

function try_launch_browser(command)
    try
        run(command)
        println("Launched browser successfully.")
        return true
    catch e
        println("Failed to launch browser: ", e)
        return false
    end
end

function launch_client(script_dir)
    html_file = joinpath(script_dir, "./src/🟡JAVASCRIPT🟡/✅_front_end_and_client.html")  # Launch the client in Microsoft Edge

    if try_launch_browser(`cmd /c start msedge "$html_file"`)
        println("Microsoft Edge launched successfully.")
        return
    elseif try_launch_browser(`cmd /c start chrome "$html_file"`)
        println("Google Chrome launched successfully.")
        return
    elseif try_launch_browser(`cmd /c start firefox "$html_file"`)
        println("Mozilla Firefox launched successfully.")
        return
    else
        println("Failed to launch any browser.")
    end
end
