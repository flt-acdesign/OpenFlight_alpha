
# Define the SimulationConstants struct (if not already defined)
struct Aircraft_Model_Data_structure
    aircraft_mass::Float64  # Kg  Aircraft total mass
    reference_area::Float64  # m^2  typically wing reference area
    Cl_vs_alpha_RAD::Float64  # 1/rad   dCL/dalpha, slope of linear part CL vs alpha at aplha 0 with alpha in RADIANS
    AR::Float64  # Wing Aspect Ratio (ADIM)
    Oswald_factor::Float64  # Span efficiency factor (Oswald factor) (ADIM)
    CD0::Float64  # Aircraft Drag coefficient at zero lift (ADIM)

    wing_mean_aerodynamic_chord::Float64 # Aircraft Wing Mean Aerodynamic Chord (m)

    derivative_roll_vs_aileron::Float64  # d_C_rolling_moment/d_aileron ; roll control derivative (OJO!!/rad)
    derivative_pitch_vs_elevator::Float64  # d_C_pitching_moment/d_elevator ; pitch control derivative (OJO!!/rad)
    derivative_yaw_vs_rudder::Float64  # d_C_yawing_moment/d_rudder ; yar control derivative (OJO!!/rad)

    CM0::Float64  # Aircraft zero lift pitching moment coefficient (ADIM)
    CN_beta::Float64 # CN_beta, derivative of yawing moment coefficient with respect to sideslip angle
    CM_alpha::Float64 # CM_alpha, derivative of pitching moment coefficient with respect to angle of attack

    Cl_p::Float64 # Roll damping coefficient
    Cm_q::Float64 # Pitch damping coefficient
    Cn_r::Float64 # Yaw damping coefficient

    maximum_thrust_at_sea_level::Float64  # Maximum static thrust at sea level (N)
    thrust_installation_angle_DEG::Float64  # Angle of tilt of thrust line with respect to x axis, positive upwards
    I_body::Matrix{Float64} # Inertia tensor in body axes. General 3x3 matrix

    control_actuator_speed::Float64  # Actuator speed in rad/s

end

# Create an instance using positional arguments
const aircraft_model_data = Aircraft_Model_Data_structure(
    3.0,        # aircraft_mass (Kg)
    8.0,        # reference_area  (m^2)
    0.3,        # Cl_vs_alpha_RAD,  (1/rad)
    10.0,       # AR, Wing Aspect Ratio (ADIM)
    .7,         # Oswald_factor  Span efficiency factor (Oswald factor) (ADIM)
    0.02,       # CD0  Aircraft Drag coefficient at zero lift (ADIM)

    1.2,        # wing_mean_aerodynamic_chord, Aircraft Wing Mean Aerodynamic Chord (m)
    
    # Control coefficients
    0.001,      # derivative_roll_vs_aileron, d_C_rolling_moment/d_aileron ; roll control derivative (OJO!!/rad)
    0.0025,      # derivative_pitch_vs_elevator, d_C_pitching_moment/d_elevator ; pitch control derivative (OJO!!/rad)
    0.0004,      # derivative_yaw_vs_rudder, d_C_yawing_moment/d_rudder ; yar control derivative (OJO!!/rad)
    

    # Aerodynamic stiffness coefficients
    0.00013,    # CM0,  Aircraft zero lift pitching moment coefficient (ADIM)
    0.0003,      # CN_beta, derivative of yawing moment coefficient with respect to sideslip angle
    -0.004,      # CM_alpha, derivative of pitching moment coefficient with respect to angle of attack


    # Aerodynamic damping coefficients
    -0.00006,    # Roll damping coefficient
    -0.00002,     # Pitch damping coefficient
    -0.0001,     # Yaw damping coefficient

    # Thrust parameters
    90.0,        # maximum_thrust_at_sea_level, Maximum static thrust at sea level (N)
    0.0,         # thrust_installation_angle_DEG, Angle of tilt of thrust line with respect to x axis, positive upwards

    # Aircraft inertia tensor
    [ 1/6 0.0 0.0 
      0.0 1/6 0.0 
      0.0 0.0 1/6 ], # Aircraft Inertial tensor in body axes. General 3x3 inertia tensor.


    3.0         # control_actuator_speed, 300% of amplitude per second

)



function compute_net_thrust_force_vector_body(thrust_setting_demand, alt, tas, aircraft_data)  
        # Calculate thrust force based on thrust lever input
        if thrust_setting_demand >= 0.0
            thrust_ratio = thrust_setting_demand 
        else
            thrust_ratio = thrust_setting_demand * 0.3
        end   
        thrust_force = thrust_ratio * aircraft_data.maximum_thrust_at_sea_level 
        return [thrust_force * cos(deg2rad(aircraft_data.thrust_installation_angle_DEG)), thrust_force * sin(deg2rad(aircraft_data.thrust_installation_angle_DEG)),  0.0]
    end
        
    function compute_lift_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data)
        alpha_stall = deg2rad(15.0)  # Stall angle in radians
        alpha_effective = clamp(alpha_RAD, -alpha_stall, alpha_stall)            
        return aircraft_data.Cl_vs_alpha_RAD * alpha_effective
    end
    
    function compute_drag_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data, CL)
        return aircraft_data.CD0 + CL^2 / (pi *  aircraft_data.AR  * aircraft_data.Oswald_factor )
    end
    
    function compute_sideforce_coefficient(alpha_RAD, beta_RAD, v_body_mag, aircraft_data)
        return 0.0 # To be implemented
    end
    
    function compute_rolling_moment_coefficient(roll_demand, alpha_RAD, beta_RAD, v_body_mag, aircraft_data )
        aircraft_data.derivative_roll_vs_aileron * roll_demand
    end
    
    function compute_pitching_moment_coefficient(pitch_demand, alpha_RAD, beta_RAD, v_body_mag, aircraft_data )
        aircraft_data.derivative_pitch_vs_elevator * pitch_demand + aircraft_data.CM0
    end
    
    function compute_yawing_moment_coefficient(yaw_demand, alpha_RAD, beta_RAD, v_body_mag, aircraft_data )
        aircraft_data.derivative_yaw_vs_rudder * yaw_demand
    
    end
    