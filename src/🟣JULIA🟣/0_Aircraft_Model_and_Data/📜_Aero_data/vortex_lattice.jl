using VortexLattice
using StaticArrays
using Plots
using Printf
using JSON

# ------------------------------------------------------------------
# 0) Read the JSON file (aircraft_data.json)
# ------------------------------------------------------------------
aircraft = JSON.parsefile(joinpath(@__DIR__, "aircraft_data.json"))



# Uncomment and adjust if SurfacePanel is not already defined:
# using StaticArrays
# struct SurfacePanel{T}
#     p1::SVector{3,T}  # lower-left corner
#     p2::SVector{3,T}  # lower-right corner
#     p3::SVector{3,T}  # upper-right corner
#     p4::SVector{3,T}  # upper-left corner
#     cp::SVector{3,T}  # collocation point (here, the average of the corners)
# end

using StaticArrays

"""
    wing_to_surface_panels(xle, yle, zle, chord, theta, phi, ns, nc; mirror=false, fc, spacing_s, spacing_c)

Recreates a grid of points and constructs quadrilateral surface panels along a wing (or similar surface).

# Arguments
- `xle, yle, zle`: Two-element vectors containing the leading-edge coordinates at the root and tip.
- `chord`: Two-element vector with chord lengths at the root and tip.
- `theta, phi`: Two-element vectors with the incidence and twist angles (in radians) at the root and tip.
- `ns`: Number of chordwise divisions.
- `nc`: Number of spanwise divisions.

# Keyword Arguments
- `mirror` (Bool): If true, create a mirrored copy (about the y=0 plane).
- `fc`: An array of two functions (one for root, one for tip) that provide the camber offset as a function of the chordwise coordinate (normalized 0–1).
- `spacing_s`: A function of the form `(a, b, n) -> vector` that returns the spanwise distribution (from 0 to 1).
- `spacing_c`: Similar to `spacing_s` but for chordwise distribution.

# Returns
A tuple `(grid, panels)` where:
- `grid` is a vector of `SVector{3,Float64}` points (size: (nc+1)*(ns+1)).
- `panels` is a matrix of `SurfacePanel{Float64}` objects constructed from the grid.
"""
function wing_to_surface_panels(xle, yle, zle, chord, theta, phi, ns, nc;
                                mirror=false, fc, spacing_s, spacing_c)

    # Generate normalized spanwise (s) and chordwise (c) coordinates.
    s_coords = spacing_s(0.0, 1.0, nc + 1)  # spanwise points
    c_coords = spacing_c(0.0, 1.0, ns + 1)   # chordwise points

    # Build grid points.
    grid = Vector{SVector{3,Float64}}()
    for s in s_coords
        # Interpolate the leading-edge (LE) position.
        LE = SVector(
            (1 - s) * xle[1] + s * xle[2],
            (1 - s) * yle[1] + s * yle[2],
            (1 - s) * zle[1] + s * zle[2]
        )
        # Linearly interpolate chord, incidence (theta), and twist (phi).
        chord_val = (1 - s) * chord[1] + s * chord[2]
        theta_val = (1 - s) * theta[1] + s * theta[2]
        phi_val   = (1 - s) * phi[1]   + s * phi[2]

        for c in c_coords
            # Determine camber offset using the provided functions.
            camber = (1 - s) * fc[1](c) + s * fc[2](c)
            # Local airfoil coordinates (x along chord, z as camber); y = 0.
            local_pt = SVector(c * chord_val, 0.0, camber)
            # Rotate to account for incidence and twist.
            # Incidence: rotation about y-axis.
            Ry = @SMatrix [ cos(theta_val)  0  sin(theta_val);
                            0               1  0;
                           -sin(theta_val)  0  cos(theta_val) ]
            # Twist: rotation about x-axis.
            Rx = @SMatrix [ 1  0           0;
                            0  cos(phi_val) -sin(phi_val);
                            0  sin(phi_val)  cos(phi_val) ]
            # Combined rotation.
            rotated_pt = Ry * (Rx * local_pt)
            # Global coordinate.
            global_pt = LE + rotated_pt
            push!(grid, global_pt)
        end
    end

    # Determine grid dimensions.
    n_span = length(s_coords)   # should equal nc + 1
    n_chord = length(c_coords)  # should equal ns + 1

    # Build panels from the grid.
    panels = Matrix{SurfacePanel{Float64}}(undef, n_span - 1, n_chord - 1)
    # The grid is ordered with the inner loop over chordwise positions.
    for i in 1:(n_span - 1)
        for j in 1:(n_chord - 1)
            idx = (i - 1) * n_chord + j
            p1 = grid[idx]             # lower-left
            p2 = grid[idx + 1]         # lower-right
            p3 = grid[idx + n_chord + 1] # upper-right
            p4 = grid[idx + n_chord]     # upper-left
            cp = (p1 + p2 + p3 + p4) / 4  # collocation point as average
            panels[i, j] = SurfacePanel(p1, p2, p3, p4, cp)
        end
    end

    # If mirroring is requested, create a mirrored grid and panels (about y=0).
    if mirror
        grid_m = [SVector(p[1], -p[2], p[3]) for p in grid]
        panels_m = Matrix{SurfacePanel{Float64}}(undef, n_span - 1, n_chord - 1)
        for i in 1:(n_span - 1)
            for j in 1:(n_chord - 1)
                idx = (i - 1) * n_chord + j
                p1 = grid_m[idx]
                p2 = grid_m[idx + 1]
                p3 = grid_m[idx + n_chord + 1]
                p4 = grid_m[idx + n_chord]
                cp = (p1 + p2 + p3 + p4) / 4
                panels_m[i, j] = SurfacePanel(p1, p2, p3, p4, cp)
            end
        end
        # Combine original and mirrored panels (here, stacking them vertically).
        panels = vcat(panels, panels_m)
    end

    return grid, panels
