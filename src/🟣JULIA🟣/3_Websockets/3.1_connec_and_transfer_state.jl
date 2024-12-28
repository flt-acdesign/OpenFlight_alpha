
const start_time = time()

function update_state(data)
    try
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
        orientation = (
            qx = float(data["qx"]),
            qy = float(data["qy"]),
            qz = float(data["qz"]),
            qw = float(data["qw"])
        )
        angular_velocity = (
            wx = float(data["wx"]),
            wy = float(data["wy"]),
            wz = float(data["wz"])
        )
        force_control_inputs = (
            x = float(data["fx"]),
            y = float(data["fy"]),
            thrust_setting_demand = float(data["thrust_setting_demand"])
        )
        moment_control_inputs = (
            roll_demand = float(data["roll_demand"]),
            pitch_demand = float(data["pitch_demand"]),
            yaw_demand = float(data["yaw_demand"])
        )
        deltaTime = float(data["deltaTime"])

        s = [
            position.x, position.y, position.z,
            velocity.x, velocity.y, velocity.z,
            orientation.qx, orientation.qy, orientation.qz, orientation.qw,
            angular_velocity.wx, angular_velocity.wy, angular_velocity.wz
        ]

        new_state = Runge_Kutta_4_integrator(s, force_control_inputs, moment_control_inputs, deltaTime, aircraft_model_data)

        push!(df, (
            time = (time() - start_time),
            x = new_state[:new_position_x],
            y = new_state[:new_position_y],
            z = new_state[:new_position_z],
            vx = new_state[:new_velocity_x],
            vy = new_state[:new_velocity_y],
            vz = new_state[:new_velocity_z],
            qx = new_state[:new_qx],
            qy = new_state[:new_qy],
            qz = new_state[:new_qz],
            qw = new_state[:new_qw],
            wx = new_state[:new_wx],
            wy = new_state[:new_wy],
            wz = new_state[:new_wz],
            fx_global = new_state[:fx_global],
            fy_global = new_state[:fy_global],
            fz_global = new_state[:fz_global],
            alpha = new_state[:alpha_avg],
            beta = new_state[:beta_avg]
        ))

        return Dict(
            "x" => new_state[:new_position_x],
            "y" => new_state[:new_position_y],
            "z" => new_state[:new_position_z],
            "vx" => new_state[:new_velocity_x],
            "vy" => new_state[:new_velocity_y],
            "vz" => new_state[:new_velocity_z],
            "qx" => new_state[:new_qx],
            "qy" => new_state[:new_qy],
            "qz" => new_state[:new_qz],
            "qw" => new_state[:new_qw],
            "wx" => new_state[:new_wx],
            "wy" => new_state[:new_wy],
            "wz" => new_state[:new_wz],
            "fx_global" => new_state[:fx_global],
            "fy_global" => new_state[:fy_global],
            "fz_global" => new_state[:fz_global],
            "alpha" => new_state[:alpha_avg],
            "beta" => new_state[:beta_avg]
        )
    catch e
        @error "Error processing state" exception=e
        return nothing
    end
end


function websocket_handler(ws)
    println("New WebSocket connection established")
    try
        while !eof(ws.socket)
            data, success = WebSockets.readguarded(ws)
            if success && !isempty(data)
                parsed_data = JSON.parse(String(data))
                response = update_state(parsed_data)
                if response !== nothing
                    WebSockets.writeguarded(ws, JSON.json(response))
                end
            end
        end
    catch e
        @error "WebSocket error" exception=e
    end
end

function http_handler(req)
    return HTTP.Response(200, "WebSocket server running")
end



function establish_websockets_connection()
    port = 8080
    println("Starting WebSocket server on port $port...")
    
    http_handler_func = WebSockets.RequestHandlerFunction(http_handler)
    ws_handler_func = WebSockets.WSHandlerFunction(websocket_handler)
    
    server = WebSockets.ServerWS(http_handler_func, ws_handler_func)
    
    @async WebSockets.serve(server, "0.0.0.0", port)
    
    println("Server running. Press Ctrl+C to stop.")
    while true
        sleep(.1)
    end
end

