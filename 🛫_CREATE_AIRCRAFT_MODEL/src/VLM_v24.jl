###############################################################################
#    Example Vortex Lattice Method Script with Fuselage "Chord" Rotation
#    (Panels aligned so that the fuselage axis is the chord direction.)
###############################################################################

using VortexLattice
using StaticArrays
#using Plots
using Printf
using JSON
using LinearAlgebra

# ------------------------------------------------------------------
# 0) Read JSON file and preprocess symmetric lifting surfaces
# ------------------------------------------------------------------
function read_and_preprocess_json(jsonfile::String)
    aircraft = JSON.parsefile(jsonfile)
    new_surfaces = Any[]
    for surf in aircraft["lifting_surfaces"]
        orig_sym = surf["symmetric"]
        surf["symmetric"] = false
        surf["mirror"]    = false
        push!(new_surfaces, surf)
        # If the original surface was marked "symmetric", copy a mirrored version:
        if orig_sym
            mirror_surf = deepcopy(surf)
            mirror_surf["name"] = surf["name"] * "_mirrored"
            mirror_surf["root_LE"] = [surf["root_LE"][1],
                                      -surf["root_LE"][2],
                                       surf["root_LE"][3]]
            push!(new_surfaces, mirror_surf)
        end
    end
    aircraft["lifting_surfaces"] = new_surfaces
    return aircraft
end

# ------------------------------------------------------------------
# 1) Utility: Print stability derivatives
# ------------------------------------------------------------------
function print_stability_derivatives(derivs)
    dCF, dCM = derivs
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
# 2) Wing planform geometry function
# ------------------------------------------------------------------
function wing_planform_coords(; area, aspect_ratio, taper_ratio, sweep25_DEG, dihedral_DEG)
    area_f     = Float64(area)
    AR_f       = Float64(aspect_ratio)
    taper_f    = Float64(taper_ratio)
    sweep25_f  = deg2rad(Float64(sweep25_DEG))
    dihedral_f = deg2rad(Float64(dihedral_DEG))

    # basic geometry
    span       = sqrt(area_f * AR_f)
    semi_span  = span / 2
    root_chord = 2 * area_f / (span * (1 + taper_f))
    tip_chord  = root_chord * taper_f

    # standard formula for MAC
    mac       = (2/3) * root_chord * (1 + taper_f + taper_f^2) / (1 + taper_f)

    # leading-edge sweep from quarter-chord sweep
    sweep_le  = atan(tan(sweep25_f) + 0.25*(1 - taper_f)*root_chord / semi_span)

    # leading-edge coordinates (assuming root LE at [0,0,0])
    root_le = SVector(0.0, 0.0, 0.0)
    tip_le  = SVector(semi_span * tan(sweep_le), semi_span, semi_span * sin(dihedral_f))

    return (root_chord=root_chord,
            tip_chord=tip_chord,
            semi_span=semi_span,
            mean_aerodynamic_chord=mac,
            root_le=root_le,
            tip_le=tip_le)
end

# ------------------------------------------------------------------
# 3) JSON helpers
# ------------------------------------------------------------------
function get_surface_param(aircraft, name::String, param)
    surfaces = aircraft["lifting_surfaces"]
    surf_idx = findfirst(x -> x["name"] == name, surfaces)
    if surf_idx === nothing
        error("Surface $name not found in 'lifting_surfaces' array!")
    end
    return surfaces[surf_idx][param]
end

function get_wing_planform_coords(aircraft, surface_name)
    area         = get_surface_param(aircraft, surface_name, "surface_area_m2")
    AR           = get_surface_param(aircraft, surface_name, "AR")
    TR           = get_surface_param(aircraft, surface_name, "TR")
    sweep25_DEG  = get_surface_param(aircraft, surface_name, "sweep_quarter_chord_DEG")
    dihedral_DEG = get_surface_param(aircraft, surface_name, "dihedral_DEG")
    return wing_planform_coords(area=area,
                                aspect_ratio=AR,
                                taper_ratio=TR,
                                sweep25_DEG=sweep25_DEG,
                                dihedral_DEG=dihedral_DEG)
end

