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
    // Wavelengths along the x and z axes (for the compute_terrain_height_and_derivatives)
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

    // Create the Morse tower at position (10,0,5) with 8 segments,
    const morseTower = createMorseTower(scene, shadowGenerator, {

    // => x: 1959.8547327640256, y: 248.25910073079265, z: 955.0814661695462
    basePosition: new BABYLON.Vector3(1971, 249, 955),
    towerHeightInSegments: 8,
    segmentHeight: 2.5,
    towerRadius: 2,
    topSphereDiameter: 3,
    morseCode: "-.-- --- ..-    .- .-. .    - --- ---    ... -- .- .-. -", 
    blinkUnit: 300,         // ms for a dot
    separationTime: 1000    // ms of pause after pattern
});

const lighthouse = createMorseTower(scene, shadowGenerator, {

    // => x: 1959.8547327640256, y: 248.25910073079265, z: 955.0814661695462
    basePosition: new BABYLON.Vector3(-1986, 25, -1380),
    towerHeightInSegments: 8,
    segmentHeight: 2.5,
    towerRadius: 2,
    topSphereDiameter: 3,
    morseCode: "-.-. ..- .-. .. --- ... .. - -.--   -.- .. .-.. .-.. . -..   - .... .   -.-. .- -", 
    blinkUnit: 300,         // ms for a dot
    separationTime: 1000    // ms of pause after pattern
});

    createRunway(scene, scene.groundConfig)




    // Call the function
    const buildings = create_buildings(scene, shadowGenerator )


    initializeTrajectorySystem();

}






