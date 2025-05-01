#!/usr/bin/env julia

using Printf
using Base.Filesystem: walkdir, basename, joinpath, splitext

# -----------------------------------------------------------------------------
# 1. Specify the base folder to process.
# 2. Specify the file extensions to capture.
# 3. Specify the output file.
# 4. Specify folders to exclude (new feature)
# -----------------------------------------------------------------------------
folder      = raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT"
extensions  = [".html", ".css", ".js", ".jl1"]
output_file = raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\openflight_concatenated_code.txt"
exclude_folders = String[
    # Add folders to exclude (relative or absolute paths)
    # Example: "node_modules", joinpath(folder, "build")

raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\src\🟡JAVASCRIPT🟡\🌈_AUXILIARY_CODE", 
raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\src\🟡JAVASCRIPT🟡\🛑_EXTERNAL_LIBRARIES",
raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\📊_Flight_Test_Data",


]

# -----------------------------------------------------------------------------
# Collect all matching files by recursively walking the directory
# -----------------------------------------------------------------------------
function gather_files(base::String, exts::Vector{String}, excluded::Vector{String})
    matched_files = String[]
    for (root, dirs, files) in walkdir(base)
        # Check if current directory should be excluded
        should_exclude = false
        for excluded_folder in excluded
            # Check if this directory is in an excluded path
            if startswith(root, excluded_folder) || root == excluded_folder
                should_exclude = true
                break
            end
        end
        
        if should_exclude
            continue
        end
        
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

all_files = gather_files(folder, extensions, exclude_folders)

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
println("Total files processed: $(length(all_files))")