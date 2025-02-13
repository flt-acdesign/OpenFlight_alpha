# Functions to calculate control-induced moment coefficients

function 🟢_rolling_moment_coefficient_due_to_control_attained(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians  
    Mach,                                   # Mach number
    aircraft_flight_physics_and_propulsive_data,  # Aircraft data struct
    aircraft_state,                         # Current aircraft state
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate rolling moment from aileron deflection
    # Multiply control effectiveness derivative by actual aileron deflection
    return aircraft_flight_physics_and_propulsive_data.derivative_roll_vs_aileron * 
           control_demand_vector_attained.roll_demand_attained
end

function 🟢_yawing_moment_coefficient_due_to_control_attained(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach,                                   # Mach number
    aircraft_flight_physics_and_propulsive_data,  # Aircraft data struct
    aircraft_state,                         # Current aircraft state
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate yawing moment from rudder deflection
    # Multiply control effectiveness derivative by actual rudder deflection
    return aircraft_flight_physics_and_propulsive_data.derivative_yaw_vs_rudder * 
           control_demand_vector_attained.yaw_demand_attained
end

function 🟢_pitching_moment_coefficient_due_to_control_attained(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach,                                   # Mach number
    aircraft_flight_physics_and_propulsive_data,  # Aircraft data struct
    aircraft_state,                         # Current aircraft state
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate pitching moment from elevator deflection plus zero-lift pitching moment
    # Combine control effectiveness with elevator deflection and add baseline moment
    return aircraft_flight_physics_and_propulsive_data.derivative_pitch_vs_elevator * 
           control_demand_vector_attained.pitch_demand_attained + 
           aircraft_flight_physics_and_propulsive_data.CM0
end

# Functions to calculate static stability (stiffness) moment coefficients

function 🟢_rolling_moment_coefficient_due_to_aerodynamic_stiffness(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    control_demand_vector_attained          # Actual control surface deflections
)
    # Currently returns zero - no static roll stability modeled
    return 0.0
end

function 🟢_yawing_moment_coefficient_due_to_aerodynamic_stiffness(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate weathercock stability contribution
    # Multiply directional stability derivative by sideslip angle
    return aircraft_flight_physics_and_propulsive_data.CN_beta * beta_RAD
end

function 🟢_pitching_moment_coefficient_due_to_aerodynamic_stiffness(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate pitch stability contribution
    # Multiply pitch stability derivative by angle of attack
    return aircraft_flight_physics_and_propulsive_data.CM_alpha * alpha_RAD
end

# Functions to calculate dynamic stability (damping) moment coefficients

function 🟢_rolling_moment_coefficient_due_to_aerodynamic_damping(
    p_roll_rate,                            # Roll rate in rad/s
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    v_body_magnitude                        # Airspeed magnitude
)
    # Calculate roll damping moment
    # Uses non-dimensional roll rate based on wingspan
    return aircraft_flight_physics_and_propulsive_data.Cl_p * 
           p_roll_rate * 
           aircraft_data.reference_span / 
           (v_body_magnitude * 2 + .001)
end

function 🟢_yawing_moment_coefficient_due_to_aerodynamic_damping(
    r_yaw_rate,                             # Yaw rate in rad/s
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    v_body_magnitude                        # Airspeed magnitude
)
    # Calculate yaw damping moment
    # Uses non-dimensional yaw rate based on wingspan
    return aircraft_flight_physics_and_propulsive_data.Cn_r * 
           r_yaw_rate * 
           aircraft_data.reference_span / 
           (v_body_magnitude * 2 + .001)
end

function 🟢_pitching_moment_coefficient_due_to_aerodynamic_damping(
    q_pitch_rate,                           # Pitch rate in rad/s
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    v_body_magnitude                        # Airspeed magnitude
)
    # Calculate pitch damping moment
    # Uses non-dimensional pitch rate based on mean aerodynamic chord
    return aircraft_flight_physics_and_propulsive_data.Cm_q * 
           q_pitch_rate * 
           aircraft_data.wing_mean_aerodynamic_chord / 
           (v_body_magnitude * 2 + .001)
end
