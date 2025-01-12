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
    createSegmentedGround(scene, scene.groundConfig, shadowGenerator);

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

    createRunway(scene, scene.groundConfig);


    create_buildings(scene, shadowGenerator)


}









/***************************************************************
 * Creates a large sky sphere with a vertical gradient texture.
 * Automatically positions it based on the camera target.
 **************************************************************/
function createSkySphere(scene, camera) {
    // Create a sphere (facing inwards) as the sky dome
    const skySphere = BABYLON.MeshBuilder.CreateSphere(
        "skySphere",
        { diameter: 7000, sideOrientation: BABYLON.Mesh.BACKSIDE },
        scene
    );

    // We'll paint a gradient onto a dynamic texture
    const textureSize = 1024;
    const skyTexture = new BABYLON.DynamicTexture(
        "skyTexture",
        { width: textureSize, height: textureSize },
        scene
    );

    // Get the 2D canvas context for drawing
    const ctx = skyTexture.getContext();

    // Create a vertical gradient that goes from a warm color (top)
    // to a lighter color (bottom). Adjust to your liking.
    const gradient = ctx.createLinearGradient(0, 0, 0, textureSize);
    gradient.addColorStop(0, "rgb(246, 97, 42)");   // near top
    gradient.addColorStop(1, "rgb(229, 229, 240)"); // near bottom

    // Paint the gradient onto the texture
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    skyTexture.update();

    // Standard material to hold our gradient texture
    const skyMaterial = new BABYLON.StandardMaterial("skyMaterial", scene);
    skyMaterial.backFaceCulling = false;  // Render inside faces
    skyMaterial.diffuseTexture = skyTexture;
    skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    // Attach the material to the sky sphere
    skySphere.material = skyMaterial;
    skySphere.isAlwaysActive = true; // Always rendered, even if out of frustum

    // Align skySphere with the camera target
    skySphere.rotation.z = Math.PI / 2; // Rotated 90 deg if desired
    skySphere.position.copyFrom(camera.target);
}

