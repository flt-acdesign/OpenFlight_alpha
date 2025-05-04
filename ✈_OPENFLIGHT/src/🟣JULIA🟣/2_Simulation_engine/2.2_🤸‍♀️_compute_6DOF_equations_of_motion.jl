"""
    compute_6DOF_equations_of_motion(
        aircraft_state_vector,
        control_demand_vector_attained,
        aircraft_data::NamedTuple,
        initial_flight_conditions::NamedTuple # Added type hint for clarity
    )

Compute the 6-DOF equations of motion for the aircraft. This function is typically
called by the Runge-Kutta integrator to update the aircraft state.

# Arguments
- `aircraft_state_vector`          : The current aircraft state (position, orientation, velocity, angular rates).
- `control_demand_vector_attained` : Actual/attained control demands (thrust, control surface deflections, etc.).
- `aircraft_data`                  : A named tuple containing fixed aircraft parameters (mass, inertia, aero data, etc.).
- `initial_flight_conditions`      : A named tuple containing pre-calculated conditions (alpha, beta, Mach, dynamic pressure, etc.).

# Returns
A tuple containing:
1) `new_aircraft_state_vector`: Vector of time derivatives of the 13-dimensional state vector.
2) `total_propulsive_plus_aerodynamic_force_vector_global_N`: Total external force (excluding gravity) in Global Frame [N].
3) `flight_data_for_telemetry`: Vector of various flight parameters for logging/display.
"""
function compute_6DOF_equations_of_motion(
    aircraft_state_vector,
    control_demand_vector_attained,
    aircraft_data, # Keep flexible if not always NamedTuple, though preferred
    initial_flight_conditions) # Keep flexible if not always NamedTuple

    # === 1) PREPARE (Already done in initial_flight_conditions) ===
    # Unpacking state, calculating atmospheric properties, alpha, beta, Mach, q_inf etc.
    # is assumed to be done when creating `initial_flight_conditions`.

    # === 2) COMPUTE FORCES & LINEAR ACCELERATIONS ===

    # Compute thrust force in body frame
    propulsive_force_vector_body_N = 🔺_compute_net_thrust_force_vector_body(
        initial_flight_conditions.altitude,
        initial_flight_conditions.Mach_number,
        aircraft_data, # Pass the main aircraft data structure
        aircraft_state_vector, # Pass state if needed by thrust model (though maybe not currently used for magnitude)
        control_demand_vector_attained
    )

    # Compute aerodynamic force coefficients
    # Pass aircraft_data which contains aircraft_flight_physics_and_propulsive_data
    CL  = 🟩_compute_lift_coefficient(
        initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
        aircraft_data, # Pass the main aircraft data structure
        aircraft_state_vector, # Pass state if needed
        control_demand_vector_attained # Pass controls if needed
    )

    CS = 🟩_compute_sideforce_coefficient(
        initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
        aircraft_data,
        aircraft_state_vector,
        control_demand_vector_attained
    )

    CD = 🟩_compute_drag_coefficient(
        initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
        aircraft_data,
        CL,CS,
        aircraft_state_vector,
        control_demand_vector_attained
    )


    # Aerodynamic forces in wind frame [D, Y, L] - Note: Standard definition F_W = [-D, Y, -L]
    # Let's calculate D, Y, L first based on positive coefficients CD, CS, CL
    D_force = initial_flight_conditions.dynamic_pressure * aircraft_data.reference_area * CD
    Y_force = initial_flight_conditions.dynamic_pressure * aircraft_data.reference_area * CS # Sign depends on CS definition
    L_force = initial_flight_conditions.dynamic_pressure * aircraft_data.reference_area * CL

    # Transform aerodynamic forces from wind to body frame (standard axes Xfwd, Yright, Zdown)
    # Input expects (D, Y, L) based on magnitude/coefficient definitions
    Fxb_std, Fyb_std, Fzb_std = transform_aerodynamic_forces_from_wind_to_body_frame(
        D_force,
        Y_force,
        L_force,
        initial_flight_conditions.alpha_rad,
        initial_flight_conditions.beta_rad
    )

    # Adjust to the simulator's internal body-axis convention (Xfwd, Yup, Zright)
    # Fx_sim = Fx_std, Fy_sim = -Fz_std, Fz_sim = -Fy_std
    aerodynamic_force_vector_body_N = [Fxb_std, -Fzb_std, -Fyb_std]

    # Sum propulsive + aerodynamic forces in body axes (simulator convention)
    total_propulsive_plus_aerodynamic_force_vector_body_N = propulsive_force_vector_body_N + aerodynamic_force_vector_body_N

    # Calculate load factors in body axes (simulator convention)
    load_factors_body_axis = total_propulsive_plus_aerodynamic_force_vector_body_N ./ (initial_flight_conditions.aircraft_mass * GRAVITY_ACCEL)

    # Rotate sum back to the global frame (NED or ENU based on gravity vector)
    total_propulsive_plus_aerodynamic_force_vector_global_N = rotate_vector_body_to_global( # Use correct function name if different
         total_propulsive_plus_aerodynamic_force_vector_body_N,
         initial_flight_conditions.global_orientation_quaternion
    )

    # Weight force in global axes (Y-axis assumed vertical, negative is down)
    weight_force_global_N = SVector(0.0, -initial_flight_conditions.aircraft_mass * GRAVITY_ACCEL, 0.0) # Ensure SVector is available or use standard vector

    # Total force in global frame
    force_total_global_N = total_propulsive_plus_aerodynamic_force_vector_global_N + weight_force_global_N

    # Linear acceleration in global axes
    aircraft_CoG_acceleration_global = force_total_global_N / initial_flight_conditions.aircraft_mass


    # === 3) MOMENTS & ANGULAR ACCELERATIONS ===

    # --- Calculate Non-Dimensional Moment Coefficients ---
    # Note: Functions return coefficients in the order [Roll, Yaw, Pitch]

    # Moment coefficient due to lift acting at AC relative to CoG [0, 0, Cm_alpha_force]
    # Ensure aircraft_data has wing_lift_lever_arm_wrt_CoG_over_MAC field
    vector_of_moment_coefficients_due_to_aero_forces_body =
        [
            0.0,  # roll
            0.0,  # yaw
            aircraft_data.wing_lift_lever_arm_wrt_CoG_over_MAC * CL  # pitch
        ]

    # Control moment coefficients [Cl_control, Cn_control, Cm_control]
    vector_of_moment_coefficients_of_control_body =
        [
            🟢_rolling_moment_coefficient_due_to_control_attained(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, aircraft_state_vector, control_demand_vector_attained
            ),
            🟢_yawing_moment_coefficient_due_to_yaw_control_attained(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, aircraft_state_vector, control_demand_vector_attained) +
            🟢_yawing_moment_coefficient_due_to_roll_control_attained( # Adverse Yaw
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, aircraft_state_vector, control_demand_vector_attained
            ),
            🟢_pitching_moment_coefficient_due_to_control_attained(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, aircraft_state_vector, control_demand_vector_attained
            )
        ]

    # Static stability moment coefficients [Cl_static, Cn_static, Cm_static]
    vector_of_moment_coefficients_of_static_stability_body =
        [
            🟢_rolling_moment_coefficient_due_to_sideslip(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, control_demand_vector_attained # Check if control needed here? Maybe just aircraft_data
            ),
            🟢_yawing_moment_coefficient_due_to_aerodynamic_stiffness(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, control_demand_vector_attained # Check if control needed here? Maybe just aircraft_data
            ),
            🟢_pitching_moment_coefficient_due_to_aerodynamic_stiffness(
                initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, control_demand_vector_attained # Check if control needed here? Maybe just aircraft_data
           )
        ]

    # Aerodynamic damping moment coefficients [Cl_damping, Cn_damping, Cm_damping]
    vector_of_moment_coefficients_of_aerodynamic_damping_body =
        [
            🟢_rolling_moment_coefficient_due_to_aerodynamic_damping(
                initial_flight_conditions.p_roll_rate, initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, initial_flight_conditions.v_body_magnitude
            ),
            🟢_yawing_moment_coefficient_due_to_aerodynamic_damping(
                initial_flight_conditions.r_yaw_rate, initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, initial_flight_conditions.v_body_magnitude
            ),
            🟢_pitching_moment_coefficient_due_to_aerodynamic_damping(
                initial_flight_conditions.q_pitch_rate, initial_flight_conditions.alpha_rad, initial_flight_conditions.beta_rad, initial_flight_conditions.Mach_number,
                aircraft_data, initial_flight_conditions.v_body_magnitude
            )
        ]

    # Sum the non-dimensional moment coefficients [Cl, Cn, Cm]
    sum_of_coeffs = (
         vector_of_moment_coefficients_due_to_aero_forces_body +
         vector_of_moment_coefficients_of_control_body +
         vector_of_moment_coefficients_of_static_stability_body +
         vector_of_moment_coefficients_of_aerodynamic_damping_body
         )

    # --- CORRECTED Moment Dimensionalization ---
    # Define the correct reference lengths corresponding to [Cl, Cn, Cm] -> [b, b, c_bar]
    # Ensure aircraft_data contains reference_span and wing_mean_aerodynamic_chord
    ref_lengths = [aircraft_data.reference_span, aircraft_data.reference_span, aircraft_data.wing_mean_aerodynamic_chord]

    # Calculate the base dimensionalization factor (dynamic pressure * reference area)
    base_moment_factor = initial_flight_conditions.dynamic_pressure * aircraft_data.reference_area

    # Correctly dimensionalize the moments element-wise: M = base_factor * ref_length * C_m
    # The '.*' performs element-wise multiplication in Julia
    total_moment_in_body_frame = base_moment_factor .* ref_lengths .* sum_of_coeffs
    # The resulting vector total_moment_in_body_frame now represents [L_roll, N_yaw, M_pitch]

    # --- Angular Acceleration Calculation ---
    # Inverse dynamics for angular acceleration in body frame using Euler's equation:
    # α_body = I_body⁻¹ * [ M_external - ω_body × (I_body * ω_body) ]
    # Ensure omega_body = [p, r, q] matches the moment vector order [L, N, M] and inertia tensor structure.
    angular_acceleration_body = initial_flight_conditions.I_body_inverse * (total_moment_in_body_frame - cross(initial_flight_conditions.omega_body, initial_flight_conditions.I_body * initial_flight_conditions.omega_body))


    # === 4) RETURN THE STATE DERIVATIVES + FLIGHT CONDITIONS ===

    # State derivatives vector (order matters for the integrator)
    # [dx/dt, dy/dt, dz/dt, dvx/dt, dvy/dt, dvz/dt, dqx/dt, dqy/dt, dqz/dt, dqw/dt, dwx/dt, dwy/dt, dwz/dt]
    new_aircraft_state_vector = [
        # Linear Velocities (derivative of position)
        aircraft_state_vector[4],  # dx/dt = vx
        aircraft_state_vector[5],  # dy/dt = vy
        aircraft_state_vector[6],  # dz/dt = vz

        # Linear Accelerations (derivative of velocity) - in Global Frame
        aircraft_CoG_acceleration_global[1],  # dvx/dt
        aircraft_CoG_acceleration_global[2],  # dvy/dt
        aircraft_CoG_acceleration_global[3],  # dvz/dt

        # Quaternion Derivatives (derivative of orientation)
        initial_flight_conditions.q_dot[2],  # dqx/dt
        initial_flight_conditions.q_dot[3],  # dqy/dt
        initial_flight_conditions.q_dot[4],  # dqz/dt
        initial_flight_conditions.q_dot[1],  # dqw/dt (Note: scalar part often first in q_dot)

        # Angular Accelerations (derivative of angular velocity) - in Body Frame [p_dot, r_dot, q_dot]
        angular_acceleration_body[1],  # dwx/dt = dp/dt (roll acceleration)
        angular_acceleration_body[2],  # dwy/dt = dr/dt (yaw acceleration)
        angular_acceleration_body[3]   # dwz/dt = dq/dt (pitch acceleration)
    ]

    # Prepare telemetry data vector (ensure order matches definition in reset_flight_data_recording)
    flight_data_for_telemetry = [
        CL,
        CD,
        (abs(CD) > 1e-9 ? CL/CD : 0.0), # Avoid division by zero/inf
        CS,

        load_factors_body_axis[1], # nx_body
        load_factors_body_axis[2], # ny_body (Sim axes: Side force component load)
        load_factors_body_axis[3], # nz_body (Sim axes: Lift component load, usually negative)

        vector_of_moment_coefficients_due_to_aero_forces_body[1], # Cl_forces
        vector_of_moment_coefficients_due_to_aero_forces_body[2], # Cn_forces
        vector_of_moment_coefficients_due_to_aero_forces_body[3], # Cm_forces

        vector_of_moment_coefficients_of_control_body[1], # Cl_control
        vector_of_moment_coefficients_of_control_body[2], # Cn_control
        vector_of_moment_coefficients_of_control_body[3], # Cm_control

        vector_of_moment_coefficients_of_static_stability_body[1], # Cl_static
        vector_of_moment_coefficients_of_static_stability_body[2], # Cn_static
        vector_of_moment_coefficients_of_static_stability_body[3], # Cm_static

        vector_of_moment_coefficients_of_aerodynamic_damping_body[1], # Cl_damping
        vector_of_moment_coefficients_of_aerodynamic_damping_body[2], # Cn_damping
        vector_of_moment_coefficients_of_aerodynamic_damping_body[3], # Cm_damping

        initial_flight_conditions.q_pitch_rate, # q
        initial_flight_conditions.p_roll_rate,  # p
        initial_flight_conditions.r_yaw_rate,   # r

        initial_flight_conditions.TAS,
        initial_flight_conditions.EAS,
        initial_flight_conditions.Mach_number,
        initial_flight_conditions.dynamic_pressure,
    ]

    # Return state derivatives, global forces (excluding gravity), and telemetry data
    return (new_aircraft_state_vector, total_propulsive_plus_aerodynamic_force_vector_global_N, flight_data_for_telemetry)

end