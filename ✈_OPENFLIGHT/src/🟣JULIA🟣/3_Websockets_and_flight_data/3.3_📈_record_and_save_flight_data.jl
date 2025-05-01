###########################################
# FILE: 3.3_📈_record_and_save_flight_data.jl
# MODIFIED TO INCLUDE ADDITIONAL TELEMETRY DATA
###########################################

using DataFrames
using CSV
using Dates

const DECIMAL_PLACES = 3
# Assume TIMESTAMP, csv_file, start_recording_sec, finish_recording_sec,
# and the initial df DataFrame definition (with ALL required columns)
# are handled elsewhere (e.g., in reset_flight_data_recording).
# Assume has_written_to_csv is also managed elsewhere.

# NOTE: The DataFrame 'df' passed to this function MUST be initialized
#       with columns corresponding to ALL the fields being pushed below,
#       including the newly added ones (CL, CD, ..., r_yaw_rate).

function gather_flight_data(
    # Rename input dict for clarity - it contains the *updated* state from the integrator
    updated_aircraft_state_dict::Dict{String,Float64},
    current_sim_time::Float64,
    df::DataFrame # Pass the DataFrame explicitly
)
    global has_written_to_csv # Flag from external scope
    global csv_file           # File path from external scope
    global start_recording_sec # Start time from external scope
    global finish_recording_sec # End time from external scope


    # 1) Append data while within [start_recording_sec .. finish_recording_sec]
    if current_sim_time >= start_recording_sec &&
       current_sim_time <= finish_recording_sec

        # Push data using a standard named tuple with keys matching DataFrame columns
        push!(df, (
            time = round(current_sim_time, digits=DECIMAL_PLACES),

            # --- Original Position/Velocity/Orientation/Forces ---
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

            wx = round(updated_aircraft_state_dict["wx"], digits=DECIMAL_PLACES), # Angular velocities
            wy = round(updated_aircraft_state_dict["wy"], digits=DECIMAL_PLACES),
            wz = round(updated_aircraft_state_dict["wz"], digits=DECIMAL_PLACES),

            fx_global = round(updated_aircraft_state_dict["fx_global"], digits=DECIMAL_PLACES),
            fy_global = round(updated_aircraft_state_dict["fy_global"], digits=DECIMAL_PLACES),
            fz_global = round(updated_aircraft_state_dict["fz_global"], digits=DECIMAL_PLACES),

            # --- Original Angles/Demands ---
            alpha_DEG = round(rad2deg(updated_aircraft_state_dict["alpha_RAD"]), digits=DECIMAL_PLACES),
            beta_DEG  = round(rad2deg(updated_aircraft_state_dict["beta_RAD"]),  digits=DECIMAL_PLACES),

            pitch_demand          = round(updated_aircraft_state_dict["pitch_demand"],          digits=DECIMAL_PLACES),
            roll_demand           = round(updated_aircraft_state_dict["roll_demand"],           digits=DECIMAL_PLACES),
            yaw_demand            = round(updated_aircraft_state_dict["yaw_demand"],            digits=DECIMAL_PLACES),
            pitch_demand_attained = round(updated_aircraft_state_dict["pitch_demand_attained"], digits=DECIMAL_PLACES),
            roll_demand_attained  = round(updated_aircraft_state_dict["roll_demand_attained"],  digits=DECIMAL_PLACES),
            yaw_demand_attained   = round(updated_aircraft_state_dict["yaw_demand_attained"],   digits=DECIMAL_PLACES),
            thrust_setting_demand = round(updated_aircraft_state_dict["thrust_setting_demand"], digits=DECIMAL_PLACES),
            thrust_attained       = round(updated_aircraft_state_dict["thrust_attained"],       digits=DECIMAL_PLACES),

            # --- NEW: Additional Flight Data for Telemetry ---
            CL = round(updated_aircraft_state_dict["CL"], digits=DECIMAL_PLACES),
            CD = round(updated_aircraft_state_dict["CD"], digits=DECIMAL_PLACES),
            CL_CD_ratio = round(updated_aircraft_state_dict["CL/CD"], digits=DECIMAL_PLACES), # Renamed key
            CS = round(updated_aircraft_state_dict["CS"], digits=DECIMAL_PLACES),

            nx = round(updated_aircraft_state_dict["nx"], digits=DECIMAL_PLACES),
            nz = round(updated_aircraft_state_dict["nz"], digits=DECIMAL_PLACES),
            ny = round(updated_aircraft_state_dict["ny"], digits=DECIMAL_PLACES),

            CM_roll_from_aero_forces   = round(updated_aircraft_state_dict["CM_roll_from_aero_forces"],   digits=DECIMAL_PLACES),
            CM_yaw_from_aero_forces    = round(updated_aircraft_state_dict["CM_yaw_from_aero_forces"],    digits=DECIMAL_PLACES),
            CM_pitch_from_aero_forces  = round(updated_aircraft_state_dict["CM_pitch_from_aero_forces"],  digits=DECIMAL_PLACES),

            CM_roll_from_control       = round(updated_aircraft_state_dict["CM_roll_from_control"],       digits=DECIMAL_PLACES),
            CM_yaw_from_control        = round(updated_aircraft_state_dict["CM_yaw_from_control"],        digits=DECIMAL_PLACES),
            CM_pitch_from_control      = round(updated_aircraft_state_dict["CM_pitch_from_control"],      digits=DECIMAL_PLACES),

            CM_roll_from_aero_stiffness  = round(updated_aircraft_state_dict["CM_roll_from_aero_stiffness"],  digits=DECIMAL_PLACES),
            CM_yaw_from_aero_stiffness   = round(updated_aircraft_state_dict["CM_yaw_from_aero_stiffness"],   digits=DECIMAL_PLACES),
            CM_pitch_from_aero_stiffness = round(updated_aircraft_state_dict["CM_pitch_from_aero_stiffness"], digits=DECIMAL_PLACES),

            CM_roll_from_aero_damping    = round(updated_aircraft_state_dict["CM_roll_from_aero_damping"],    digits=DECIMAL_PLACES),
            CM_yaw_from_aero_damping     = round(updated_aircraft_state_dict["CM_yaw_from_aero_damping"],     digits=DECIMAL_PLACES),
            CM_pitch_from_aero_damping   = round(updated_aircraft_state_dict["CM_pitch_from_aero_damping"],   digits=DECIMAL_PLACES),

            # --- NEW: Body frame rotation rates (assuming source is average_flight_data_for_telemetry as per dict) ---
            # Note: These might be redundant if wx, wy, wz are sufficient, but included as per the dictionary structure.
            q_pitch_rate = round(updated_aircraft_state_dict["q_pitch_rate"], digits=DECIMAL_PLACES),
            p_roll_rate  = round(updated_aircraft_state_dict["p_roll_rate"],  digits=DECIMAL_PLACES),
            r_yaw_rate   = round(updated_aircraft_state_dict["r_yaw_rate"],   digits=DECIMAL_PLACES), 

            TAS = round(updated_aircraft_state_dict["TAS"], digits=DECIMAL_PLACES),
            EAS = round(updated_aircraft_state_dict["EAS"], digits=DECIMAL_PLACES),
            Mach= round(updated_aircraft_state_dict["Mach"], digits=DECIMAL_PLACES),
            dynamic_pressure = round(updated_aircraft_state_dict["dynamic_pressure"], digits=DECIMAL_PLACES)


        ), promote=true) # Use promote=true just in case types are inferred narrowly initially
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

