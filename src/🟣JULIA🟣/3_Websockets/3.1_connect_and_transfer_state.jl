
const start_time = time()

function update_aircraft_state(aircraft_state_data)
    try
        position = (
            x = float(aircraft_state_data["x"]),
            y = float(aircraft_state_data["y"]),
            z = float(aircraft_state_data["z"])
        )
        velocity = (
            x = float(aircraft_state_data["vx"]),
            y = float(aircraft_state_data["vy"]),
            z = float(aircraft_state_data["vz"])
        )
        orientation = (
            qx = float(aircraft_state_data["qx"]),
            qy = float(aircraft_state_data["qy"]),
            qz = float(aircraft_state_data["qz"]),
            qw = float(aircraft_state_data["qw"])
        )
        angular_velocity = (
            wx = float(aircraft_state_data["wx"]),
            wy = float(aircraft_state_data["wy"]),
            wz = float(aircraft_state_data["wz"])
        )
        force_control_inputs = (
            x = float(aircraft_state_data["fx"]),
            y = float(aircraft_state_data["fy"]),
            thrust_setting_demand = float(aircraft_state_data["thrust_setting_demand"])
        )
        moment_control_inputs = (
            roll_demand = float(aircraft_state_data["roll_demand"]),
            pitch_demand = float(aircraft_state_data["pitch_demand"]),
            yaw_demand = float(aircraft_state_data["yaw_demand"])
        )
        deltaTime = float(aircraft_state_data["deltaTime"])

        aircraft_current_state_vector = [
            position.x, position.y, position.z,
            velocity.x, velocity.y, velocity.z,
            orientation.qx, orientation.qy, orientation.qz, orientation.qw,
            angular_velocity.wx, angular_velocity.wy, angular_velocity.wz
        ]

        aircraft_updated_state_vector = Runge_Kutta_4_integrator(aircraft_current_state_vector, force_control_inputs, moment_control_inputs, deltaTime, aircraft_model_data)

        elapsed_time = time() - start_time 
        if (elapsed_time > 6.0 && elapsed_time < 21.0)
            gather_telemetry(aircraft_updated_state_vector, elapsed_time, df)
        end

        return Dict(
            "x" => aircraft_updated_state_vector[:new_position_x],
            "y" => aircraft_updated_state_vector[:new_position_y],
            "z" => aircraft_updated_state_vector[:new_position_z],
            "vx" => aircraft_updated_state_vector[:new_velocity_x],
            "vy" => aircraft_updated_state_vector[:new_velocity_y],
            "vz" => aircraft_updated_state_vector[:new_velocity_z],
            "qx" => aircraft_updated_state_vector[:new_qx],
            "qy" => aircraft_updated_state_vector[:new_qy],
            "qz" => aircraft_updated_state_vector[:new_qz],
            "qw" => aircraft_updated_state_vector[:new_qw],
            "wx" => aircraft_updated_state_vector[:new_wx],
            "wy" => aircraft_updated_state_vector[:new_wy],
            "wz" => aircraft_updated_state_vector[:new_wz],
            "fx_global" => aircraft_updated_state_vector[:fx_global],
            "fy_global" => aircraft_updated_state_vector[:fy_global],
            "fz_global" => aircraft_updated_state_vector[:fz_global],
            "alpha" => aircraft_updated_state_vector[:alpha_avg],
            "beta" => aircraft_updated_state_vector[:beta_avg]
        )
    catch e
        @error "Error processing state" exception=e
        return nothing
    end
end


# Main WebSocket connection handler function that processes incoming messages
function websocket_handler(ws)
    println("New WebSocket connection established")
    try
        # Keep processing messages while the socket connection is open
        while !eof(ws.socket)
            # Read aircraft_state_data from the WebSocket connection safely using readguarded
            # Returns both the aircraft_state_data and a success status
            aircraft_state_data, success = WebSockets.readguarded(ws)
            
            # Process the aircraft_state_data only if read was successful and aircraft_state_data is not empty
            if success && !isempty(aircraft_state_data)
                # Convert the received binary aircraft_state_data to a string and parse it as JSON
                current_aircraft_state_vector = JSON.parse(String(aircraft_state_data))
                
                # Process the parsed aircraft_state_data through update_aircraft_state function that takes 
                # the aircraft current state as received from the client and updates it according to the equations of motion and the aircraft aerodynamic aircraft_state_data
                updated_aircraft_state_vector = update_aircraft_state(current_aircraft_state_vector)
                
                # If there's a updated_aircraft_state_vector to send back (not null)
                if updated_aircraft_state_vector !== nothing
                    # Convert updated_aircraft_state_vector to JSON and send it back through the WebSocket
                    WebSockets.writeguarded(ws, JSON.json(updated_aircraft_state_vector))
                end
            end
        end
    catch e
        # Log any errors that occur during WebSocket communication
        @error "WebSocket error" exception=e
    end
end

# Basic HTTP handler that responds to regular HTTP requests
function http_handler(req)
    # Return a simple 200 OK updated_aircraft_state_vector with a message
    return HTTP.updated_aircraft_state_vector(200, "WebSocket server running")
end

# Main function to set up and start the WebSocket server
function establish_websockets_connection()
    # Define the port number for the server
    port = 8080
    println("Starting WebSocket server on port $port...")
    
    # Create handler functions required by the WebSockets package
    http_handler_func = WebSockets.RequestHandlerFunction(http_handler)
    ws_handler_func = WebSockets.WSHandlerFunction(websocket_handler)
    
    # Initialize the WebSocket server with both HTTP and WebSocket handlers
    server = WebSockets.ServerWS(http_handler_func, ws_handler_func)
    
    # Start the server asynchronously on all network interfaces (0.0.0.0)
    @async WebSockets.serve(server, "0.0.0.0", port)
    
    println("Server running. Press Ctrl+C to stop.")
    # Keep the program running indefinitely
    while true
        sleep(.1)
    end
end
