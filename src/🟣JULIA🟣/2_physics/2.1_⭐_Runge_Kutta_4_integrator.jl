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
    # 2) Compute the 4 intermediate state derivatives (state_vec_derivative_1, state_vec_derivative_2, state_vec_derivative_3, state_vec_derivative_4) using Runge_Kutta_4 method

    # state_vec_derivative_1
    state_vec_derivative_1, Flt_Conds_derivative_1= compute_6DOF_equations_of_motion(
        current_aircraft_state_vector,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # state_vec_derivative_2
    state_vec_derivative_2, Flt_Conds_derivative_2 = compute_6DOF_equations_of_motion(
        current_aircraft_state_vector .+ (deltaTime / 2) .* state_vec_derivative_1,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # state_vec_derivative_3
    state_vec_derivative_3, Flt_Conds_derivative_3 = compute_6DOF_equations_of_motion(
        current_aircraft_state_vector .+ (deltaTime / 2) .* state_vec_derivative_2,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # state_vec_derivative_4
    state_vec_derivative_4, Flt_Conds_derivative_4 = compute_6DOF_equations_of_motion(
        current_aircraft_state_vector .+ deltaTime .* state_vec_derivative_3,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # -------------------------------------------------------------------------
    # 3) Combine state_vec_derivative_1..state_vec_derivative_4 for the final RK4 integration step
    new_aircraft_state_vector = current_aircraft_state_vector .+ (deltaTime / 6.0) .* (state_vec_derivative_1 .+ 2 .* state_vec_derivative_2 .+ 2 .* state_vec_derivative_3 .+ state_vec_derivative_4)

    # -------------------------------------------------------------------------
    # 4) Compute new average Flight Conditions from the RK4 integration
    new_Flight_Conditions = (Flt_Conds_derivative_1 .+ 2 .* Flt_Conds_derivative_2 .+ 2 .* Flt_Conds_derivative_3 .+ Flt_Conds_derivative_4) ./ 6

    # -------------------------------------------------------------------------
    # 5) Collisions or ground effect for X velocity
    #    Indices 1->pos_x, 4->Vx
    #    Indices 2->pos_y, 5->Vy
    new_aircraft_state_vector[5] = handle_collisions(new_aircraft_state_vector[2], new_aircraft_state_vector[5])

    # -------------------------------------------------------------------------
    # 6) Return the same dictionary shape expected by update_aircraft_state
    return Dict(
        # Position
        "x" => new_aircraft_state_vector[1], "y" => new_aircraft_state_vector[2], "z" => new_aircraft_state_vector[3],

        # Velocity
        "vx" => new_aircraft_state_vector[4], "vy" => new_aircraft_state_vector[5], "vz" => new_aircraft_state_vector[6],

        # Quaternion orientation (normalized)
        "qx" => new_aircraft_state_vector[7], "qy" => new_aircraft_state_vector[8], "qz" => new_aircraft_state_vector[9], "qw" => new_aircraft_state_vector[10],

        # Angular velocity
        "wx" => new_aircraft_state_vector[11], "wy" => new_aircraft_state_vector[12], "wz" => new_aircraft_state_vector[13],

        # Global forces
        "fx_global" => new_Flight_Conditions[1], "fy_global" => new_Flight_Conditions[2], "fz_global" => new_Flight_Conditions[3],

        # Aerodynamic angles
        "alpha" => new_Flight_Conditions[4],
        "beta"  => new_Flight_Conditions[5],

        # Rates of rotation (p, q, r) in body frame
        "p_roll_rate" => new_Flight_Conditions[6], "r_yaw_rate" => new_Flight_Conditions[7], "q_pitch_rate" => new_Flight_Conditions[8],

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
