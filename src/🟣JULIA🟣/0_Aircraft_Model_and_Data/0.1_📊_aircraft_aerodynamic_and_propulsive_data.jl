


json_data = JSON.parsefile("data9.json")
aircraft_aero_and_propulsive_database = parse_aero_data(json_data)


aircraft_flight_physics_and_propulsive_data = (
    # Aircraft mass and geometry
    aircraft_mass = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "aircraft_mass"),
    reference_area = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "reference_area"),
    Cl_vs_alpha_RAD = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_vs_alpha_RAD"),
    AR = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "AR"),
    Oswald_factor = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Oswald_factor"),
    CD0 = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CD0"),
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
    I_body = [
        1/6  0.0  0.0;
        0.0  1/6  0.0;
        0.0  0.0  1/6
       ]    

)