end



# ------------------------------------------------------------------
# 1) Utility function to print stability derivatives (unchanged)
# ------------------------------------------------------------------
function print_stability_derivatives(derivs)
    # Unpack the tuple (dCF, dCM)
    dCF, dCM = derivs

    # Short aliases for clarity
    dCFα, dCFβ, dCFp, dCFq, dCFr = dCF.alpha, dCF.beta, dCF.p, dCF.q, dCF.r
    dCMα, dCMβ, dCMp, dCMq, dCMr = dCM.alpha, dCM.beta, dCM.p, dCM.q, dCM.r

    println("                             alpha                beta")
    println("                   ----------------    ----------------")
    @printf(" z' force CL |    CLa = %12.6f    CLb = %12.6f\n", dCFα[3], dCFβ[3])
    @printf(" y  force CY |    CYa = %12.6f    CYb = %12.6f\n", dCFα[2], dCFβ[2])
    @printf(" x' mom.  Cl'|    Cla = %12.6f    Clb = %12.6f\n", dCMα[1], dCMβ[1])
    @printf(" y  mom.  Cm |    Cma = %12.6f    Cmb = %12.6f\n", dCMα[2], dCMβ[2])
    @printf(" z' mom.  Cn'|    Cna = %12.6f    Cnb = %12.6f\n", dCMα[3], dCMβ[3])
    println()
    println("                     roll rate  p'      pitch rate  q'        yaw rate  r'")
    println("                   ----------------    ----------------    ----------------")
    @printf(" z' force CL |    CLp = %12.6f    CLq = %12.6f    CLr = %12.6f\n", dCFp[3], dCFq[3], dCFr[3])
    @printf(" y  force CY |    CYp = %12.6f    CYq = %12.6f    CYr = %12.6f\n", dCFp[2], dCFq[2], dCFr[2])
    @printf(" x' mom.  Cl'|    Clp = %12.6f    Clq = %12.6f    Clr = %12.6f\n", dCMp[1], dCMq[1], dCMr[1])
    @printf(" y  mom.  Cm |    Cmp = %12.6f    Cmq = %12.6f    Cmr = %12.6f\n", dCMp[2], dCMq[2], dCMr[2])
    @printf(" z' mom.  Cn'|    Cnp = %12.6f    Cnq = %12.6f    Cnr = %12.6f\n", dCMp[3], dCMq[3], dCMr[3])
end

