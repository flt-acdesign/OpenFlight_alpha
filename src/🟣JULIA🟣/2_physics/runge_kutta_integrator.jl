
# Called from update_state

# External function for RK4 integration and state update
function Runge_Kutta_4_integrator(s, force_control_inputs, moment_control_inputs, deltaTime, aircraft_model_data)
    # Runge-Kutta 4th order integration
    k1, force_total_k1, alpha_k1, beta_k1 = compute_6DOF_equations_of_motion(s, force_control_inputs, moment_control_inputs, aircraft_model_data)
    k2, force_total_k2, alpha_k2, beta_k2 = compute_6DOF_equations_of_motion(s .+ (deltaTime / 2) .* k1, force_control_inputs, moment_control_inputs, aircraft_model_data)
    k3, force_total_k3, alpha_k3, beta_k3 = compute_6DOF_equations_of_motion(s .+ (deltaTime / 2) .* k2, force_control_inputs, moment_control_inputs, aircraft_model_data)
    k4, force_total_k4, alpha_k4, beta_k4 = compute_6DOF_equations_of_motion(s .+ deltaTime .* k3, force_control_inputs, moment_control_inputs, aircraft_model_data)

    s_new = s .+ (deltaTime / 6) .* (k1 .+ 2 .* k2 .+ 2 .* k3 .+ k4)  # Updated state (original + delta_S)

    # Vectorized calculation for global forces
    force_global = (force_total_k1 .+ 2 .* force_total_k2 .+ 2 .* force_total_k3 .+ force_total_k4) ./ 6

    # Extract the components from the vector
    fx_global, fy_global, fz_global = force_global[1], force_global[2], force_global[3]

    # Average angles from the RK4 steps
    alpha_avg = (alpha_k1 + 2 * alpha_k2 + 2 * alpha_k3 + alpha_k4) / 6
    beta_avg = (beta_k1 + 2 * beta_k2 + 2 * beta_k3 + beta_k4) / 6

    # Extract new positions, velocities, orientations, and angular velocities
    new_position_x, new_position_y, new_position_z = s_new[1], s_new[2], s_new[3]
    new_velocity_x, new_velocity_y, new_velocity_z = s_new[4], s_new[5], s_new[6]
    new_qx, new_qy, new_qz, new_qw = s_new[7], s_new[8], s_new[9], s_new[10]
    new_wx, new_wy, new_wz = s_new[11], s_new[12], s_new[13]

    # Normalize the quaternion
    q_new = quat_normalize([new_qw, new_qx, new_qy, new_qz])
    new_qw, new_qx, new_qy, new_qz = q_new[1], q_new[2], q_new[3], q_new[4]

    new_velocity_y = handle_collisions(new_position_y, new_velocity_y)   # Handle ground collision

    # The return of this function is a dicctionary with all the relevant variables
    # it gets parsed in the update_and_write_state function
    return Dict(
        :s_new => s_new,
        :new_position_x => new_position_x,
        :new_position_y => new_position_y,
        :new_position_z => new_position_z,
        :new_velocity_x => new_velocity_x,
        :new_velocity_y => new_velocity_y,
        :new_velocity_z => new_velocity_z,
        :new_qx => new_qx,
        :new_qy => new_qy,
        :new_qz => new_qz,
        :new_qw => new_qw,
        :new_wx => new_wx,
        :new_wy => new_wy,
        :new_wz => new_wz,
        :fx_global => fx_global,
        :fy_global => fy_global,
        :fz_global => fz_global,
        :alpha_avg => alpha_avg,
        :beta_avg => beta_avg
    )
end
