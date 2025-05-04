###########################################
# FILE: F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\src\🟣JULIA🟣\0_Aircraft_Aerodynamic_Model\0.1_📊_aircraft_aerodynamic_and_propulsive_data.jl
###########################################

# Change directory to the script's location to ensure relative paths work
cd(@__DIR__)

# --- MODIFICATION START ---
# Get the aircraft aerodynamic data filename from the mission configuration.
# MISSION_DATA is loaded globally from 'default_mission.yaml' via an include
# in the main OpenFlight.jl script BEFORE this file is included.
if !@isdefined(MISSION_DATA)
    error("MISSION_DATA dictionary not found. Ensure '✨_sync_mission_data_to_javascript.jl' is included before this file.")
elseif !haskey(MISSION_DATA, "aircraft_name")
    # You might need to make mission_file accessible here too if you want to show it in the error.
    error("Mission configuration (default_mission.yaml) is missing the required 'aircraft_name' key.")
end

aircraft_aero_filename = MISSION_DATA["aircraft_name"]
println("INFO: Using aircraft aerodynamic data file specified in mission: $aircraft_aero_filename")

# Construct the full path to the selected aero data file
# Path is relative to this script's directory (__DIR__)
filename = joinpath(@__DIR__, raw"../../../../🏭_HANGAR/📜_Aero_data/", aircraft_aero_filename)
# --- MODIFICATION END ---


println("DEBUG: Attempting to load YAML aero data from: $filename")
# Check if the specified file actually exists before trying to load
if !isfile(filename)
    error("Aircraft aerodynamic data file not found at: $filename. Check the 'aircraft_name' in your mission file (e.g., default_mission.yaml) and ensure the file exists in the 🏭_HANGAR/📜_Aero_data directory.")
end
#println("DEBUG: isfile(filename)? ", isfile(filename)) # Uncomment for debugging if needed

# Load the YAML data for the selected aircraft
json_data = YAML.load_file(filename)

# Parse the loaded YAML data into the structured database
aircraft_aero_and_propulsive_database = parse_aero_data(json_data)

# --- Rest of the file remains unchanged ---

# OJO!!! revisar completamente y validar
function compute_inertial_tensor_body_frame(aircraft_mass, radius_of_giration_pitch, radius_of_giration_roll, radius_of_giration_yaw, principal_axis_pitch_up_DEG )
    I_body_principal_axes = [
        aircraft_mass * radius_of_giration_roll^2  0.0  0.0;
        0.0  aircraft_mass * radius_of_giration_yaw^2   0.0;
        0.0  0.0  aircraft_mass * radius_of_giration_pitch^2
    ]

    # Convert angle to radians
    θ = deg2rad(principal_axis_pitch_up_DEG)

    # Rotation matrix around z-axis
    R = [
        cos(θ)  -sin(θ)  0.0;
        sin(θ)   cos(θ)  0.0;
        0.0      0.0     1.0
    ]

    # Compute rotated inertia tensor: I_body = R * I_body_principal_axes * R'
    I_body = R * I_body_principal_axes * transpose(R)

    return I_body
end


aircraft_flight_physics_and_propulsive_data = (
    # Aircraft mass and geometry
    aircraft_mass = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "aircraft_mass"),

    x_CoG = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_CoG"),
    x_wing_aerodynamic_center = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_wing_aerodynamic_center"),

    wing_lift_lever_arm_wrt_CoG_over_MAC = -1 * (
        (fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_wing_aerodynamic_center")) -
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_CoG"))
        / fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "wing_mean_aerodynamic_chord"),

    reference_area = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "reference_area"),
    reference_span = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "reference_span"),
    #Cl_vs_alpha_RAD = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_vs_alpha_RAD"),
    AR = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "AR"),
    Oswald_factor = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Oswald_factor"),

    #CD0 = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CD0"),

    #CD0 = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CD0", Mach=0.0),

    wing_mean_aerodynamic_chord = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "wing_mean_aerodynamic_chord"),

    # Control derivatives
    Cl_da = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_da"),     # d_C_rolling_moment/d_aileron (per rad)
    Cm_de = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cm_de"),  # d_C_pitching_moment/d_elevator (per rad)
    Cn_dr = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cn_dr"),     # d_C_yawing_moment/d_rudder (per rad)
    Cn_da = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cn_da"),     # d_C_yawing_moment/d_aileron (per rad)

    # Static stability derivatives
    Cm0 = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cm0"),       # Zero-lift pitching moment coefficient
    Cm_trim = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cm_trim"),       # pitching moment coefficient due to trim

    Cn_beta = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cn_beta"),    # Derivative of yawing moment w.r.t. sideslip angle
    Cl_beta = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_beta"),    # Derivative of rolling moment w.r.t. sideslip angle
    Cm_alpha = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cm_alpha"),   # Derivative of pitching moment w.r.t. angle of attack

    # Dynamic stability derivatives
    Cl_p = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_p"),     # Roll damping coefficient
    Cm_q = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cm_q"),     # Pitch damping coefficient
    Cn_r = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cn_r"),      # Yaw damping coefficient

    # Propulsion
    maximum_thrust_at_sea_level = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "maximum_thrust_at_sea_level"),     # Static thrust at sea level (N)
    thrust_installation_angle_DEG = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "thrust_installation_angle_DEG"),     # Tilt of thrust line wrt x-axis (deg)

    # Actuator dynamics
    control_actuator_speed = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "control_actuator_speed"),     # Actuator speed ratio (amplitude/sec)
    engine_spool_up_speed = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "engine_spool_up_speed"),      # Spool-up speed (fraction of max thrust/sec)
    engine_spool_down_speed = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "engine_spool_down_speed"),    # Spool-down speed (fraction of max thrust/sec)

    # Inertia matrix
    I_body = compute_inertial_tensor_body_frame(
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "aircraft_mass"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_pitch"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_roll"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_yaw"),
            fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "principal_axis_pitch_up_DEG"),
    )

)