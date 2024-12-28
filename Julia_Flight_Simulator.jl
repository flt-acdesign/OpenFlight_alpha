
using HTTP, WebSockets, JSON, CSV, DataFrames, LinearAlgebra, StaticArrays, Dates

# absolute path of the directory containing the current script file
script_dir = @__DIR__



# Load general code and functions
include(raw"./src/🟣JULIA🟣/0_Aircraft_Model_and_Data/0.1_📊_aircraft_model_data.jl")

include(raw"./SRC/🟣JULIA🟣/1_maths/1.1_🔮_quaternions_and_transformations.jl")

include(raw"./SRC/🟣JULIA🟣/2_physics/2.1_⭐_runge_kutta_integrator.jl")
include(raw"./src/🟣JULIA🟣/2_physics/2.2_🔀_convert_control_demanded_to_attained.jl")
include(raw"./SRC/🟣JULIA🟣/2_physics/2.4_🤸‍♀️_compute_6DOF_equations_of_motion.jl")

include(raw"./SRC/🟣JULIA🟣/2_physics/2.5_💥_handle_collisions.jl")

include(raw"./src/🟣JULIA🟣/3_Websockets_and_flight_data/3.1_🔁_connect_and_transfer_state.jl") 
include(raw"./src/🟣JULIA🟣/3_Websockets_and_flight_data/3.2_📈_record_and_save_flight_data.jl")

include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/4.1_🎯_physical_constants.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/4.2_🌍_ISA76.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/4.3_🕑_anemometry.jl")




function launch_client()
    html_file = joinpath(script_dir, "./src/🟡JAVASCRIPT🟡/✅_front_end_and_client.html") 
    try
        run(`cmd /c start msedge "$html_file"`)
        println("Microsoft Edge launched successfully.")
    catch e
        println("Failed to launch Microsoft Edge: ", e)
    end
end


launch_client()
establish_websockets_connection()

