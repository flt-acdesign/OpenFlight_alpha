
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
  followCamera.heightOffset = 5;         // Height above target.
  followCamera.rotationOffset = 180;     // Rotate 180° around the target.
  followCamera.cameraAcceleration = 0.01; // Smoothing factor.
  followCamera.maxCameraSpeed = 60;       // Maximum speed.
  followCamera.radius = -10;              // Distance from target.
  // Set clipping planes to match other cameras.
  followCamera.minZ = 10;
  followCamera.maxZ = 5000;

  // Fix FOV mode to prevent aspect distortion
  followCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  followCamera.fov = 1.0; // ~57 degrees in radians

  // Force the FollowCamera to use the world's Y-axis as its up direction
  // This prevents scene distortion during aircraft rolls.
  followCamera.upVector = new BABYLON.Vector3(0, 1, 0);

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
   * @param {BABYLON.Mesh | BABYLON.TransformNode} aircraft - The aircraft mesh or node to follow.
   */
  function updateCamerasForAircraft(aircraft) {
    if (!aircraft) return;

    // Update locked targets for the orbital and follow cameras.
    arcRotateCamera.lockedTarget = aircraft;
    followCamera.lockedTarget = aircraft;
    // Ensure FollowCamera upVector is set (might be redundant if already set above, but safe)
    followCamera.upVector = new BABYLON.Vector3(0, 1, 0);


    // Configure the cockpit camera (first-person view).
    cockpitCamera.parent = aircraft;
    cockpitCamera.position.set(0.5, 1, 0); // Position relative to aircraft origin
    cockpitCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(
      0,
      Math.PI / 2, // Rotate 90° around the LOCAL Y axis to face forward (assuming aircraft +X is forward)
      0
    );

    // --- REMOVED THIS LINE ---
    // We rely on the onBeforeRenderObservable to set the upVector for the active cockpit camera
    // cockpitCamera.upVector = new BABYLON.Vector3(0, 1, 0);
    // ------------------------

    // Configure the wing camera (external view).
    wingCamera.parent = aircraft;
    wingCamera.position.set(-1.5, 0.5, -3.2); // Position relative to aircraft origin
    wingCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, -0.1, 0); // Slight rotation

    // --- REMOVED THIS LINE ---
    // We rely on the onBeforeRenderObservable to set the upVector for the active wing camera
    // wingCamera.upVector = new BABYLON.Vector3(0, 1, 0);
    // ------------------------
  }

  // If an aircraft is defined, perform an initial update.
  if (typeof aircraft !== "undefined" && aircraft) {
    updateCamerasForAircraft(aircraft);
  }

  // Add a scene observer to maintain camera stability during rendering
  scene.onBeforeRenderObservable.add(() => {
    // Force consistent up vectors on the cameras that are parented or following WHEN ACTIVE
    if (scene.activeCamera) {
      // Apply to Cockpit and Wing cameras ALWAYS when they are active
      if (scene.activeCamera.name === "CockpitCamera" ||
          scene.activeCamera.name === "WingCamera") {
        scene.activeCamera.upVector = new BABYLON.Vector3(0, 1, 0);
      }
      // Note: FollowCamera upVector is set during setup and should persist.
      // If issues remain with FollowCamera, uncommenting the following might help,
      // but could impact performance slightly if checked every frame.
      // else if (scene.activeCamera.name === "FollowCamera") {
      //  scene.activeCamera.upVector = new BABYLON.Vector3(0, 1, 0);
      //}
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

  // Force the up vector to be world-aligned for stability immediately on switch
  // This complements the onBeforeRenderObservable which handles it frame-by-frame
  if (scene.activeCamera.name === "CockpitCamera" ||
      scene.activeCamera.name === "WingCamera" ||
      scene.activeCamera.name === "FollowCamera") {
      scene.activeCamera.upVector = new BABYLON.Vector3(0, 1, 0);
  }


  // Toggle aircraft model visibility for cockpit view.
  // Assumes 'glbNode' is a global mesh/node representing the loaded aircraft model.
  // Assumes 'planeNode' is the default simple aircraft model.
  const isCockpitView = (index === 2); // Assuming index 2 is CockpitCamera

  // Hide loaded GLB model in cockpit view
  if (typeof glbNode !== "undefined" && glbNode) {
     glbNode.setEnabled(!isCockpitView);
  }
  // Also ensure the default planeNode (if visible) is hidden in cockpit view
  if (typeof planeNode !== "undefined" && planeNode) {
     // Only hide planeNode if glbNode is NOT loaded, otherwise glbNode logic takes precedence
     if (!glbNode) {
         planeNode.setEnabled(!isCockpitView);
     } else {
         planeNode.setEnabled(false); // Ensure default is hidden if GLB is loaded
     }
  }
}