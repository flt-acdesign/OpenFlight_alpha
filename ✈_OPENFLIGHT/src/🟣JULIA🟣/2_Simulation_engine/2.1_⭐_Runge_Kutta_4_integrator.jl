function Runge_Kutta_4_integrator(
    initial_aircraft_state_vector::Vector{Float64},    # Initial state vector containing position, velocity, orientation, and angular velocity
    control_demand_vector::NamedTuple,                 # Desired control inputs (pitch, roll, yaw, thrust)
    deltaTime::Float64,                               # Time step for integration
    aircraft_flight_physics_and_propulsive_data       # Aircraft physical properties and flight characteristics
)

    # Step 1: Process Control Inputs
    # Convert the demanded control values into physically attainable values
    # considering actuator dynamics and physical limitations
    control_demand_vector_attained = convert_control_demanded_to_attained(
        aircraft_flight_physics_and_propulsive_data,
        control_demand_vector,
        deltaTime
    )

    # Calculate initial flight conditions (alpha, beta, rotation rates)
    # from the current state vector
    initial_flight_conditions = compute_flight_conditions_from_state_vector(
        initial_aircraft_state_vector, 
        aircraft_flight_physics_and_propulsive_data 
    )

    # Step 2: Runge-Kutta 4th Order Integration
    # Calculate four intermediate derivatives for RK4 integration

    # First derivative (k1) at initial state
    state_vec_derivative_1, global_force1 , flight_data_for_telemetry1 = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data, 
        initial_flight_conditions
    )

    # Second derivative (k2) at state + (dt/2)*k1
    state_vec_derivative_2, global_force2 , flight_data_for_telemetry2 = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector .+ (deltaTime / 2) .* state_vec_derivative_1,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data, 
        initial_flight_conditions
    )

    # Third derivative (k3) at state + (dt/2)*k2
    state_vec_derivative_3, global_force3 , flight_data_for_telemetry3 = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector .+ (deltaTime / 2) .* state_vec_derivative_2,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data,
        initial_flight_conditions
    )

    # Fourth derivative (k4) at state + dt*k3
    state_vec_derivative_4, global_force4 , flight_data_for_telemetry4  = compute_6DOF_equations_of_motion(
        initial_aircraft_state_vector .+ deltaTime .* state_vec_derivative_3,
        control_demand_vector_attained,
        aircraft_flight_physics_and_propulsive_data,
        initial_flight_conditions
    )

    # Step 3: Compute Final State
    # Combine all derivatives using RK4 formula: new_state = initial_state + (dt/6)*(k1 + 2k2 + 2k3 + k4)
    new_aircraft_state_vector = initial_aircraft_state_vector .+ (deltaTime / 6.0) .* 
        (state_vec_derivative_1 .+ 2 .* state_vec_derivative_2 .+ 2 .* state_vec_derivative_3 .+ state_vec_derivative_4)

    # Step 4: Average Forces and data for telemetry
    # Calculate average force over the time step using all four RK4 stages
    total_aero_and_propulsive_force_resultant = (global_force1 .+ global_force2 .+ global_force3 .+ global_force4) ./ 4
    average_flight_data_for_telemetry = (flight_data_for_telemetry1 .+ flight_data_for_telemetry2 .+ flight_data_for_telemetry3 .+ flight_data_for_telemetry4) ./ 4


    # Step 5: Handle Ground Interactions
    # Check for collisions and adjust vertical velocity if necessary
    vertical_speed_post_collision_check = handle_collisions(new_aircraft_state_vector[2], new_aircraft_state_vector[5])

    # Step 6: Package Results
    # Return a dictionary containing all updated state variables and flight information
    return Dict(
        # Position components (x, y, z)
        "x" => new_aircraft_state_vector[1], 
        "y" => new_aircraft_state_vector[2], 
        "z" => new_aircraft_state_vector[3],

        # Velocity components (vx, vy, vz)
        "vx" => new_aircraft_state_vector[4], 
        "vy" => vertical_speed_post_collision_check, 
        "vz" => new_aircraft_state_vector[6],

        # Angular velocities (wx, wy, wz)
        "wx" => new_aircraft_state_vector[11], 
        "wy" => new_aircraft_state_vector[12], 
        "wz" => new_aircraft_state_vector[13],

        # Quaternion orientation (qx, qy, qz, qw)
        "qx" => new_aircraft_state_vector[7], 
        "qy" => new_aircraft_state_vector[8], 
        "qz" => new_aircraft_state_vector[9], 
        "qw" => new_aircraft_state_vector[10],

        # Global forces
        "fx_global" => total_aero_and_propulsive_force_resultant[1], 
        "fy_global" => total_aero_and_propulsive_force_resultant[2], 
        "fz_global" => total_aero_and_propulsive_force_resultant[3],      

        # Aerodynamic angles
        "alpha_RAD" => initial_flight_conditions.alpha_rad,
        "beta_RAD"  => initial_flight_conditions.beta_rad,

        # Body frame rotation rates
        "p_roll_rate" => initial_flight_conditions.p_roll_rate, 
        "r_yaw_rate" => initial_flight_conditions.r_yaw_rate, 
        "q_pitch_rate" => initial_flight_conditions.q_pitch_rate,

        # Control demands and attained values
        "pitch_demand" => control_demand_vector.pitch_demand,
        "roll_demand" => control_demand_vector.roll_demand,
        "yaw_demand" => control_demand_vector.yaw_demand,
        "thrust_setting_demand" => control_demand_vector_attained.thrust_setting_demand,
        "pitch_demand_attained" => control_demand_vector_attained.pitch_demand_attained,
        "roll_demand_attained" => control_demand_vector_attained.roll_demand_attained,
        "yaw_demand_attained" => control_demand_vector_attained.yaw_demand_attained,
        "thrust_attained" => control_demand_vector_attained.thrust_attained,

    # Additional flight data for telemetry

    "CL"  => average_flight_data_for_telemetry[1],                     
    "CD"  => average_flight_data_for_telemetry[2],  
    "CL/CD"  => average_flight_data_for_telemetry[3], 
    "CS"  => average_flight_data_for_telemetry[4], 

    "nx"  => average_flight_data_for_telemetry[5], 
    "nz"  => average_flight_data_for_telemetry[6], 
    "ny"  => average_flight_data_for_telemetry[7], 

    "CM_roll_from_aero_forces"   => average_flight_data_for_telemetry[8], 
    "CM_yaw_from_aero_forces"   => average_flight_data_for_telemetry[9], 
    "CM_pitch_from_aero_forces"   => average_flight_data_for_telemetry[10], 

    "CM_roll_from_control"   => average_flight_data_for_telemetry[11], 
    "CM_yaw_from_control"   => average_flight_data_for_telemetry[12], 
    "CM_pitch_from_control"   => average_flight_data_for_telemetry[13], 

    "CM_roll_from_aero_stiffness"   => average_flight_data_for_telemetry[14], 
    "CM_yaw_from_aero_stiffness"   => average_flight_data_for_telemetry[15], 
    "CM_pitch_from_aero_stiffness"   => average_flight_data_for_telemetry[16], 

    "CM_roll_from_aero_damping"   => average_flight_data_for_telemetry[17], 
    "CM_yaw_from_aero_damping"   => average_flight_data_for_telemetry[18], 
    "CM_pitch_from_aero_damping"   => average_flight_data_for_telemetry[19],

    "q_pitch_rate"   => average_flight_data_for_telemetry[20],
    "p_roll_rate" => average_flight_data_for_telemetry[21],
    "r_yaw_rate" => average_flight_data_for_telemetry[22], 

    "TAS" => average_flight_data_for_telemetry[23], 
    "EAS" => average_flight_data_for_telemetry[24], 
    "Mach" => average_flight_data_for_telemetry[25], 
    "dynamic_pressure" => average_flight_data_for_telemetry[26] 

    )

end
