

function  handle_collisions(new_position_y, new_velocity_y )   # Handle ground collision
    
    if new_position_y <= 14.0
        new_velocity_y = 0.0        # Reset vertical velocity
    end

    return new_velocity_y
end