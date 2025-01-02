# This function is called by the Runge-Kutta integrator.

function compute_6DOF_equations_of_motion(
    aircraft_state,
    control_demand_vector_attained,
    aircraft_data::Dict{String,Any}  # Or ::Dict if you prefer a more general type
)

    # === UNPACK THE AIRCRAFT STATE ===
    latitude, altitude, longitude = aircraft_state[1], aircraft_state[2], aircraft_state[3]
    vx, vy, vz = aircraft_state[4], aircraft_state[5], aircraft_state[6] 
    qx, qy, qz, qw = aircraft_state[7], aircraft_state[8], aircraft_state[9], aircraft_state[10]
    p_roll_rate, r_yaw_rate, q_pitch_rate = aircraft_state[11], aircraft_state[12], aircraft_state[13]

    # Reconstruct quaternion for orientation state and ensure normalization
    global_orientation_quaternion = quat_normalize([qw, qx, qy, qz])

    # === 1) FORCES & LINEAR ACCELERATIONS ===
    # Compute global velocity vector
    v_global = SVector(vx, vy, vz)

    # Compute velocity in the body frame
    v_body = rotate_vector_global_to_body(v_global, global_orientation_quaternion)
    v_body_mag = norm(v_body) + 1e-6  # Avoid zero magnitude

    # Calculate dynamic pressure for this altitude and speed
    dynamic_pressure = simple_dynamic_pressure(v_body_mag, altitude)

    # Compute angle of attack (alpha) and sideslip angle (beta) in RADIANS
    alpha_RAD = -1.0 * my_atan2(v_body[2], v_body[1]) 
    beta_RAD  = -1.0 * my_atan2(v_body[3], v_body[1]) 

    # Compute thrust force value in Newtons from the thrust lever, altitude, and speed
    propulsive_force_vector_body_N = 🟢_compute_net_thrust_force_vector_body(
        control_demand_vector_attained.thrust_attained,
        altitude,
        v_body_mag,
        aircraft_data,
        aircraft_state,
        control_demand_vector_attained
    )

    # Compute aerodynamic force coefficients in wind axis
    CL = 🟢_compute_lift_coefficient(
             alpha_RAD, beta_RAD, v_body_mag,
             aircraft_data, aircraft_state, control_demand_vector_attained
         )
    CD = 🟢_compute_drag_coefficient(
             alpha_RAD, beta_RAD, v_body_mag,
             aircraft_data, CL, aircraft_state, control_demand_vector_attained
         )
    CS = 🟢_compute_sideforce_coefficient(
             alpha_RAD, beta_RAD, v_body_mag,
             aircraft_data, aircraft_state, control_demand_vector_attained
         )

    # Compute aerodynamic forces in wind frame
    # [ CD, CL, CS ] is a typical order in "wind axes": X_wind=drag, Z_wind=-lift, Y_wind=sideforce
    # but here we define them as [D, L, Y]. Then we transform them later.
    reference_area = aircraft_data["reference_area"]
    aerodynamic_force_vector_wind_N = dynamic_pressure * reference_area * [CD, CL, CS]

    # Extract forces in wind axes
    D = aerodynamic_force_vector_wind_N[1]  # Drag
    L = aerodynamic_force_vector_wind_N[2]  # Lift
    Y = aerodynamic_force_vector_wind_N[3]  # Sideforce

    # Convert aerodynamic forces from wind to body frame
    Fxb, Fyb, Fzb = transform_aerodynamic_forces_from_wind_to_body_frame(D, Y, L, alpha_RAD, beta_RAD)

    # According to the simulator's axes: 
    #   +Xb -> forward 
    #   +Yb -> downwards (!) or up?  (the code suggests up is negative)
    #   +Zb -> ??? 
    # Adjust sign as needed
    aerodynamic_force_vector_body_N = [Fxb, -Fzb, -Fyb]

    # Sum of propulsive + aerodynamic forces in body axes
    total_propulsive_plus_aerodynamic_force_vector_body_N =
        propulsive_force_vector_body_N + aerodynamic_force_vector_body_N

    # Rotate that sum back to global frame
    total_propulsive_plus_aerodynamic_force_vector_global_N =
        rotate_vector_by_quaternion(
            total_propulsive_plus_aerodynamic_force_vector_body_N,
            global_orientation_quaternion
        )

    # Weight force in global axes
    # (Assuming a constant GRAVITY_ACCEL somewhere in scope)
    mass = aircraft_data["aircraft_mass"]
    weight_force_global_N = [0.0, -1.0 * mass * GRAVITY_ACCEL, 0.0]

    # Total force in global axis
    force_total_global_N =
        total_propulsive_plus_aerodynamic_force_vector_global_N + weight_force_global_N

    # Compute linear acceleration in global axis
    aircraft_CoG_acceleration_global = force_total_global_N / mass

    # === 2) MOMENTS & ANGULAR ACCELERATIONS ===
    # Angular velocity in body frame
    w_body = SVector(p_roll_rate, r_yaw_rate, q_pitch_rate)

    # Angular velocity as a quaternion
    omega_body_quaternion = [0.0, p_roll_rate, r_yaw_rate, q_pitch_rate]

    # Orientation quaternion derivative
    q_dot = 0.5 * quat_multiply(global_orientation_quaternion, omega_body_quaternion)

    # Control moments in body axes
    chord = aircraft_data["wing_mean_aerodynamic_chord"]
    control_moment_body_vector =
        chord * reference_area * dynamic_pressure .* [
            🟢_compute_rolling_moment_coefficient(
                control_demand_vector_attained.roll_demand_attained,
                alpha_RAD, beta_RAD, v_body_mag,
                aircraft_data, aircraft_state, control_demand_vector_attained
            ),
            🟢_compute_yawing_moment_coefficient(
                control_demand_vector_attained.yaw_demand_attained,
                alpha_RAD, beta_RAD, v_body_mag,
                aircraft_data, aircraft_state, control_demand_vector_attained
            ),
            🟢_compute_pitching_moment_coefficient(
                control_demand_vector_attained.pitch_demand_attained,
                alpha_RAD, beta_RAD, v_body_mag,
                aircraft_data, aircraft_state, control_demand_vector_attained
            )
        ]

    # Static stability moments in body axes
    CN_beta = aircraft_data["CN_beta"]
    CM_alpha = aircraft_data["CM_alpha"]
    static_stability_moment_body_vector =
        chord * reference_area * dynamic_pressure .* [
            0.0,                    # roll
            CN_beta * beta_RAD,     # yaw
            CM_alpha * alpha_RAD    # pitch
        ]

    # Aerodynamic damping moments in body axes
    Cl_p = aircraft_data["Cl_p"]
    Cn_r = aircraft_data["Cn_r"]
    Cm_q = aircraft_data["Cm_q"]
    aerodynamic_damping_moment_body_vector =
        chord * reference_area * dynamic_pressure .* [
            Cl_p * p_roll_rate,
            Cn_r * r_yaw_rate,
            Cm_q * q_pitch_rate
        ]

    # Sum all moments in body frame
    moment_total_body =
        control_moment_body_vector +
        static_stability_moment_body_vector +
        aerodynamic_damping_moment_body_vector

    # Compute angular acceleration in body frame:
    #   α_body = I_body⁻¹ * (τ_total - ω × (I_body * ω))
    I_body = aircraft_data["I_body"]   # This should be a 3x3 matrix
    cross_term = cross(w_body, I_body * w_body)
    alpha_ang_body = inv(I_body) * (moment_total_body - cross_term)

    # === RETURN THE DERIVATIVES + EXTRA OUTPUTS ===

    return (
        [
            # New aircraft state derivatives (13 state derivatives)
            vx, vy, vz,  # dx/dt, dy/dt, dz/dt
            aircraft_CoG_acceleration_global[1],
            aircraft_CoG_acceleration_global[2],
            aircraft_CoG_acceleration_global[3],  # dvx/dt, dvy/dt, dvz/dt
            q_dot[2], q_dot[3], q_dot[4], q_dot[1],  # dq/dt (x,y,z,w in your chosen order)
            alpha_ang_body[1],
            alpha_ang_body[2],
            alpha_ang_body[3]  # dωx/dt, dωy/dt, dωz/dt
        ],
        total_propulsive_plus_aerodynamic_force_vector_global_N,
        rad2deg(alpha_RAD), # Angle of attack (deg)
        rad2deg(beta_RAD),  # Sideslip angle (deg)
        p_roll_rate, r_yaw_rate, q_pitch_rate
    )
end
