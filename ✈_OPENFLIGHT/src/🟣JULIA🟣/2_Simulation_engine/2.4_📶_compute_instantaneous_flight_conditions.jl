function compute_flight_conditions_from_state_vector(initial_aircraft_state_vector, aircraft_data)

    # === 1) UNPACK THE AIRCRAFT STATE ===
    # Note: The order (lat, alt, lon) is inherited from babylon.js or other external constraints.
    latitude  = initial_aircraft_state_vector[1]
    altitude  = initial_aircraft_state_vector[2]
    longitude = initial_aircraft_state_vector[3]

    T, p, rho, speed_of_sound, density_ratio = atmosphere_isa(altitude)

    vx = initial_aircraft_state_vector[4]
    vy = initial_aircraft_state_vector[5]
    vz = initial_aircraft_state_vector[6]
    
    # Quaternion: [qx, qy, qz, qw]
    qx = initial_aircraft_state_vector[7]
    qy = initial_aircraft_state_vector[8]
    qz = initial_aircraft_state_vector[9]
    qw = initial_aircraft_state_vector[10]

    # Body angular rates: p, r, q (roll, yaw, pitch rates)
    p_roll_rate  = initial_aircraft_state_vector[11]
    r_yaw_rate   = initial_aircraft_state_vector[12]
    q_pitch_rate = initial_aircraft_state_vector[13]

    # Normalize the orientation quaternion to avoid numerical drift
    global_orientation_quaternion = quat_normalize([qw, qx, qy, qz])

    # Body angular velocity vector
    omega_body = SVector(p_roll_rate, r_yaw_rate, q_pitch_rate)

    # Angular velocity as a quaternion
    omega_body_quaternion = [0.0, p_roll_rate, r_yaw_rate, q_pitch_rate]

    # Quaternion derivative 
    # q_dot = 0.5 * (global_orientation_quaternion ⨂ ω_body)
    q_dot = 0.5 * quat_multiply(global_orientation_quaternion, omega_body_quaternion)

    # === 2) FORCES & LINEAR ACCELERATIONS ===

    # Global velocity vector
    v_global = SVector(vx, vy, vz)

    # Velocity in the body frame
    v_body = rotate_vector_global_to_body(v_global, global_orientation_quaternion)
    v_body_magnitude = norm(v_body) + 1e-6  # Avoid division by zero

    # Dynamic pressure
    dynamic_pressure = .5 * v_body_magnitude ^2 * rho

    # Mach number
    Mach_number = v_body_magnitude / speed_of_sound

    # Angles of attack (alpha) and sideslip (beta) in radians
    alpha_rad = -my_atan2(v_body[2], v_body[1])
    beta_rad  = -my_atan2(v_body[3], v_body[1])

    aircraft_mass = aircraft_data.aircraft_mass  # this and the inertia could change due to fuel burn

    I_body = aircraft_data.I_body

    # Pre-compute the inverse of the inertia tensor matrix
    I_body_inverse = inv(aircraft_data.I_body)     # pre-compute 3×3 inverse inertia tensor matrix

    return ( # named tuple with current flight conditions derived from the state vector
        # Unpacked variables
        latitude  = latitude,
        altitude  = altitude,
        longitude = longitude,
        
        vx = vx,
        vy = vy,
        vz = vz,

        TAS = v_body_magnitude, 
        EAS = v_body_magnitude * density_ratio,

        qx = qx,
        qy = qy,
        qz = qz,
        qw = qw,

        p_roll_rate  = p_roll_rate,
        r_yaw_rate   = r_yaw_rate,
        q_pitch_rate = q_pitch_rate,

        # Derived variables
        global_orientation_quaternion = global_orientation_quaternion,
        v_global            = v_global,
        v_body              = v_body,
        v_body_magnitude    = v_body_magnitude,
        dynamic_pressure    = dynamic_pressure,
        Mach_number         = Mach_number,
        alpha_rad           = alpha_rad,
        beta_rad            = beta_rad,
    
        omega_body = omega_body, 

        # Angular velocity as a quaternion
        omega_body_quaternion = omega_body_quaternion,
    
        # Quaternion derivative 
        # q_dot = 0.5 * (global_orientation_quaternion ⨂ ω_body)
        q_dot = q_dot,

        aircraft_mass = aircraft_mass,  # this and the inertia could change due to fuel burn

        I_body = I_body,
        # Pre-compute the inverse of the inertia tensor matrix
        I_body_inverse = I_body_inverse     # pre-compute 3×3 inverse inertia tensor matrix to save time in RK4 evaluations
    )
end
