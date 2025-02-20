// js/babylon-setup.js

// Global references.
window.canvas = document.getElementById("renderCanvas");
window.engine = null;
window.scene = null;
window.camera = null;
window.light = null;
window.dirLight = null;
window.ground = null;
window.gizmoManager = null;
window.aircraftRoot = null;
window.glbRoot = null; // Parent node for GLB models

function initBabylon() {
  engine = new BABYLON.Engine(canvas, true);
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.97);

  camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI/3, 60, new BABYLON.Vector3(10,5,0), scene);
  camera.attachControl(canvas, true);
  camera.inputs.remove(camera.inputs.attached["pointers"]);
  const pointerInput = new BABYLON.ArcRotateCameraPointersInput();
  pointerInput.buttons = [0];
  camera.inputs.add(pointerInput);
  camera.inertia = 0;
  camera.lowerRadiusLimit = 0.1;
  camera.upperRadiusLimit = 1000;

  light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
  light.intensity = 0.8;
  dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0,-1,1), scene);
  dirLight.intensity = 0.3;

  ground = BABYLON.MeshBuilder.CreateGround("ground", {width:100, height:100}, scene);
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.alpha = 0.5;
  const dt = new BABYLON.DynamicTexture("groundDT", {width:512, height:512}, scene, false);
  const ctx = dt.getContext();
  const tileSize = 64;
  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      ctx.fillStyle = ((i+j)%2===0) ? "#99ccff" : "#66b3ff";
      ctx.fillRect(i*tileSize, j*tileSize, tileSize, tileSize);
    }
  }
  dt.update();
  groundMat.diffuseTexture = dt;
  ground.material = groundMat;
  ground.isPickable = true;

  // Optional axis lines.
  const axisX = BABYLON.MeshBuilder.CreateLines("axisX", {points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(10,0,0)]}, scene);
  axisX.color = new BABYLON.Color3(1,0,0);
  const axisY = BABYLON.MeshBuilder.CreateLines("axisY", {points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,10,0)]}, scene);
  axisY.color = new BABYLON.Color3(0,1,0);
  const axisZ = BABYLON.MeshBuilder.CreateLines("axisZ", {points: [new BABYLON.Vector3(0,0,0), new BABYLON.Vector3(0,0,10)]}, scene);
  axisZ.color = new BABYLON.Color3(0,0,1);

  const glowLayer = new BABYLON.GlowLayer("glow", scene);
  glowLayer.intensity = 0.8;

  gizmoManager = new BABYLON.GizmoManager(scene);
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = false;
  gizmoManager.scaleGizmoEnabled = false;

  createAircraftRoot();

  if (!window.glbRoot) {
    window.glbRoot = new BABYLON.TransformNode("glbRoot", scene);
    window.glbRoot.isPickable = true;
    window.glbRoot.metadata = { type: "glb", data: {} };
  }


  engine.runRenderLoop(function(){
    scene.render();
  });

  window.addEventListener("resize", function(){
    engine.resize();
  });
}

function createAircraftRoot() {
  if (window.aircraftRoot) {
    window.aircraftRoot.dispose();
  }
  window.aircraftRoot = new BABYLON.TransformNode("aircraftRoot", scene);
  window.aircraftRoot.rotation.x = -Math.PI/2;
  window.aircraftRoot.renderingGroupId = 2; // JSON geometry rendered on top
}

initBabylon();
