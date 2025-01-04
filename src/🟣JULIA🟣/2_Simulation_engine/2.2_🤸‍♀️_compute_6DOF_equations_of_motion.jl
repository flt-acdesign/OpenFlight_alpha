"""
    compute_6DOF_equations_of_motion(
        aircraft_state_vector,
        control_demand_vector_attained,
        aircraft_data::NamedTuple
    )

Compute the 6-DOF equations of motion for the aircraft. This function is typically
called by the Runge-Kutta integrator to update the aircraft state.

# Arguments
- `aircraft_state_vector`          : The current aircraft state (position, orientation, velocity, angular rates).
- `control_demand_vector_attained` : Actual/attained control demands (thrust, control surface deflections, etc.).
- `aircraft_data`                  : A named tuple containing fixed aircraft parameters (mass, inertia, aero data, etc.).

# Returns
A two-element tuple of vectors:
1) The time derivatives of the 13-dimensional state vector.
2) A vector of flight conditions (diagnostic outputs).
"""
function compute_6DOF_equations_of_motion(
    aircraft_state_vector,
    control_demand_vector_attained,
    aircraft_data::NamedTuple
)

    # === 1) UNPACK THE AIRCRAFT STATE VECTOR INTO LOCAL VARIABLES ===

    altitude = aircraft_state_vector[2]  - 30 # The Altitude (m) is the height minus the ground level (30m)

    Outside_Air_Temperature, static_pressure, air_density_inf, speed_of_sound = atmosphere_isa(altitude)

    vx, vy, vz = aircraft_state_vector[4], aircraft_state_vector[5], aircraft_state_vector[6]

    # Quaternion: [qx, qy, qz, qw]
    qx, qy, qz, qw = aircraft_state_vector[7], aircraft_state_vector[8], aircraft_state_vector[9], aircraft_state_vector[10]

    # Body angular rates: p, r, q  (roll, yaw, pitch rates)
    p_roll_rate, r_yaw_rate, q_pitch_rate  = aircraft_state_vector[11], aircraft_state_vector[12], aircraft_state_vector[13]

    # Normalize the orientation quaternion to avoid numerical drift
    global_orientation_quaternion = quat_normalize([qw, qx, qy, qz])


    # === 2) COMPUTE FLIGHT CONDITIONS ===

    # Global velocity vector
    v_global = SVector(vx, vy, vz)

    # Velocity in the body frame
    v_body = rotate_vector_global_to_body(v_global, global_orientation_quaternion)
    v_body_magnitude = norm(v_body) + 1e-6  # Avoid division by zero
    
    Mach_number = v_body_magnitude / speed_of_sound

    # Dynamic pressure
    dynamic_pressure = simple_dynamic_pressure(v_body_magnitude, altitude)

    # Angles of attack (alpha) and sideslip (beta) in radians
    alpha_rad = -my_atan2(v_body[2], v_body[1])
    beta_rad  = -my_atan2(v_body[3], v_body[1])

    # Body angular velocity vector
    omega_body = SVector(p_roll_rate, r_yaw_rate, q_pitch_rate)

    # Angular velocity as a quaternion
    omega_body_quaternion = [0.0, p_roll_rate, r_yaw_rate, q_pitch_rate]

    # Quaternion derivative 
    # q_dot = 0.5 * (global_orientation_quaternion ⨂ ω_body)
    q_dot = 0.5 * quat_multiply(global_orientation_quaternion, omega_body_quaternion)


    # Retrieve some fields from the named tuple
    reference_area = aircraft_data.reference_area
    reference_chord = aircraft_data.wing_mean_aerodynamic_chord

    aircraft_mass  = aircraft_data.aircraft_mass
    I_body   = aircraft_data.I_body

    I_body_inverse = pre_computed_I_body_inverse  # Pre-computed inverse of the inertia tensor matrix


    # === 2) COMPUTE FORCES & LINEAR ACCELERATIONS ===
   
    # Compute thrust force in body frame
    propulsive_force_vector_body_N = 🟢_compute_net_thrust_force_vector_body(
        altitude,
        Mach_number,
        aircraft_data,
        aircraft_state_vector,
        control_demand_vector_attained
    )

    # Compute aerodynamic force coefficients (wind axes)
    CL = 🟢_compute_lift_coefficient(
        alpha_rad, beta_rad, v_body_magnitude,
        aircraft_data,
        aircraft_state_vector,
        control_demand_vector_attained
    )
    CD = 🟢_compute_drag_coefficient(
        alpha_rad, beta_rad, v_body_magnitude,
        aircraft_data,
        CL,
        aircraft_state_vector,
        control_demand_vector_attained
    )
    CS = 🟢_compute_sideforce_coefficient(
        alpha_rad, beta_rad, v_body_magnitude,
        aircraft_data,
        aircraft_state_vector,
        control_demand_vector_attained
    )

    # Aerodynamic forces in wind frame [CD, CL, CS]
    aerodynamic_force_vector_wind_N = dynamic_pressure * reference_area .* [CD, CL, CS]

    # Extract components in wind axes
    Total_Drag_in_wind_axes      = aerodynamic_force_vector_wind_N[1]
    Total_Lift_in_wind_axes      = aerodynamic_force_vector_wind_N[2]
    Total_Sideforce_in_wind_axes = aerodynamic_force_vector_wind_N[3]

    # Transform aerodynamic forces from wind to body frame
    Fxb, Fyb, Fzb = transform_aerodynamic_forces_from_wind_to_body_frame(
        Total_Drag_in_wind_axes,
        Total_Sideforce_in_wind_axes,
        Total_Lift_in_wind_axes,
        alpha_rad,
        beta_rad
    )

    # Adjust to the simulator's (Babylon.js) body-axis convention
    aerodynamic_force_vector_body_N = [Fxb, -Fzb, -Fyb]

    # Sum propulsive + aerodynamic forces in body axes
    total_propulsive_plus_aerodynamic_force_vector_body_N = propulsive_force_vector_body_N + aerodynamic_force_vector_body_N

    # Rotate sum back to the global frame
    total_propulsive_plus_aerodynamic_force_vector_global_N = rotate_vector_by_quaternion( total_propulsive_plus_aerodynamic_force_vector_body_N,  global_orientation_quaternion )

    # Weight force in global axes
    weight_force_global_N = SVector(0.0, -aircraft_mass * GRAVITY_ACCEL, 0.0)

    # Total force in global frame
    force_total_global_N = total_propulsive_plus_aerodynamic_force_vector_global_N + weight_force_global_N

    # Linear acceleration in global axes
    aircraft_CoG_acceleration_global = force_total_global_N / aircraft_mass


    
    # === 3) MOMENTS & ANGULAR ACCELERATIONS ===

    # Control moments in body axes
    vector_of_moment_coefficients_of_control_body =
        [
            🟢_rolling_moment_coefficient_due_to_control_attained(
                alpha_rad, beta_rad, Mach_number,
                aircraft_data,
                aircraft_state_vector,
                control_demand_vector_attained
            ),
            🟢_yawing_moment_coefficient_due_to_control_attained(
                alpha_rad, beta_rad, Mach_number,
                aircraft_data,
                aircraft_state_vector,
                control_demand_vector_attained
            ),
            🟢_pitching_moment_coefficient_due_to_control_attained(
                alpha_rad, beta_rad, Mach_number,
                aircraft_data,
                aircraft_state_vector,
                control_demand_vector_attained
            )
        ]

    # Static stability moment coefficients in body axes
    vector_of_moment_coefficients_of_static_stability_body =
        [
            🟢_rolling_moment_coefficient_due_to_aerodynamic_stiffness(
                alpha_rad, beta_rad, Mach_number,
                aircraft_data,
                control_demand_vector_attained
            ),
            🟢_yawing_moment_coefficient_due_to_aerodynamic_stiffness( # CN_beta * beta_rad,
                alpha_rad, beta_rad, Mach_number,
                aircraft_data,
                control_demand_vector_attained
            ),
            🟢_pitching_moment_coefficient_due_to_aerodynamic_stiffness( # CM_alpha * alpha_rad
                alpha_rad, beta_rad, Mach_number,
                aircraft_data,
                control_demand_vector_attained
           )                      
        ]

    # Aerodynamic damping moment coefficients in body axes
    vector_of_moment_coefficients_of_aerodynamic_damping_body =
        [
            🟢_rolling_moment_coefficient_due_to_aerodynamic_damping(  # Cl_p * p_roll_rate,
                p_roll_rate, alpha_rad, beta_rad, Mach_number,
                aircraft_data
        ),
            🟢_yawing_moment_coefficient_due_to_aerodynamic_damping(   # Cn_r * r_yaw_rate,
                r_yaw_rate, alpha_rad, beta_rad, Mach_number,
                aircraft_data
        ),
            🟢_pitching_moment_coefficient_due_to_aerodynamic_damping( # Cm_q * q_pitch_rate
                q_pitch_rate, alpha_rad, beta_rad, Mach_number,
                aircraft_data
        )          
        ]

    # Dimensionalize the sum all moment coefficients into total moments in body frame
    total_moment_in_body_frame =  reference_chord * reference_area * dynamic_pressure .* 
        (
        vector_of_moment_coefficients_of_control_body + 
        vector_of_moment_coefficients_of_static_stability_body + 
        vector_of_moment_coefficients_of_aerodynamic_damping_body
        )

    # Inverse dynamics for angular acceleration in body frame
    #   α_body = I_body⁻¹ * [ (total_moment_body) - (omega_body × (I_body * omega_body)) ]
    angular_acceleration_body = I_body_inverse * (total_moment_in_body_frame - cross(omega_body, I_body * omega_body))


    # === 4) RETURN THE STATE DERIVATIVES + FLIGHT CONDITIONS ===

    return (

        [   # (1) State Vector Time Derivatives (13 entries):            
            vx, vy, vz, # positions (just velocity in global coords)
            aircraft_CoG_acceleration_global[1], aircraft_CoG_acceleration_global[2], aircraft_CoG_acceleration_global[3],  # velocities (acceleration in global coords)            
            q_dot[2], q_dot[3], q_dot[4], q_dot[1],  # quaternion time derivatives (x, y, z, w)            
            angular_acceleration_body[1], angular_acceleration_body[2], angular_acceleration_body[3] # angular rates (their time derivatives in body coords)
        ],

        [   # (2) Vector of Flight Conditions (diagnostics):
            total_propulsive_plus_aerodynamic_force_vector_global_N[1], total_propulsive_plus_aerodynamic_force_vector_global_N[2], total_propulsive_plus_aerodynamic_force_vector_global_N[3],
            rad2deg(alpha_rad),  # AoA in degrees
            rad2deg(beta_rad),   # Sideslip in degrees
            p_roll_rate, r_yaw_rate, q_pitch_rate # p, r, q in body frame (roll, yaw, pitch rates) rad/s
        ]
    )

end
