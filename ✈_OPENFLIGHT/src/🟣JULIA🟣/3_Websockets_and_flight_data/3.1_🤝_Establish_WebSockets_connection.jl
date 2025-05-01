# Function to reset flight data recording state
function reset_flight_data_recording()
    # Define the DataFrame structure with NEW valid identifier names
    global df = DataFrame(
        # --- Original Columns ---
        time=Float64[],
        LATITUDE_m=Float64[],  # Renamed from x
        ALTITUDE_m=Float64[],  # Renamed from y
        LONGITUDE_m=Float64[], # Renamed from z
        vx=Float64[],
        VSI_ms=Float64[],    # Renamed from vy
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
        alpha_DEG=Float64[],
        beta_DEG=Float64[],
        pitch_demand=Float64[],
        roll_demand=Float64[],
        yaw_demand=Float64[],
        pitch_demand_attained=Float64[],
        roll_demand_attained=Float64[],
        yaw_demand_attained=Float64[],
        thrust_setting_demand=Float64[],
        thrust_attained=Float64[],

        # --- New Columns Added ---
        CL=Float64[],
        CD=Float64[],
        CL_CD_ratio=Float64[], # Renamed from CL/CD
        CS=Float64[],
        nx=Float64[],
        nz=Float64[],
        ny=Float64[],
        CM_roll_from_aero_forces=Float64[],
        CM_yaw_from_aero_forces=Float64[],
        CM_pitch_from_aero_forces=Float64[],
        CM_roll_from_control=Float64[],
        CM_yaw_from_control=Float64[],
        CM_pitch_from_control=Float64[],
        CM_roll_from_aero_stiffness=Float64[],
        CM_yaw_from_aero_stiffness=Float64[],
        CM_pitch_from_aero_stiffness=Float64[],
        CM_roll_from_aero_damping=Float64[],
        CM_yaw_from_aero_damping=Float64[],
        CM_pitch_from_aero_damping=Float64[],
        q_pitch_rate=Float64[],
        p_roll_rate=Float64[],
        r_yaw_rate=Float64[],

        TAS =Float64[],
        EAS =Float64[],
        Mach =Float64[],
        dynamic_pressure =Float64[]
        
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
                current_aircraft_state_dict = JSON.parse(String(aircraft_state_data)) # Changed name for clarity

                # Update aircraft state using physics simulation
                updated_aircraft_state_dict = update_aircraft_state(current_aircraft_state_dict, aircraft_flight_physics_and_propulsive_data) # Changed name

                # Send updated state back to client if available
                if updated_aircraft_state_dict !== nothing
                    WebSockets.writeguarded(ws, JSON.json(updated_aircraft_state_dict))
                end
            end
        end
    catch e
        # Ignore BrokenPipeError which commonly happens when the client disconnects
        if !(e isa Base.IOError && e.code == Base.UV_EPIPE)
             @error "WebSocket error" exception=e
        else
             println("Client disconnected (BrokenPipeError).")
        end
    finally
         println("WebSocket connection closed.")
         # Optionally save any partially recorded data here if needed
         # if !has_written_to_csv && !isempty(df)
         #     println("Saving partial data on disconnect...")
         #     data_dir = dirname(csv_file)
         #     if !isdir(data_dir); mkpath(data_dir); end
         #     CSV.write(csv_file, df)
         #     has_written_to_csv = true
         #     println("Partial flight data saved to: $(csv_file)")
         # end
    end
end

# HTTP fallback handler for non-WebSocket requests
function http_handler(req)
    return HTTP.Response(200, "WebSocket server running")
end

# Server initialization and startup function
function establish_websockets_connection()
    port = WebSockets_port  # Port number found by 🔌_Find_free_port.jl
    println("Starting WebSocket server on port $port...")

    # Create handler functions for HTTP and WebSocket protocols
    http_handler_func = WebSockets.RequestHandlerFunction(http_handler)
    ws_handler_func = WebSockets.WSHandlerFunction(websocket_handler)

    # Initialize server with both handlers
    server = WebSockets.ServerWS(http_handler_func, ws_handler_func)

    # Start server asynchronously on all interfaces
    @async WebSockets.serve(server, "0.0.0.0", port)

    println("Server running. Press Ctrl+C to stop.")
    # Keep server running (add a try/catch for graceful shutdown)
    try
        while true
            sleep(1) # Check less frequently
        end
    catch e
        if e isa InterruptException
            println("\nCtrl+C detected. Shutting down server...")
            # Potentially add cleanup code here if needed before exiting
        else
            @error "Server loop error" exception=e
        end
    finally
        println("Server stopped.")
        # You might want to explicitly close the server socket if WebSockets.serve doesn't handle it fully on interrupt
    end
end