


"""
    my_atan2(y::Number, x::Number)

Compute the arctangent of `y/x` taking into account the quadrant of the resulting angle.
Returns a value in the range (-π, π].

# Arguments
- `y::Number`: The y-coordinate
- `x::Number`: The x-coordinate

# Returns
- `::Float64`: The angle in radians between the positive x-axis and the ray from (0,0) to (x,y)

# Examples
julia> my_atan2(1.0, 1.0)
0.7853981633974483 # π/4 radians (45 degrees)
julia> my_atan2(1.0, -1.0)
2.356194490192345 # 3π/4 radians (135 degrees)
text
"""
function my_atan2(y::Number, x::Number)
    return angle(complex(x, y))
end