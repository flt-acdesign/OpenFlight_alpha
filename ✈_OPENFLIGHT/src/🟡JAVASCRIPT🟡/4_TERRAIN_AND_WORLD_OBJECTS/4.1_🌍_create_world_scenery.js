/***************************************************************
 * Creates the main world scenery, applying fog settings and
 * delegating sub-elements (sky, ground, trees, runway, reference
 * cube) to specialized functions. Also creates the player car.
 *
 * Note: We treat the coordinate system such that:
 * - x and z are the "ground plane" (horizontal).
 * - y is the vertical axis (height).
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
    createSkySphere(scene, camera, scenery_complexity);

    create_fog(scene, scenery_complexity);

    if (scenery_complexity > 0) {
        // Create the segmented ground with custom vertex colors
        create_procedural_ground_texture(scene, scene.groundConfig, shadowGenerator, scenery_complexity);

        // Wait until the ICAO/OACI font is loaded
        document.fonts.load('120px "ICAORWYID"').then(() => {
            // Now we know the font is available!
            // -> Create or update your dynamic texture here
            createRunway(scene, scene.groundConfig, scenery_complexity);
        });

        create_control_tower(scene, shadowGenerator, scenery_complexity);

        if (scenery_complexity > 1) {
            const buildings = create_buildings(scene, shadowGenerator, scenery_complexity);

            if (scenery_complexity > 2) {
                create_lighthouses(scene, shadowGenerator, scenery_complexity);
                create_wind_turbines(scene, shadowGenerator, scenery_complexity);

                // Enable dynamic sea generation (call this after creating your scene and camera)
                enableDynamicSeaGeneration(scene, scene.activeCamera, scenery_complexity);
            }
        }
    } else {
        create_checkered_ground(); // Assuming this function exists for complexity 0
    }

    // --- Create the Car ---
    // Assuming createCar(scene, shadowGenerator) function is defined elsewhere
    const car = createCar(scene, shadowGenerator);

    // --- Position the Car ---
    car.position = new BABYLON.Vector3(40, 14, -30);


    // Return the created car node in case it's needed elsewhere
    return car;
}