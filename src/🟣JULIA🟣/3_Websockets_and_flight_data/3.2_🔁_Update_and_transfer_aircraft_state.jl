# Main function to process and update aircraft state
function update_aircraft_state(aircraft_state_data, aircraft_flight_physics_and_propulsive_data)
    try
        ########################################################################
        # 1) Parse incoming data directly to a 13-element vector
        ########################################################################
        aircraft_current_state_vector = [
            float(aircraft_state_data["x"]),   # 1)  x
            float(aircraft_state_data["y"]),   # 2)  y
            float(aircraft_state_data["z"]),   # 3)  z
            
            float(aircraft_state_data["vx"]),  # 4)  Vx
            float(aircraft_state_data["vy"]),  # 5)  Vy
            float(aircraft_state_data["vz"]),  # 6)  Vz

            float(aircraft_state_data["qx"]),  # 7)  qx
            float(aircraft_state_data["qy"]),  # 8)  qy
            float(aircraft_state_data["qz"]),  # 9)  qz
            float(aircraft_state_data["qw"]),  # 10) qw

            float(aircraft_state_data["wx"]),  # 11) wx
            float(aircraft_state_data["wy"]),  # 12) wy
            float(aircraft_state_data["wz"])   # 13) wz
        ]

        ########################################################################
        # 2) Parse control demands into a Named Tuple
        ########################################################################
        control_demand_vector = (
            Fx = float(aircraft_state_data["fx"]),  # Possibly unused forces
            Fy = float(aircraft_state_data["fy"]),

            roll_demand           = float(aircraft_state_data["roll_demand"]),
            pitch_demand          = float(aircraft_state_data["pitch_demand"]),
            yaw_demand            = float(aircraft_state_data["yaw_demand"]),
            thrust_setting_demand = float(aircraft_state_data["thrust_setting_demand"]),

            roll_demand_attained  = float(aircraft_state_data["roll_demand_attained"]),
            pitch_demand_attained = float(aircraft_state_data["pitch_demand_attained"]),
            yaw_demand_attained   = float(aircraft_state_data["yaw_demand_attained"]),
            thrust_attained       = float(aircraft_state_data["thrust_attained"])
        )

        # Time step for integration
        deltaTime = float(aircraft_state_data["deltaTime"])

        ########################################################################
        # 3) Perform numerical integration
        #    Now the integrator returns a dictionary in the final form we need.
        ########################################################################
        updated_aircraft_state_dictionary_for_JSON = Runge_Kutta_4_integrator(
            aircraft_current_state_vector,    # 13-element state vector
            control_demand_vector,           # named tuple of demands
            deltaTime, 
            aircraft_flight_physics_and_propulsive_data
        )

        ########################################################################
        # 4) Optionally record flight_data
        ########################################################################
        elapsed_time = time() - start_time
        if (elapsed_time > 6.0 && elapsed_time < 21.0)
            gather_flight_data(updated_aircraft_state_dictionary_for_JSON, elapsed_time, df)
        end

        ########################################################################
        # 5) Return the updated dictionary directly for JSON
        ########################################################################
        return updated_aircraft_state_dictionary_for_JSON

    catch e
        @error "Error processing state" exception=e
        return nothing
    end
end
