using JSON, Plots, DataFrames, ColorSchemes, Dates, YAML
using PlotUtils: distinguishable_colors

cd(@__DIR__)
#filename = "SF25B.json"

# Specify the filename
filename = "SF25B.yaml"

# Read and parse the YAML file
json_data = YAML.load_file(filename)

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
    # If DataFrame is empty or the coeff column is missing, return a dummy plot
    if isempty(df) || !(coeff_name in names(df))
        return plot(title="No data for $coeff_name")
    end

    # The last parameter in param_hierarchy is our x-axis
    x_param = param_hierarchy[end]

    # Construct the plot
    # Increase left_margin so the title/labels are not clipped,
    # and use title_position=:center so the title is centered in the plot area.
    p = plot(
        title="$coeff_name vs ($(join(param_hierarchy, ", ")))",
        title_position=:center,
        xlabel=x_param,
        ylabel=coeff_name,
        legend=:outerright,
        left_margin=190Plots.mm,    # Increase left margin to avoid clipping
        right_margin=40Plots.mm,
        bottom_margin=20Plots.mm,
        formatter=:plain           # Use plain number formatting on axes
    )
    # Slight improvement: ensure x‐axis ticks are rounded, for neatness
    plot!(p, formatter = x -> round(x, digits=5))

    # Figure out how many grouping parameters there are
    # (These are all parameters except the last, which is on the x-axis.)
    group_cols = param_hierarchy[1:end-1]
    num_groups = length(group_cols)

    if num_groups == 0
        # No grouping parameters at all => just sort and plot a single curve
        sort!(df, x_param)
        plot!(
            p,
            df[:, x_param],
            df[:, coeff_name],
            label = coeff_name, 
            linewidth = 2, 
            color = :blue,         # Just pick a default color
            marker = :none         # No markers needed
        )
        return p
    end

    # Otherwise, group by those columns
    gdf = groupby(df, group_cols)

    # --- Prepare style lists ---
    # 1) Fixed color palette for the first grouping parameter
    colors_for_first_param = [
        "#377eb8",  # Medium Blue1
        "#e41a1c",  # Dark Red1
        "#4daf4a",  # Forest Green1
        "#ff7f00",  # Orange1
        "#984ea3",  # Purple1
        "#4477aa",  # Navy Blue2
        "#cc6677",  # Rose1
        "#117733",  # Deep Green1
        "#882255",  # Burgundy1
        "#88ccee"   # Light Blue1
    ]

    # 2) Marker shapes for a possible second grouping parameter
    markers_list = [:circle, :square, :diamond, :utriangle, :dtriangle, :hex, :star5]

    # 3) Outline/stroke colors for a possible third grouping parameter
    outline_colors = [:black, :red, :green, :orange, :purple, :brown, :pink]

    # Build dictionaries so we can map parameter values => style index
    param_value_to_index = Dict{Symbol,Dict{Any,Int}}()
    for (i, par_sym) in enumerate(Symbol.(group_cols))
        col_name = String(par_sym)
        unique_vals = unique(df[:, col_name])
        sort!(unique_vals)
        # Make a dictionary from actual value => index
        idx_map = Dict{Any,Int}()
        for (k,v) in enumerate(unique_vals)
            idx_map[v] = k
        end
        param_value_to_index[par_sym] = idx_map
    end

    # Now loop over each grouped subset and assign color/marker/outline
    for group in gdf
        # Build a label for the legend
        label_parts = String[]
        for c in group_cols
            val = group[1, c]
            push!(label_parts, "$(c)=$(round(val,digits=5))")
        end
        label_str = join(label_parts, ", ")

        # figure out first param style
        first_param = group_cols[1]
        fp_val = group[1, first_param]
        fp_idx = param_value_to_index[Symbol(first_param)][fp_val]
        color_style = colors_for_first_param[mod1(fp_idx, length(colors_for_first_param))]

        # default marker and stroke
        marker_style = :none
        stroke_style = :transparent

        # If 2 or more grouping parameters => second param influences marker shape
        if num_groups >= 2
            second_param = group_cols[2]
            sp_val = group[1, second_param]
            sp_idx = param_value_to_index[Symbol(second_param)][sp_val]
            marker_style = markers_list[mod1(sp_idx, length(markers_list))]
        end

        # If 3 or more grouping parameters => third param influences stroke color
        if num_groups >= 3
            third_param = group_cols[3]
            tp_val = group[1, third_param]
            tp_idx = param_value_to_index[Symbol(third_param)][tp_val]
            stroke_style = outline_colors[mod1(tp_idx, length(outline_colors))]
        end

        # Sort the group by x-axis for a clean line
        sort!(group, x_param)

        # Decide if we even want markers or outlines:
        if num_groups == 1
            # Only lines
            marker_style = :none
            stroke_style = :transparent
        elseif num_groups == 2
            # lines + markers, no outline
            stroke_style = :transparent
        else
            # lines + markers + outlines
        end

        plot!(
            p,
            group[:, x_param],
            group[:, coeff_name],
            label=label_str,
            linewidth=2,
            color=color_style,
            marker=marker_style,
            markerstrokecolor=stroke_style,
            markerstrokewidth=(num_groups >= 3 ? 1.5 : 0),
            markersize=(marker_style == :none ? 0 : 5)
        )
    end

    # Finally, adjust plot x/y limits if we have data
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
#json_data = JSON.parsefile(filename)
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

