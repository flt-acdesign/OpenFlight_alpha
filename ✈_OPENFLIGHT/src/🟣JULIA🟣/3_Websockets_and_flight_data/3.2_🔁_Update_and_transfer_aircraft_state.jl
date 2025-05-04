###########################################
# FILE: F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\src\🟣JULIA🟣\3_Websockets_and_flight_data\3.2_🔁_Update_and_transfer_aircraft_state.jl
###########################################

#!/usr/bin/env julia

using Logging
using Dates

# We'll store total sim time here. Starts at 0.0 when Julia launches or reinitializes.
global sim_time = 0.0

# We assume the following are defined globally elsewhere:
#  - start_recording_sec, finish_recording_sec
#  - df, csv_file, has_written_to_csv
#  - gather_flight_data(...)
#  - Runge_Kutta_4_integrator(...)
#  - aircraft_flight_physics_and_propulsive_data


"""
    update_aircraft_state(aircraft_state_data, aircraft_flight_physics_and_propulsive_data)

Main function that processes the JSON message from the client, runs an
integration step, records flight data if within time window, then returns
the updated aircraft state (plus "server_time") as JSON, but uses our
internal `sim_time` for everything, NOT real wall-clock time.

*** MODIFIED: Rounds Float64 values to 4 decimal places before returning. ***
*** FIXED: Ensures returned dictionary type matches gather_flight_data expectation. ***
"""
###########################################
# FILE: 3.2_🔁_Update_and_transfer_aircraft_state.jl
###########################################

function update_aircraft_state(
    aircraft_state_data::Dict{String,Any},
    aircraft_flight_physics_and_propulsive_data
)
    try
        # 1) Build the 13-element state vector from the incoming JSON
        aircraft_current_state_vector = [
            float(aircraft_state_data["x"]),
            float(aircraft_state_data["y"]),
            float(aircraft_state_data["z"]),
            float(aircraft_state_data["vx"]),
            float(aircraft_state_data["vy"]),
            float(aircraft_state_data["vz"]),
            float(aircraft_state_data["qx"]),
            float(aircraft_state_data["qy"]),
            float(aircraft_state_data["qz"]),
            float(aircraft_state_data["qw"]),
            float(aircraft_state_data["wx"]),
            float(aircraft_state_data["wy"]),
            float(aircraft_state_data["wz"])
        ]

        # 2) Control demands
        control_demand_vector = (
            fx = float(aircraft_state_data["fx"]),
            fy = float(aircraft_state_data["fy"]),
            roll_demand           = float(aircraft_state_data["roll_demand"]),
            pitch_demand          = float(aircraft_state_data["pitch_demand"]),
            yaw_demand            = float(aircraft_state_data["yaw_demand"]),
            thrust_setting_demand = float(aircraft_state_data["thrust_setting_demand"]),
            roll_demand_attained  = float(aircraft_state_data["roll_demand_attained"]),
            pitch_demand_attained = float(aircraft_state_data["pitch_demand_attained"]),
            yaw_demand_attained   = float(aircraft_state_data["yaw_demand_attained"]),
            thrust_attained       = float(aircraft_state_data["thrust_attained"])
        )

        # 3) Update global sim_time by the client-sent deltaTime
        deltaTime = float(aircraft_state_data["deltaTime"])
        global sim_time
        sim_time += deltaTime

        # 4) Run 6-DOF integrator
        # This returns the dictionary containing the updated state and telemetry data
        integrator_result_dict = Runge_Kutta_4_integrator(
            aircraft_current_state_vector,
            control_demand_vector,
            deltaTime,
            aircraft_flight_physics_and_propulsive_data
        )

        # *** START MODIFICATION: Round float values AND ensure correct Dict type ***
        # CHANGE HERE: Declare the dictionary type specifically as Dict{String, Float64}
        rounded_dict = Dict{String, Float64}()
        for (key, value) in integrator_result_dict
            if isa(value, Number) # Check if it's any kind of number
                # Round Float64 values, convert other numbers (like Int) to Float64
                rounded_dict[key] = round(Float64(value), digits=4)
            else
                # This case should ideally not happen if integrator returns only numbers,
                # but if it did, it would cause an error here due to the Dict type.
                # If non-numeric data is possible, the Dict type and gather_flight_data
                # signature would need to be Dict{String, Any}.
                @warn "Non-numeric value found in integrator result for key '$key'. Skipping."
                # rounded_dict[key] = value # This would error if uncommented
            end
        end
        # *** END MODIFICATION ***

        # 5) Record data (now passing the correctly typed Dict)
        gather_flight_data(
            rounded_dict, # Pass the Dict{String, Float64} dictionary
            sim_time,
            df
        )

        # 6) Attach 'server_time' so the client sees our sim_time
        #    Add this to the *rounded* dictionary before sending
        #    Ensure it's also a Float64 to match the dictionary type
        rounded_dict["server_time"] = round(Float64(sim_time), digits=4)

        return rounded_dict # Return the dictionary with rounded Float64 values

    catch e
        # Log the error with stacktrace for better debugging
        @error "Error processing state" exception=(e, catch_backtrace())
        return nothing
    end
end