
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


