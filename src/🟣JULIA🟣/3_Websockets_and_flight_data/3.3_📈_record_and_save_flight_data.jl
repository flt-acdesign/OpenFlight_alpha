# Constants
const DECIMAL_PLACES = 5
const TIMESTAMP = Dates.format(now(), "yyyy-mm-dd_@_HHh-MM-SS")
csv_file = joinpath(project_dir, "OUTPUT_OF_SIMULATION_DATA", "simulation_data_" * TIMESTAMP * ".csv")

df = DataFrame(
    time=Float64[], x=Float64[], y=Float64[], z=Float64[],
    vx=Float64[], vy=Float64[], vz=Float64[],
    qx=Float64[], qy=Float64[], qz=Float64[], qw=Float64[],
    wx=Float64[], wy=Float64[], wz=Float64[],
    fx_global=Float64[], fy_global=Float64[], fz_global=Float64[],
    alpha_DEG=Float64[], beta_DEG=Float64[],
    pitch_demand=Float64[], roll_demand=Float64[], yaw_demand=Float64[],
    pitch_demand_attained=Float64[], roll_demand_attained=Float64[], yaw_demand_attained=Float64[],
    thrust_setting_demand=Float64[], thrust_attained=Float64[]
)

# Add a flag to track if the file has been written
has_written_to_csv = false

function gather_flight_data(aircraft_state_data::Dict{String,Float64}, elapsed_time::Float64, df::DataFrame)
    # Make the flag variable accessible inside the function
    global has_written_to_csv

#println(aircraft_state_data)
    
    # Gather flight_data data with rounded values
    push!(df, (
        time = round(elapsed_time, digits=DECIMAL_PLACES),

        x  = round(aircraft_state_data["x"],  digits=DECIMAL_PLACES),
        y  = round(aircraft_state_data["y"],  digits=DECIMAL_PLACES),
        z  = round(aircraft_state_data["z"],  digits=DECIMAL_PLACES),

        vx = round(aircraft_state_data["vx"], digits=DECIMAL_PLACES),
        vy = round(aircraft_state_data["vy"], digits=DECIMAL_PLACES),
        vz = round(aircraft_state_data["vz"], digits=DECIMAL_PLACES),

        qx = round(aircraft_state_data["qx"], digits=DECIMAL_PLACES),
        qy = round(aircraft_state_data["qy"], digits=DECIMAL_PLACES),
        qz = round(aircraft_state_data["qz"], digits=DECIMAL_PLACES),
        qw = round(aircraft_state_data["qw"], digits=DECIMAL_PLACES),

        wx = round(aircraft_state_data["wx"], digits=DECIMAL_PLACES),
        wy = round(aircraft_state_data["wy"], digits=DECIMAL_PLACES),
        wz = round(aircraft_state_data["wz"], digits=DECIMAL_PLACES),

        fx_global = round(aircraft_state_data["fx_global"], digits=DECIMAL_PLACES),
        fy_global = round(aircraft_state_data["fy_global"], digits=DECIMAL_PLACES),
        fz_global = round(aircraft_state_data["fz_global"], digits=DECIMAL_PLACES),

        alpha_DEG = round(rad2deg(aircraft_state_data["alpha_RAD"]), digits=DECIMAL_PLACES),
        beta_DEG  = round(rad2deg(aircraft_state_data["beta_RAD"]),  digits=DECIMAL_PLACES),

        pitch_demand           = round(aircraft_state_data["pitch_demand"],           digits=DECIMAL_PLACES),
        roll_demand            = round(aircraft_state_data["roll_demand"],            digits=DECIMAL_PLACES),
        yaw_demand             = round(aircraft_state_data["yaw_demand"],             digits=DECIMAL_PLACES),
        thrust_setting_demand  = round(aircraft_state_data["thrust_setting_demand"],  digits=DECIMAL_PLACES),

        pitch_demand_attained  = round(aircraft_state_data["pitch_demand_attained"],  digits=DECIMAL_PLACES),
        roll_demand_attained   = round(aircraft_state_data["roll_demand_attained"],   digits=DECIMAL_PLACES),
        yaw_demand_attained    = round(aircraft_state_data["yaw_demand_attained"],    digits=DECIMAL_PLACES),

        thrust_attained        = round(aircraft_state_data["thrust_attained"],        digits=DECIMAL_PLACES)
    ))

    # Write to CSV if elapsed_time is greater than 20 seconds and the file has not been written yet
    if elapsed_time > 20 && !has_written_to_csv
        CSV.write(csv_file, df)
        has_written_to_csv = true
        println("Data written to CSV file: $(csv_file)")
    end
end
