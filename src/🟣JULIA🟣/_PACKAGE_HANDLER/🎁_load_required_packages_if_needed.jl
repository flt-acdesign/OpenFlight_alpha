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



