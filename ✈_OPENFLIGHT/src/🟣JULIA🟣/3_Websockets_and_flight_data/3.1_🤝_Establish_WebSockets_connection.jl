# Modified WebSocket connection handler function that processes incoming messages
function websocket_handler(ws)
    println("New WebSocket connection established")
    try
        # First, immediately send mission data to the client
        mission_data_message = Dict(
            "messageType" => "missionData",
            "initial_velocity" => MISSION_DATA.initial_velocity,
            "initial_altitude" => MISSION_DATA.initial_altitude,
            "aircraft_name" => MISSION_DATA.aircraft_name,
            "scenery_complexity" => MISSION_DATA.scenery_complexity
        )
        WebSockets.writeguarded(ws, JSON.json(mission_data_message))
        println("Mission data sent to client: ", mission_data_message)
        
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
    port = WebSockets_port  # Port number defined in the client-side JavaScript file
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