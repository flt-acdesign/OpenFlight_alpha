# Constants
const DECIMAL_PLACES = 5
const TIMESTAMP = Dates.format(now(), "yyyy-mm-dd_@_HHh-MM-SS")
csv_file = joinpath(script_dir, "OUTPUT_OF_SIMULATION_DATA", "simulation_data_" * TIMESTAMP * ".csv")


df = DataFrame(
    time=Float64[], x=Float64[], y=Float64[], z=Float64[],
    vx=Float64[], vy=Float64[], vz=Float64[],
    qx=Float64[], qy=Float64[], qz=Float64[], qw=Float64[],
    wx=Float64[], wy=Float64[], wz=Float64[],
    fx_global=Float64[], fy_global=Float64[], fz_global=Float64[],
    alpha=Float64[], beta=Float64[], pitch_demand=Float64[], roll_demand=Float64[], yaw_demand=Float64[], 
    pitch_demand_attained=Float64[], roll_demand_attained=Float64[], yaw_demand_attained=Float64[]
)

# Add a flag to track if the file has been written
has_written_to_csv = false

function gather_telemetry(aircraft_state_data, control_demand_vector, elapsed_time, df)
    # Make the flag variable accessible inside the function
    global has_written_to_csv
    
    # Gather telemetry data with rounded values
    push!(df, (
        time = round(elapsed_time, digits=DECIMAL_PLACES),
        x = round(aircraft_state_data[:new_position_x], digits=DECIMAL_PLACES),
        y = round(aircraft_state_data[:new_position_y], digits=DECIMAL_PLACES),
        z = round(aircraft_state_data[:new_position_z], digits=DECIMAL_PLACES),
        vx = round(aircraft_state_data[:new_velocity_x], digits=DECIMAL_PLACES),
        vy = round(aircraft_state_data[:new_velocity_y], digits=DECIMAL_PLACES),
        vz = round(aircraft_state_data[:new_velocity_z], digits=DECIMAL_PLACES),
        qx = round(aircraft_state_data[:new_qx], digits=DECIMAL_PLACES),
        qy = round(aircraft_state_data[:new_qy], digits=DECIMAL_PLACES),
        qz = round(aircraft_state_data[:new_qz], digits=DECIMAL_PLACES),
        qw = round(aircraft_state_data[:new_qw], digits=DECIMAL_PLACES),
        wx = round(aircraft_state_data[:new_wx], digits=DECIMAL_PLACES),
        wy = round(aircraft_state_data[:new_wy], digits=DECIMAL_PLACES),
        wz = round(aircraft_state_data[:new_wz], digits=DECIMAL_PLACES),
        fx_global = round(aircraft_state_data[:fx_global], digits=DECIMAL_PLACES),
        fy_global = round(aircraft_state_data[:fy_global], digits=DECIMAL_PLACES),
        fz_global = round(aircraft_state_data[:fz_global], digits=DECIMAL_PLACES),
        alpha = round(aircraft_state_data[:alpha_avg], digits=DECIMAL_PLACES),
        beta = round(aircraft_state_data[:beta_avg], digits=DECIMAL_PLACES), 

        pitch_demand = round(control_demand_vector[:pitch_demand], digits=DECIMAL_PLACES),
        roll_demand = round(control_demand_vector[:roll_demand], digits=DECIMAL_PLACES),
        yaw_demand = round(control_demand_vector[:yaw_demand], digits=DECIMAL_PLACES),

        pitch_demand_attained = round(control_demand_vector[:pitch_demand_attained], digits=DECIMAL_PLACES),
        roll_demand_attained = round(control_demand_vector[:roll_demand_attained], digits=DECIMAL_PLACES),
        yaw_demand_attained = round(control_demand_vector[:yaw_demand_attained], digits=DECIMAL_PLACES)
    ))

    # Write to CSV if elapsed_time is greater than 20 seconds and the file has not been written yet
    if elapsed_time > 20 && !has_written_to_csv
        CSV.write(csv_file, df)
        has_written_to_csv = true
        println("Data written to CSV file: $(csv_file)")
    end
end
