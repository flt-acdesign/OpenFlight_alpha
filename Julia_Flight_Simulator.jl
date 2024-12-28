
using HTTP, WebSockets, JSON, CSV, DataFrames, LinearAlgebra, StaticArrays, Dates

# absolute path of the directory containing the current script file
script_dir = @__DIR__



# Load general code and functions
include(raw"./src/🟣JULIA🟣/0_Aircraft_Model_and_Data/0.1_📊_aircraft_model_data.jl")

include(raw"./SRC/🟣JULIA🟣/1_maths/quaternions_and_transformations.jl")

include(raw"./SRC/🟣JULIA🟣/2_physics/runge_kutta_integrator.jl")
include(raw"./SRC/🟣JULIA🟣/2_physics/#_compute_6DOF_equations_of_motion.jl")
include(raw"./SRC/🟣JULIA🟣/2_physics/handle_collisions.jl")

include(raw"./src/🟣JULIA🟣/3_Websockets/3.1_connect_and_transfer_state.jl") 
include(raw"./src/🟣JULIA🟣/3_Websockets/3.2_gather_and_save_telemetry.jl")

include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/physical_constants.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/ISA76.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/anemometry.jl")




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

