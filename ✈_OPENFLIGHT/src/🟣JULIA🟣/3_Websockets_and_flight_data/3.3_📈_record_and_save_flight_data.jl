###########################################
# FILE: 3.3_📈_record_and_save_flight_data.jl
###########################################

# using LinearAlgebra # No longer needed for this specific output format
using DataFrames
using CSV
using Dates

const DECIMAL_PLACES = 3
# TIMESTAMP and initial csv_file definition moved to reset_flight_data_recording()
# in 3.1_🤝_Establish_WebSockets_connection.jl

# Initial DataFrame definition moved to reset_flight_data_recording()
# in 3.1_🤝_Establish_WebSockets_connection.jl

# Flag to ensure CSV is written exactly once - This is now reset in reset_flight_data_recording()
# global has_written_to_csv = false # Re-initialized in reset_flight_data_recording

function gather_flight_data(
    # Rename input dict for clarity - it contains the *updated* state from the integrator
    updated_aircraft_state_dict::Dict{String,Float64},
    current_sim_time::Float64,
    df::DataFrame # Pass the DataFrame explicitly
)
    global has_written_to_csv
    global csv_file # Ensure csv_file is accessible

    # 1) Append data while within [start_recording_sec .. finish_recording_sec]
    if current_sim_time >= start_recording_sec &&
       current_sim_time <= finish_recording_sec

        # Push data using a standard named tuple with keys matching NEW DataFrame columns
        push!(df, (
            time = round(current_sim_time, digits=DECIMAL_PLACES),

            # Map source dictionary keys to NEW DataFrame column names
            LATITUDE_m  = round(updated_aircraft_state_dict["x"],  digits=DECIMAL_PLACES), # x -> LATITUDE_m
            ALTITUDE_m  = round(updated_aircraft_state_dict["y"],  digits=DECIMAL_PLACES), # y -> ALTITUDE_m
            LONGITUDE_m = round(updated_aircraft_state_dict["z"],  digits=DECIMAL_PLACES), # z -> LONGITUDE_m

            vx = round(updated_aircraft_state_dict["vx"], digits=DECIMAL_PLACES),
            VSI_ms = round(updated_aircraft_state_dict["vy"], digits=DECIMAL_PLACES), # vy -> VSI_ms
            vz = round(updated_aircraft_state_dict["vz"], digits=DECIMAL_PLACES),

            qx = round(updated_aircraft_state_dict["qx"], digits=DECIMAL_PLACES),
            qy = round(updated_aircraft_state_dict["qy"], digits=DECIMAL_PLACES),
            qz = round(updated_aircraft_state_dict["qz"], digits=DECIMAL_PLACES),
            qw = round(updated_aircraft_state_dict["qw"], digits=DECIMAL_PLACES),

            wx = round(updated_aircraft_state_dict["wx"], digits=DECIMAL_PLACES),
            wy = round(updated_aircraft_state_dict["wy"], digits=DECIMAL_PLACES),
            wz = round(updated_aircraft_state_dict["wz"], digits=DECIMAL_PLACES),

            fx_global = round(updated_aircraft_state_dict["fx_global"], digits=DECIMAL_PLACES),
            fy_global = round(updated_aircraft_state_dict["fy_global"], digits=DECIMAL_PLACES),
            fz_global = round(updated_aircraft_state_dict["fz_global"], digits=DECIMAL_PLACES),

            # Convert angles to degrees for the DEG columns
            alpha_DEG = round(rad2deg(updated_aircraft_state_dict["alpha_RAD"]), digits=DECIMAL_PLACES),
            beta_DEG  = round(rad2deg(updated_aircraft_state_dict["beta_RAD"]),  digits=DECIMAL_PLACES),

            # Direct mapping for demands and attained values
            pitch_demand          = round(updated_aircraft_state_dict["pitch_demand"],          digits=DECIMAL_PLACES),
            roll_demand           = round(updated_aircraft_state_dict["roll_demand"],           digits=DECIMAL_PLACES),
            yaw_demand            = round(updated_aircraft_state_dict["yaw_demand"],            digits=DECIMAL_PLACES),
            pitch_demand_attained = round(updated_aircraft_state_dict["pitch_demand_attained"], digits=DECIMAL_PLACES),
            roll_demand_attained  = round(updated_aircraft_state_dict["roll_demand_attained"],  digits=DECIMAL_PLACES),
            yaw_demand_attained   = round(updated_aircraft_state_dict["yaw_demand_attained"],   digits=DECIMAL_PLACES),
            thrust_setting_demand = round(updated_aircraft_state_dict["thrust_setting_demand"], digits=DECIMAL_PLACES),
            thrust_attained       = round(updated_aircraft_state_dict["thrust_attained"],       digits=DECIMAL_PLACES)
        ), promote=true) # Use promote=true just in case
    end

    # 2) If we're *past* the interval and haven't written CSV yet, do it now
    if current_sim_time > finish_recording_sec && !has_written_to_csv
        # Make sure the directory exists before writing
        data_dir = dirname(csv_file)
        if !isdir(data_dir)
            try
                mkpath(data_dir)
                println("Created directory: $data_dir")
            catch e
                 @error "Failed to create directory $data_dir" exception=e
                 return # Exit if directory creation fails
            end
        end

        # Write the DataFrame to the CSV file
        try
            CSV.write(csv_file, df)
            has_written_to_csv = true
            println("Flight data saved to CSV file: $(csv_file)")
        catch e
             @error "Failed to write CSV file $csv_file" exception=e
        end
    end
end