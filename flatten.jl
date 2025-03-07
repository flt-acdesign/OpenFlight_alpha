#!/usr/bin/env julia

using Printf
using Base.Filesystem: walkdir, basename, joinpath, splitext

# -----------------------------------------------------------------------------
# 1. Specify the base folder to process.
# 2. Specify the file extensions to capture.
# 3. Specify the output file.
# -----------------------------------------------------------------------------
folder      = raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\🛫_CREATE_AIRCRAFT_MODEL"
extensions  = [".html", ".css", ".js"]
output_file = raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\concatenated_code.txt"

# -----------------------------------------------------------------------------
# Collect all matching files by recursively walking the directory
# -----------------------------------------------------------------------------
function gather_files(base::String, exts::Vector{String})
    matched_files = String[]
    for (root, dirs, files) in walkdir(base)
        for f in files
            file_path = joinpath(root, f)
            ext = splitext(f)[2]   # e.g. ".jl", ".html", etc.
            if ext in exts
                push!(matched_files, file_path)
            end
        end
    end
    return matched_files
end

all_files = gather_files(folder, extensions)

# -----------------------------------------------------------------------------
# Write file headers and contents to the output file
# -----------------------------------------------------------------------------
open(output_file, "w") do io
    for file_path in all_files
        # Write a clear header with the complete file path
        println(io, "###########################################")
        @printf(io, "# FILE: %s\n", file_path)
        println(io, "###########################################")
        println(io)
        
        # Read each line from the file and write to the output
        for line in eachline(file_path)
            println(io, line)
        end
        
        # Separate files with a blank line
        println(io)
    end
end

println("Concatenation complete! Output written to: $output_file")