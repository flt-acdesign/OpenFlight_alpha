

# Get the directory path of the current script
current_path = @__DIR__

# Construct path to the JavaScript initialization file that needs modification
filepath = joinpath(current_path, "..", "..", "..", "🟡JAVASCRIPT🟡", "0_INITIALIZATION", "0.1_🧾_initializations.js")

# Display paths for debugging purposes
#println("Starting from: ", current_path)
#println("Target file: ", filepath)


# Function to find an available network port
function find_free_port(start_port=8000, max_attempts=1000)
    for port in start_port:(start_port + max_attempts)
        server = try
            # Attempt to create a listening socket on the port
            listen(port)
        catch e
            # If port is in use, continue to next port
            continue
        end
        # If successful, close the socket and return the port number
        close(server)
        return port
    end
    # If no ports are available after max attempts, throw error
    error("No free port found after $max_attempts attempts")
end

# Function to update the WebSocket port in the JavaScript filefunction update_port_in_file(filepath)
    # Find an available port
    freeport = find_free_port()

    # Read the content of the JavaScript file
    content = try
        read(filepath, String)
    catch e
        error("Could not read file: $filepath")
    end

    # Function to update the freeport value in the file content
    function update_port_in_file(filepath)
        # Find an available port
        freeport = find_free_port()
    
        # Read the content of the JavaScript file
        content = try
            read(filepath, String)
        catch e
            error("Could not read file: $filepath")
        end
    
        # Function to update the freeport value in the file content
        function update_freeport(content::String, freeport::Int)
            # Find the start range of "let freeport ="
            start_range = findfirst("let freeport =", content)
            if start_range === nothing
                return content  # Return original content if "let freeport =" is not found
            end
            # Extract the starting index from the range
            start_idx = first(start_range)
    
            # Find the index of the "//" comment after "let freeport ="
            comment_idx = findnext("//", content, start_idx + 1)
            if comment_idx === nothing
                return content  # Return original content if no comment is found
            end
            # Ensure comment_idx is an integer (if it's returned as a range, extract its first element)
            if comment_idx isa AbstractRange
                comment_idx = first(comment_idx)
            end
    
            # Extract the part before and after the number
            # "let freeport =" has length 14, so we add 13 to the starting index to get its end
            before = content[1:start_idx + 13]
            after = content[comment_idx:end]
    
            # Construct the new content with the updated freeport value
            return before * " " * string(freeport) * "  " * after
        end
    
        # Apply the replacement function
        new_content = update_freeport(content, freeport)
    
        # Write the modified content back to the file
        try
            write(filepath, new_content)
            println("WebSockets connection will use port: $freeport")
        catch e
            error("Could not write to file: $filepath")
        end
    
        return freeport
    end
    




# Execute the port update and store the selected port number
WebSockets_port = update_port_in_file(filepath)


