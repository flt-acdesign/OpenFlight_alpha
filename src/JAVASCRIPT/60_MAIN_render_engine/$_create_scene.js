function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);

  // Set a background color
  scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);

  // Create the camera
  const camera = new BABYLON.ArcRotateCamera("Camera", -1.2, 1.6, 100, new BABYLON.Vector3(170, 110, -70), scene);
  camera.minZ = 0.1;      
  camera.maxZ = 5000;    
  camera.fov = 0.647;
  camera.attachControl(canvas, true);
  camera.upperBetaLimit = Math.PI;
  camera.lowerBetaLimit = 0;
  camera.inertia = 0.9;
  camera.lowerRadiusLimit = 0.01;
  camera.upperRadiusLimit = 1650;
  camera.wheelPrecision = 10
  camera.inputs.attached.pointers.panningSensibility = 10;

  const pilotCamera = new BABYLON.UniversalCamera('pilotCamera', new BABYLON.Vector3(-15, 2, 0), scene);
  pilotCamera.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
  scene.activeCamera = camera;

  // Lights
  const lightDown = new BABYLON.HemisphericLight("lightDown", new BABYLON.Vector3(0, 1, 0), scene);
  lightDown.intensity = 0.2;
  const lightUp = new BABYLON.HemisphericLight("lightUp", new BABYLON.Vector3(0, -1, 1), scene);
  lightUp.intensity = 0.20;

  // Directional light for shadows
  const directionalLight = new BABYLON.DirectionalLight("directionalLight", new BABYLON.Vector3(-1, -2, -1), scene);
  directionalLight.position = new BABYLON.Vector3(5, 10, 5);
  directionalLight.intensity = 0.8;
  directionalLight.autoCalcShadowZBounds = true; // Enable automatic shadow bounds calculation

  const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  // Create the world scenery
  create_world_scenary(scene, shadowGenerator, camera);

  // Create the aircraft model
  createAircraft(shadowGenerator, scene);

  // OBJ file input handling
  document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".obj")) {
      const scaleFactor = 0.01;
      const rotationX = -90;
      const rotationY = 90;
      const rotationZ = 180;
      loadObjFile(file, scaleFactor, rotationX, rotationY, rotationZ, scene, shadowGenerator);
    } else {
      alert("Please select a valid .obj file");
    }
  });

  createVelocityLine();
  createForceLine();
  createGUI();

  // Update the sky sphere position each frame to follow the camera
  scene.onBeforeRenderObservable.add(() => {
    const skySphere = scene.getMeshByName("skySphere");
    if (skySphere && scene.activeCamera) {
      skySphere.position.x = scene.activeCamera.position.x;
      skySphere.position.z = scene.activeCamera.position.z;
    }
  });

  // Double-click to move camera towards clicked ground point
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
      const pickResult = scene.pick(pointerInfo.event.clientX, pointerInfo.event.clientY);
      if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.name.includes("groundSegment")) {
        camera.setTarget(pickResult.pickedPoint);
        camera.radius = 200;
      }
    }
  });

  return scene;
}
