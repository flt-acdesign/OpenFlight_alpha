

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


