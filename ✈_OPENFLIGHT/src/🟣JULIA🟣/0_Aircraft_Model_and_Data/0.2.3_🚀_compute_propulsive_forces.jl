


function 🔺_compute_net_thrust_force_vector_body(alt, Mach, aircraft_flight_physics_and_propulsive_data, aircraft_state, control_demand_vector_attained)
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
