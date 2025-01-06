using JSON, Plots, DataFrames, ColorSchemes, Dates

cd(@__DIR__)


function extract_coefficient_data(data::Dict, coeff_name::String)
    if !haskey(data["coefficients"], coeff_name)
        println("Coefficient $coeff_name not found in data")
        return DataFrame()
    end
    
    coeff_data = data["coefficients"][coeff_name]
    parameters = coeff_data["parameters"]
    rows = []
    
    function process_level(current_data, current_params=Dict())
        for entry in current_data
            next_params = copy(current_params)
            
            for param in parameters
                if haskey(entry, param)
                    next_params[param] = entry[param]
                end
            end
            
            if haskey(entry, coeff_name)
                row_data = Dict{String, Float64}()
                for param in parameters
                    row_data[param] = get(next_params, param, 0.0)
                end
                row_data[coeff_name] = entry[coeff_name]
                push!(rows, row_data)
            end
            
            if haskey(entry, "data")
                process_level(entry["data"], next_params)
            end
        end
    end
    
    process_level(coeff_data["data"])
    println("Data extracted for $coeff_name: ", length(rows), " rows")
    return isempty(rows) ? DataFrame() : DataFrame(rows)
end

function find_parameter_hierarchy(data::Dict, coeff_name::String)
    coeff_data = data["coefficients"][coeff_name]
    return String[param for param in coeff_data["parameters"]]
end

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
        right_margin=40Plots.mm
    )
    
    if nrow(df) > 0
        x_data = df[:, x_param]
        y_data = df[:, coeff_name]
        xlims!(minimum(x_data), maximum(x_data))
        ylims!(minimum(y_data), maximum(y_data))
    end
    
    markers = [:circle, :square, :diamond, :triangle, :cross, :hex]
    linestyles = [:solid, :dash, :dot, :dashdot]
    
    if length(param_hierarchy) == 1
        sorted_indices = sortperm(df[:, x_param])
        sorted_df = df[sorted_indices, :]
        
        if nrow(df) == 1
            scatter!(p, sorted_df[:, x_param], sorted_df[:, coeff_name],
                    label="$coeff_name", marker=:circle, markersize=8, markerstrokewidth=0)
            annotate!([(sorted_df[1, x_param], sorted_df[1, coeff_name],
                       text("$(round(sorted_df[1, coeff_name], digits=3))", :black, :top, 10))])
        else
            plot!(p, sorted_df[:, x_param], sorted_df[:, coeff_name],
                  label="$coeff_name", linewidth=2, marker=:circle, markersize=4, markerstrokewidth=0)
        end
    else
        first_param = param_hierarchy[1]
        unique_first_values = sort(unique(df[:, first_param]))
        
        for (i, first_val) in enumerate(unique_first_values)
            base_color = RGB(
                i == 1 ? 1.0 : 0.0,
                i == 2 ? 1.0 : 0.0,
                i == 3 ? 1.0 : 0.0
            )
            
            first_param_data = df[df[:, first_param] .== first_val, :]
            remaining_params = param_hierarchy[2:end-1]
            
            if !isempty(remaining_params)
                param_combinations = []
                for param in remaining_params
                    push!(param_combinations, sort(unique(first_param_data[:, param])))
                end
                
                for (j, combo) in enumerate(Iterators.product(param_combinations...))
                    filter_expr = first_param_data[:, first_param] .== first_val
                    for (param, val) in zip(remaining_params, combo)
                        filter_expr .&= (first_param_data[:, param] .== val)
                    end
                    
                    subset = first_param_data[filter_expr, :]
                    if !isempty(subset)
                        sorted_indices = sortperm(subset[:, x_param])
                        sorted_subset = subset[sorted_indices, :]
                        
                        shade_factor = 1.0 - (j-1) * 0.3 / length(collect(Iterators.product(param_combinations...)))
                        color = RGB(
                            base_color.r * shade_factor,
                            base_color.g * shade_factor,
                            base_color.b * shade_factor
                        )
                        
                        label_parts = ["$first_param = $first_val"]
                        for (param, val) in zip(remaining_params, combo)
                            push!(label_parts, "$param = $val")
                        end
                        label = join(label_parts, ", ")
                        
                        plot!(p, sorted_subset[:, x_param], sorted_subset[:, coeff_name],
                              label=label, linewidth=2, color=color,
                              linestyle=linestyles[mod1(j, length(linestyles))],
                              marker=markers[mod1(j, length(markers))],
                              markersize=4, markerstrokewidth=0)
                    end
                end
            end
        end
    end
    return p
end

function create_coefficient_plots(all_plots::Vector, filename::String, json_data::Dict)
    current_time = Dates.format(now(), "yyyy-mm-dd HH:MM:SS")
    
    header_text = "Generated on: $current_time\nFile: $filename\n\nConstants:\n"
    constants = json_data["constants"]
    for (name, value) in constants
        header_text *= "$name: $value\n"
    end
    
    header_plot = plot(
        annotation=(0.1, 0.9, text(header_text, :left, 10)),
        showaxis=false, grid=false, legend=false,
        ticks=nothing, border=:none,
        size=(800, 150)
    )
    
    # Calculate total height needed
    n_plots = length(all_plots)
    plot_height = 400
    total_height = 150 + n_plots * plot_height
    
    # Create the layout
    layout = @layout [
        header{0.15h}
        grid(n_plots, 1)
    ]
    
    # Combine all plots
    combined_plot = plot(
        header_plot, 
        all_plots...,
        layout=layout,
        size=(800, total_height),
        link=:x,
        legend=:outerright,
        left_margin=20Plots.mm,
        top_margin=20Plots.mm
    )
    
    return combined_plot
end


filename =  "data9.json" 

# Main execution

json_data = JSON.parsefile(filename)
println("Coefficients found: ", keys(json_data["coefficients"]))

all_plots = []
for coeff_name in keys(json_data["coefficients"])
    df = extract_coefficient_data(json_data, coeff_name)
    if !isempty(df)
        param_hierarchy = find_parameter_hierarchy(json_data, coeff_name)
        push!(all_plots, plot_coefficient(df, coeff_name, param_hierarchy))
    end
end

coefficient_plot = create_coefficient_plots(all_plots, filename, json_data)
savefig(coefficient_plot, "coefficient_visualization.png")
