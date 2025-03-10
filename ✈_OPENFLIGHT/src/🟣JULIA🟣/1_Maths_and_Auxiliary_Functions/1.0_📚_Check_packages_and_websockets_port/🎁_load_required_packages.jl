#!/usr/bin/env julia

# Import essential Julia packages for package management, linear algebra, and date/time operations
using Pkg, LinearAlgebra, Dates

# Define a function that checks if a package is installed, installs if missing, and loads it
function ensure_package(pkg::String)
    try
        # Attempt to dynamically load the package using metaprogramming
        @eval using $(Symbol(pkg))
    catch e
        # Convert any error to string for pattern matching
        err_str = sprint(showerror, e)

        # Check if error indicates missing package
        if e isa ArgumentError && occursin("not found", err_str)
            println("Package $pkg not found. Installing it now... Once installed this message will not appear again")
            # Install the missing package
            Pkg.add(pkg)
            # Try loading the newly installed package
            @eval using $(Symbol(pkg))
        else
            # If error is not related to missing package, propagate the error
            rethrow(e)
        end
    end
end

# Define array of required packages for the application
# These packages will be checked and installed if necessary
required_packages = [
    "HTTP",        # HTTP client and server functionality
    "Sockets",     # Network socket operations
    "WebSockets",  # WebSocket protocol implementation
    "JSON",        # JSON parsing and generation
    "CSV",         # CSV file handling
    "DataFrames",  # Tabular data manipulation
    "StaticArrays",# Fixed-size arrays for performance
    "YAML",         # YAML file parsing and generation
    "VortexLattice" # Vortex lattice method for aerodynamics, only used for the aero model creation, not in the simulator
]

# Iterate through required packages and ensure they're installed
println("Checking Julia packages...")
for pkg in required_packages
    ensure_package(pkg)
end

println("All required Julia packages are installed and loaded successfully!")
println("  ")







