# Convert your dictionary to a NamedTuple
aircraft_flight_physics_and_propulsive_data = (

    aircraft_mass = 3.0,                # Kg  Aircraft total mass
    reference_area = 8.0,               # m^2  Wing reference area
    Cl_vs_alpha_RAD = 0.3,              # 1/rad, dCL/dalpha
    AR = 10.0,                          # Wing Aspect Ratio (ADIM)
    Oswald_factor = 0.7,                # Span efficiency factor (Oswald factor)
    CD0 = 0.02,                         # Drag coefficient at zero lift

    wing_mean_aerodynamic_chord = 1.2,  # Mean Aerodynamic Chord (m)

    derivative_roll_vs_aileron = 0.0001,     # d_C_rolling_moment/d_aileron (per rad)
    derivative_pitch_vs_elevator = 0.00025,  # d_C_pitching_moment/d_elevator (per rad)
    derivative_yaw_vs_rudder = 0.00004,      # d_C_yawing_moment/d_rudder (per rad)

    CM0 = 0.00013,        # Zero-lift pitching moment coefficient
    CN_beta = 0.0003,     # Derivative of yawing moment w.r.t. sideslip angle
    CM_alpha = -0.004,    # Derivative of pitching moment w.r.t. angle of attack

    Cl_p = -0.00006,      # Roll damping coefficient
    Cm_q = -0.00002,      # Pitch damping coefficient
    Cn_r = -0.0001,       # Yaw damping coefficient

    maximum_thrust_at_sea_level = 120.0,     # Static thrust at sea level (N)
    thrust_installation_angle_DEG = 0.0,      # Tilt of thrust line wrt x-axis (deg)

    control_actuator_speed = 3.0,      # Actuator speed ratio (amplitude/sec)
    engine_spool_up_speed = 1.3,       # Spool-up speed (fraction of max thrust/sec)
    engine_spool_down_speed = 1.1,     # Spool-down speed (fraction of max thrust/sec)

    I_body = [
        1/6  0.0  0.0;
        0.0  1/6  0.0;
        0.0  0.0  1/6
    ]       # 3×3 inertia tensor matrix
    
)

