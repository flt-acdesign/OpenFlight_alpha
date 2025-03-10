# Function to reset flight data recording state
function reset_flight_data_recording()
    global df = DataFrame(
        time=Float64[],
        x=Float64[],  y=Float64[],  z=Float64[],
        vx=Float64[], vy=Float64[], vz=Float64[],
        qx=Float64[], qy=Float64[], qz=Float64[], qw=Float64[],
        wx=Float64[], wy=Float64[], wz=Float64[],
        fx_global=Float64[], fy_global=Float64[], fz_global=Float64[],
        alpha_DEG=Float64[], beta_DEG=Float64[],
        pitch_demand=Float64[], roll_demand=Float64[], yaw_demand=Float64[],
        pitch_demand_attained=Float64[], roll_demand_attained=Float64[],
        yaw_demand_attained=Float64[],
        thrust_setting_demand=Float64[], thrust_attained=Float64[]
    )
    
    global has_written_to_csv = false
    
    # Generate a new timestamp and CSV filename for this session
    timestamp = Dates.format(now(), "yyyy-mm-dd_@_HHh-MM-SS")
    global csv_file = joinpath(project_dir, "📊_Flight_Test_Data",
        "simulation_data_" * timestamp * ".csv")
        
    println("Flight data recording reset with new CSV target: $csv_file")
end

# Main WebSocket connection handler function that processes incoming messages
function websocket_handler(ws)
    # Reset simulation time when a new connection is established
    global sim_time = 0.0
    println("New WebSocket connection established - Simulation time reset to 0.0")
    
    # Reset flight data recording
    reset_flight_data_recording()
    
    try
        # Keep processing messages while the socket connection is open
        while !eof(ws.socket)
            # Read data from WebSocket connection with error handling
            aircraft_state_data, success = WebSockets.readguarded(ws)
            
            # Only process valid, non-empty data
            if success && !isempty(aircraft_state_data)
                # Parse received JSON data into Julia structure
                current_aircraft_state_vector = JSON.parse(String(aircraft_state_data))
                
                # Update aircraft state using physics simulation
                updated_aircraft_state_vector = update_aircraft_state(current_aircraft_state_vector, aircraft_flight_physics_and_propulsive_data)
                
                # Send updated state back to client if available
                if updated_aircraft_state_vector !== nothing
                    WebSockets.writeguarded(ws, JSON.json(updated_aircraft_state_vector))
                end
            end
        end
    catch e
        @error "WebSocket error" exception=e
    end
end

# HTTP fallback handler for non-WebSocket requests
function http_handler(req)
    return HTTP.Response(200, "WebSocket server running")
end

# Server initialization and startup function
function establish_websockets_connection()
    port = WebSockets_port  # Port number defined in the client-side JavaScript file, this is found in function "🎁_load_required_packages_and_find_free_port.jl"
    println("Starting WebSocket server on port $port...")
    
    # Create handler functions for HTTP and WebSocket protocols
    http_handler_func = WebSockets.RequestHandlerFunction(http_handler)
    ws_handler_func = WebSockets.WSHandlerFunction(websocket_handler)
    
    # Initialize server with both handlers
    server = WebSockets.ServerWS(http_handler_func, ws_handler_func)
    
    # Start server asynchronously on all interfaces
    @async WebSockets.serve(server, "0.0.0.0", port)
    
    println("Server running. Press Ctrl+C to stop.")
    # Keep server running
    while true
        sleep(.1)
    end
end