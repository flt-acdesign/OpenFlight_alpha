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

# Pre-compute the inverse of the inertia tensor matrix
pre_computed_I_body_inverse = inv(aircraft_flight_physics_and_propulsive_data.I_body)     # pre-compute 3×3 inverse inertia tensor matrix

# ---------------------------------------------------------------------------
# The following functions must also use string keys when accessing dictionary fields:

function 🟢_compute_net_thrust_force_vector_body(alt, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
    # Calculate thrust force based on thrust lever input
    if control_demand_vector_attained.thrust_attained >= 0.0
        thrust_ratio = control_demand_vector_attained.thrust_attained
    else
        thrust_ratio = control_demand_vector_attained.thrust_attained * 0.3  # Max reverse thrust is 30% of forward thrust
    end
    
    # Use the dictionary key with quotes:
    thrust_force = thrust_ratio * aircraft_flight_physics_and_propulsive_data.maximum_thrust_at_sea_level
    
    # Also use the correct string key for thrust_installation_angle_DEG:
    install_angle_rad = deg2rad(aircraft_flight_physics_and_propulsive_data.thrust_installation_angle_DEG)
    return [
        thrust_force * cos(install_angle_rad),
        thrust_force * sin(install_angle_rad),
        0.0
    ]
end

function 🟢_compute_lift_coefficient(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
    alpha_stall = deg2rad(15.0)  # Stall angle in radians
    alpha_effective = clamp(alpha_RAD, -alpha_stall, alpha_stall)
    # Note the string key "Cl_vs_alpha_RAD"
    return aircraft_flight_physics_and_propulsive_data.Cl_vs_alpha_RAD * alpha_effective
end

function 🟢_compute_drag_coefficient(alpha_RAD, beta_RAD, MAch, aircraft_flight_physics_and_propulsive_data, CL, aircraft_state, control_demand_vector_attained)
    # Again, use string keys: "CD0", "AR", "Oswald_factor"
    return aircraft_flight_physics_and_propulsive_data.CD0 + CL^2 / (π * aircraft_flight_physics_and_propulsive_data.AR * aircraft_flight_physics_and_propulsive_data.Oswald_factor)
end

function 🟢_compute_sideforce_coefficient(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
    # Not yet implemented
    return 0.0
end




function 🟢_rolling_moment_coefficient_due_to_control_attained(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
    return aircraft_flight_physics_and_propulsive_data.derivative_roll_vs_aileron * control_demand_vector_attained.roll_demand_attained
end

function 🟢_yawing_moment_coefficient_due_to_control_attained(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
    return aircraft_flight_physics_and_propulsive_data.derivative_yaw_vs_rudder * control_demand_vector_attained.yaw_demand_attained
end

function 🟢_pitching_moment_coefficient_due_to_control_attained(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
    return aircraft_flight_physics_and_propulsive_data.derivative_pitch_vs_elevator * control_demand_vector_attained.pitch_demand_attained + aircraft_flight_physics_and_propulsive_data.CM0
end






function 🟢_rolling_moment_coefficient_due_to_aerodynamic_stiffness(alpha_RAD, beta_RAD, Mach_number, aircraft_data, control_demand_vector_attained)
    return 0.0
end

function 🟢_yawing_moment_coefficient_due_to_aerodynamic_stiffness(alpha_RAD, beta_RAD, Mach_number, aircraft_data, control_demand_vector_attained)
    return aircraft_flight_physics_and_propulsive_data.CN_beta * beta_RAD
end

function 🟢_pitching_moment_coefficient_due_to_aerodynamic_stiffness(alpha_RAD, beta_RAD, Mach_number, aircraft_data, control_demand_vector_attained)
    return aircraft_flight_physics_and_propulsive_data.CM_alpha * alpha_RAD
end



function 🟢_rolling_moment_coefficient_due_to_aerodynamic_damping(p_roll_rate, alpha_RAD, beta_RAD, Mach_number, aircraft_data)
    return aircraft_flight_physics_and_propulsive_data.Cl_p * p_roll_rate
end

function 🟢_yawing_moment_coefficient_due_to_aerodynamic_damping(r_yaw_rate, alpha_RAD, beta_RAD, Mach_number, aircraft_data)
    return aircraft_flight_physics_and_propulsive_data.Cn_r * r_yaw_rate
end

function 🟢_pitching_moment_coefficient_due_to_aerodynamic_damping(q_pitch_rate, alpha_RAD, beta_RAD, Mach_number, aircraft_data)
    return aircraft_flight_physics_and_propulsive_data.Cm_q * q_pitch_rate
end


