#!/usr/bin/env julia

using Pkg, LinearAlgebra, Dates

# Define a helper function that ensures a package is installed and loaded.
function ensure_package(pkg::String)
    try
        @eval using $(Symbol(pkg))
    catch e
        # Check if the error indicates that the package wasn't found.
        if occursin("not found in path", String(e))
            println("Package $pkg not found. Installing it now...")
            Pkg.add(pkg)
            @eval using $(Symbol(pkg))
        else
            rethrow(e)
        end
    end
end

# List the packages you want to ensure are installed.
# Note: LinearAlgebra and Dates are part of Julia's standard library so we load them directly.
required_packages = ["HTTP", "WebSockets", "JSON", "CSV", "DataFrames", "StaticArrays", "YAML"]

for pkg in required_packages
    ensure_package(pkg)
end



