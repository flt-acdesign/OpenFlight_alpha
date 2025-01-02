# Define the dictionary with Julia syntax
aircraft_model_data = Dict(
    "aircraft_mass" => 3.0,                     # Kg  Aircraft total mass
    "reference_area" => 8.0,                    # m^2  typically wing reference area
    "Cl_vs_alpha_RAD" => 0.3,                   # 1/rad   dCL/dalpha
    "AR" => 10.0,                               # Wing Aspect Ratio (ADIM)
    "Oswald_factor" => 0.7,                     # Span efficiency factor (Oswald factor) (ADIM)
    "CD0" => 0.02,                              # Aircraft Drag coefficient at zero lift (ADIM)

    "wing_mean_aerodynamic_chord" => 1.2,       # Aircraft Wing Mean Aerodynamic Chord (m)
    
    "derivative_roll_vs_aileron" => 0.0001,     # d_C_rolling_moment/d_aileron (per rad)
    "derivative_pitch_vs_elevator" => 0.00025,  # d_C_pitching_moment/d_elevator (per rad)
    "derivative_yaw_vs_rudder" => 0.00004,      # d_C_yawing_moment/d_rudder (per rad)
   
    "CM0" => 0.00013,                           # Aircraft zero lift pitching moment coefficient (ADIM)
    "CN_beta" => 0.0003,                        # Derivative of yawing moment coeff w.r.t. sideslip angle
    "CM_alpha" => -0.004,                       # Derivative of pitching moment coeff w.r.t. angle of attack

    "Cl_p" => -0.00006,                         # Roll damping coefficient
    "Cm_q" => -0.00002,                         # Pitch damping coefficient
    "Cn_r" => -0.0001,                          # Yaw damping coefficient

    "maximum_thrust_at_sea_level" => 120.0,     # Maximum static thrust at sea level (N)
    "thrust_installation_angle_DEG" => 0.0,      # Tilt of thrust line w.r.t. x-axis, positive upwards (deg)

    "control_actuator_speed" => 3.0,            # Actuator speed, ratio of amplitude/sec
    "engine_spool_up_speed" => 1.3,             # Engine spool-up speed (fraction of max thrust per sec)
    "engine_spool_down_speed" => 1.1,             # Engine spool-down speed (fraction of max thrust per sec)


    # 3x3 inertia tensor
    "I_body" => [
                1/6  0.0  0.0;
                0.0  1/6  0.0;
                0.0  0.0  1/6
                ]

)

# ---------------------------------------------------------------------------
# The following functions must also use string keys when accessing dictionary fields:

function 🟢_compute_net_thrust_force_vector_body(thrust_setting_demand, alt, tas, aircraft_data, aircraft_state, control_demand_vector_attained)
    # Calculate thrust force based on thrust lever input
    if thrust_setting_demand >= 0.0
        thrust_ratio = thrust_setting_demand
    else
        thrust_ratio = thrust_setting_demand * 0.3  # Max reverse thrust is 30% of forward thrust
    end
    
    # Use the dictionary key with quotes:
    thrust_force = thrust_ratio * aircraft_data["maximum_thrust_at_sea_level"]
    
    # Also use the correct string key for thrust_installation_angle_DEG:
    install_angle_rad = deg2rad(aircraft_data["thrust_installation_angle_DEG"])
    return [
        thrust_force * cos(install_angle_rad),
        thrust_force * sin(install_angle_rad),
        0.0
    ]
end

function 🟢_compute_lift_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data, aircraft_state, control_demand_vector_attained)
    alpha_stall = deg2rad(15.0)  # Stall angle in radians
    alpha_effective = clamp(alpha_RAD, -alpha_stall, alpha_stall)
    # Note the string key "Cl_vs_alpha_RAD"
    return aircraft_data["Cl_vs_alpha_RAD"] * alpha_effective
end

function 🟢_compute_drag_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data, CL, aircraft_state, control_demand_vector_attained)
    # Again, use string keys: "CD0", "AR", "Oswald_factor"
    return aircraft_data["CD0"] + CL^2 / (π * aircraft_data["AR"] * aircraft_data["Oswald_factor"])
end

function 🟢_compute_sideforce_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data, aircraft_state, control_demand_vector_attained)
    # Not yet implemented
    return 0.0
end

function 🟢_compute_rolling_moment_coefficient(roll_demand, alpha_RAD, beta_RAD, v_body_mag, aircraft_data, aircraft_state, control_demand_vector_attained)
    return aircraft_data["derivative_roll_vs_aileron"] * roll_demand
end

function 🟢_compute_pitching_moment_coefficient(pitch_demand, alpha_RAD, beta_RAD, v_body_mag, aircraft_data, aircraft_state, control_demand_vector_attained)
    return aircraft_data["derivative_pitch_vs_elevator"] * pitch_demand + aircraft_data["CM0"]
end

function 🟢_compute_yawing_moment_coefficient(yaw_demand, alpha_RAD, beta_RAD, v_body_mag, aircraft_data, aircraft_state, control_demand_vector_attained)
    return aircraft_data["derivative_yaw_vs_rudder"] * yaw_demand
end
