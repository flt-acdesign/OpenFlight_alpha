using HTTP, WebSockets, JSON, CSV, DataFrames, LinearAlgebra, StaticArrays

# Load general code and functions

include(raw"./src/🟣JULIA🟣/0_Aircraft_Model_and_Data/0.1_📊_aircraft_model_data.jl")

include(raw"./SRC/🟣JULIA🟣/1_maths/quaternions_and_transformations.jl")

include(raw"./SRC/🟣JULIA🟣/2_physics/runge_kutta_integrator.jl")
include(raw"./SRC/🟣JULIA🟣/2_physics/#_compute_6DOF_equations_of_motion.jl")
include(raw"./SRC/🟣JULIA🟣/2_physics/handle_collisions.jl")

include(raw"./src/🟣JULIA🟣/3_Websockets/3.1_connec_and_transfer_state.jl") 

include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/physical_constants.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/ISA76.jl")
include(raw"./SRC/🟣JULIA🟣/4_Atmosphere_and_anemometry/anemometry.jl")





# Prepare CSV file for logging
script_dir = @__DIR__
csv_file = joinpath(script_dir, raw"./OUTPUT_OF_SIMULATION_DATA/simulation_data.csv")
df = DataFrame(
    time=Float64[], x=Float64[], y=Float64[], z=Float64[],
    vx=Float64[], vy=Float64[], vz=Float64[],
    qx=Float64[], qy=Float64[], qz=Float64[], qw=Float64[],
    wx=Float64[], wy=Float64[], wz=Float64[],
    fx_global=Float64[], fy_global=Float64[], fz_global=Float64[],
    alpha=Float64[], beta=Float64[]
)





function launch_client()
    html_file = joinpath(script_dir, "./src/JAVASCRIPT/✅_front_end_and_client.html")
    try
        run(`cmd /c start msedge "$html_file"`)
        println("Microsoft Edge launched successfully.")
    catch e
        println("Failed to launch Microsoft Edge: ", e)
    end
end


launch_client()
establish_websockets_connection()

