

struct ParameterBounds
    min_val::Float64
    max_val::Float64
end

struct SortedParameterData
    values::Vector{Float64}
    indices::Dict{Float64, Int}
end

struct CoefficientMetadata
    parameters::Vector{String}
    bounds::Dict{String, ParameterBounds}
    sorted_data::Dict{String, SortedParameterData}
end

struct AeroData
    constants::Dict{String, Float64}
    coefficients::Dict{String, Any}
    metadata::Dict{String, CoefficientMetadata}
end

function find_parameter_values(data::Vector, param::String)
    values = Float64[]
    
    for entry in data
        if haskey(entry, param)
            push!(values, entry[param])
        elseif haskey(entry, "data")
            append!(values, find_parameter_values(entry["data"], param))
        end
    end
    
    return unique(values)
end

function compute_parameter_bounds(values::Vector{Float64})
    return ParameterBounds(minimum(values), maximum(values))
end

function create_sorted_parameter_data(values::Vector{Float64})
    sorted_values = sort(values)
    indices = Dict(value => i for (i, value) in enumerate(sorted_values))
    return SortedParameterData(sorted_values, indices)
end

function compute_coefficient_metadata(coeff_data::Dict)
    parameters = coeff_data["parameters"]
    bounds = Dict{String, ParameterBounds}()
    sorted_data = Dict{String, SortedParameterData}()
    
    for param in parameters
        values = find_parameter_values(coeff_data["data"], param)
        bounds[param] = compute_parameter_bounds(values)
        sorted_data[param] = create_sorted_parameter_data(values)
    end
    
    return CoefficientMetadata(parameters, bounds, sorted_data)
end

function parse_aero_data(data::Dict)
    coefficients = Dict{String, Any}(data["coefficients"])
    metadata = Dict{String, CoefficientMetadata}()
    
    for (coeff_name, coeff_data) in coefficients
        metadata[coeff_name] = compute_coefficient_metadata(coeff_data)
    end
    
    AeroData(
        Dict{String, Float64}(data["constants"]),
        coefficients,
        metadata
    )
end

function check_parameters(metadata::CoefficientMetadata, params::Dict)
    required_params = Set(metadata.parameters)
    provided_params = Set(keys(params))
    
    if required_params != provided_params
        throw(ArgumentError("Incorrect parameters provided. Required: $required_params, Got: $provided_params"))
    end
end

function clip_value(value::Float64, bounds::ParameterBounds)
    if value < bounds.min_val
        #@warn "Value $value below minimum $(bounds.min_val) for parameter. Using $(bounds.min_val)"
        return bounds.min_val
    elseif value > bounds.max_val
        #@warn "Value $value above maximum $(bounds.max_val) for parameter. Using $(bounds.max_val)"
        return bounds.max_val
    end
    return value
end

function find_nearest_values(sorted_values::Vector{Float64}, target::Float64)
    idx = searchsortedfirst(sorted_values, target)
    
    if idx > length(sorted_values)
        return sorted_values[end], sorted_values[end]
    elseif idx == 1
        return sorted_values[1], sorted_values[1]
    elseif sorted_values[idx] == target
        return target, target
    else
        return sorted_values[idx-1], sorted_values[idx]
    end
end

function get_value_at_params(data::Vector, params::Vector{String}, values::Vector{Float64}, coeff_name::String)
    current_data = data
    
    for (param, value) in zip(params, values)
        found = false
        for entry in current_data
            if haskey(entry, param) && abs(entry[param] - value) < 1e-10
                if haskey(entry, "data")
                    current_data = entry["data"]
                else
                    return entry[coeff_name]
                end
                found = true
                break
            end
        end
        if !found
            throw(ErrorException("Value not found for parameter $param = $value"))
        end
    end
    
    if !isempty(current_data) && haskey(current_data[1], coeff_name)
        return current_data[1][coeff_name]
    else
        throw(ErrorException("Coefficient $coeff_name not found at specified parameters"))
    end
