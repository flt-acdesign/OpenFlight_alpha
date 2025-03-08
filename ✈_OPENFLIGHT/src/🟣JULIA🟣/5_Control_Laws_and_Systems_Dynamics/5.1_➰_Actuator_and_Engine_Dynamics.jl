function convert_control_demanded_to_attained(
    aircraft_model_data,
    control_demand_vector,
    deltaTime
)


    # Retrieve actuator speed (for control surfaces) or fall back to 1.0 if not provided
    actuator_speed = aircraft_model_data.control_actuator_speed

    # Retrieve engine spool-up/down speeds (for thrust), multiplied by deltaTime
    engine_spool_up_speed   = aircraft_model_data.engine_spool_up_speed
    engine_spool_down_speed = aircraft_model_data.engine_spool_down_speed


    # Utility to compute new attained value, limited by a max step per update
    function compute_attained(demanded, current, speed, deltaTime)
        max_delta = speed * deltaTime
        error = demanded - current
        if isapprox(max_delta, 0.0; atol=1e-12)
            return current
        end
        if abs(error) <= max_delta
            return demanded
        else
            return current + sign(error) * max_delta
        end
    end


    # Specialized version for thrust:
    #   Use engine_spool_up_delta when demanded > current
    #   Use engine_spool_down_delta when demanded < current
    function compute_thrust_attained(demanded, current, spool_up_speed, spool_down_speed, deltaTime)

        #println("demanded: ", demanded)
        #println("current: ", current)
        #println("spool_up_speed: ", spool_up_speed)
        #println("spool_down_speed: ", spool_down_speed)


        if demanded > current
            return compute_attained(demanded, current, spool_up_speed, deltaTime)
        elseif demanded < current
            return compute_attained(demanded, current, spool_down_speed, deltaTime)
        else
            # demanded == current
            return current
        end
    end

    # Compute new attained thrust based on spool-up/spool-down
    thrust_attained = compute_thrust_attained(
        control_demand_vector.thrust_setting_demand,
        control_demand_vector.thrust_attained,
        engine_spool_up_speed,
        engine_spool_down_speed,
        deltaTime
    )

    # Compute new attained positions for control surfaces (roll, pitch, yaw)
    roll_attained = compute_attained(
        control_demand_vector.roll_demand,
        control_demand_vector.roll_demand_attained,
        actuator_speed,
        deltaTime
    )

    pitch_attained = compute_attained(
        control_demand_vector.pitch_demand,
        control_demand_vector.pitch_demand_attained,
        actuator_speed,
        deltaTime
    )

    yaw_attained = compute_attained(
        control_demand_vector.yaw_demand,
        control_demand_vector.yaw_demand_attained,
        actuator_speed,
        deltaTime
    )

    # Construct the output with updated attained values
    control_demand_vector_attained = (
        # Keep x and y if provided, else default
        x = get(control_demand_vector, :x, 0.0),
        y = get(control_demand_vector, :y, 0.0),

        # Keep original demands
        roll_demand            = control_demand_vector.roll_demand,
        pitch_demand           = control_demand_vector.pitch_demand,
        yaw_demand             = control_demand_vector.yaw_demand,
        thrust_setting_demand  = control_demand_vector.thrust_setting_demand,

        # Updated attained values
        roll_demand_attained   = roll_attained,
        pitch_demand_attained  = pitch_attained,
        yaw_demand_attained    = yaw_attained,
        thrust_attained        = thrust_attained
    )

    return control_demand_vector_attained
end

