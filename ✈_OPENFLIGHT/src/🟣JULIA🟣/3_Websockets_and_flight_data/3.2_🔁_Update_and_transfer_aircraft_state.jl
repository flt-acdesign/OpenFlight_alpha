###########################################
# FILE: F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\src\🟣JULIA🟣\3_Websockets_and_flight_data\3.2_🔁_Update_and_transfer_aircraft_state.jl
###########################################

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
        updated_aircraft_state_dictionary_for_JSON = Runge_Kutta_4_integrator(
            aircraft_current_state_vector,
            control_demand_vector,
            deltaTime,
            aircraft_flight_physics_and_propulsive_data
        )

        # 5) Record data **every time** – let the function handle intervals
        gather_flight_data(
            updated_aircraft_state_dictionary_for_JSON,
            sim_time,
            df
        )

        # 6) Attach 'server_time' so the client sees our sim_time
        updated_aircraft_state_dictionary_for_JSON["server_time"] = sim_time

        return updated_aircraft_state_dictionary_for_JSON

    catch e
        @error "Error processing state" exception=e
        return nothing
    end
end