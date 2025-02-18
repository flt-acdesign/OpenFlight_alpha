// js/babylon-setup.js

// Global variables (attached to window)
window.canvas = document.getElementById("renderCanvas");
window.engine = null;
window.scene = null;

function initBabylon() {
  engine = new BABYLON.Engine(canvas, true);
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.5);

  // Create camera
  window.camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 3, 60, new BABYLON.Vector3(10, 5, 0), scene);
  camera.attachControl(canvas, true);
  camera.inputs.remove(camera.inputs.attached["pointers"]);
  var pointerInput = new BABYLON.ArcRotateCameraPointersInput();
  pointerInput.buttons = [0];
  camera.inputs.add(pointerInput);
  camera.inertia = 0;

  // Create light
  window.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Create ground with a checkerboard texture
  window.ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.alpha = 0.5;
  var dt = new BABYLON.DynamicTexture("dt", { width: 512, height: 512 }, scene, false);
  var ctx = dt.getContext();
  var size = 64;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = ((i+j) % 2 === 0) ? "#3366FF" : "#99CCFF";
      ctx.fillRect(i*size, j*size, size, size);
    }
  }
  dt.update();
  groundMat.diffuseTexture = dt;
  ground.material = groundMat;

  // Create global axis lines
  var axisX = BABYLON.MeshBuilder.CreateLines("axisX", { points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(10,0,0)] }, scene);
  axisX.color = new BABYLON.Color3(1,0,0);
  var axisY = BABYLON.MeshBuilder.CreateLines("axisY", { points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,10,0)] }, scene);
  axisY.color = new BABYLON.Color3(0,1,0);
  var axisZ = BABYLON.MeshBuilder.CreateLines("axisZ", { points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,0,10)] }, scene);
  axisZ.color = new BABYLON.Color3(0,0,1);

  // Create a glow layer for highlighting
  window.glowLayer = new BABYLON.GlowLayer("glow", scene);
  glowLayer.intensity = 0.8;

  // Setup GizmoManager for object manipulation
  window.gizmoManager = new BABYLON.GizmoManager(scene);
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = false;
  gizmoManager.scaleGizmoEnabled = false;

  // Create the Aircraft Root Transform node
  createAircraftRoot();

  // Start the render loop
  engine.runRenderLoop(function() {
    scene.render();
  });
  window.addEventListener("resize", function() {
    engine.resize();
  });
}

initBabylon();

// Global function to create (or re-create) the aircraft root transform node.
function createAircraftRoot() {
  if (window.aircraftRoot) {
    window.aircraftRoot.dispose();
  }
  window.aircraftRoot = new BABYLON.TransformNode("aircraftRoot", scene);
  // Rotate -90° about the X-axis so that wings become horizontal.
  window.aircraftRoot.rotation.x = -Math.PI / 2;
}
