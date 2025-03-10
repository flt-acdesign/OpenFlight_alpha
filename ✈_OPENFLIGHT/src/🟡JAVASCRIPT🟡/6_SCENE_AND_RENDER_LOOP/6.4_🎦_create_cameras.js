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
  arcRotateCamera.maxZ = 5000;
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

  // Fix FOV mode to prevent aspect distortion
  arcRotateCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  arcRotateCamera.fov = 1.0; // ~57 degrees in radians

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
  followCamera.maxZ = 5000;
  
  // Fix FOV mode to prevent aspect distortion
  followCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  followCamera.fov = 1.0; // ~57 degrees in radians

  // Create the cockpit camera (first-person view).
  const cockpitCamera = new BABYLON.UniversalCamera(
    "CockpitCamera",
    new BABYLON.Vector3(0, 0, 0), // Initial position.
    scene
  );
  cockpitCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  
  // Fix FOV mode to prevent aspect distortion
  cockpitCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  cockpitCamera.fov = 0.87;
  
  // Set clipping planes for cockpit view.
  cockpitCamera.minZ = 1;
  cockpitCamera.maxZ = 5000;

  // Create the wing camera (external view).
  const wingCamera = new BABYLON.UniversalCamera(
    "WingCamera",
    new BABYLON.Vector3(0, 0, 0), // Initial position.
    scene
  );
  wingCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  wingCamera.minZ = 1;
  wingCamera.maxZ = 5000;
  
  // Fix FOV mode to prevent aspect distortion
  wingCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  wingCamera.fov = 1.9;

  // Register all cameras with the scene.
  scene.cameras.push(arcRotateCamera, cockpitCamera, followCamera, wingCamera);

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
    
    // Force world up vector to prevent distortion
    cockpitCamera.upVector = new BABYLON.Vector3(0, 1, 0);

    // Configure the wing camera (external view).
    wingCamera.parent = aircraft;
    wingCamera.position.set(-1.5, 0.5, -3.2);
    wingCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, -0.1, 0);
    
    // Force world up vector to prevent distortion
    wingCamera.upVector = new BABYLON.Vector3(0, 1, 0);
  }

  // If an aircraft is defined, perform an initial update.
  if (typeof aircraft !== "undefined" && aircraft) {
    updateCamerasForAircraft(aircraft);
  }

  // Add a scene observer to maintain camera stability during rendering
  scene.onBeforeRenderObservable.add(() => {
    // Force consistent up vectors on the cameras
    if (scene.activeCamera) {
      if (scene.activeCamera.name === "CockpitCamera" || 
          scene.activeCamera.name === "WingCamera") {
        scene.activeCamera.upVector = new BABYLON.Vector3(0, 1, 0);
      }
    }
  });

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

  // Reset FOV to original values to maintain consistency
  if (scene.activeCamera.name === "ArcRotateCamera") {
    scene.activeCamera.fov = 1.0;
  } else if (scene.activeCamera.name === "FollowCamera") {
    scene.activeCamera.fov = 1.0;
  } else if (scene.activeCamera.name === "CockpitCamera") {
    scene.activeCamera.fov = 0.87;
  } else if (scene.activeCamera.name === "WingCamera") {
    scene.activeCamera.fov = 1.9;
  }

  // Force the up vector to be world-aligned for stability
  if (scene.activeCamera.name !== "ArcRotateCamera") {
    scene.activeCamera.upVector = new BABYLON.Vector3(0, 1, 0);
  }

  // Toggle aircraft model visibility for cockpit view.
  // Assumes 'glbNode' is a global mesh representing the aircraft model.
  if (typeof glbNode !== "undefined" && glbNode) {
    // Hide the aircraft model in cockpit view (assuming index 2 is the cockpit camera).
    glbNode.setEnabled(index !== 2);
  }
}