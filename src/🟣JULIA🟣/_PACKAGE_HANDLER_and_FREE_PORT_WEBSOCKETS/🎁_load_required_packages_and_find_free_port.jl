#!/usr/bin/env julia

using Pkg, LinearAlgebra, Dates

# Define a helper function that ensures a package is installed and loaded.
function ensure_package(pkg::String)
    try
        # Try to load the package.
        @eval using $(Symbol(pkg))
    catch e
        # Convert the error to a string for inspection.
        err_str = sprint(showerror, e)

        # More generic check: if this is an ArgumentError and the error text
        # contains "not found", we assume the package isn't installed yet.
        if e isa ArgumentError && occursin("not found", err_str)
            println("Package $pkg not found. Installing it now... Once installed this message will not appear again")
            Pkg.add(pkg)
            # After installation, try loading again.
            @eval using $(Symbol(pkg))
        else
            # If it's a different error, just rethrow.
            rethrow(e)
        end
    end
end

# List the packages you want to ensure are installed.
# Standard libraries (LinearAlgebra, Dates) are already in the environment.
required_packages = [
    "HTTP",
    "Sockets",
    "WebSockets",
    "JSON",
    "CSV",
    "DataFrames",
    "StaticArrays",
    "YAML"
]

println("Checking packages...")
for pkg in required_packages
    ensure_package(pkg)
end

println("All required packages are installed and loaded successfully!")



# Find free port for the server to listen on
# Navigate to the target JavaScript file
current_path = @__DIR__
filepath = joinpath(current_path, "..", "..", "🟡JAVASCRIPT🟡", "7_INITIALIZATION", "7.1_🧾_initializations.js")

# Print paths to verify
println("Starting from: ", current_path)
println("Target file: ", filepath)

function find_free_port(start_port=8000, max_attempts=1000)
    for port in start_port:(start_port + max_attempts)
        server = try
            listen(port)
        catch e
            continue
        end
        close(server)
        return port
    end
    error("No free port found after $max_attempts attempts")
end

# Function to update the file (using previous implementation)
function update_port_in_file(filepath)
    freeport = find_free_port()
    content = try
        read(filepath, String)
    catch e
        error("Could not read file: $filepath")
    end
    
    new_content = replace(content, "let freeport = 8080" => "let freeport = $freeport")
    
    try
        write(filepath, new_content)
        println("Successfully updated port to $freeport")
    catch e
        error("Could not write to file: $filepath")
    end
    
    return freeport
end

# Execute the update
WebSockets_port = update_port_in_file(filepath)