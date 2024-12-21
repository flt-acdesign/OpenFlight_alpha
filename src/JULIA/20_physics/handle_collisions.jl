

function  handle_collisions(new_position_y, new_velocity_y)   # Handle ground collision
    
    if new_position_y <= 2.0
        new_position_y = 2.0        # Set position y to ground level
        new_velocity_y = .0        # Reset vertical velocity
    end

    return new_velocity_y
end