/***************************************************************
 * 4.2.4_🌖_create_sky_sphere_and_fog.js
 * 
 * Creates a large sky sphere with a vertical gradient. Also
 * configures linear fog. Then, updateSkySphereDiameter ensures
 * the sphere scales so the camera remains inside it. 
 ***************************************************************/

/**
 * Creates a large sky sphere with a vertical gradient texture.
 * Automatically positions it based on the camera target.
 */
function createSkySphere(scene, camera) {
    // Create a sphere (with inverted normals) as the sky dome
    const skySphere = BABYLON.MeshBuilder.CreateSphere(
        "skySphere",
        { 
            diameter: 7000, 
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            segments: (current_graphic_settings.sky === 'full') ? 32 : 16
        },
        scene
    );

    // Dynamic texture for vertical gradient
    const textureSize = (current_graphic_settings.sky === 'full') ? 512 : 256;
    const skyTexture = new BABYLON.DynamicTexture(
        "skyTexture",
        { width: textureSize, height: textureSize },
        scene
    );
    const ctx = skyTexture.getContext();

    // Choose gradient based on complexity
    let gradient;
    if (current_graphic_settings.sky === 'full') {
        gradient = ctx.createLinearGradient(0, 0, 0, textureSize);
        gradient.addColorStop(0,    "rgb(246, 97, 42)");    // top
        gradient.addColorStop(0.4,  "rgb(253, 184, 119)"); 
        gradient.addColorStop(0.7,  "rgb(208, 218, 224)");
        gradient.addColorStop(1.0,  "rgb(229, 229, 240)");  // bottom
    } else {
        // medium or simpler
        gradient = ctx.createLinearGradient(0, 0, 0, textureSize);
        gradient.addColorStop(0,    "rgb(246, 97, 42)");
        gradient.addColorStop(1.0,  "rgb(229, 229, 240)");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    skyTexture.update();

    // Material for sphere
    const skyMaterial = new BABYLON.StandardMaterial("skyMaterial", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.diffuseTexture = skyTexture;
    skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    skySphere.material = skyMaterial;
    skySphere.isAlwaysActive = true;

    // Position the sky sphere at the camera target if available
    if (camera && camera.target) {
        skySphere.position.copyFrom(camera.target);
    } else {
        skySphere.position = BABYLON.Vector3.Zero();
    }

    // Optionally rotate
    skySphere.rotation.z = Math.PI / 2;

    return skySphere;
}

/**
 * Dynamically updates the sky sphere's diameter so the camera
 * remains inside it, preserving the fog effect.
 */
function updateSkySphereDiameter(scene, camera) {
    // Use provided camera or fallback to active camera
    const activeCam = camera || scene.activeCamera;
    if (!activeCam) {
        return;
    }

    // If there's no aircraft yet, skip
    if (!aircraft) {
        return;
    }

    // Retrieve the sky sphere
    const skySphere = scene.getMeshByName("skySphere");
    
    // Only proceed if sky sphere exists
    if (!skySphere) {
        return; // Silently return instead of logging an error
    }

    // How far is aircraft from origin?
    const distanceFromCenter = aircraft.position.length();

    // Base diameter
    let newDiameter = 7000;

    // Increase if the aircraft is far
    if (distanceFromCenter > 2000) {
        newDiameter += (distanceFromCenter - 2000) * 2;
    }

    // Ensure big enough vs. camera distance
    const margin = 500;
    const camDistance = BABYLON.Vector3.Distance(activeCam.position, aircraft.position);
    if (newDiameter / 2 < camDistance + margin) {
        newDiameter = (camDistance + margin) * 2;
    }

    // Scale factor
    const scale = newDiameter / 7000; 
    skySphere.scaling = new BABYLON.Vector3(scale, scale, scale);
}



/**
 * Configures linear fog for the scene, based on complexity
 */
function create_fog(scene) {
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;

    if (current_graphic_settings.sky === 'full') {
        scene.fogStart = 300.0;
        scene.fogEnd = 2800.0;
        scene.fogColor = new BABYLON.Color3(180/255, 206/255, 255/255);
        scene.fogDensity = 0.58;
    } else {
        scene.fogStart = 500.0;
        scene.fogEnd = 2000.0;
        scene.fogColor = new BABYLON.Color3(180/255, 206/255, 255/255);
        scene.fogDensity = 0.4;
    }
}
