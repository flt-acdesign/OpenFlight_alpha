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
    return aircraft_flight_physics_and_propulsive_data.Cl_da * 
           control_demand_vector_attained.roll_demand_attained
end

function 🟢_yawing_moment_coefficient_due_to_yaw_control_attained(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach,                                   # Mach number
    aircraft_flight_physics_and_propulsive_data,  # Aircraft data struct
    aircraft_state,                         # Current aircraft state
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate yawing moment from rudder deflection
    # Multiply control effectiveness derivative by actual rudder deflection
    return aircraft_flight_physics_and_propulsive_data.Cn_dr * 
           control_demand_vector_attained.yaw_demand_attained
end

function 🟢_yawing_moment_coefficient_due_to_roll_control_attained(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach,                                   # Mach number
    aircraft_flight_physics_and_propulsive_data,  # Aircraft data struct
    aircraft_state,                         # Current aircraft state
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate yawing moment from rudder deflection
    # Multiply control effectiveness derivative by actual rudder deflection
    return aircraft_flight_physics_and_propulsive_data.Cn_da * 
           control_demand_vector_attained.roll_demand_attained
end




function 🟢_pitching_moment_coefficient_due_to_control_attained(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach,                                   # Mach number
    aircraft_flight_physics_and_propulsive_data,  # Aircraft data struct
    aircraft_state,                         # Current aircraft state
    control_demand_vector_attained          # Actual control surface deflections
)

   #print( aircraft_flight_physics_and_propulsive_data.Cm_trim)
    # Calculate pitching moment from elevator deflection plus zero-lift pitching moment plus pitching moment due to trim
    # Combine control effectiveness with elevator deflection and add baseline moment
    return aircraft_flight_physics_and_propulsive_data.Cm_de * control_demand_vector_attained.pitch_demand_attained + 
           aircraft_flight_physics_and_propulsive_data.Cm0 +
           aircraft_flight_physics_and_propulsive_data.Cm_trim
end

# Functions to calculate static stability (stiffness) moment coefficients



function 🟢_yawing_moment_coefficient_due_to_aerodynamic_stiffness(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate weathercock stability contribution
    # Multiply directional stability derivative by sideslip angle
    return aircraft_flight_physics_and_propulsive_data.Cn_beta * beta_RAD
end

function 🟢_rolling_moment_coefficient_due_to_sideslip(
    alpha_RAD,                              # Angle of attack in radians
    beta_RAD,                               # Sideslip angle in radians
    Mach_number,                            # Mach number
    aircraft_data,                          # Aircraft data struct
    control_demand_vector_attained          # Actual control surface deflections
)
    # Calculate weathercock stability contribution
    # Multiply directional stability derivative by sideslip angle
    return aircraft_flight_physics_and_propulsive_data.Cl_beta * beta_RAD * -1   # OJO! CHECK THIS SIGN
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
    return aircraft_flight_physics_and_propulsive_data.Cm_alpha * alpha_RAD
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
