# Function to attempt launching a browser with error handling
function try_launch_browser(command)
    try
        # Attempt to execute the provided command to launch browser
        run(command)
        println("Launched browser successfully.")
        return true
    catch e
        # If any error occurs during launch, print the error and return false
        println("Failed to launch browser: ", e)
        return false
    end
end

# Main function to launch the client HTML file in a web browser
function launch_client(script_dir)
    # Construct the full path to the HTML file
    # Uses joinpath to create platform-independent path
    # Note: File path contains emojis which might need special handling
    html_file = joinpath(script_dir, "./src/🟡JAVASCRIPT🟡/✅_front_end_and_client.html")

    # Try launching browsers in order of preference: Edge -> Chrome -> Firefox
    
    # First attempt: Microsoft Edge
    if try_launch_browser(`cmd /c start msedge "$html_file"`)
        println("Microsoft Edge launched successfully.")
        return
    
    # Second attempt: Google Chrome
    elseif try_launch_browser(`cmd /c start chrome "$html_file"`)
        println("Google Chrome launched successfully.")
        return
    
    # Third attempt: Mozilla Firefox
    elseif try_launch_browser(`cmd /c start firefox "$html_file"`)
        println("Mozilla Firefox launched successfully.")
        return
    
    # If all browser launch attempts fail
    else
        println("Failed to launch any browser.")
    end
end
