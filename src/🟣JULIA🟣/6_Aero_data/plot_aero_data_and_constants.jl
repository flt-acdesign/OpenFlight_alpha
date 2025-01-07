using JSON, Plots, DataFrames, ColorSchemes, Dates

cd(@__DIR__)
filename = "SF25B.json"

function extract_coefficient_data(data::Dict, coeff_name::String)
    if !haskey(data["coefficients"], coeff_name)
        println("Coefficient $coeff_name not found in data")
        return DataFrame()
    end
    
    coeff_data = data["coefficients"][coeff_name]
    parameters = coeff_data["parameters"]
    rows = []
    
    function process_nested_data(entry, params=Dict())
        if haskey(entry, coeff_name)
            row = Dict{String,Float64}()
            for p in parameters
                row[p] = get(params, p, 0.0)
            end
            row[coeff_name] = entry[coeff_name]
            push!(rows, row)
        end
        
        if haskey(entry, "data")
            for item in entry["data"]
                new_params = copy(params)
                for p in parameters
                    if haskey(item, p)
                        new_params[p] = item[p]
                    end
                end
                process_nested_data(item, new_params)
            end
        else
            for p in parameters
                if haskey(entry, p)
                    params[p] = entry[p]
                end
            end
        end
    end
    
    process_nested_data(coeff_data)
    return DataFrame(rows)
end

function find_parameter_hierarchy(data::Dict, coeff_name::String)
    coeff_data = data["coefficients"][coeff_name]
    return String[string(param) for param in coeff_data["parameters"]]
end

# Modify the plot_coefficient function to format the tick labels
function plot_coefficient(df::DataFrame, coeff_name::String, param_hierarchy::Vector{String})
    if isempty(df) || !(coeff_name in names(df))
        return plot(title="No data for $coeff_name")
    end
    
    x_param = param_hierarchy[end]
    p = plot(
        title="$coeff_name vs ($(join(param_hierarchy, ", ")))",
        xlabel=x_param,
        ylabel=coeff_name,
        legend=:outerright,
        left_margin=20Plots.mm,
        bottom_margin=10Plots.mm,
        right_margin=40Plots.mm,
        formatter=:plain  # Use plain number formatting
    )
    
    # Add custom tick formatting function
    plot!(p, formatter=x->round(x, digits=5))
    
    if length(param_hierarchy) == 1
        sort!(df, x_param)
        plot!(p, df[:, x_param], df[:, coeff_name],
              label=coeff_name, marker=:circle, linewidth=2,
              markersize=4, markerstrokewidth=0)
    else
        group_cols = param_hierarchy[1:end-1]
        gdf = groupby(df, group_cols)
        
        colors = [:red, :blue, :green, :orange, :purple, :brown]
        markers = [:circle, :square, :diamond, :triangle, :cross, :hex]
        
        for (i, group) in enumerate(gdf)
            label_parts = ["$(col)=$(round(group[1, col], digits=5))" for col in group_cols]
            label = join(label_parts, ", ")
            
            sort!(group, x_param)
            plot!(p, group[:, x_param], group[:, coeff_name],
                  label=label,
                  linewidth=2,
                  color=colors[mod1(i, length(colors))],
                  marker=markers[mod1(i, length(markers))],
                  markersize=4,
                  markerstrokewidth=0)
        end
    end
    
    if nrow(df) > 0
        x_data = df[:, x_param]
        y_data = df[:, coeff_name]
        x_range = maximum(x_data) - minimum(x_data)
        y_range = maximum(y_data) - minimum(y_data)
        x_padding = max(0.05 * x_range, 1e-6)
        y_padding = max(0.05 * y_range, 1e-6)
        
        xlims!(minimum(x_data) - x_padding, maximum(x_data) + x_padding)
        ylims!(minimum(y_data) - y_padding, maximum(y_data) + y_padding)
    end
    
    return p
end





function create_coefficient_plots(all_plots::Vector, filename::String, json_data::Dict)
    current_time = Dates.format(now(), "yyyy-mm-dd HH:MM:SS")
    n_constants = length(json_data["constants"])
    header_height = max(150, n_constants * 20)
    
    header_text = "Generated on: $current_time\nFile: $filename\n\nConstants:\n"
    constants = sort(collect(json_data["constants"]))
    for (name, value) in constants
        header_text *= rpad(name, 30) * " " * string(value) * "\n"
    end
    
    header_plot = plot(
        annotation=(0.5, 0.5, text(header_text, :left, 8)),
        showaxis=false,
        grid=false,
        legend=false,
        ticks=nothing,
        border=:none,
        size=(800, header_height),
        margin=20Plots.mm
    )
    
    n_plots = length(all_plots)
    plot_height = 400
    total_height = header_height + n_plots * plot_height
    
    layout = @layout [header{0.2h}; grid(n_plots, 1)]
    
    combined_plot = plot(
        header_plot,
        all_plots...,
        layout=layout,
        size=(800, total_height),
        link=:x,
        legend=:outerright,
        left_margin=20Plots.mm,
        right_margin=40Plots.mm,
        top_margin=20Plots.mm
    )
    
    return combined_plot
end

# Main execution
println("Starting coefficient visualization...")
json_data = JSON.parsefile(filename)
println("Coefficients found: ", keys(json_data["coefficients"]))

all_plots = []
for coeff_name in keys(json_data["coefficients"])
    println("Processing coefficient: $coeff_name")
    df = extract_coefficient_data(json_data, coeff_name)
    if !isempty(df)
        println("Successfully created DataFrame for: $coeff_name")
        param_hierarchy = find_parameter_hierarchy(json_data, coeff_name)
        push!(all_plots, plot_coefficient(df, coeff_name, param_hierarchy))
    else
        println("Warning: Empty DataFrame for: $coeff_name")
    end
end

coefficient_plot = create_coefficient_plots(all_plots, filename, json_data)
savefig(coefficient_plot, "coefficient_visualization.png")
println("Visualization complete!")
