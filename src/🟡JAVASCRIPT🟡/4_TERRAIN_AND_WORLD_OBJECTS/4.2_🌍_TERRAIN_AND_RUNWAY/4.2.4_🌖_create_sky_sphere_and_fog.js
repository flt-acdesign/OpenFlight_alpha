/***************************************************************
 * Creates a large sky sphere with a vertical gradient texture.
 * Automatically positions it based on the camera target.
 **************************************************************/
function createSkySphere(scene, camera) {
    // Create a sphere (with inverted normals) to serve as the sky dome.
    const skySphere = BABYLON.MeshBuilder.CreateSphere(
        "skySphere",
        { diameter: 7000, sideOrientation: BABYLON.Mesh.BACKSIDE },
        scene
    );

    // Create a dynamic texture to paint a vertical gradient.
    const textureSize = 512;
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
    skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    // Apply the material to the sky sphere.
    skySphere.material = skyMaterial;
    skySphere.isAlwaysActive = true; // Ensure it renders even if outside the frustum.

    // Align the sky sphere with the camera target if available.
    if (camera && camera.target) {
        skySphere.position.copyFrom(camera.target);
    } else {
        //console.warn("Camera or camera.target is undefined. Positioning sky sphere at the origin.");
        skySphere.position = BABYLON.Vector3.Zero();
    }

    // Optionally rotate the sky sphere (here rotated 90° around the Z-axis).
    skySphere.rotation.z = Math.PI / 2;

    return skySphere;
}


/***************************************************************
 * Dynamically updates the sky sphere's diameter to ensure that the
 * camera remains safely inside it, preserving the fog effect.
 * This function scales the sphere based on:
 *   1. The aircraft's distance from the origin.
 *   2. The camera's distance from the aircraft (with a margin).
 **************************************************************/
function updateSkySphereDiameter(scene, camera) {
    // Use the provided camera or fall back to the scene's active camera.
    const activeCam = camera || scene.activeCamera;
    if (!activeCam) {
        console.warn("No active camera found for updating sky sphere diameter.");
        return;
    }
    
    // Ensure the aircraft is defined (assuming 'aircraft' is a global mesh).
    if (typeof aircraft === "undefined") {
        console.warn("Aircraft is undefined. Cannot update sky sphere diameter based on aircraft position.");
        return;
    }
    
    // Calculate how far the aircraft is from the origin.
    const distanceFromCenter = aircraft.position.length();

    // Set the base diameter for the sky sphere.
    let newDiameter = 7000;
    // Increase the diameter if the aircraft is far from the origin.
    if (distanceFromCenter > 2000) {
        newDiameter += (distanceFromCenter - 2000) * 2;
    }
    
    // Additionally, ensure the sky sphere is large enough relative to the camera.
    const margin = 500; // Desired minimum distance between the camera and the sphere's inner surface.
    const camDistance = BABYLON.Vector3.Distance(activeCam.position, aircraft.position);
    // If the sphere's radius is too small, adjust the diameter.
    if (newDiameter / 2 < camDistance + margin) {
        newDiameter = (camDistance + margin) * 2;
    }

    // Retrieve the sky sphere from the scene.
    const skySphere = scene.getMeshByName("skySphere");
    if (skySphere) {
        // Calculate the uniform scaling factor.
        const scale = newDiameter / 7000; // 7000 is the base diameter.
        skySphere.scaling = new BABYLON.Vector3(scale, scale, scale);
    } else {
        console.warn("Sky sphere not found in the scene.");
    }
}


/***************************************************************
 * Configures linear fog to enhance atmospheric depth.
 **************************************************************/
function create_fog(scene) {
    // Enable linear fog.
    scene.fogMode   = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart  = 300.0;
    scene.fogEnd    = 2800.0;
    scene.fogColor  = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);
    scene.fogDensity = 0.58;
    // Uncomment and adjust these if needed:
    // scene.fogNearPlane = 10.0;
    // scene.fogFarPlane = 10000.0;
    // scene.fogEnabled = true;
}
