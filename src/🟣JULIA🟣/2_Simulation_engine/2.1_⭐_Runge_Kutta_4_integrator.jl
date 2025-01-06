
function Runge_Kutta_4_integrator(
    initial_aircraft_state_vector::Vector{Float64},
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

initial_flight_conditions = compute_flight_conditions_from_state_vector(initial_aircraft_state_vector, aircraft_flight_physics_and_propulsive_data )

    # -------------------------------------------------------------------------
    # 2) Compute the 4 intermediate state derivatives (state_vec_derivative_1, state_vec_derivative_2, state_vec_derivative_3, state_vec_derivative_4) using Runge_Kutta_4 method

    # state_vec_derivative_1
    state_vec_derivative_1, global_force1 = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data, 
        initial_flight_conditions
    )

    # state_vec_derivative_2
    state_vec_derivative_2, global_force2  = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector .+ (deltaTime / 2) .* state_vec_derivative_1,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data, 
        initial_flight_conditions
    )

    # state_vec_derivative_3
    state_vec_derivative_3, global_force3  = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector .+ (deltaTime / 2) .* state_vec_derivative_2,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data,
        initial_flight_conditions
    )

    # state_vec_derivative_4
    state_vec_derivative_4, global_force4  = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector .+ deltaTime .* state_vec_derivative_3,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data,
        initial_flight_conditions
    )

    # -------------------------------------------------------------------------
    # 3) Combine state_vec_derivative_1..state_vec_derivative_4 for the final RK4 integration step
    new_aircraft_state_vector = initial_aircraft_state_vector .+ (deltaTime / 6.0) .* (state_vec_derivative_1 .+ 2 .* state_vec_derivative_2 .+ 2 .* state_vec_derivative_3 .+ state_vec_derivative_4)

    # -------------------------------------------------------------------------
    # 4) Combine global_force for the final RK4 integration step
    total_aero_and_propulsive_force_resultant = (global_force1 .+  global_force2 .+  global_force3 .+ global_force4) ./ 4


    # -------------------------------------------------------------------------
    # 5) Collisions or ground effect for vertical velocity
    vertical_speed_post_collision_check = handle_collisions(new_aircraft_state_vector[2], new_aircraft_state_vector[5])

    # -------------------------------------------------------------------------
    # 6) Return the same dictionary shape expected by update_aircraft_state
    return Dict(

        # New Position
        "x" => new_aircraft_state_vector[1] , "y" => new_aircraft_state_vector[2] , "z" => new_aircraft_state_vector[3],

        # New Velocity
        "vx" => new_aircraft_state_vector[4], "vy" => vertical_speed_post_collision_check, "vz" => new_aircraft_state_vector[6],

        # New Angular velocity
        "wx" => new_aircraft_state_vector[11], "wy" => new_aircraft_state_vector[12], "wz" => new_aircraft_state_vector[13],

        # New Quaternion orientation (normalized)
        "qx" => new_aircraft_state_vector[7], "qy" => new_aircraft_state_vector[8], "qz" => new_aircraft_state_vector[9], "qw" => new_aircraft_state_vector[10],

        # New Global forces
        "fx_global" => total_aero_and_propulsive_force_resultant[1], "fy_global" => total_aero_and_propulsive_force_resultant[2], "fz_global" => total_aero_and_propulsive_force_resultant[3],      

        # Aerodynamic angles (of previous state)
        "alpha" => initial_flight_conditions.alpha_rad  ,
        "beta"  => initial_flight_conditions.beta_rad ,

        # Rates of rotation (p, q, r) in body frame (of previous state)
        "p_roll_rate" => initial_flight_conditions.p_roll_rate, "r_yaw_rate" => initial_flight_conditions.r_yaw_rate, "q_pitch_rate" => initial_flight_conditions.q_pitch_rate ,

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