# ------------------------------------------------------------------
# 2) Wing planform function (unchanged)
# ------------------------------------------------------------------
function wing_planform_coords(; area, aspect_ratio, taper_ratio, sweep25_DEG, dihedral_DEG)
    area_f     = Float64(area)
    AR_f       = Float64(aspect_ratio)
    taper_f    = Float64(taper_ratio)
    sweep25_f  = deg2rad(Float64(sweep25_DEG))
    dihedral_f = deg2rad(Float64(dihedral_DEG))

    span       = sqrt(area_f * AR_f)
    semi_span  = span / 2
    root_chord = 2 * area_f / (span * (1 + taper_f))
    tip_chord  = root_chord * taper_f

    mac = (2/3) * root_chord * (1 + taper_f + taper_f^2) / (1 + taper_f)
    sweep_le = atan(tan(sweep25_f) + 0.25*(1 - taper_f)*root_chord / semi_span)

    root_le = SVector(0.0, 0.0, 0.0)
    root_te = SVector(root_chord, 0.0, 0.0)
    tip_le  = SVector(
        semi_span * tan(sweep_le),
        semi_span,
        semi_span * sin(dihedral_f)
    )
    tip_te  = SVector(
        tip_le[1] + tip_chord,
        semi_span,
        tip_le[3]
    )

    return (
        root_chord = root_chord,
        tip_chord  = tip_chord,
        semi_span  = semi_span,
        mean_aerodynamic_chord = mac,
        root_le = root_le,
        root_te = root_te,
        tip_le  = tip_le,
        tip_te  = tip_te
    )
end

# ------------------------------------------------------------------
# 3) Helper functions for accessing surface parameters
# ------------------------------------------------------------------
function get_surface_param(aircraft, name::String, param)
    param_str = (param isa Symbol ? string(param) : param)
    surfaces = aircraft["lifting_surfaces"]
    surf_idx = findfirst(x -> x["name"] == name, surfaces)
    if surf_idx === nothing
        throw(ArgumentError("Surface $name not found"))
    end
    return surfaces[surf_idx][param_str]
end

function get_wing_planform_coords(aircraft, surface_name)
    try
        return wing_planform_coords(
            area         = get_surface_param(aircraft, surface_name, "surface_area_m2"),
            aspect_ratio = get_surface_param(aircraft, surface_name, "AR"),
            taper_ratio  = get_surface_param(aircraft, surface_name, "TR"),
            sweep25_DEG  = get_surface_param(aircraft, surface_name, "sweep_quarter_chord_DEG"),
            dihedral_DEG = get_surface_param(aircraft, surface_name, "dihedral_DEG")
        )
    catch e
        @error "Failed to get wing planform coordinates" surface_name exception=e
        rethrow(e)
    end
end

# ------------------------------------------------------------------
# 4) Helper function: dynamically reshape the panel grid.
# ------------------------------------------------------------------
function reshape_grid(grid, default_rows, default_cols)
    points = reinterpret(SVector{3,Float64}, reshape(grid, 3, :))
    npoints = length(points)
    expected = default_rows * default_cols
    if npoints == expected
        return reshape(points, default_rows, default_cols)'  # transpose to match ordering
    else
        if npoints % default_rows == 0
            c = div(npoints, default_rows)
            @warn "Grid has $npoints points; using shape ($default_rows, $c) instead of ($default_rows, $default_cols)"
            return reshape(points, default_rows, c)' 
        elseif npoints % default_cols == 0
            r = div(npoints, default_cols)
            @warn "Grid has $npoints points; using shape ($r, $default_cols) instead of ($default_rows, $default_cols)"
            return reshape(points, r, default_cols)' 
        else
            error("Cannot reshape grid with $npoints points into a 2D array using defaults ($default_rows, $default_cols)")
        end
    end
end

# ------------------------------------------------------------------
# 4.1) Dummy panel properties for visualization fuselage surfaces.
#
# Create a dummy matrix of PanelProperties using the 5-argument constructor.
# We fill each field with a zero SVector{3,Float64}.
# ------------------------------------------------------------------
function dummy_panel_properties(surfpanels::Matrix)
    nrows, ncols = size(surfpanels)
    dummy = PanelProperties(
        zeros(SVector{3,Float64}),
        zeros(SVector{3,Float64}),
        zeros(SVector{3,Float64}),
        zeros(SVector{3,Float64}),
        zeros(SVector{3,Float64})
    )
    return [ dummy for i in 1:nrows, j in 1:ncols ]
