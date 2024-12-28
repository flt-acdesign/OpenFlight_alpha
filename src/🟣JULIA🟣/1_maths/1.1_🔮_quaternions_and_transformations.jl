
############## Quaternion Algebra ##############
# Quaternion multiplication
function quat_multiply(q1::Vector{Float64}, q2::Vector{Float64})
    w1, x1, y1, z1 = q1
    w2, x2, y2, z2 = q2

    w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2
    x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2
    y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2
    z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2

    return [w, x, y, z]
end

# Quaternion conjugate (inverse for unit quaternions)
function quat_conjugate(q::Vector{Float64})
    w, x, y, z = q
    return [w, -x, -y, -z]
end

# Normalize a quaternion
function quat_normalize(q::Vector{Float64})
    norm_q = norm(q)
    return q / norm_q
end

function rotate_vector_by_quaternion(vec, quat)
    # Ensure the quaternion is normalized
    quat = quat_normalize(quat)

    # Extract scalar and vector parts
    qw = quat[1]
    qv = quat[2:4]

    # Compute the rotated vector
    t = 2.0 * cross(qv, vec)
    rotated_vec = vec + qw * t + cross(qv, t)
    return rotated_vec
end


    # Rotation functions without axis inversions
    function rotate_vector_body_to_global(vec_body, quaternion)
        vec_global = rotate_vector_by_quaternion(vec_body, quaternion)
        return vec_global
    end

    function rotate_vector_global_to_body(vec_global, quaternion)
        vec_body = rotate_vector_by_quaternion(vec_global, quat_conjugate(quaternion))
        return vec_body
    end


    
    


function transform_aerodynamic_forces_from_wind_to_body_frame(D, Y, L, alpha_RAD, beta_RAD)
    # Force vector in wind frame
    # In the wind frame:
    # - X-axis points opposite to flight direction (backward)
    # - Y-axis points to the right wing
    # - Z-axis points downward
    # Drag acts along negative X_wind, Lift along negative Z_wind
    F_wind = [-D, Y, -L]

    # Rotation due to angle of attack (alpha) about Y-axis
    half_alpha = -alpha_RAD / 2.0
    q_alpha = [cos(half_alpha), 0.0, sin(half_alpha), 0.0]

    # Rotation due to sideslip angle (beta) about Z-axis
    half_beta = -beta_RAD / 2.0
    q_beta = [cos(half_beta), 0.0, 0.0, sin(half_beta)]

    # Combined rotation quaternion: q = q_beta * q_alpha
    q = quat_multiply(q_beta, q_alpha)
    q = quat_normalize(q)

    # Rotate the force vector from wind frame to body frame
    F_body = rotate_vector_by_quaternion(F_wind, q)

    # Extract body frame forces
    Fxb, Fyb, Fzb = F_body

    return Fxb, Fyb, Fzb
end
