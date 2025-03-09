# Function to update the scenery complexity in the JavaScript file
function update_scenery_complexity_in_file(filepath)
    # Get the new scenery complexity value
    new_complexity = mission_data["scenery_complexity"]
    
    # Read the content of the JavaScript file
    content = try
        read(filepath, String)
    catch e
        error("Could not read file: $filepath")
    end
    
    # Function to update the scenery_complexity value in the file content
    function update_complexity(content::String, new_complexity::String)
        # Find the start range of "let scenery_complexity="
        start_range = findfirst("let scenery_complexity=", content)
        if start_range === nothing
            return content  # Return original content if "let scenery_complexity=" is not found
        end
        
        # Extract the starting index from the range
        start_idx = first(start_range)
        
        # Find the end of the line (either newline or semicolon)
        newline_idx = findnext("\n", content, start_idx + 1)
        semicolon_idx = findnext(";", content, start_idx + 1)
        
        # Get the earlier of newline or semicolon
        end_idx = if newline_idx === nothing && semicolon_idx === nothing
            length(content)
        elseif newline_idx === nothing
            semicolon_idx
        elseif semicolon_idx === nothing
            newline_idx
        else
            min(newline_idx, semicolon_idx)
        end
        
        # Extract the part before the value
        before = content[1:start_idx + 23]  # "let scenery_complexity=" has length 20
        
        # Find the start and end of the current value (enclosed in quotes)
        quote_start = findnext("\"", content, start_idx + 23)
        if quote_start === nothing
            return content  # Return original content if no quotes are found
        end
        
        quote_end = findnext("\"", content, first(quote_start) + 1)
        if quote_end === nothing
            return content  # Return original content if closing quote is not found
        end
        
        # Extract the part after the value
        after = content[first(quote_end) + 1:end]
        
        # Construct the new content with the updated scenery_complexity value
        return before * "\"" * new_complexity * "\"" * after
    end
    
    # Apply the replacement function
    new_content = update_complexity(content, new_complexity)
    
    # Write the modified content back to the file
    try
        write(filepath, new_content)
        println("Scenery complexity updated to: $new_complexity")
    catch e
        error("Could not write to file: $filepath")
    end
    
    return new_complexity
end

# Get the directory path of the current script
current_path = @__DIR__

# Construct path to the JavaScript initialization file
filepath = joinpath(current_path, "..", "..", "..", "🟡JAVASCRIPT🟡", "0_INITIALIZATION", "0.1_🧾_initializations.js")

# Execute the complexity update and store the selected complexity
new_scenery_complexity = update_scenery_complexity_in_file(filepath)