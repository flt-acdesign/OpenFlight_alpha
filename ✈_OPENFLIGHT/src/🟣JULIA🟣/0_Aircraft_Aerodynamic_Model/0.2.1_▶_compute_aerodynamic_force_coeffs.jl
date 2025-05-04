
function 🟩_compute_lift_coefficient(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
    #alpha_stall = deg2rad(15.0)  # Stall angle in radians
    #alpha_effective = clamp(alpha_RAD, -alpha_stall, alpha_stall)
    # Note the string key "Cl_vs_alpha_RAD"
    #return aircraft_flight_physics_and_propulsive_data.Cl_vs_alpha_RAD * alpha_effective

    # Note, beta is made positive as it is assumed that the aircraft is symmetric

    CL = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CL", Mach=Mach, beta = abs(rad2deg(beta_RAD)), alpha=rad2deg(alpha_RAD))  
    return CL
    
end



function 🟩_compute_sideforce_coefficient(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)

    CS = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CS", Mach=Mach, beta = rad2deg(beta_RAD), alpha=rad2deg(alpha_RAD))
    return CS

end




function 🟩_compute_drag_coefficient(alpha_RAD, beta_RAD, Mach, aircraft_flight_physics_and_propulsive_data, CL, CS, aircraft_state, control_demand_vector_attained)
    # Again, use string keys: "CD0", "AR", "Oswald_factor"

    CD0_pure_parasitic = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CD0", Mach=Mach, beta = abs(rad2deg(beta_RAD)), alpha=rad2deg(alpha_RAD))

    CDi_Lift = CL^2 / (π * aircraft_flight_physics_and_propulsive_data.AR * aircraft_flight_physics_and_propulsive_data.Oswald_factor)

    CDi_Sideslip = abs(CS^2 ) * fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Sideslip_drag_K_factor")

    CD_Total = CD0_pure_parasitic + CDi_Lift + CDi_Sideslip

    return CD_Total
end



