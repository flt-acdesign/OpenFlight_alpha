
cd(@__DIR__)

filename = joinpath(@__DIR__, raw"./📜_Aero_data/SF25B.yaml")
println("DEBUG: Attempting to load YAML from: $filename")
println("DEBUG: isfile(filename)? ", isfile(filename))

json_data = YAML.load_file(filename)





aircraft_aero_and_propulsive_database = parse_aero_data(json_data)

 # OJO!!! revisar completamente y validar
function compute_inertial_tensor_body_frame(aircraft_mass, radius_of_giration_pitch, radius_of_giration_roll, radius_of_giration_yaw, principal_axis_pitch_up_DEG  ) 
    I_body_principal_axes = [
        aircraft_mass * radius_of_giration_roll^2  0.0  0.0;
        0.0  aircraft_mass * radius_of_giration_yaw^2   0.0;
        0.0  0.0  aircraft_mass * radius_of_giration_pitch^2
    ]

    # Convert angle to radians
    θ = deg2rad(principal_axis_pitch_up_DEG)
    
    # Rotation matrix around z-axis
    R = [
        cos(θ)  -sin(θ)  0.0;
        sin(θ)   cos(θ)  0.0;
        0.0      0.0     1.0
    ]
    
    # Compute rotated inertia tensor: I_body = R * I_body_principal_axes * R'
    I_body = R * I_body_principal_axes * transpose(R)

    return I_body
end



aircraft_flight_physics_and_propulsive_data = (
    # Aircraft mass and geometry
    aircraft_mass = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "aircraft_mass"),

    x_CoG = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_CoG"),
    x_wing_aerodynamic_center = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_wing_aerodynamic_center"),

    wing_lift_lever_arm_wrt_CoG_over_MAC = -1 * (
        (fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_wing_aerodynamic_center")) - 
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_CoG")) 
        / fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "wing_mean_aerodynamic_chord"), 


    reference_area = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "reference_area"),
    #Cl_vs_alpha_RAD = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_vs_alpha_RAD"),
    AR = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "AR"),
    Oswald_factor = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Oswald_factor"),

    #CD0 = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CD0"),

    #CD0 = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CD0", Mach=0.0),

    wing_mean_aerodynamic_chord = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "wing_mean_aerodynamic_chord"),

    # Control derivatives
    derivative_roll_vs_aileron = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "derivative_roll_vs_aileron"),     # d_C_rolling_moment/d_aileron (per rad)
    derivative_pitch_vs_elevator = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "derivative_pitch_vs_elevator"),  # d_C_pitching_moment/d_elevator (per rad)
    derivative_yaw_vs_rudder = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "derivative_yaw_vs_rudder"),      # d_C_yawing_moment/d_rudder (per rad)

    # Static stability derivatives
    CM0 = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CM0"),        # Zero-lift pitching moment coefficient
    CN_beta = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CN_beta"),     # Derivative of yawing moment w.r.t. sideslip angle
    CM_alpha = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CM_alpha"),    # Derivative of pitching moment w.r.t. angle of attack

    # Dynamic stability derivatives
    Cl_p = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_p"),      # Roll damping coefficient
    Cm_q = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cm_q"),      # Pitch damping coefficient
    Cn_r = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cn_r"),       # Yaw damping coefficient

    # Propulsion
    maximum_thrust_at_sea_level = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "maximum_thrust_at_sea_level"),     # Static thrust at sea level (N)
    thrust_installation_angle_DEG = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "thrust_installation_angle_DEG"),      # Tilt of thrust line wrt x-axis (deg)

    # Actuator dynamics
    control_actuator_speed = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "control_actuator_speed"),      # Actuator speed ratio (amplitude/sec)
    engine_spool_up_speed = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "engine_spool_up_speed"),       # Spool-up speed (fraction of max thrust/sec)
    engine_spool_down_speed = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "engine_spool_down_speed"),     # Spool-down speed (fraction of max thrust/sec)

    # Inertia matrix
    I_body = compute_inertial_tensor_body_frame(
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "aircraft_mass"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_pitch"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_roll"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_yaw"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "principal_axis_pitch_up_DEG"),
    )

)

