"""
    Runge_Kutta_4_integrator(state_vector, force_control_inputs, moment_control_inputs, deltaTime, aircraft_model_data)

Performs a single integration step of the 6-DOF equations of motion using 
the 4th-order Runge-Kutta method (RK4). Also accounts for actuator dynamics
by converting demanded controls to those actually attained.

# Arguments
- `state_vector`: A vector of states (e.g., `[pos_x, pos_y, pos_z, vel_x, vel_y, vel_z, qx, qy, qz, qw, wx, wy, wz]`).
- `force_control_inputs`: NamedTuple or dictionary with demanded forces (`thrust_setting_demand`, etc.).
- `moment_control_inputs`: NamedTuple or dictionary with demanded moments (`roll_demand`, `pitch_demand`, `yaw_demand`, etc.).
- `deltaTime`: Integration time step (s).
- `aircraft_model_data`: Dictionary (or struct) with aircraft parameters, 
  used in `convert_control_demanded_to_attained` and in `compute_6DOF_equations_of_motion`.

# Returns
A dictionary containing:
- `:state_vector_new`: The updated state vector after integration.
- `:new_position_x, :new_position_y, :new_position_z`: Updated positions.
- `:new_velocity_x, :new_velocity_y, :new_velocity_z`: Updated velocities (after collision checks, etc.).
- `:new_qx, :new_qy, :new_qz, :new_qw`: Updated quaternion representing orientation (normalized).
- `:new_wx, :new_wy, :new_wz`: Updated angular velocities.
- `:fx_global, :fy_global, :fz_global`: Global force components (averaged from RK4 steps).
- `:alpha_avg, :beta_avg`: Some average angles (AoA, sideslip) from the RK4 steps, if relevant.

Typical usage:


"""
function Runge_Kutta_4_integrator(
    state_vector,
    control_demand_vector,
    deltaTime,
    aircraft_flight_physics_and_propulsive_data
)

    # -------------------------------------------------------------------------
    # 1. Convert demanded controls to the actually attainable controls
    #    (accounting for actuator dynamics).
    control_demand_vector_attained = convert_control_demanded_to_attained(
        aircraft_flight_physics_and_propulsive_data,
        control_demand_vector,
        deltaTime
    )

    # -------------------------------------------------------------------------
    # 2. Compute the 4 intermediate derivatives (k1, k2, k3, k4) using RK4

    # k1
    k1, force_total_k1, alpha_k1, beta_k1 = compute_6DOF_equations_of_motion(
        state_vector,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # k2
    k2, force_total_k2, alpha_k2, beta_k2 = compute_6DOF_equations_of_motion(
        state_vector .+ (deltaTime / 2) .* k1,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # k3
    k3, force_total_k3, alpha_k3, beta_k3 = compute_6DOF_equations_of_motion(
        state_vector .+ (deltaTime / 2) .* k2,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # k4
    k4, force_total_k4, alpha_k4, beta_k4 = compute_6DOF_equations_of_motion(
        state_vector .+ deltaTime .* k3,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data
    )

    # -------------------------------------------------------------------------
    # 3. Combine k1..k4 for the final RK4 integration step
    state_vector_new = state_vector .+ (deltaTime / 6.0) .* (k1 .+ 2 .* k2 .+ 2 .* k3 .+ k4)

    # -------------------------------------------------------------------------
    # 4. Compute average forces and angles (if desired) from the RK4 steps
    force_global = (force_total_k1 .+ 2 .* force_total_k2 .+ 2 .* force_total_k3 .+ force_total_k4) ./ 6
    fx_global = force_global[1]
    fy_global = force_global[2]
    fz_global = force_global[3]

    alpha_avg = (alpha_k1 + 2*alpha_k2 + 2*alpha_k3 + alpha_k4) / 6
    beta_avg  = (beta_k1 + 2*beta_k2 + 2*beta_k3 + beta_k4) / 6

    # -------------------------------------------------------------------------
    # 5. Extract new positions, velocities, orientation, and angular velocities

    # Positions
    new_position_x = state_vector_new[1]
    new_position_y = state_vector_new[2]
    new_position_z = state_vector_new[3]

    # Linear velocities
    new_velocity_x = state_vector_new[4]
    new_velocity_y = state_vector_new[5]
    new_velocity_z = state_vector_new[6]

    # Quaternion
    new_qx = state_vector_new[7]
    new_qy = state_vector_new[8]
    new_qz = state_vector_new[9]
    new_qw = state_vector_new[10]

    # Angular velocities
    new_wx = state_vector_new[11]
    new_wy = state_vector_new[12]
    new_wz = state_vector_new[13]

    # -------------------------------------------------------------------------
    # 6. Normalize the quaternion to avoid drift due to numerical integration
    #    (quat_normalize is user-defined).
    q_new   = quat_normalize([new_qw, new_qx, new_qy, new_qz])
    new_qw  = q_new[1]
    new_qx  = q_new[2]
    new_qy  = q_new[3]
    new_qz  = q_new[4]

    # -------------------------------------------------------------------------
    # 7. Handle collisions or ground effect if needed (user-defined function).
    new_velocity_y = handle_collisions(new_position_y, new_velocity_y)

    # -------------------------------------------------------------------------
    # 8. Return a dictionary of results for convenience
    return Dict(
        :state_vector_new => state_vector_new,
        :new_position_x   => new_position_x,
        :new_position_y   => new_position_y,
        :new_position_z   => new_position_z,

        :new_velocity_x   => new_velocity_x,
        :new_velocity_y   => new_velocity_y,
        :new_velocity_z   => new_velocity_z,

        :new_qx           => new_qx,
        :new_qy           => new_qy,
        :new_qz           => new_qz,
        :new_qw           => new_qw,

        :new_wx           => new_wx,
        :new_wy           => new_wy,
        :new_wz           => new_wz,

        :fx_global        => fx_global,
        :fy_global        => fy_global,
        :fz_global        => fz_global,
        
        :alpha_avg        => alpha_avg,
        :beta_avg         => beta_avg,

        :thrust_setting_demand => control_demand_vector_attained.thrust_setting_demand,
        :thrust_attained => control_demand_vector_attained.thrust_attained,

        :pitch_demand_attained => control_demand_vector_attained.pitch_demand_attained,
        :roll_demand_attained  => control_demand_vector_attained.roll_demand_attained,
        :yaw_demand_attained   => control_demand_vector_attained.yaw_demand_attained,

        :pitch_demand          => control_demand_vector.pitch_demand,
        :roll_demand           => control_demand_vector.roll_demand,
        :yaw_demand            => control_demand_vector.yaw_demand            
    )
end
