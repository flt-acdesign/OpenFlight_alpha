function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);

  const {lights, shadowGenerator} = setupLights_and_shadows(scene);
  createAircraft(shadowGenerator, scene)
  const {camera, pilotCamera, cockpitCamera} = setupCameras(scene, canvas);
  create_world_scenary(scene, shadowGenerator, camera);
  createVelocityLine();
  createForceLine();
  createGUI();
  setupEventListeners(scene, shadowGenerator);
  setupAnimations(scene);
  return scene;
}


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
  pilotCamera.cameraAcceleration = 0.0005;   // Reduced acceleration for smoother movement
  pilotCamera.maxCameraSpeed = 1;       // Reduced max speed for smoother movement
  pilotCamera.radius = -15;


  // Create the cockpit camera, but dont target it yet.
  const cockpitCamera = new BABYLON.UniversalCamera("cockpitCamera", new BABYLON.Vector3(0, 0, 0), scene);
  cockpitCamera.rotation.y = Math.PI/2 // Adjust for initial forward facing direction.

  scene.activeCamera = camera;


  if (aircraft) {
    pilotCamera.lockedTarget = aircraft;
    camera.lockedTarget = aircraft;

    // Make the cockpit camera a child of the aircraft and position it
    cockpitCamera.parent = aircraft;
    cockpitCamera.position.y = 1; // Adjust as needed for the position of the cockpit relative to the center of the aircraft mesh.
    //cockpitCamera.position.z = 2;  // Adjust as needed for the position of the cockpit relative to the center of the aircraft mesh.
    //cockpitCamera.setTarget(new BABYLON.Vector3(0,1,10)); // Set it to look forward.
}

  return { camera, pilotCamera, cockpitCamera };
}




function setupLights_and_shadows(scene) {
  const lightDown = new BABYLON.HemisphericLight(
      "lightDown",
      new BABYLON.Vector3(0, 1, 0),
      scene
  );
  lightDown.intensity = 0.7;

  const lightUp = new BABYLON.HemisphericLight(
      "lightUp",
      new BABYLON.Vector3(0, -1, 1),
      scene
  );
  lightUp.intensity = 0.2;

  const directionalLight = new BABYLON.DirectionalLight(
    "directionalLight",
    new BABYLON.Vector3(-1, -2, -1),
    scene
);
directionalLight.position = new BABYLON.Vector3(5, 10, 5);
directionalLight.intensity = 0.7;
directionalLight.autoCalcShadowZBounds = true;

const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
shadowGenerator.useBlurExponentialShadowMap = true;
shadowGenerator.blurKernel = 32;


  return {
      lights: {lightDown, lightUp, directionalLight},
      shadowGenerator
  };
}


function setupEventListeners(scene, shadowGenerator) {
  setupFileInput(scene, shadowGenerator);
  setupDoubleClickHandler(scene);
}


function setupAnimations(scene) {
  scene.onBeforeRenderObservable.add(() => {
      updateSkySpherePosition(scene);
  });
}

function updateSkySpherePosition(scene) {
  const skySphere = scene.getMeshByName("skySphere");
  if (skySphere && scene.activeCamera) {
      skySphere.position.x = scene.activeCamera.position.x;
      skySphere.position.z = scene.activeCamera.position.z;
  }
}

function setupDoubleClickHandler(scene) {
  scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
          handleDoubleClick(pointerInfo, scene);
      }
  });
}

function handleDoubleClick(pointerInfo, scene) {
  const pickResult = scene.pick(
      pointerInfo.event.clientX,
      pointerInfo.event.clientY
  );
  if (pickResult.hit && 
      pickResult.pickedMesh && 
      pickResult.pickedMesh.name.includes("groundSegment")) {
      scene.activeCamera.setTarget(pickResult.pickedPoint);
      scene.activeCamera.radius = 200;
  }
}
