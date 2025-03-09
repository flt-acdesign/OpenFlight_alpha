###########################################
# FILE: 0.1_📊_aircraft_aerodynamic_and_propulsive_data.jl
###########################################

cd(@__DIR__)

# IMPORTANT: We now reference the global MISSION_DATA from `OpenFlight_✈.jl`.
# That file defines: const MISSION_DATA = (aircraft_name=..., initial_velocity=..., ...)

# Instead of hard-coding "SF25B.yaml", use MISSION_DATA.aircraft_name:
test_aircraft = MISSION_DATA.aircraft_name

filename = joinpath(@__DIR__, raw"../../../../🏭_HANGAR/📜_Aero_data/", test_aircraft)

println("DEBUG: Attempting to load YAML aero data from: $filename")

json_data = YAML.load_file(filename)
aircraft_aero_and_propulsive_database = parse_aero_data(json_data)


# The function to compute the body-frame inertial tensor is the same as before:
function compute_inertial_tensor_body_frame(aircraft_mass, radius_of_giration_pitch, radius_of_giration_roll, radius_of_giration_yaw, principal_axis_pitch_up_DEG)
    I_body_principal_axes = [
        aircraft_mass * radius_of_giration_roll^2  0.0  0.0;
        0.0  aircraft_mass * radius_of_giration_yaw^2  0.0;
        0.0  0.0  aircraft_mass * radius_of_giration_pitch^2
    ]

    θ = deg2rad(principal_axis_pitch_up_DEG)
    R = [
        cos(θ)  -sin(θ)   0.0;
        sin(θ)   cos(θ)   0.0;
        0.0      0.0      1.0
    ]
    I_body = R * I_body_principal_axes * transpose(R)
    return I_body
end

# Build a NamedTuple with the aerodynamic/propulsive data for the chosen aircraft:
aircraft_flight_physics_and_propulsive_data = (
    aircraft_mass = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "aircraft_mass"),

    x_CoG = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_CoG"),
    x_wing_aerodynamic_center = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_wing_aerodynamic_center"),

    wing_lift_lever_arm_wrt_CoG_over_MAC = -1 * (
        (fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_wing_aerodynamic_center")) -
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "x_CoG")
    ) / fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "wing_mean_aerodynamic_chord"),

    reference_area = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "reference_area"),
    reference_span = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "reference_span"),
    AR = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "AR"),
    Oswald_factor = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Oswald_factor"),
    wing_mean_aerodynamic_chord = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "wing_mean_aerodynamic_chord"),

    # Control derivatives
    derivative_roll_vs_aileron    = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "derivative_roll_vs_aileron"),
    derivative_pitch_vs_elevator  = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "derivative_pitch_vs_elevator"),
    derivative_yaw_vs_rudder      = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "derivative_yaw_vs_rudder"),

    # Static stability derivatives
    CM0     = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CM0"),
    CN_beta = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CN_beta"),
    CM_alpha= fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "CM_alpha"),

    # Dynamic stability derivatives
    Cl_p = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cl_p"),
    Cm_q = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cm_q"),
    Cn_r = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "Cn_r"),

    # Propulsion
    maximum_thrust_at_sea_level   = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "maximum_thrust_at_sea_level"),
    thrust_installation_angle_DEG = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "thrust_installation_angle_DEG"),

    # Actuator dynamics
    control_actuator_speed  = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "control_actuator_speed"),
    engine_spool_up_speed   = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "engine_spool_up_speed"),
    engine_spool_down_speed = fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "engine_spool_down_speed"),

    # Inertia matrix
    I_body = compute_inertial_tensor_body_frame(
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "aircraft_mass"),
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_pitch"),
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_roll"),
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "radius_of_giration_yaw"),
        fetch_value_from_aero_database(aircraft_aero_and_propulsive_database, "principal_axis_pitch_up_DEG")
    )
)
