/**
 * Sets up and configures all cameras for the scene.
 *
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {HTMLCanvasElement} canvas - The canvas element for camera controls.
 * @param {BABYLON.ShadowGenerator} shadowGenerator - (Optional) Shadow generator for the scene.
 * @returns {Object} An object containing all camera instances.
 */
function setupCameras(scene, canvas, shadowGenerator) {
  // Use mission data for initial camera position if available
  const initialAltitude = typeof MISSION_INITIAL_ALTITUDE !== 'undefined' ? MISSION_INITIAL_ALTITUDE : 400;
  
  // Create and configure the main orbital (arc rotate) camera
  const arcRotateCamera = new BABYLON.ArcRotateCamera(
    "ArcRotateCamera",
    -1.2, // Alpha rotation
    1.6,  // Beta rotation
    100,  // Radius (distance from target)
    new BABYLON.Vector3(0, initialAltitude, 0), // Initial target position
    scene
  );
  
  // Camera settings
  arcRotateCamera.minZ = 10;
  arcRotateCamera.maxZ = 8000;
  arcRotateCamera.fov = 0.47;
  arcRotateCamera.attachControl(canvas, true);
  arcRotateCamera.upperBetaLimit = Math.PI;
  arcRotateCamera.lowerBetaLimit = 0;
  arcRotateCamera.inertia = 0.9;
  arcRotateCamera.lowerRadiusLimit = 10;
  arcRotateCamera.upperRadiusLimit = 1650;
  arcRotateCamera.wheelPrecision = 8;
  if (arcRotateCamera.inputs.attached.pointers) {
    arcRotateCamera.inputs.attached.pointers.panningSensibility = 10;
  }

  // Create and configure the follow (chase) camera
  const followCamera = new BABYLON.FollowCamera(
    "FollowCamera",
    new BABYLON.Vector3(0, initialAltitude, -1),
    scene
  );
  followCamera.heightOffset = 5;
  followCamera.rotationOffset = 180;
  followCamera.cameraAcceleration = 0.01;
  followCamera.maxCameraSpeed = 60;
  followCamera.radius = -10;
  followCamera.minZ = 10;
  followCamera.maxZ = 8000;

  // Create the cockpit camera (first-person view)
  const cockpitCamera = new BABYLON.UniversalCamera(
    "CockpitCamera",
    new BABYLON.Vector3(0, initialAltitude, 0),
    scene
  );
  cockpitCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  cockpitCamera.fov = 0.87;
  cockpitCamera.minZ = 1;
  cockpitCamera.maxZ = 8000;

  // Create the wing camera (external view)
  const wingCamera = new BABYLON.UniversalCamera(
    "WingCamera",
    new BABYLON.Vector3(0, initialAltitude, 0),
    scene
  );
  wingCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  wingCamera.minZ = 1;
  wingCamera.maxZ = 8000;
  wingCamera.fov = 1.9;

  // Register all cameras with the scene
  scene.cameras.push(arcRotateCamera, cockpitCamera, followCamera, wingCamera);

  /**
   * Updates camera positions and targets based on the aircraft's position.
   *
   * @param {BABYLON.Mesh} aircraft - The aircraft mesh to follow.
   */
  function updateCamerasForAircraft(aircraft) {
    if (!aircraft) {
      console.warn("updateCamerasForAircraft called with no aircraft");
      return;
    }

    console.log(`Updating cameras to target aircraft at position: x=${aircraft.position.x.toFixed(2)}, y=${aircraft.position.y.toFixed(2)}, z=${aircraft.position.z.toFixed(2)}`);

    // CRITICAL FIX: Make the arcRotateCamera truly follow the aircraft by setting it as the 
    // lockedTarget, not just setting the target position once
    arcRotateCamera.lockedTarget = aircraft;

    // Update the follow camera to target the aircraft
    followCamera.lockedTarget = aircraft;

    // Configure the cockpit camera (first-person view)
    cockpitCamera.parent = aircraft;
    cockpitCamera.position.set(0.5, 1, 0);
    cockpitCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(
      0,
      Math.PI / 2, // Rotate 90° around the Y axis
      0
    );

    // Configure the wing camera (external view)
    wingCamera.parent = aircraft;
    wingCamera.position.set(-1.5, 0.5, -3.2);
    wingCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, -0.1, 0);
    
    // Ensure arcRotateCamera is the active camera by default
    if (scene.activeCamera !== arcRotateCamera) {
      scene.activeCamera = arcRotateCamera;
      console.log("Set active camera to ArcRotateCamera");
    }
  }

  // Expose the update function on the scene for external access
  scene.updateCamerasForAircraft = updateCamerasForAircraft;

  return {
    arcRotateCamera,
    followCamera,
    cockpitCamera,
    wingCamera
  };
}

/**
 * Switches the active camera in the scene.
 *
 * @param {number} index - The index of the camera to activate.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 */
function setActiveCamera(index, scene) {
  if (!scene || !scene.cameras || index < 0 || index >= scene.cameras.length) {
    console.warn("Invalid scene or camera index:", index);
    return;
  }
  
  // Set the active camera
  const previousCamera = scene.activeCamera ? scene.activeCamera.name : "none";
  scene.activeCamera = scene.cameras[index];
  console.log(`Switched from camera ${previousCamera} to ${scene.activeCamera.name}`);

  // Toggle aircraft model visibility for cockpit view
  if (typeof glbNode !== "undefined" && glbNode) {
    // Hide the aircraft model in cockpit view (assuming index 2 is the cockpit camera)
    glbNode.setEnabled(index !== 2);
  }
}