# ------------------------------------------------------------------
# 4) Main analysis function, building wings and fuselage octagon surfaces
# ------------------------------------------------------------------
function analyze_aircraft(aircraft)
    # A) Build reference from the "wing" surface
    wingName = "wing"
    WNG = get_wing_planform_coords(aircraft, wingName)
    ref = Reference(
        get_surface_param(aircraft, wingName, "surface_area_m2"),
        WNG.mean_aerodynamic_chord,
        WNG.semi_span * 2.0,
        aircraft["general"]["aircraft_CoG_coords_xyz_m"],
        1.0
    )

    # B) Freestream
    fs = Freestream(1.0, deg2rad(25.0), 0.0, zeros(3))

    # C) Prepare arrays for geometry
    grids      = Vector{Array{Float64,3}}()
    ratios     = Vector{Array{Float64,3}}()
    surface_id = Int[]
    symmetric_flags = [ s["symmetric"] for s in aircraft["lifting_surfaces"] ]

    # D) Build wing/tail surfaces
    spacing_s = Uniform()
    spacing_c = Uniform()
    for (i, surf) in enumerate(aircraft["lifting_surfaces"])
        planform = get_wing_planform_coords(aircraft, surf["name"])
        offset   = SVector(surf["root_LE"]...)
        mirror_setting = surf["mirror"]

        # For mirrored surfaces, we invert y-coordinates (and maybe z for vertical)
        if occursin("_mirrored", surf["name"])
            if surf["vertical"]
                xle = [planform.root_le[1] + offset[1], planform.tip_le[1] + offset[1]]
                yle = [-planform.root_le[3] + offset[2], -planform.tip_le[3] + offset[2]]
                zle = [planform.root_le[2] + offset[3], planform.tip_le[2] + offset[3]]
            else
                xle = [planform.root_le[1] + offset[1], planform.tip_le[1] + offset[1]]
                yle = [-planform.root_le[2] + offset[2], -planform.tip_le[2] + offset[2]]
                zle = [planform.root_le[3] + offset[3], planform.tip_le[3] + offset[3]]
            end
        else
            if surf["vertical"]
                xle = [planform.root_le[1] + offset[1], planform.tip_le[1] + offset[1]]
                yle = [planform.root_le[3] + offset[2], planform.tip_le[3] + offset[2]]
                zle = [planform.root_le[2] + offset[3], planform.tip_le[2] + offset[3]]
            else
                xle = [planform.root_le[1] + offset[1], planform.tip_le[1] + offset[1]]
                yle = [planform.root_le[2] + offset[2], planform.tip_le[2] + offset[2]]
                zle = [planform.root_le[3] + offset[3], planform.tip_le[3] + offset[3]]
            end
        end

        chord = [planform.root_chord, planform.tip_chord]
        theta = zeros(2)
        phi   = zeros(2)
        fc    = fill(xc -> 0.0, 2)

        p1 = SVector(xle[1], yle[1], zle[1])
        p2 = SVector(xle[2], yle[2], zle[2])
        L_span = norm(p2 - p1)
        avg_chord = (chord[1] + chord[2]) / 2
        ratio_ = L_span / avg_chord

        min_span_panels  = 7
        min_chord_panels = 5
        if ratio_ >= 1
            nc_local = min_chord_panels
            ns_local = max(min_span_panels, round(Int, ratio_ * nc_local))
        else
            ns_local = min_span_panels
            nc_local = max(min_chord_panels, round(Int, ns_local / ratio_))
        end

        @info "Wing/Surface $(surf["name"]) => L_span=$L_span, avg_chord=$avg_chord => (ns=$ns_local, nc=$nc_local)"

        grid, ratioarray = wing_to_grid(
            xle, yle, zle, chord, theta, phi,
            ns_local, nc_local;
            mirror=mirror_setting,
            fc=fc,
            spacing_s=spacing_s,
            spacing_c=spacing_c
        )

        push!(grids, grid)
        push!(ratios, ratioarray)
        push!(surface_id, i)
    end

    # E) Build fuselage octagon surfaces (MODIFIED for chord along fuselage axis)
    if haskey(aircraft, "fuselages")
        base_id = length(surface_id)
        for fus in aircraft["fuselages"]
            name    = fus["name"]
            diam    = fus["diameter"]
            len_fus = fus["length"]
            nosepos = fus["nose_position"]

            R = diam / 2
            s_oct = R * sin(pi/8)  # approximate side length

            # The fuselage length is now used as the chord direction
            nChord = max(2, round(Int, len_fus / s_oct))   # chordwise
            nSpan  = 1  # number of panels along the curved fuselage cross-section
            @info "Building fuselage '$name' => diam=$diam, len=$len_fus, chord panels=$nChord, span panels=$nSpan"

            # 8 segments around the cross-section
            angles = [deg2rad(45*(k-1)) for k in 1:9]  # 0, 45, ..., 360
            for iSide in 1:8
                α1 = angles[iSide]
                α2 = angles[iSide+1]
                xNose = nosepos[1]
                yNose = nosepos[2]
                zNose = nosepos[3]

                # Two corner points on the circular cross-section
                ycorner1 = yNose + R * cos(α1)
                zcorner1 = zNose + R * sin(α1)
                ycorner2 = yNose + R * cos(α2)
                zcorner2 = zNose + R * sin(α2)

                # Build grid with shape (3, nChord+1, nSpan+1)
                #  => second index is chordwise, third is spanwise
                grid = Array{Float64,3}(undef, 3, nChord+1, nSpan+1)
                for iC in 0:nChord
                    chordFrac = iC / nChord
                    xval = xNose + chordFrac * len_fus
                    for jS in 0:nSpan
                        lerpFrac = jS / nSpan
                        yside = (1 - lerpFrac)*ycorner1 + lerpFrac*ycorner2
                        zside = (1 - lerpFrac)*zcorner1 + lerpFrac*zcorner2
                        grid[1, iC+1, jS+1] = xval
                        grid[2, iC+1, jS+1] = yside
                        grid[3, iC+1, jS+1] = zside
                    end
                end

                # Build ratio array with shape (2, nChord, nSpan)
                # Place the bound vortex at 25% chord and the collocation point at 50% chord.
                ratioarray = fill(0.0, 2, nChord, nSpan)
                for iC in 1:nChord
                    for jS in 1:nSpan
                        ratioarray[1, iC, jS] = 0.55  # bound vortex
                        ratioarray[2, iC, jS] = 0.50  # control point
                    end
                end

                push!(grids, grid)
                push!(ratios, ratioarray)
                push!(surface_id, base_id + iSide)
                push!(symmetric_flags, false)

                # Debug bounding box
                xvals = vec(grid[1, :, :])
                yvals = vec(grid[2, :, :])
                zvals = vec(grid[3, :, :])
                @info "Fuselage side #$iSide of $name => x∈[$(minimum(xvals)), $(maximum(xvals))], y∈[$(minimum(yvals)), $(maximum(yvals))], z∈[$(minimum(zvals)), $(maximum(zvals))]"
            end
            base_id += 8
    end
    else
        @warn "No fuselages found in JSON!"
    end

    # F) Create the System from all surfaces
    system = System(grids; ratios=ratios)
    for (idx, g) in enumerate(grids)
        nc = size(g, 2) - 1
        ns = size(g, 3) - 1
        @info "Surface #$idx => dims=$(size(g)), nc=$nc, ns=$ns"
    end

    # G) Run the steady analysis
    steady_analysis!(system, ref, fs;
                     symmetric=symmetric_flags,
                     surface_id=surface_id)

    return system
