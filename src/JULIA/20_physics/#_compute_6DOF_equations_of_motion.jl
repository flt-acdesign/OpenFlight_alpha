# This function is called by the Runge-Kutta integrator

function compute_6DOF_equations_of_motion(s_local, force_control_inputs, moment_control_inputs, aircraft_data::Aircraft_Model_Data_structure)

    latitude, altitude, longitude = s_local[1], s_local[2], s_local[3] # in global axis  (latitude and longitude are not used unless the simulator limits the range)
    vx, vy, vz = s_local[4], s_local[5], s_local[6] # in global axis
    qx, qy, qz, qw = s_local[7], s_local[8], s_local[9], s_local[10]  # Orientation quaternion in global frame
    p_roll_rate, r_yaw_rate, q_pitch_rate = s_local[11], s_local[12], s_local[13]  # angular velocity in the body frame

    # Reconstruct quaternion for orientation state and ensure normalization
    global_orientation_quaternion = quat_normalize([qw, qx, qy, qz])

    # ******* ➡ COMPUTE FORCES AND LINEAR ACCELERATIONS *******
    # Compute global velocity vector
    v_global = SVector(vx, vy, vz) 

    # Compute body-frame velocity  (+X  -> fwd,  +Y  -> Upwards, +Z -> to port )
    v_body = rotate_vector_global_to_body(v_global, global_orientation_quaternion)

    v_body_mag = norm(v_body) + 1e-6  # Ensure non-zero magnitude

    # Calculate dynamic pressure for this altituded and speed, valid for the time of integration
    dynamic_pressure = simple_dynamic_pressure(v_body_mag, altitude) # note y is altitude in global babylon.js axes

    # Compute angle of attack (alpha) and sideslip angle (beta) in degrees (Note that Julia does not have the function ATAN2, use rad2deg(angle(complex(1,1))) = 45, rad2deg(angle(complex(0,1))) = 90  )
    alpha_RAD = -1.0 * angle(complex(v_body[1], v_body[2]))  # RADIANS  
    beta_RAD  = -1.0 * angle(complex(v_body[1], v_body[3]))  # defined as per eq. 7.1.4 Phillips 1st Edition
    
    # Compute thrust force value in Newtons from the position of the thrust lever, the altitude and the speed
    propulsive_force_vector_body_N = compute_net_thrust_force_vector_body(force_control_inputs.thrust_lever, altitude, v_body_mag, aircraft_data)

    # Compute aerodynamic force coefficients in wind axis
    CL = compute_lift_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data) # lift coefficient
    CD = compute_drag_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data, CL) # drag coefficient
    CS = compute_sideforce_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data) # sideforce coefficient

    # Compute aerodynamic drag force in wind frame
    aerodynamic_force_vector_wind_N = dynamic_pressure * aircraft_data.reference_area * [ CD, CL , CS ]    # 1/2 * rho * v^2 * Sref * C_

    L = aerodynamic_force_vector_wind_N[2]  # standard definition of lift force in wind axes
    D = aerodynamic_force_vector_wind_N[1]  # standard definition of Drag force in wind axes
    Y = aerodynamic_force_vector_wind_N[3]  # standard definition of sideforce in wind axes

    # The transformations of forces from wind axis to body axis are the standard, done using a quaternion transformation
    Fxb, Fyb, Fzb = transform_aerodynamic_forces_from_wind_to_body_frame(D, Y, L, alpha_RAD, beta_RAD)

    # The resulting forces are placed in the aerodynamic_force_vector_body_N reflecting this simulator's axes system  (my_Fxb = Fxb, my_Fyb = - Fzb, my_Fzb = -Fyb)
    aerodynamic_force_vector_body_N = [Fxb, -Fzb, -Fyb] * 1.0

    # Sum of propulsive and aerodynamic forces in body axes
    total_propulsive_plus_aerodynamic_force_vector_body_N = propulsive_force_vector_body_N + aerodynamic_force_vector_body_N

    # Rotate total propulsive plus aerodynamic forces back to global frame
    total_propulsive_plus_aerodynamic_force_vector_global_N = rotate_vector_by_quaternion(total_propulsive_plus_aerodynamic_force_vector_body_N, global_orientation_quaternion)

    # weight force in global axes
    weight_force_global_N = [0.0, -1.0 * aircraft_data.aircraft_mass * GRAVITY_ACCEL , 0.0]

    # Total force in global axis (propulsive plus aerodynamic plus weight)
    force_total_global_N = total_propulsive_plus_aerodynamic_force_vector_global_N + weight_force_global_N

    # Compute linear acceleration in global axis
    aircraft_CoG_acceleration_global = force_total_global_N  / aircraft_data.aircraft_mass


    # ******* ☢ COMPUTE MOMENTS AND ANGULAR ACCELERATIONS *******
    # Angular velocity in body frame
    w_body = [p_roll_rate, r_yaw_rate, q_pitch_rate]

    # Angular velocity as a quaternion (q_ω = [0, wx, wy, wz] in body frame)
    omega_body_quaternion = [0.0, p_roll_rate, r_yaw_rate, q_pitch_rate]

    # Compute orientation quaternion derivative (q_dot = 0.5 * q * q_ω)
    q_dot = 0.5 * quat_multiply(global_orientation_quaternion, omega_body_quaternion)

        # Compute aircraft control moments in body axes
        control_moment_body_vector = aircraft_data.wing_mean_aerodynamic_chord * aircraft_data.reference_area * dynamic_pressure .* [
            compute_rolling_moment_coefficient(moment_control_inputs.aileron_input, alpha_RAD, beta_RAD, v_body_mag, aircraft_data )      ,    
            compute_yawing_moment_coefficient(moment_control_inputs.rudder_input, alpha_RAD, beta_RAD, v_body_mag, aircraft_data ) ,
            compute_pitching_moment_coefficient(moment_control_inputs.elevator_input, alpha_RAD, beta_RAD, v_body_mag, aircraft_data )    
            ]
    
        # Compute aircraft static stability moments in body axes
        static_stability_moment_body_vector = aircraft_data.wing_mean_aerodynamic_chord * aircraft_data.reference_area * dynamic_pressure .* [  # Move all these ad-hoc coefficient to aircraft_data, like all the others
                                    0.0,  # roll 
                                    aircraft_data.CN_beta * beta_RAD,  # yaw
                                    aircraft_data.CM_alpha * alpha_RAD]  # pitch                                 
    
        # Compute aircraft damping moments in body axes
        aerodynamic_damping_moment_body_vector = aircraft_data.wing_mean_aerodynamic_chord * aircraft_data.reference_area * dynamic_pressure .* [
                                    aircraft_data.Cl_p * p_roll_rate,  # roll 
                                    aircraft_data.Cn_r * r_yaw_rate,  # yaw
                                    aircraft_data.Cm_q * q_pitch_rate]  # pitch
        
        # Total moment in body frame  +1 roll to left     +2 -> nose to right     +3 -> nose up
        moment_total_body = control_moment_body_vector + static_stability_moment_body_vector + aerodynamic_damping_moment_body_vector


    # Compute angular acceleration in body frame: α_body = I⁻¹ * (τ_total - ω × (I * ω))
    alpha_ang_body = inv(aircraft_data.I_body) * (moment_total_body - cross(SVector(p_roll_rate, r_yaw_rate, q_pitch_rate), aircraft_data.I_body * SVector(p_roll_rate, r_yaw_rate, q_pitch_rate)))


    # Return derivative and additional outputs, including angular velocities in body frame as a quaternion
    return (
        [  # New aircraft state vector
            vx, vy, vz,             # dx/dt, dy/dt, dz/dt (linear velocity in global frame)
            aircraft_CoG_acceleration_global[1], aircraft_CoG_acceleration_global[2], aircraft_CoG_acceleration_global[3],   # dvx/dt, dvy/dt, dvz/dt (linear acceleration in global frame)
            q_dot[2], q_dot[3], q_dot[4], q_dot[1], # dq/dt components (orientation quaternion derivative) Note that (q_dot_w, q_dot_x, q_dot_y, q_dot_z)Babylon = (q_dot[1], q_dot[2], q_dot[3], q_dot[4])Julia
            alpha_ang_body[1], alpha_ang_body[2], alpha_ang_body[3] # dωx/dt, dωy/dt, dωz/dt (angular acceleration in body frame)
        ],
        total_propulsive_plus_aerodynamic_force_vector_global_N,     # Total force in global frame excluding weight
        rad2deg(alpha_RAD),        # Angle of attack DEGREES
        rad2deg(beta_RAD),         # Sideslip angle DEGREES
        p_roll_rate, r_yaw_rate, q_pitch_rate  # Angular velocity in body frame (as vector)
    )
end



