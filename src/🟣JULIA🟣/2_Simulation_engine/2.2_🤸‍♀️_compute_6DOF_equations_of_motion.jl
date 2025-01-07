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
    aircraft_data, 
    initial_flight_conditions
)

    # === 2) COMPUTE FORCES & LINEAR ACCELERATIONS ===
   
    # Compute thrust force in body frame
    propulsive_force_vector_body_N = 🟢_compute_net_thrust_force_vector_body(
        initial_flight_conditions.altitude,
        initial_flight_conditions.Mach_number,
        aircraft_data,
        aircraft_state_vector,
        control_demand_vector_attained
    )

    # Compute aerodynamic force coefficients and associated moments (wind axes)
    CL  = 🟢_compute_lift_coefficient(
        initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
        aircraft_data,
        aircraft_state_vector,
        control_demand_vector_attained
    )

    CS = 🟢_compute_sideforce_coefficient(
        initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
        aircraft_data,
        aircraft_state_vector,
        control_demand_vector_attained
    )

    CD = 🟢_compute_drag_coefficient(
        initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
        aircraft_data,
        CL,CS, 
        aircraft_state_vector,
        control_demand_vector_attained
    )



    
    # Aerodynamic forces in wind frame [CD, CL, CS]
    aerodynamic_force_vector_wind_N = initial_flight_conditions.dynamic_pressure * aircraft_data.reference_area .* [CD, CL, CS]

    # Extract components in wind axes
    Total_Drag_in_wind_axes      = aerodynamic_force_vector_wind_N[1]
    Total_Lift_in_wind_axes      = aerodynamic_force_vector_wind_N[2]
    Total_Sideforce_in_wind_axes = aerodynamic_force_vector_wind_N[3]

    # Transform aerodynamic forces from wind to body frame
    Fxb, Fyb, Fzb = transform_aerodynamic_forces_from_wind_to_body_frame(
        Total_Drag_in_wind_axes,
        Total_Sideforce_in_wind_axes,
        Total_Lift_in_wind_axes,
        initial_flight_conditions.alpha_rad,
        initial_flight_conditions.beta_rad
    )

    # Adjust to the simulator's (Babylon.js) body-axis convention
    aerodynamic_force_vector_body_N = [Fxb, -Fzb, -Fyb]

    # Sum propulsive + aerodynamic forces in body axes
    total_propulsive_plus_aerodynamic_force_vector_body_N = propulsive_force_vector_body_N + aerodynamic_force_vector_body_N

    # Rotate sum back to the global frame
    total_propulsive_plus_aerodynamic_force_vector_global_N = rotate_vector_by_quaternion( total_propulsive_plus_aerodynamic_force_vector_body_N,  initial_flight_conditions.global_orientation_quaternion )

    # Weight force in global axes
    weight_force_global_N = SVector(0.0, -initial_flight_conditions.aircraft_mass * GRAVITY_ACCEL, 0.0)

    # Total force in global frame
    force_total_global_N = total_propulsive_plus_aerodynamic_force_vector_global_N + weight_force_global_N

    # Linear acceleration in global axes
    aircraft_CoG_acceleration_global = force_total_global_N / initial_flight_conditions.aircraft_mass


    
    # === 3) MOMENTS & ANGULAR ACCELERATIONS ===

    vector_of_moment_coefficients_due_to_aero_forces_body =
        [
            0.0,  # roll
            0.0,  # yaw,
            aircraft_flight_physics_and_propulsive_data.wing_lift_lever_arm_wrt_CoG_over_MAC * CL
        ]


    # Control moments in body axes
    vector_of_moment_coefficients_of_control_body =
        [
            🟢_rolling_moment_coefficient_due_to_control_attained(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data,
                aircraft_state_vector,
                control_demand_vector_attained
            ),
            🟢_yawing_moment_coefficient_due_to_control_attained(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data,
                aircraft_state_vector,
                control_demand_vector_attained
            ),
            🟢_pitching_moment_coefficient_due_to_control_attained(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data,
                aircraft_state_vector,
                control_demand_vector_attained
            ) 
        ]

    # Static stability moment coefficients in body axes
    vector_of_moment_coefficients_of_static_stability_body =
        [
            🟢_rolling_moment_coefficient_due_to_aerodynamic_stiffness(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data,
                control_demand_vector_attained
            ),
            🟢_yawing_moment_coefficient_due_to_aerodynamic_stiffness( # CN_beta * beta_rad,
            initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data,
                control_demand_vector_attained
            ),
            🟢_pitching_moment_coefficient_due_to_aerodynamic_stiffness( # CM_alpha * alpha_rad
            initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data,
                control_demand_vector_attained
           )                      
        ]

    # Aerodynamic damping moment coefficients in body axes
    vector_of_moment_coefficients_of_aerodynamic_damping_body =
        [
            🟢_rolling_moment_coefficient_due_to_aerodynamic_damping(  # Cl_p * p_roll_rate,
            initial_flight_conditions.p_roll_rate, initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data
        ),
            🟢_yawing_moment_coefficient_due_to_aerodynamic_damping(   # Cn_r * r_yaw_rate,
            initial_flight_conditions.r_yaw_rate, initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data
        ),
            🟢_pitching_moment_coefficient_due_to_aerodynamic_damping( # Cm_q * q_pitch_rate
            initial_flight_conditions.q_pitch_rate, initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data
        )          
        ]

    # Dimensionalize the sum all moment coefficients into total moments in body frame
    total_moment_in_body_frame =  aircraft_data.wing_mean_aerodynamic_chord * aircraft_data.reference_area * initial_flight_conditions.dynamic_pressure .* 
        (
        vector_of_moment_coefficients_due_to_aero_forces_body +
        vector_of_moment_coefficients_of_control_body + 
        vector_of_moment_coefficients_of_static_stability_body + 
        vector_of_moment_coefficients_of_aerodynamic_damping_body         
        )

    # Inverse dynamics for angular acceleration in body frame
    #   α_body = I_body⁻¹ * [ (total_moment_body) - (omega_body × (I_body * omega_body)) ]
    angular_acceleration_body = initial_flight_conditions.I_body_inverse * (total_moment_in_body_frame - cross(initial_flight_conditions.omega_body, initial_flight_conditions.I_body * initial_flight_conditions.omega_body))


    # === 4) RETURN THE STATE DERIVATIVES + FLIGHT CONDITIONS ===

    new_aircraft_state_vector = [ # with linear and angular accelerations
        aircraft_state_vector[4] ,   # 1)  x
        aircraft_state_vector[5] ,   # 2)  y
        aircraft_state_vector[6] ,   # 3)  z
        
        aircraft_CoG_acceleration_global[1],  # 4)  Vx
        aircraft_CoG_acceleration_global[2],  # 5)  Vy
        aircraft_CoG_acceleration_global[3],  # 6)  Vz

        initial_flight_conditions.q_dot[2] ,  # 7)  qx
        initial_flight_conditions.q_dot[3] ,  # 8)  qy
        initial_flight_conditions.q_dot[4],  # 9)  qz
        initial_flight_conditions.q_dot[1],  # 10) qw

        angular_acceleration_body[1],  # 11) wx
        angular_acceleration_body[2],  # 12) wy
        angular_acceleration_body[3],   # 13) wz
    ]

    total_propulsive_plus_aerodynamic_force_vector_global_N = [
        total_propulsive_plus_aerodynamic_force_vector_global_N[1], 
        total_propulsive_plus_aerodynamic_force_vector_global_N[2], 
        total_propulsive_plus_aerodynamic_force_vector_global_N[3]
    ]



    return (new_aircraft_state_vector, total_propulsive_plus_aerodynamic_force_vector_global_N)


end
