

# Prepare CSV file for logging
script_dir = @__DIR__
csv_file = joinpath(script_dir, raw"./OUTPUT_OF_SIMULATION_DATA/simulation_data.csv")
df = DataFrame(
    time=Float64[],
    x=Float64[],
    y=Float64[],
    z=Float64[],
    vx=Float64[],
    vy=Float64[],
    vz=Float64[],
    qx=Float64[],
    qy=Float64[],
    qz=Float64[],
    qw=Float64[],
    wx=Float64[],
    wy=Float64[],
    wz=Float64[],
    fx_global=Float64[],
    fy_global=Float64[],
    fz_global=Float64[],
    alpha=Float64[],
    beta=Float64[]
)

# Capture start time
const start_time = time()


############## Main Simulation Code ##############

# Function to handle physics calculation using RK4 integration
function update_state(req::HTTP.Request)
    headers = [
        "Access-Control-Allow-Origin" => "*",
        "Access-Control-Allow-Methods" => "POST, OPTIONS",
        "Access-Control-Allow-Headers" => "Content-Type"
    ]

    if HTTP.method(req) == "OPTIONS"
        return HTTP.Response(200, headers)
    end

    try
        # The data is received as a string which contains a JSON data structure
        # JSON.parse converts the JSON data structure into a dictionary
        data = JSON.parse(String(req.body)) # Read state and controls from Javascript client

        # Extract current state and inputs
        position = (
            x = float(data["x"]),
            y = float(data["y"]),
            z = float(data["z"])
        )
        velocity = (
            x = float(data["vx"]),
            y = float(data["vy"]),
            z = float(data["vz"])
        )
        orientation = (  # Quaternion in global axes. Note that in babylon the term qw is the last (in Julia is the first)
            qx = float(data["qx"]),
            qy = float(data["qy"]),
            qz = float(data["qz"]),
            qw = float(data["qw"])
        )
        angular_velocity = ( # In body axes
            wx = float(data["wx"]),
            wy = float(data["wy"]),
            wz = float(data["wz"])
        )
        force_control_inputs = (  # Control inputs (thrust lever)
            x = float(data["fx"]),
            y = float(data["fy"]),
            thrust_lever = float(data["thrust_lever"])
        )
        moment_control_inputs = ( # Control inputs (stick and pedals)
            aileron_input = float(data["aileron_input"]),
            elevator_input = float(data["elevator_input"]),
            rudder_input = float(data["rudder_input"])
        )
        deltaTime = float(data["deltaTime"])

        # Aircraft state vector, it defines the position, orientation and its derivatives in global axes
        # State vector: s = [x, y, z, vx, vy, vz, qx, qy, qz, qw, wx, wy, wz]
        s = [
            position.x,
            position.y,
            position.z,
            velocity.x,
            velocity.y,
            velocity.z,
            orientation.qx,
            orientation.qy,
            orientation.qz,
            orientation.qw,
            angular_velocity.wx,  # Body axes
            angular_velocity.wy,
            angular_velocity.wz
        ]
 #************************************************************************************************************************************************
        # Runge-Kutta integration of the 6DOF equations of motion. It returns the new positions, orientations and their derivatives for the next delta_T
        # Update state using RK4 integration
        # Transform the given state to the next state (position, orientation, etc...) integrating the 6DOF equations of motion. 
        new_state = Runge_Kutta_4_integrator(s, force_control_inputs, moment_control_inputs, deltaTime, aircraft_model_data)
       
 # new_state is the return from the RK4 function, which contains the new state and additional variables (like alpha and beta) for plotting
        #************************************************************************************************************************************************


        # Unpack results. Create new state vector from the updated state after time-integration 
        # (more or less, s_new = s_old + state_derivative * delta_t, although this would be Euler, a Runge_Kutta 4th order integrator is actually used)
        s_new = new_state[:s_new]
        new_position_x = new_state[:new_position_x]
        new_position_y = new_state[:new_position_y]
        new_position_z = new_state[:new_position_z]
        new_velocity_x = new_state[:new_velocity_x]
        new_velocity_y = new_state[:new_velocity_y]
        new_velocity_z = new_state[:new_velocity_z]
        new_qx = new_state[:new_qx]
        new_qy = new_state[:new_qy]
        new_qz = new_state[:new_qz]
        new_qw = new_state[:new_qw]
        new_wx = new_state[:new_wx]
        new_wy = new_state[:new_wy]
        new_wz = new_state[:new_wz]
        fx_global = new_state[:fx_global]
        fy_global = new_state[:fy_global]
        fz_global = new_state[:fz_global]
        alpha_avg = new_state[:alpha_avg]
        beta_avg = new_state[:beta_avg]

      

        # Log data to DataFrame
        push!(df, (
            time = (time() - start_time),
            x = new_position_x,
            y = new_position_y,
            z = new_position_z,
            vx = new_velocity_x,
            vy = new_velocity_y,
            vz = new_velocity_z,
            qx = new_qx,
            qy = new_qy,
            qz = new_qz,
            qw = new_qw,
            wx = new_wx,
            wy = new_wy,
            wz = new_wz,
            fx_global = fx_global,
            fy_global = fy_global,
            fz_global = fz_global,
            alpha = alpha_avg,
            beta = beta_avg
        ))

        # Build the dictionary with the respose containing the updated state and other data for plotting
        response_dict = Dict(
            "x" => new_position_x,
            "y" => new_position_y,
            "z" => new_position_z,
            "vx" => new_velocity_x,
            "vy" => new_velocity_y,
            "vz" => new_velocity_z,
            "qx" => new_qx,
            "qy" => new_qy,
            "qz" => new_qz,
            "qw" => new_qw,
            "wx" => new_wx,
            "wy" => new_wy,
            "wz" => new_wz,
            "fx_global" => fx_global,
            "fy_global" => fy_global,
            "fz_global" => fz_global,
            "alpha" => alpha_avg,
            "beta" => beta_avg
        )
        response_body = JSON.json(response_dict) # Prepare the response as a stringified JSON format

        HTTP.Response(200, headers, response_body) # Send the response with the new state to the Javascript client as a string containing a JSON data structure
    catch e
        println("Error processing request: ", e)
        HTTP.Response(400, headers, "Invalid input: " * string(e))
    end
end
