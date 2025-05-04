###########################################
# FILE: F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\✈_OPENFLIGHT\OpenFlight.jl
###########################################

# Absolute path of the directory containing the current script file.
# It needs to be defined at the top.
project_dir = dirname(@__FILE__)

 
# Add required Julia packages in the first execution and ignore afterwards.
include(raw"./src/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.0_📚_Check_packages_and_websockets_port/🎁_load_required_packages.jl")
include(raw"./src/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.0_📚_Check_packages_and_websockets_port/🔌_Find_free_port.jl")
include(raw"./src/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.0_📚_Check_packages_and_websockets_port/✨_sync_mission_data_to_javascript.jl")


# 2) Load aerodynamic and flight-model code:
include(raw"./src/🟣JULIA🟣/0_Aircraft_Aerodynamic_Model/0.2.4_📈_get_constants_and_interpolate_coefficients.jl")
include(raw"./src/🟣JULIA🟣/0_Aircraft_Aerodynamic_Model/0.1_📊_aircraft_aerodynamic_and_propulsive_data.jl")
include(raw"./src/🟣JULIA🟣/0_Aircraft_Aerodynamic_Model/0.2.1_▶_compute_aerodynamic_force_coeffs.jl")
include(raw"./src/🟣JULIA🟣/0_Aircraft_Aerodynamic_Model/0.2.2_⏩_compute_aerodynamic_moment_coeffs.jl")
include(raw"./src/🟣JULIA🟣/0_Aircraft_Aerodynamic_Model/0.2.3_🚀_compute_propulsive_forces.jl")

# 3) Load math & auxiliary functions:
include(raw"./SRC/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.1_🔮_quaternions_and_transformations.jl")
include(raw"./src/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.2_🛠_auxiliary_functions.jl")

# 4) Load the simulation engine:
include(raw"./SRC/🟣JULIA🟣/2_Simulation_engine/2.1_⭐_Runge_Kutta_4_integrator.jl")
include(raw"./SRC/🟣JULIA🟣/2_Simulation_engine/2.2_🤸‍♀️_compute_6DOF_equations_of_motion.jl")
include(raw"./SRC/🟣JULIA🟣/2_Simulation_engine/2.3_💥_handle_collisions.jl")
include(raw"./src/🟣JULIA🟣/2_Simulation_engine/2.4_📶_compute_instantaneous_flight_conditions.jl")

# 5) Load websockets + flight-data code:
include(raw"./src/🟣JULIA🟣/3_Websockets_and_flight_data/3.0_🌐_launch_web_browser.jl")
include(raw"./src/🟣JULIA🟣/3_Websockets_and_flight_data/3.1_🤝_Establish_WebSockets_connection.jl")
include(raw"./src/🟣JULIA🟣/3_Websockets_and_flight_data/3.2_🔁_Update_and_transfer_aircraft_state.jl")
include(raw"./src/🟣JULIA🟣/3_Websockets_and_flight_data/3.3_📈_record_and_save_flight_data.jl")

# 6) Load atmosphere, anemometry, and constants:
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_anemometry_and_constants/4.1_🎯_physical_constants.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_anemometry_and_constants/4.2_🌍_ISA76.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_anemometry_and_constants/4.3_🕑_anemometry.jl")

# 7) Load control/actuator dynamics:
include(raw"./src/🟣JULIA🟣/5_Control_Laws_and_Systems_Dynamics/5.1_➰_Actuator_and_Engine_Dynamics.jl")

# Launch the local web browser with the client front-end
launch_client(project_dir)


# Establish the WebSockets connection with front-end
establish_websockets_connection()