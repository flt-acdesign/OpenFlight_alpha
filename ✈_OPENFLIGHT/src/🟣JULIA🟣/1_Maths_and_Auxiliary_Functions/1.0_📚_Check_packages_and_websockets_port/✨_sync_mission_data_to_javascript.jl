###########################################
# FILE: ...\🟣JULIA🟣\1_Maths_and_Auxiliary_Functions\1.0_📚_Check_packages_and_websockets_port\✨_sync_mission_data_to_javascript.jl
###########################################



# 2) Mission file path
mission_file = joinpath(@__DIR__, raw"../../../../", "default_mission.yaml")
println("Loading mission file from: $mission_file")

# 3) Load mission data FIRST, before any includes
MISSION_DATA = YAML.load_file(mission_file)


# Extract the user-chosen times:
const start_recording_sec  = MISSION_DATA["start_flight_data_recording_at"]
const finish_recording_sec = MISSION_DATA["finish_flight_data_recording_at"]

println("Configured to record flight data only during: [$start_recording_sec .. $finish_recording_sec] seconds")



"""
    format_js_value(value)

Convert a Julia value into a JavaScript-friendly string.
"""
function format_js_value(value)
    if isa(value, String)
        # produce quoted string, e.g. "myString" -> "\"myString\""
        return "\"" * value * "\""
    elseif isa(value, Bool)
        # lowercase booleans (true/false) in JS style
        return lowercase(string(value))
    elseif value === nothing
        return "null"
    else
        # numbers or other types as-is
        return string(value)
    end
end

"""
    update_js_variables_simplified(js_filepath)

Find any line that contains:
    <varName> = <anything>
and replace the entire line with exactly:
    let <varName> = <new_value>

This enforces a single space before and after '='
and includes 'let ' at the start.
"""
function update_js_variables_simplified(js_filepath::String)
    # 1) Read the entire JS file into one string
    content = read(js_filepath, String)
    
    # 2) Split the content into lines for processing
    lines = split(content, '\n')
    
    # 3) For each key in MISSION_DATA, find and replace matching lines
    for (key, value) in MISSION_DATA
        var_name = string(key)
        new_value = format_js_value(value)
        
        # Process each line
        for (i, line) in enumerate(lines)
            # Check if this line contains our variable assignment
            # Using a simple string match to avoid regex complexity
            if occursin(var_name * " =", line) || occursin(var_name * "=", line)
                # Replace the entire line, regardless of what else is in it
                # This will remove any existing "let" declaration
                lines[i] = "let " * var_name * " = " * new_value
            end
        end
    end
    
    # 4) Join the modified lines back together
    updated_content = join(lines, '\n')
    
    # 5) Write the updated content back to the file
    write(js_filepath, updated_content)
    println("Finished simplified variable updates in: $js_filepath")
end

# ─────────────────────────────────────────────────
# Example usage (uncomment below to test):
current_path = @__DIR__
js_filepath = joinpath(
    current_path, "..", "..", "..",
    "🟡JAVASCRIPT🟡", "0_INITIALIZATION", 
    "0.1_🧾_initializations.js"
)
update_js_variables_simplified(js_filepath)
# ─────────────────────────────────────────────────