end

# ------------------------------------------------------------------
# 5) Run analysis and write VTK output
# ------------------------------------------------------------------
jsonfile = raw"F:\UEM\DEV\JS\Flight_Simulator\▶OpenFlight_Git_folder\🛫_CREATE_AIRCRAFT_MODEL\📋_Aircraft_data_files\MIG21.json"   # Update path/filename as needed
aircraft = read_and_preprocess_json(jsonfile)

# Build the system (wings + fuselage) and run the analysis
system = analyze_aircraft(aircraft)

# Extract aerodynamic coefficients
CF, CM = body_forces(system; frame=Wind())   # (CD, CY, CL), (Cl, Cm, Cn)
CDiff  = far_field_drag(system)
derivs = stability_derivatives(system)

# Print results
println("\nForces in Wind axes:")
println("CF = ", CF, "   (CD, CY, CL)")
println("CM = ", CM, "   (Cl, Cm, Cn)")
println("CDiff = ", CDiff)

println("Stability derivatives:")
print_stability_derivatives(derivs)

# Write VTK file (only surfaces, no wakes)
vtk_filename = "c:/Temp/myplane_fuselage_oct"
write_vtk(vtk_filename, system; write_surfaces=true, write_wakes=false)
println("\nVTK written to: $vtk_filename")
println("Open in ParaView (or other VTK viewer), 'Surface With Edges', then 'Reset Camera' to see wing & fuselage.")
