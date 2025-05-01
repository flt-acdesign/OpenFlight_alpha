

/***************************************************************
 * Creates a large sky sphere with a vertical gradient texture.
 * Automatically positions it based on the camera target.
 **************************************************************/
function createSkySphere(scene, camera) {
    // Create a sphere (with inverted normals) to serve as the sky dome.
    const skySphere = BABYLON.MeshBuilder.CreateSphere(
        "skySphere",
        {
            diameter: 7000,
            segments: 16, // <--- Added this line. Lower value = fewer triangles.
            sideOrientation: BABYLON.Mesh.BACKSIDE
        },
        scene
    );

    // Create a dynamic texture to paint a vertical gradient.
    const textureSize = 128;
    const skyTexture = new BABYLON.DynamicTexture(
        "skyTexture",
        { width: textureSize, height: textureSize },
        scene
    );

    // Get the 2D drawing context of the texture.
    const ctx = skyTexture.getContext();

    // Create a vertical gradient from a warm color (top) to a lighter color (bottom).
    const gradient = ctx.createLinearGradient(0, 0, 0, textureSize);
    gradient.addColorStop(0, "rgb(246, 97, 42)");   // Near the top.
    gradient.addColorStop(1, "rgb(229, 229, 240)");   // Near the bottom.

    // Fill the texture with the gradient.
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    skyTexture.update();

    // Create a material that uses the gradient texture.
    const skyMaterial = new BABYLON.StandardMaterial("skyMaterial", scene);
    skyMaterial.backFaceCulling = false;  // Render the inside of the sphere.
    skyMaterial.diffuseTexture = skyTexture;
    skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1); // Make it emissive so it's not affected by scene lighting

    // Apply the material to the sky sphere.
    skySphere.material = skyMaterial;
    skySphere.isAlwaysActive = true; // Ensure it renders even if outside the frustum.
    skySphere.isPickable = false; // Not needed for picking

    // Align the sky sphere with the camera target if available.
    // **Note:** We will keep the sphere centered at the origin for simpler distance calculations later.
    skySphere.position = BABYLON.Vector3.Zero(); // Keep centered at world origin

    // Optionally rotate the sky sphere (here rotated 90° around the Z-axis).
    skySphere.rotation.x = Math.PI / 2;
    skySphere.rotation.y = 0 // Math.PI / 5;
    skySphere.rotation.z = 0 //Math.PI / 51;

    return skySphere;
}


/**
 * Dynamically updates the sky sphere's diameter to ensure that the
 * camera remains safely inside it, preserving the fog effect.
 * This function scales the sphere based on:
 * 1. The aircraft's distance from the origin.
 * 2. The camera's distance from the aircraft (with a margin).
 * @param {BABYLON.Scene} scene - The Babylon scene.
 * @param {BABYLON.Camera} camera - The currently active camera.
 */
function updateSkySphereDiameter(scene, camera) {
    // Use the provided camera or fall back to the scene's active camera.
    const activeCam = camera || scene.activeCamera;
    if (!activeCam) {
        // console.warn("No active camera found for updating sky sphere diameter."); // Avoid spamming console
        return;
    }

    // Ensure the aircraft is defined (assuming 'aircraft' is a global mesh/node).
    if (typeof aircraft === "undefined" || !aircraft) {
        // console.warn("Aircraft is undefined. Cannot update sky sphere diameter based on aircraft position."); // Avoid spamming console
        return;
    }

    // Calculate how far the aircraft is from the origin (center of the world).
    const aircraftDistanceFromCenter = aircraft.position.length();

    // Calculate the distance between the camera and the aircraft.
    const camDistanceToAircraft = BABYLON.Vector3.Distance(activeCam.position, aircraft.position);

    // *** INCREASED BUFFER HERE ***
    // Determine the required radius. It should be larger than both:
    // a) The aircraft's distance from the center + buffer.
    // b) The camera's distance from the center (approximated by aircraft distance + camera-to-aircraft distance) + larger buffer.
    const requiredRadius = Math.max(
        aircraftDistanceFromCenter + 1000, // Ensure sphere is at least 1000 units beyond aircraft from origin
        camDistanceToAircraft + aircraftDistanceFromCenter + 2000 // Ensure sphere is 2000 units beyond camera (increased from 500)
    );


    // Retrieve the sky sphere from the scene.
    const skySphere = scene.getMeshByName("skySphere");
    if (skySphere) {
        const baseDiameter = 7000; // The initial diameter set during creation.
        const currentDiameter = skySphere.scaling.x * baseDiameter; // Assuming uniform scaling

        // Only update if the required diameter is significantly larger than the current one
        if (requiredRadius * 2 > currentDiameter) {
             // Calculate the required uniform scaling factor.
            const scale = (requiredRadius * 2) / baseDiameter;
            skySphere.scaling.copyFromFloats(scale, scale, scale); // Use copyFromFloats for efficiency
             // console.log(`Sky sphere scaled to: ${scale.toFixed(2)} (Diameter: ${(scale * baseDiameter).toFixed(0)})`); // Optional debug log
        }
        // Optional: Consider shrinking the sphere if it becomes much larger than needed,
        // but this might cause flickering if the camera moves back and forth rapidly.
        // For simplicity, we currently only scale up.

    } else {
        // console.warn("Sky sphere not found in the scene."); // Avoid spamming console
    }
}


/***************************************************************
 * Configures linear fog to enhance atmospheric depth.
 **************************************************************/
function create_fog(scene) {
    // Enable linear fog.
    scene.fogMode    = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart   = 300.0; // Start distance of fog effect
    scene.fogEnd     = 2800.0; // Full fog effect distance (adjust based on desired visibility)
    scene.fogColor   = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255); // Fog color (light blueish)
    // scene.fogDensity = 0.58; // Only used for FOGMODE_EXP or FOGMODE_EXP2
}
