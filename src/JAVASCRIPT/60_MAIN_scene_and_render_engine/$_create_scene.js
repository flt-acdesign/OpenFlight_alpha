function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);

  const {camera, pilotCamera} = setupCameras(scene, canvas);
  const {lights, shadowGenerator} = setupLights(scene);
  setupWorld(scene, shadowGenerator, camera);
  setupEventListeners(scene, shadowGenerator);
  setupAnimations(scene);

  return scene;
}

function setupCameras(scene, canvas) {
  const camera = new BABYLON.ArcRotateCamera(
      "Camera", 
      -1.2, 1.6, 100,
      new BABYLON.Vector3(170, 110, -70),
      scene
  );
  configureCameraSettings(camera, canvas);

  const pilotCamera = new BABYLON.UniversalCamera(
      'pilotCamera',
      new BABYLON.Vector3(-15, 2, 0),
      scene
  );
  pilotCamera.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
  scene.activeCamera = camera;

  return {camera, pilotCamera};
}

function configureCameraSettings(camera, canvas) {
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
}

function setupLights(scene) {
  const lightDown = new BABYLON.HemisphericLight(
      "lightDown",
      new BABYLON.Vector3(0, 1, 0),
      scene
  );
  lightDown.intensity = 0.2;

  const lightUp = new BABYLON.HemisphericLight(
      "lightUp",
      new BABYLON.Vector3(0, -1, 1),
      scene
  );
  lightUp.intensity = 0.20;

  const directionalLight = createDirectionalLight(scene);
  const shadowGenerator = createShadowGenerator(directionalLight);

  return {
      lights: {lightDown, lightUp, directionalLight},
      shadowGenerator
  };
}

function createDirectionalLight(scene) {
  const light = new BABYLON.DirectionalLight(
      "directionalLight",
      new BABYLON.Vector3(-1, -2, -1),
      scene
  );
  light.position = new BABYLON.Vector3(5, 10, 5);
  light.intensity = 0.8;
  light.autoCalcShadowZBounds = true;
  return light;
}

function createShadowGenerator(directionalLight) {
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;
  return shadowGenerator;
}

function setupWorld(scene, shadowGenerator, camera) {
  create_world_scenary(scene, shadowGenerator, camera);
  createAircraft(shadowGenerator, scene);
  createVelocityLine();
  createForceLine();
  createGUI();
}

function setupEventListeners(scene, shadowGenerator) {
  setupFileInput(scene, shadowGenerator);
  setupDoubleClickHandler(scene);
}

function setupFileInput(scene, shadowGenerator) {
  document.getElementById("fileInput").addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file && file.name.endsWith(".obj")) {
          loadObjFile(
              file,
              0.01,  // scaleFactor
              -90,   // rotationX
              90,    // rotationY
              180,   // rotationZ
              scene,
              shadowGenerator
          );
      } else {
          alert("Please select a valid .obj file");
      }
  });
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
