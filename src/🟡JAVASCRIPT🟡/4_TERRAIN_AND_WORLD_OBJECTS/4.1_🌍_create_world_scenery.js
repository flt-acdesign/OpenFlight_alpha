/***************************************************************
 * Creates the main world scenery, applying fog settings and
 * delegating sub-elements (sky, ground, trees, runway, reference
 * cube) to specialized functions.
 *
 * Note: We treat the coordinate system such that:
 *   - x and z are the "ground plane" (horizontal).
 *   - y is the vertical axis (height).
 **************************************************************/
function createWorldScenery(scene, shadowGenerator, camera) {
    // Wavelengths along the x and z axes (for the compute_terrain_height)
    const xWavelength = 833;   
    const zWavelength = 500;   

    // Store config parameters for ground undulation in the scene
    scene.groundConfig = {
        freqX: 1 / xWavelength,
        freqZ: 1 / zWavelength,
        amplitude: 500
    };

    // Create the sky sphere behind/around everything
    createSkySphere(scene, camera);

    // Create the segmented ground with custom vertex colors
    create_procedural_ground_texture(scene, scene.groundConfig, shadowGenerator);

    // (Optional) create reference objects, trees, runway, etc.
    create_control_tower(scene, shadowGenerator);

    create_lighthouses(scene, shadowGenerator)

    createRunway(scene, scene.groundConfig)




    // Call the function
    const buildings = create_buildings(scene, shadowGenerator )


    initializeTrajectorySystem();

}






