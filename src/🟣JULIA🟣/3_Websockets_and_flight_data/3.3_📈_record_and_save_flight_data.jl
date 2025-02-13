# Define constants for data formatting and file naming
const DECIMAL_PLACES = 5  # Number of decimal places for rounding numerical values
const TIMESTAMP = Dates.format(now(), "yyyy-mm-dd_@_HHh-MM-SS")  # Current timestamp for unique file naming
# Construct the full path for the CSV output file
csv_file = joinpath(project_dir, "OUTPUT_OF_SIMULATION_DATA", "simulation_data_" * TIMESTAMP * ".csv")

# Initialize DataFrame with typed columns for storing flight simulation data
df = DataFrame(
    # Time column
    time=Float64[],
    
    # Position coordinates in 3D space
    x=Float64[], y=Float64[], z=Float64[],
    
    # Velocity components
    vx=Float64[], vy=Float64[], vz=Float64[],
    
    # Quaternion orientation parameters
    qx=Float64[], qy=Float64[], qz=Float64[], qw=Float64[],
    
    # Angular velocity components
    wx=Float64[], wy=Float64[], wz=Float64[],
    
    # Global force components
    fx_global=Float64[], fy_global=Float64[], fz_global=Float64[],
    
    # Angle of attack and sideslip angle in degrees
    alpha_DEG=Float64[], beta_DEG=Float64[],
    
    # Control demands (desired values)
    pitch_demand=Float64[], roll_demand=Float64[], yaw_demand=Float64[],
    
    # Actually achieved control values
    pitch_demand_attained=Float64[], roll_demand_attained=Float64[], yaw_demand_attained=Float64[],
    
    # Thrust control and actual thrust
    thrust_setting_demand=Float64[], thrust_attained=Float64[]
)

# Flag to ensure CSV is written only once when conditions are met
has_written_to_csv = false

function gather_flight_data(aircraft_state_data::Dict{String,Float64}, elapsed_time::Float64, df::DataFrame)
    # Access the global flag for CSV writing
    global has_written_to_csv
    
    # Add a new row to the DataFrame with rounded values from the current aircraft state
    push!(df, (
        # Time stamp
        time = round(elapsed_time, digits=DECIMAL_PLACES),

        # Position data
        x  = round(aircraft_state_data["x"],  digits=DECIMAL_PLACES),
        y  = round(aircraft_state_data["y"],  digits=DECIMAL_PLACES),
        z  = round(aircraft_state_data["z"],  digits=DECIMAL_PLACES),

        # Velocity data
        vx = round(aircraft_state_data["vx"], digits=DECIMAL_PLACES),
        vy = round(aircraft_state_data["vy"], digits=DECIMAL_PLACES),
        vz = round(aircraft_state_data["vz"], digits=DECIMAL_PLACES),

        # Quaternion orientation data
        qx = round(aircraft_state_data["qx"], digits=DECIMAL_PLACES),
        qy = round(aircraft_state_data["qy"], digits=DECIMAL_PLACES),
        qz = round(aircraft_state_data["qz"], digits=DECIMAL_PLACES),
        qw = round(aircraft_state_data["qw"], digits=DECIMAL_PLACES),

        # Angular velocity data
        wx = round(aircraft_state_data["wx"], digits=DECIMAL_PLACES),
        wy = round(aircraft_state_data["wy"], digits=DECIMAL_PLACES),
        wz = round(aircraft_state_data["wz"], digits=DECIMAL_PLACES),

        # Global force components
        fx_global = round(aircraft_state_data["fx_global"], digits=DECIMAL_PLACES),
        fy_global = round(aircraft_state_data["fy_global"], digits=DECIMAL_PLACES),
        fz_global = round(aircraft_state_data["fz_global"], digits=DECIMAL_PLACES),

        # Convert angles from radians to degrees and round
        alpha_DEG = round(rad2deg(aircraft_state_data["alpha_RAD"]), digits=DECIMAL_PLACES),
        beta_DEG  = round(rad2deg(aircraft_state_data["beta_RAD"]),  digits=DECIMAL_PLACES),

        # Control demand values
        pitch_demand           = round(aircraft_state_data["pitch_demand"],           digits=DECIMAL_PLACES),
        roll_demand            = round(aircraft_state_data["roll_demand"],            digits=DECIMAL_PLACES),
        yaw_demand             = round(aircraft_state_data["yaw_demand"],             digits=DECIMAL_PLACES),
        thrust_setting_demand  = round(aircraft_state_data["thrust_setting_demand"],  digits=DECIMAL_PLACES),

        # Actual attained control values
        pitch_demand_attained  = round(aircraft_state_data["pitch_demand_attained"],  digits=DECIMAL_PLACES),
        roll_demand_attained   = round(aircraft_state_data["roll_demand_attained"],   digits=DECIMAL_PLACES),
        yaw_demand_attained    = round(aircraft_state_data["yaw_demand_attained"],    digits=DECIMAL_PLACES),

        # Actual thrust achieved
        thrust_attained        = round(aircraft_state_data["thrust_attained"],        digits=DECIMAL_PLACES)
    ))

    # Write accumulated data to CSV file after 20 seconds of simulation time
    # Only writes once due to the has_written_to_csv flag
    if elapsed_time > 20 && !has_written_to_csv
        CSV.write(csv_file, df)
        has_written_to_csv = true
        println("Data written to CSV file: $(csv_file)")
    end
end
