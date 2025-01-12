/**
 * Sets up and configures all cameras for the scene
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {HTMLCanvasElement} canvas - The canvas element for camera controls
 * @param {BABYLON.ShadowGenerator} shadowGenerator - Shadow generator for the scene
 * @returns {Object} Object containing all camera instances
 */
function setupCameras(scene, canvas, shadowGenerator) {
    // Create and configure the main arc rotate (orbital) camera
    const camera = new BABYLON.ArcRotateCamera(
        "Camera",
        -1.2,  // Alpha rotation
        1.6,   // Beta rotation
        100,   // Radius
        new BABYLON.Vector3(170, 110, -70),  // Target position
        scene
    );

    // Configure main camera properties
    camera.minZ = 0.1;                    // Nearest viewing distance
    camera.maxZ = 5000;                   // Farthest viewing distance
    camera.fov = 0.47;                   // Field of view in radians
    camera.attachControl(canvas, true);    // Enable camera controls
    camera.upperBetaLimit = Math.PI;      // Maximum vertical rotation
    camera.lowerBetaLimit = 0;            // Minimum vertical rotation
    camera.inertia = 0.9;                 // Camera movement smoothing
    camera.lowerRadiusLimit = 0.01;       // Minimum zoom distance
    camera.upperRadiusLimit = 1650;       // Maximum zoom distance
    camera.wheelPrecision = 10;           // Mouse wheel sensitivity
    camera.inputs.attached.pointers.panningSensibility = 10;  // Panning sensitivity

    // Create and configure the follow (chase) camera
    const pilotCamera = new BABYLON.FollowCamera(
        "pilotCamera",
        new BABYLON.Vector3(0, 10, -1),  // Initial position
        scene
    );
    pilotCamera.heightOffset = 5;         // Height above target
    pilotCamera.rotationOffset = 180;     // Rotation around target
    pilotCamera.cameraAcceleration = 0.0005;  // Follow movement smoothing
    pilotCamera.maxCameraSpeed = 30;       // Maximum follow speed
    pilotCamera.radius = -10;             // Distance from target

    // Create cockpit camera (first-person view)
    const cockpitCamera = new BABYLON.UniversalCamera(
        "cockpitCamera",
        new BABYLON.Vector3(0, 0, 0),     // Initial position
        scene
    );
    cockpitCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
    cockpitCamera.fov = 0.87; 
  


    // Create wing camera (external view)
    const wingCamera = new BABYLON.UniversalCamera(
        "wingCamera",
        new BABYLON.Vector3(0, 0, 0),     // Initial position
        scene
    );
    wingCamera.rotationQuaternion = BABYLON.Quaternion.Identity();

    // Register all cameras with the scene
    scene.cameras.push(camera);
    scene.cameras.push(pilotCamera);
    scene.cameras.push(cockpitCamera);
    scene.cameras.push(wingCamera);

    /**
     * Updates camera positions and targets when aircraft position changes
     * @param {BABYLON.Mesh} aircraft - The aircraft mesh to follow
     */
    const updateCamerasForAircraft = (aircraft) => {
        if (!aircraft) return;

        // Update follow cameras' targets
        pilotCamera.lockedTarget = aircraft;
        camera.lockedTarget = aircraft;

        // Configure cockpit camera
        cockpitCamera.parent = aircraft;
        cockpitCamera.position.set(0, 0, 0);
        cockpitCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(
            0,
            Math.PI / 2,  // 90 degrees rotation around Y axis
            0
        );


        // Configure wing camera
        wingCamera.parent = aircraft;
        wingCamera.position.set(-1.5, .5, -3.2);
        wingCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, -0.1, 0);
            // Set a wider FOV (default is ~0.8 radians or 45 degrees)
            wingCamera.fov = 1.9; // Approximately 85 degrees in radians
    };

    // Initial camera update if aircraft exists
    if (typeof aircraft !== "undefined") {
        updateCamerasForAircraft(aircraft);
    }

    // Add update function to scene for external access
    scene.updateCamerasForAircraft = updateCamerasForAircraft;

    return { camera, pilotCamera, cockpitCamera, wingCamera };
}

/**
 * Switches the active camera in the scene
 * @param {number} index - Index of the camera to activate
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 */
function setActiveCamera(index, scene) {
    scene.activeCamera = scene.cameras[index];

    // Toggle aircraft model visibility for cockpit view
    if (glbNode) {
        glbNode.setEnabled(index !== 2);  // Hide model in cockpit view (index 2)
    }
}