end

# ------------------------------------------------------------------
# 5) Main analysis function
#
# The aerodynamic analysis is performed only on the surfaces defined in the 
# JSON "lifting_surfaces" array.
#
# Fuselage surfaces (horizontal and vertical) are built for visualization only.
# ------------------------------------------------------------------
function analyze_aircraft(aircraft)
    # --- Discretization parameters for main lifting surfaces ---
    ns = 17   # chordwise divisions
    nc = 5    # spanwise divisions

    # --- Discretization parameters for fuselage surfaces (visualization only) ---
    ns_fus = 9   # chordwise divisions (=> 10 grid points)
    nc_fus = 6   # spanwise divisions (=> 7 grid points)

    # Build aerodynamic reference from the "wing" (used for analysis)
    wingName = "wing"
    WNG = get_wing_planform_coords(aircraft, wingName)
    ref = Reference(
        get_surface_param(aircraft, wingName, "surface_area_m2"),
        WNG.mean_aerodynamic_chord,
        WNG.semi_span * 2.0,
        aircraft["general"]["aircraft_CoG_coords_xyz_m"],
        1.0
    )

    # Define freestream conditions (e.g., alpha = 5°, beta = 0°)
    fs = Freestream(1.0, deg2rad(5.0), 0.0, zeros(3))
    spacing_s = Uniform()
    spacing_c = Uniform()

    # --- Build aerodynamic surfaces from the JSON "lifting_surfaces" array ---
    aero_surfaces = Vector{Matrix{SurfacePanel{Float64}}}()
    aero_ids = Int[]
    aero_sym_flags = Bool[]
    surface_counter = 0

    for (i, surf) in enumerate(aircraft["lifting_surfaces"])
        surface_counter += 1

        # Compute planform coordinates and apply the offset.
        P = get_wing_planform_coords(aircraft, surf["name"])
        offset = SVector(surf["root_LE"]...)
        if surf["vertical"]
            # For vertical surfaces, swap Y and Z.
            xle = [P.root_le[1] + offset[1], P.tip_le[1] + offset[1]]
            yle = [P.root_le[3] + offset[2], P.tip_le[3] + offset[2]]
            zle = [P.root_le[2] + offset[3], P.tip_le[2] + offset[3]]
        else
            xle = [P.root_le[1] + offset[1], P.tip_le[1] + offset[1]]
            yle = [P.root_le[2] + offset[2], P.tip_le[2] + offset[2]]
            zle = [P.root_le[3] + offset[3], P.tip_le[3] + offset[3]]
        end

        chord = [P.root_chord, P.tip_chord]
        theta = zeros(2)
        phi   = zeros(2)
        fc    = fill(x -> 0.0, 2)
        mirror_setting = surf["mirror"]

        grid, surfpanels = wing_to_surface_panels(
            xle, yle, zle, chord, theta, phi, ns, nc;
            mirror    = mirror_setting,
            fc        = fc,
            spacing_s = spacing_s,
            spacing_c = spacing_c
        )
        # (The grid is used only for visualization; aerodynamic analysis uses surfpanels.)
        _ = reshape_grid(grid, nc+1, ns+1)  # discard reshaped grid here
        push!(aero_surfaces, surfpanels)
        push!(aero_ids, surface_counter)
        push!(aero_sym_flags, surf["symmetric"])
    end

    # Perform aerodynamic analysis using only the aero_surfaces.
    system = steady_analysis(
        aero_surfaces,
        ref,
        fs;
        symmetric   = aero_sym_flags,
        surface_id  = aero_ids
    )

    # --- Build fuselage surfaces for visualization only ---
    fuselage_surfaces = Vector{Matrix{SurfacePanel{Float64}}}()
    fuselage_sym_flags = Bool[]
    fuselage_properties = Vector{Matrix{PanelProperties{Float64}}}()

    for fus in aircraft["fuselages"]
        nose = SVector(fus["nose_position"]...)
        fus_length = fus["length"]
        fus_diameter = fus["diameter"]

        # Horizontal fuselage surface:
        area_h = fus_length * (fus_diameter / 2)
        AR_h = fus_diameter / (2 * fus_length)
        TR_h = 1.0
        sweep_h = 0.0
        dihedral_h = 1.0  # small dihedral for visualization
        H = wing_planform_coords(
            area         = area_h,
            aspect_ratio = AR_h,
            taper_ratio  = TR_h,
            sweep25_DEG  = sweep_h,
            dihedral_DEG = dihedral_h
        )
        xle = [H.root_le[1] + nose[1], H.tip_le[1] + nose[1]]
        yle = [H.root_le[2] + nose[2], H.tip_le[2] + nose[2]]
        zle = [H.root_le[3] + nose[3], H.tip_le[3] + nose[3]]
        chord = [H.root_chord, H.tip_chord]
        theta = fill(deg2rad(1.0), 2)  # small incidence angle
        phi   = zeros(2)
        fc    = fill(x -> 0.0, 2)
        mirror_setting = true

        surface_counter += 1
        grid, surfpanels = wing_to_surface_panels(
            xle, yle, zle, chord, theta, phi, ns_fus, nc_fus;
            mirror    = mirror_setting,
            fc        = fc,
            spacing_s = spacing_s,
            spacing_c = spacing_c
        )
        _ = reshape_grid(grid, nc_fus+1, ns_fus+1)
        push!(fuselage_surfaces, surfpanels)
        push!(fuselage_sym_flags, true)
        push!(fuselage_properties, dummy_panel_properties(surfpanels))

        # Vertical fuselage surface:
        area_v = fus_length * fus_diameter
        AR_v = fus_diameter / fus_length
        TR_v = 1.0
        sweep_v = 0.0
        dihedral_v = 1.0
        V = wing_planform_coords(
            area         = area_v,
            aspect_ratio = AR_v,
            taper_ratio  = TR_v,
            sweep25_DEG  = sweep_v,
            dihedral_DEG = dihedral_v
        )
        # For vertical surfaces, swap Y and Z and add a small lateral offset.
        xle = [V.root_le[1] + nose[1], V.tip_le[1] + nose[1]]
        yle = [V.root_le[3] + nose[2] + 0.05, V.tip_le[3] + nose[2] + 0.05]
        zle = [V.root_le[2] + nose[3], V.tip_le[2] + nose[3]]
        chord = [V.root_chord, V.tip_chord]
        theta = fill(deg2rad(1.0), 2)
        phi   = zeros(2)
        fc    = fill(x -> 0.0, 2)
        mirror_setting = false

        surface_counter += 1
        grid, surfpanels = wing_to_surface_panels(
            xle, yle, zle, chord, theta, phi, ns_fus, nc_fus;
            mirror    = mirror_setting,
            fc        = fc,
            spacing_s = spacing_s,
            spacing_c = spacing_c
        )
        _ = reshape_grid(grid, nc_fus+1, ns_fus+1)
        push!(fuselage_surfaces, surfpanels)
        push!(fuselage_sym_flags, false)
        push!(fuselage_properties, dummy_panel_properties(surfpanels))
    end

    # --- Combine surfaces and properties for visualization ---
    vis_surfaces = vcat(aero_surfaces, fuselage_surfaces)
    vis_sym_flags = vcat(aero_sym_flags, fuselage_sym_flags)
    aero_properties = get_surface_properties(system)
    vis_properties = vcat(aero_properties, fuselage_properties)

    return system, vis_surfaces, vis_properties, vis_sym_flags
end

# ------------------------------------------------------------------
# 6) Run the analysis and output results and VTK files
# ------------------------------------------------------------------
system, vis_surfaces, vis_properties, vis_sym_flags = analyze_aircraft(aircraft)

# Extract aerodynamic results.
CF, CM = body_forces(system; frame=Wind())
CDiff  = far_field_drag(system)
derivs = stability_derivatives(system)

println("CF = ", CF, "   (CD, CY, CL)")
println("CM = ", CM, "   (Cl, Cm, Cn)")
println("CDiff = ", CDiff)
println("Stability derivatives = ", derivs)

# Write VTK files including all surfaces.
write_vtk("c:/Temp/myplaneV14", vis_surfaces, vis_properties; symmetric=vis_sym_flags)

print_stability_derivatives(derivs)
println("\nVTK output written to 'c:/Temp/myplaneV14'. Open in ParaView to visualize.")
