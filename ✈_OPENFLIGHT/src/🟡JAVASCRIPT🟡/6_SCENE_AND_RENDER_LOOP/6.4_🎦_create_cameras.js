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
  arcRotateCamera.minZ = 10;
  arcRotateCamera.maxZ = 5000;
  arcRotateCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  arcRotateCamera.fov = 0.8; // Standard FOV (~45 degrees)
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

  // Create and configure the follow (chase) camera.
  const followCamera = new BABYLON.FollowCamera(
    "FollowCamera",
    new BABYLON.Vector3(0, 10, -1),
    scene
  );
  followCamera.heightOffset = 5;
  followCamera.rotationOffset = 180;
  followCamera.cameraAcceleration = 0.01;
  followCamera.maxCameraSpeed = 60;
  followCamera.radius = -10;
  followCamera.minZ = 10;
  followCamera.maxZ = 5000;
  followCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  followCamera.fov = 0.8; // Match arc rotate camera
  // **CRITICAL FIX**: Set upVector ONCE during setup, not every frame
  followCamera.upVector = new BABYLON.Vector3(0, 1, 0);

  // Create the cockpit camera (first-person view).
  const cockpitCamera = new BABYLON.UniversalCamera(
    "CockpitCamera",
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  cockpitCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  cockpitCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  cockpitCamera.fov = 0.87; // Slightly wider for cockpit immersion
  cockpitCamera.minZ = 0.1; // Closer near plane for cockpit details
  cockpitCamera.maxZ = 5000;

  // Create the wing camera (external view).
  const wingCamera = new BABYLON.UniversalCamera(
    "WingCamera",
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  wingCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
  wingCamera.minZ = 0.1;
  wingCamera.maxZ = 5000;
  wingCamera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  wingCamera.fov = 1.2; // Wider for dramatic wing view (reduced from 1.9)

  // Register all cameras with the scene.
  scene.cameras.push(arcRotateCamera, cockpitCamera, followCamera, wingCamera);

  /**
   * Updates camera positions and targets based on the aircraft's position.
   */
  function updateCamerasForAircraft(aircraft) {
    if (!aircraft) return;

    arcRotateCamera.lockedTarget = aircraft;
    followCamera.lockedTarget = aircraft;

    // Configure cockpit camera
    cockpitCamera.parent = aircraft;
    cockpitCamera.position.set(0.5, 1, 0);
    cockpitCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, Math.PI / 2, 0);

    // Configure wing camera
    wingCamera.parent = aircraft;
    wingCamera.position.set(-1.5, 0.5, -3.2);
    wingCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, -0.1, 0);
  }

  if (typeof aircraft !== "undefined" && aircraft) {
    updateCamerasForAircraft(aircraft);
  }

  // **CRITICAL FIX**: Remove the onBeforeRenderObservable that was forcing upVector every frame
  // This was causing the aspect ratio distortion during rolls
  // The upVector should only be set once during initialization

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
 */
function setActiveCamera(index, scene) {
  if (index < 0 || index >= scene.cameras.length) {
    console.warn("Invalid camera index:", index);
    return;
  }
  scene.activeCamera = scene.cameras[index];

  // **REMOVED**: Don't reset FOV here - maintain original values set during setup

  // Toggle aircraft model visibility for cockpit view
  const isCockpitView = (index === 2);

  if (typeof glbNode !== "undefined" && glbNode) {
     glbNode.setEnabled(!isCockpitView);
  }
  if (typeof planeNode !== "undefined" && planeNode) {
     if (!glbNode) {
         planeNode.setEnabled(!isCockpitView);
     } else {
         planeNode.setEnabled(false);
     }
  }
}