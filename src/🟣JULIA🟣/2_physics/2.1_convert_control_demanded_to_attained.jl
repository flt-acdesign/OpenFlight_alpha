"""
    convert_control_demanded_to_attained(aircraft_model_data, force_control_inputs, moment_control_inputs, deltaTime)

Computes the actually attained control inputs given the demanded controls and
an actuator speed limit. The actuator speed (in control units per second) comes
from `aircraft_model_data[:actuator_speed]`, defaulting to `1.0` if missing.

# Arguments
- `aircraft_model_data`: Dictionary containing aircraft parameters. 
   Must have `:actuator_speed` (control-units/s), or defaults to 1.0.
- `force_control_inputs`: NamedTuple with:
    - `thrust_setting_demand` :: Scalar (required)
    - `x`, `y` :: Optional force components (default to 0.0 if absent).
- `moment_control_inputs`: NamedTuple with:
    - `roll_demand`, `pitch_demand`, `yaw_demand`             :: Demanded angles (scalars)
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
    actuator_speed = .00020 #get(aircraft_model_data, :actuator_speed, 1.0)

    # Compute the maximum adjustment possible this timestep
    actuator_delta = actuator_speed * deltaTime

    # -------------------------------------------------------------------------
    # Helper function to compute the new "attained" value of a control 
    # with rate limiting. The movement from current -> demanded is clamped 
    # by ±actuator_delta.
    function compute_attained(demanded, current, max_delta)
        # Uncomment for debugging:
         println("current = $current, demanded = $demanded")

        error = demanded - current
        delta = clamp(error, -max_delta, max_delta)
        return current + delta
    end

    # -------------------------------------------------------------------------
    # For now, thrust is assumed to match demanded directly (no spool-up).
    # If needed, you can handle it similarly to the control surfaces below.
    thrust_attained = force_control_inputs.thrust_setting_demand

    # -------------------------------------------------------------------------
    # Roll
    roll_attained = compute_attained(
        moment_control_inputs.roll_demand,
        moment_control_inputs.roll_demand_attained,
        actuator_delta
    )

    # Pitch
    pitch_attained = compute_attained(
        moment_control_inputs.pitch_demand,
        moment_control_inputs.pitch_demand_attained,
        actuator_delta
    )

    # Yaw
    yaw_attained = compute_attained(
        moment_control_inputs.yaw_demand,
        moment_control_inputs.yaw_demand_attained,
        actuator_delta
    )

    # -------------------------------------------------------------------------
    # Construct output for force control inputs
    force_control_inputs_out = (
        thrust_setting_demand = thrust_attained,
        x = get(force_control_inputs, :x, 0.0),
        y = get(force_control_inputs, :y, 0.0)
    )

    # Construct output for moment control inputs
    moment_control_inputs_out = (
        # Retain the originally demanded angles
        roll_demand  = moment_control_inputs.roll_demand,
        pitch_demand = moment_control_inputs.pitch_demand,
        yaw_demand   = moment_control_inputs.yaw_demand,

        # Update the newly attained angles
        roll_demand_attained  = roll_attained,
        pitch_demand_attained = pitch_attained,
        yaw_demand_attained   = yaw_attained
    )

    return force_control_inputs_out, moment_control_inputs_out
end
