


function setupCameras(scene, canvas, shadowGenerator) {
    const camera = new BABYLON.ArcRotateCamera(
        "Camera", 
        -1.2,
        1.6,
        100,
        new BABYLON.Vector3(170, 110, -70),
        scene
    );
    camera.minZ = 0.1;
    camera.maxZ = 5000;
    camera.fov = 0.647;
    camera.attachControl(canvas, true);
    camera.upperBetaLimit = Math.PI;
    camera.lowerBetaLimit = 0;
    camera.inertia = 0.9;
    camera.lowerRadiusLimit = 0.01;
    camera.upperRadiusLimit = 1650;
    camera.wheelPrecision = 10;
    camera.inputs.attached.pointers.panningSensibility = 10;

    const pilotCamera = new BABYLON.FollowCamera("pilotCamera", new BABYLON.Vector3(0, 10, -10), scene);
    pilotCamera.heightOffset = 5;
    pilotCamera.rotationOffset = 180;
    pilotCamera.cameraAcceleration = 0.0005;
    pilotCamera.maxCameraSpeed = 1;
    pilotCamera.radius = -15;

    const cockpitCamera = new BABYLON.UniversalCamera("cockpitCamera", new BABYLON.Vector3(0, 0, 0), scene);
    cockpitCamera.rotationQuaternion = BABYLON.Quaternion.Identity();

    // Add cameras to the scene
    scene.cameras.push(camera);
    scene.cameras.push(pilotCamera);
    scene.cameras.push(cockpitCamera);

    const updateCamerasForaircraft_geometric_reference = (aircraft_geometric_reference) => {
        if (aircraft_geometric_reference) {
            pilotCamera.lockedTarget = aircraft_geometric_reference;
            camera.lockedTarget = aircraft_geometric_reference;

            // Center the cockpit camera at the aircraft's origin
            cockpitCamera.parent = aircraft_geometric_reference;
            cockpitCamera.position.set(0, 0, 0); // Center of the aircraft

            // Point the cockpit camera in the negative local X direction
            cockpitCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, Math.PI / 2, 0);
        }
    };

    if (typeof aircraft_geometric_reference !== "undefined") {
        updateCamerasForaircraft_geometric_reference(aircraft_geometric_reference);
    }

    scene.updateCamerasForaircraft_geometric_reference = updateCamerasForaircraft_geometric_reference;

    return { camera, pilotCamera, cockpitCamera };
}
  
  