function Runge_Kutta_4_integrator(
    current_aircraft_state_vector::Vector{Float64},
    control_demand_vector::NamedTuple,
    deltaTime::Float64,
    aircraft_flight_physics_and_propulsive_data
)
    # -------------------------------------------------------------------------
    # 1) Convert demanded controls to the actually attainable controls
    #    (accounting for actuator dynamics).
    control_demand_vector_attained = convert_control_demanded_to_attained(
        aircraft_flight_physics_and_propulsive_data,
        control_demand_vector,
        deltaTime
    )

    # -------------------------------------------------------------------------
    # 2) Compute the 4 intermediate derivatives (k1, k2, k3, k4) using RK4

    # k1
    k1, force_total_k1, alpha_k1, beta_k1 = compute_6DOF_equations_of_motion(
        current_aircraft_state_vector,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # k2
    k2, force_total_k2, alpha_k2, beta_k2 = compute_6DOF_equations_of_motion(
        current_aircraft_state_vector .+ (deltaTime / 2) .* k1,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # k3
    k3, force_total_k3, alpha_k3, beta_k3 = compute_6DOF_equations_of_motion(
        current_aircraft_state_vector .+ (deltaTime / 2) .* k2,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # k4
    k4, force_total_k4, alpha_k4, beta_k4 = compute_6DOF_equations_of_motion(
        current_aircraft_state_vector .+ deltaTime .* k3,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # -------------------------------------------------------------------------
    # 3) Combine k1..k4 for the final RK4 integration step
    new_aircraft_state_vector = current_aircraft_state_vector .+ (deltaTime / 6.0) .* (k1 .+ 2 .* k2 .+ 2 .* k3 .+ k4)

    # -------------------------------------------------------------------------
    # 4) Compute average forces and angles (if desired) from the RK4 steps
    force_global = (force_total_k1 .+ 2 .* force_total_k2 .+ 2 .* force_total_k3 .+ force_total_k4) ./ 6

    alpha_avg = (alpha_k1 + 2*alpha_k2 + 2*alpha_k3 + alpha_k4) / 6
    beta_avg  = (beta_k1 + 2*beta_k2 + 2*beta_k3 + beta_k4) / 6

    # -------------------------------------------------------------------------
    # 5) Normalize the quaternion (indices: 10->qw, 7->qx, 8->qy, 9->qz)
    q_normalized = quat_normalize([
        new_aircraft_state_vector[10],  # qw
        new_aircraft_state_vector[7],   # qx
        new_aircraft_state_vector[8],   # qy
        new_aircraft_state_vector[9]    # qz
    ])

    # -------------------------------------------------------------------------
    # 6) Collisions or ground effect for Y velocity
    #    Indices 2->pos_y, 5->Vy
    new_velocity_y = handle_collisions(new_aircraft_state_vector[2], new_aircraft_state_vector[5])

    # -------------------------------------------------------------------------
    # 7) Return the same dictionary shape expected by update_aircraft_state
    return Dict(
        # Position
        "x" => new_aircraft_state_vector[1],
        "y" => new_aircraft_state_vector[2],
        "z" => new_aircraft_state_vector[3],

        # Velocity
        "vx" => new_aircraft_state_vector[4],
        "vy" => new_velocity_y,
        "vz" => new_aircraft_state_vector[6],

        # Quaternion orientation (normalized)
        "qx" => q_normalized[2],
        "qy" => q_normalized[3],
        "qz" => q_normalized[4],
        "qw" => q_normalized[1],

        # Angular velocity
        "wx" => new_aircraft_state_vector[11],
        "wy" => new_aircraft_state_vector[12],
        "wz" => new_aircraft_state_vector[13],

        # Global forces
        "fx_global" => force_global[1],
        "fy_global" => force_global[2],
        "fz_global" => force_global[3],

        # Aerodynamic angles
        "alpha" => alpha_avg,
        "beta"  => beta_avg,

        # Control demands
        "pitch_demand"           => control_demand_vector.pitch_demand,
        "roll_demand"            => control_demand_vector.roll_demand,
        "yaw_demand"             => control_demand_vector.yaw_demand,
        "thrust_setting_demand"  => control_demand_vector_attained.thrust_setting_demand,

        # Attained control values
        "pitch_demand_attained"  => control_demand_vector_attained.pitch_demand_attained,
        "roll_demand_attained"   => control_demand_vector_attained.roll_demand_attained,
        "yaw_demand_attained"    => control_demand_vector_attained.yaw_demand_attained,
        "thrust_attained"        => control_demand_vector_attained.thrust_attained
    )
end
