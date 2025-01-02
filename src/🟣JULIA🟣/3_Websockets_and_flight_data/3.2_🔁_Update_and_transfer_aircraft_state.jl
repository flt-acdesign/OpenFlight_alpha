

# Main function to process and update aircraft state
function update_aircraft_state(aircraft_state_data, aircraft_flight_physics_and_propulsive_data)
    try
        state_variables = (
        # Extract position data from incoming state
            x = float(aircraft_state_data["x"]),
            y = float(aircraft_state_data["y"]),
            z = float(aircraft_state_data["z"]),
        
        # Extract velocity components
            Vx = float(aircraft_state_data["vx"]),
            Vy = float(aircraft_state_data["vy"]),
            Vz = float(aircraft_state_data["vz"]),

        # Extract quaternion orientation
            qx = float(aircraft_state_data["qx"]),
            qy = float(aircraft_state_data["qy"]),
            qz = float(aircraft_state_data["qz"]),
            qw = float(aircraft_state_data["qw"]),

        # Extract angular velocity components
            wx = float(aircraft_state_data["wx"]),
            wy = float(aircraft_state_data["wy"]),
            wz = float(aircraft_state_data["wz"])
        )

        # Extract control inputs and demands
        control_demand_vector = (
            Fx = float(aircraft_state_data["fx"]),  # Unused force components
            Fy = float(aircraft_state_data["fy"]),  # Unused force components

            # Control demands in this iteration
            roll_demand = float(aircraft_state_data["roll_demand"]),
            pitch_demand = float(aircraft_state_data["pitch_demand"]),
            yaw_demand = float(aircraft_state_data["yaw_demand"]),

            thrust_setting_demand = float(aircraft_state_data["thrust_setting_demand"]),

            # Control demands attained in previous iteration after application of control laws and actuator dynamics
            roll_demand_attained = float(aircraft_state_data["roll_demand_attained"]),
            pitch_demand_attained = float(aircraft_state_data["pitch_demand_attained"]),
            yaw_demand_attained = float(aircraft_state_data["yaw_demand_attained"]),

            thrust_attained = float(aircraft_state_data["thrust_attained"])

        )

        # Get time step for integration
        deltaTime = float(aircraft_state_data["deltaTime"])

        # Combine current state into vector for physics simulation
        aircraft_current_state_vector = [
            state_variables.x, state_variables.y, state_variables.z,
            state_variables.Vx, state_variables.Vy, state_variables.Vz,
            state_variables.qx, state_variables.qy, state_variables.qz, state_variables.qw,
            state_variables.wx, state_variables.wy, state_variables.wz
        ]

        # Perform numerical integration to get next state
        aircraft_updated_state_vector = Runge_Kutta_4_integrator(
            aircraft_current_state_vector, 
            control_demand_vector, 
            deltaTime, 
            aircraft_flight_physics_and_propulsive_data
        )

        # Record telemetry data during specific time window
        elapsed_time = time() - start_time 
        if (elapsed_time > 6.0 && elapsed_time < 21.0)
            gather_telemetry(aircraft_updated_state_vector, control_demand_vector, elapsed_time, df)
        end

        # Return updated state as dictionary for JSON conversion
        return Dict(
            # Position
            "x" => aircraft_updated_state_vector[:new_position_x],
            "y" => aircraft_updated_state_vector[:new_position_y],
            "z" => aircraft_updated_state_vector[:new_position_z],
            
            # Velocity
            "vx" => aircraft_updated_state_vector[:new_velocity_x],
            "vy" => aircraft_updated_state_vector[:new_velocity_y],
            "vz" => aircraft_updated_state_vector[:new_velocity_z],
            
            # Quaternion orientation
            "qx" => aircraft_updated_state_vector[:new_qx],
            "qy" => aircraft_updated_state_vector[:new_qy],
            "qz" => aircraft_updated_state_vector[:new_qz],
            "qw" => aircraft_updated_state_vector[:new_qw],
            
            # Angular velocity
            "wx" => aircraft_updated_state_vector[:new_wx],
            "wy" => aircraft_updated_state_vector[:new_wy],
            "wz" => aircraft_updated_state_vector[:new_wz],
            
            # Global forces
            "fx_global" => aircraft_updated_state_vector[:fx_global],
            "fy_global" => aircraft_updated_state_vector[:fy_global],
            "fz_global" => aircraft_updated_state_vector[:fz_global],
            
            # Aerodynamic angles
            "alpha" => aircraft_updated_state_vector[:alpha_avg],
            "beta" => aircraft_updated_state_vector[:beta_avg], 

            # Control demands
            "pitch_demand" => aircraft_updated_state_vector[:pitch_demand],
            "roll_demand" => aircraft_updated_state_vector[:roll_demand],
            "yaw_demand" => aircraft_updated_state_vector[:yaw_demand],
            "thrust_setting_demand" => aircraft_updated_state_vector[:thrust_setting_demand],

            # Attained control values
            "pitch_demand_attained" => aircraft_updated_state_vector[:pitch_demand_attained],
            "roll_demand_attained" => aircraft_updated_state_vector[:roll_demand_attained],
            "yaw_demand_attained" => aircraft_updated_state_vector[:yaw_demand_attained],

            # Thrust values
            "thrust_attained" => aircraft_updated_state_vector[:thrust_attained]
            


        )
    catch e
        @error "Error processing state" exception=e
        return nothing
    end
end
