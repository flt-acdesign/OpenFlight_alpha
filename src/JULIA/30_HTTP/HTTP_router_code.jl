

const ROUTER = HTTP.Router()
HTTP.register!(ROUTER, "POST", "/api/update", update_state)

############## ANCILLARY FUNCTIONS #################
# Function to launch the client in Microsoft Edge
function launch_client()
    html_file = joinpath(script_dir, "../../../src/JAVASCRIPT/front_end_and_client.html")

    try
        run(`cmd /c start msedge "$html_file"`)
        println("Microsoft Edge launched successfully.")
    catch e
        println("Failed to launch Microsoft Edge: ", e)
    end
end

# Start the server using a Server object
server_task = @async begin
    println("Starting server on http://localhost:8080")
    HTTP.serve(ROUTER, Sockets.localhost, 8080)
end

@async begin
    sleep(20)
    println("Simulation data written for first 20 seconds.")
    println("Writing data to CSV file...")
    CSV.write(csv_file, df)
    println("Data written to ", csv_file)
    exit() # Terminates the application with exit code 0 (successful termination)
end

# Launch the client after starting the server
launch_client()

wait(server_task)
