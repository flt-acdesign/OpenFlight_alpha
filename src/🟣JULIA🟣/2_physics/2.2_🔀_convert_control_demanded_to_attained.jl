"""
    convert_control_demanded_to_attained(aircraft_model_data, force_control_inputs, moment_control_inputs, deltaTime)

Computes the actually attained control inputs given the demanded controls and
an actuator speed limit. The actuator speed (in control units per second) comes
from `aircraft_model_data[:actuator_speed]`, defaulting to `1.0` if missing.

# Arguments
- `aircraft_model_data`: Dictionary containing aircraft parameters. 
   Must have `:actuator_speed` (control-units/s), or defaults to 1.0 if absent.
- `force_control_inputs`: NamedTuple with:
    - `thrust_setting_demand` :: Scalar (required)
    - `x`, `y` :: Optional force components (defaults to 0.0 if absent).
- `moment_control_inputs`: NamedTuple with:
    - `roll_demand`, `pitch_demand`, `yaw_demand` :: Demanded angles (scalars)
    - `roll_demand_attained`, `pitch_demand_attained`, `yaw_demand_attained` :: Current attained angles
- `deltaTime`: Time step (s).

# Returns
Tuple `(force_control_inputs_out, moment_control_inputs_out)` with updated attained values.
"""
function convert_control_demanded_to_attained(
    aircraft_model_data,
    force_control_inputs,
    moment_control_inputs,
    deltaTime
)
    # Retrieve actuator speed or fall back to 1.0 if not provided
    actuator_speed = aircraft_model_data.control_actuator_speed    #get(aircraft_model_data, :actuator_speed, 1.0)
    actuator_delta = actuator_speed * deltaTime

    function compute_attained(demanded, current, max_delta)
        error = demanded - current

        # If max_delta is zero or near zero, actuator can't move
        if isapprox(max_delta, 0.0; atol=1e-12)
            return current
        end

        # If the needed movement is within the max_delta, move directly
        if abs(error) <= max_delta
            return demanded
        else
            # Move only partway (by ±max_delta)
            return current + sign(error) * max_delta
        end
    end

    # For now, thrust matches demanded directly (no spool-up)
    thrust_attained = force_control_inputs.thrust_setting_demand

    # Compute new attained positions using current attained values
    roll_attained = compute_attained(
        moment_control_inputs.roll_demand,
        moment_control_inputs.roll_demand_attained,
        actuator_delta
    )

    pitch_attained = compute_attained(
        moment_control_inputs.pitch_demand,
        moment_control_inputs.pitch_demand_attained,
        actuator_delta
    )

    yaw_attained = compute_attained(
        moment_control_inputs.yaw_demand,
        moment_control_inputs.yaw_demand_attained,
        actuator_delta
    )

    # Construct outputs
    force_control_inputs_out = (
        thrust_setting_demand = thrust_attained,
        x = get(force_control_inputs, :x, 0.0),
        y = get(force_control_inputs, :y, 0.0)
    )

    moment_control_inputs_out = (
        # Keep original demands
        roll_demand = moment_control_inputs.roll_demand,
        pitch_demand = moment_control_inputs.pitch_demand,
        yaw_demand = moment_control_inputs.yaw_demand,
        # Update attained values
        roll_demand_attained = roll_attained,
        pitch_demand_attained = pitch_attained,
        yaw_demand_attained = yaw_attained
    )

    return force_control_inputs_out, moment_control_inputs_out
end

# Example of proper initialization:
function initialize_control_inputs()
    force_control_inputs = (
        thrust_setting_demand = 0.0,
        x = 0.0,
        y = 0.0
    )

    moment_control_inputs = (
        # Initial demands (can be non-zero if needed)
        roll_demand = 0.0,
        pitch_demand = 0.0,
        yaw_demand = 0.0,
        # Initial attained values MUST start at known positions
        roll_demand_attained = 0.0,
        pitch_demand_attained = 0.0,
        yaw_demand_attained = 0.0
    )

    return force_control_inputs, moment_control_inputs
end

# Example usage:
function example_usage()
    # Initialize aircraft model data
    aircraft_model_data = Dict(:actuator_speed => 1.0)
    
    # Initialize control inputs with proper starting values
    force_controls, moment_controls = initialize_control_inputs()
    
    # Simulation loop example
    deltaTime = 0.01
    for t in 1:100
        # Update demanded values (example)
        moment_controls = (
            roll_demand = sin(t * deltaTime),  # Some varying demand
            pitch_demand = cos(t * deltaTime), # Some varying demand
            yaw_demand = 0.0,                 # Constant demand
            # Keep current attained values
            roll_demand_attained = moment_controls.roll_demand_attained,
            pitch_demand_attained = moment_controls.pitch_demand_attained,
            yaw_demand_attained = moment_controls.yaw_demand_attained
        )
        
        # Convert demanded to attained
        force_controls, moment_controls = convert_control_demanded_to_attained(
            aircraft_model_data,
            force_controls,
            moment_controls,
            deltaTime
        )
    end
end