end



function fetch_value_from_aero_database(aero_data::AeroData, coeff_name::String; kwargs...)
    # Check if it's a constant
    if haskey(aero_data.constants, coeff_name)
        return aero_data.constants[coeff_name]
    end
    
    # If no parameters provided and it's not a constant, throw error
    if isempty(kwargs)
        throw(ArgumentError("No parameters provided for non-constant coefficient $coeff_name"))
    end
    
    # Convert kwargs to Dict{String, Float64}
    params = Dict{String, Float64}(string(k) => Float64(v) for (k,v) in kwargs)
    
    # Get coefficient data and metadata
    coeff_data = aero_data.coefficients[coeff_name]
    metadata = aero_data.metadata[coeff_name]
    
    # Verify parameters
    check_parameters(metadata, params)
    
    # For single parameter coefficients
    if length(metadata.parameters) == 1
        param = metadata.parameters[1]
        if length(coeff_data["data"]) == 1
            return coeff_data["data"][1][coeff_name]
        end
        
        param_value = clip_value(params[param], metadata.bounds[param])
        lower_val, upper_val = find_nearest_values(metadata.sorted_data[param].values, param_value)
        
        if lower_val == upper_val
            return get_value_at_params(coeff_data["data"], [param], [lower_val], coeff_name)
        end
        
        lower_coeff = get_value_at_params(coeff_data["data"], [param], [lower_val], coeff_name)
        upper_coeff = get_value_at_params(coeff_data["data"], [param], [upper_val], coeff_name)
        
        t = (param_value - lower_val) / (upper_val - lower_val)
        return lower_coeff * (1-t) + upper_coeff * t
    end
    
    # For multi-parameter coefficients
    interpolated_value = 0.0
    total_weight = 0.0
    
    # Get all parameter combinations
    param_values = Dict(
        param => clip_value(params[param], metadata.bounds[param])
        for param in metadata.parameters
    )
    
    # Get nearest values for each parameter
    param_bounds = Dict(
        param => find_nearest_values(metadata.sorted_data[param].values, value)
        for (param, value) in param_values
    )
    
    # Generate all combinations of lower/upper bounds
    for combination in Iterators.product(([0,1] for _ in 1:length(metadata.parameters))...)
        try
            current_params = [metadata.parameters[i] for i in 1:length(metadata.parameters)]
            current_values = [
                (combination[i] == 0 ? param_bounds[param][1] : param_bounds[param][2])
                for (i, param) in enumerate(current_params)
            ]
            
            value = get_value_at_params(coeff_data["data"], current_params, current_values, coeff_name)
            
            # Calculate weight based on distance from target point
            weight = 1.0
            for (i, param) in enumerate(current_params)
                target = param_values[param]
                current = current_values[i]
                bound_low, bound_high = param_bounds[param]
                if bound_low != bound_high
                    t = abs(target - current) / abs(bound_high - bound_low)
                    weight *= (1 - t)
                end
            end
            
            interpolated_value += weight * value
            total_weight += weight
        catch e
            if !isa(e, ErrorException)
                rethrow(e)
            end
        end
    end
    
    if total_weight == 0
        throw(ErrorException("No valid interpolation points found"))
    end
    
    return interpolated_value / total_weight
end





# Example usage:
# json_data = JSON.parsefile("data9.json")
# aero_data = parse_aero_data(json_data)


    # Get CL value
    # For multiple parameters
  #  cl = fetch_value_from_aero_database(aero_data, "CL", Mach=0.05, beta = 0.0, alpha=2.0)

  #  println("CL: $cl")
    
    # Get CD0 value
  #  cd0 = fetch_value_from_aero_database(aero_data, "CD0", Mach=0.05)
  #  println("CD0: $cd0")
    

    # For constants
  #  mass0 = fetch_value_from_aero_database(aero_data, "aircraft_mass")
  #  println("Mass: $mass")

    


