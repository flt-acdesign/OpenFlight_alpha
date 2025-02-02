/**
 * Sets up and configures all cameras for the scene.
 *
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {HTMLCanvasElement} canvas - The canvas element for camera controls.
 * @param {BABYLON.ShadowGenerator} shadowGenerator - (Optional) Shadow generator for the scene.
 * @returns {Object} An object containing all camera instances.
 */
function setupCameras(scene, canvas, shadowGenerator) {
  // Create and configure the main orbital (arc rotate) camera.
  const arcRotateCamera = new BABYLON.ArcRotateCamera(
    "ArcRotateCamera",
    -1.2, // Alpha rotation.
    1.6,  // Beta rotation.
    100,  // Radius (distance from target).
    new BABYLON.Vector3(170, 110, -70), // Target position.
    scene
  );
  // Use a near plane of 1 and a far plane of 4000 to reduce depth buffer issues.
  arcRotateCamera.minZ = 10;
  arcRotateCamera.maxZ = 8000;
  arcRotateCamera.fov = 0.47;
  arcRotateCamera.attachControl(canvas, true);
  arcRotateCamera.upperBetaLimit = Math.PI;
  arcRotateCamera.lowerBetaLimit = 0;
  arcRotateCamera.inertia = 0.9;
  // Increase the lower radius limit so the camera does not zoom in too close,
  // which can cause z-fighting with nearby objects.
  arcRotateCamera.lowerRadiusLimit = 10; // Changed from 0.1 to 10
  arcRotateCamera.upperRadiusLimit = 1650;
  arcRotateCamera.wheelPrecision = 8;
  // Adjust panning sensitivity if available.
  if (arcRotateCamera.inputs.attached.pointers) {
    arcRotateCamera.inputs.attached.pointers.panningSensibility = 10;
  }

  // Create and configure the follow (chase) camera.
  const followCamera = new BABYLON.FollowCamera(
    "FollowCamera",
    new BABYLON.Vector3(0, 10, -1), // Initial position.
    scene
  );
  followCamera.heightOffset = 5;          // Height above target.
  followCamera.rotationOffset = 180;      // Rotate 180° around the target.
  followCamera.cameraAcceleration = 0.01; // Smoothing factor.
  followCamera.maxCameraSpeed = 60;        // Maximum speed.
  followCamera.radius = -10;               // Distance from target.
  // Set clipping planes to match other cameras.
  followCamera.minZ = 10;
  followCamera.maxZ = 8000;

  // Create the cockpit camera (first-person view).
  const cockpitCamera = new BABYLON.UniversalCamera(
    "CockpitCamera",
    new BABYLON.Vector3(0, 0, 0), // Initial position.
    scene
  );
  cockpitCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  cockpitCamera.fov = 0.87;
  // Set clipping planes for cockpit view.
  cockpitCamera.minZ = 1;
  cockpitCamera.maxZ = 8000;

  // Create the wing camera (external view).
  const wingCamera = new BABYLON.UniversalCamera(
    "WingCamera",
    new BABYLON.Vector3(0, 0, 0), // Initial position.
    scene
  );
  wingCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  wingCamera.minZ = 1;
  wingCamera.maxZ = 8000;
  // Set a wider field of view (~85° in radians).
  wingCamera.fov = 1.9;

  // Register all cameras with the scene.
  scene.cameras.push(arcRotateCamera, followCamera, cockpitCamera, wingCamera);

  /**
   * Updates camera positions and targets based on the aircraft's position.
   *
   * @param {BABYLON.Mesh} aircraft - The aircraft mesh to follow.
   */
  function updateCamerasForAircraft(aircraft) {
    if (!aircraft) return;

    // Update locked targets for the orbital and follow cameras.
    arcRotateCamera.lockedTarget = aircraft;
    followCamera.lockedTarget = aircraft;

    // Configure the cockpit camera (first-person view).
    cockpitCamera.parent = aircraft;
    cockpitCamera.position.set(0.5, 1, 0);
    cockpitCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(
      0,
      Math.PI / 2, // Rotate 90° around the Y axis.
      0
    );

    // Configure the wing camera (external view).
    wingCamera.parent = aircraft;
    wingCamera.position.set(-1.5, 0.5, -3.2);
    wingCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, -0.1, 0);
  }

  // If an aircraft is defined, perform an initial update.
  // (Note: 'aircraft' is assumed to be a global variable or defined elsewhere.)
  if (typeof aircraft !== "undefined" && aircraft) {
    updateCamerasForAircraft(aircraft);
  }

  // Expose the update function on the scene for external access.
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
  if (index < 0 || index >= scene.cameras.length) {
    console.warn("Invalid camera index:", index);
    return;
  }
  scene.activeCamera = scene.cameras[index];

  // Toggle aircraft model visibility for cockpit view.
  // Assumes 'glbNode' is a global mesh representing the aircraft model.
  if (typeof glbNode !== "undefined" && glbNode) {
    // Hide the aircraft model in cockpit view (assuming index 2 is the cockpit camera).
    glbNode.setEnabled(index !== 2);
  }
}
