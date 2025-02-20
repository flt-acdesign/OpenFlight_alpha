// js/babylon-setup.js

window.canvas = document.getElementById("renderCanvas");
window.engine = null;
window.scene = null;
window.camera = null;
window.ground = null;
window.gizmoManager = null;
window.aircraftRoot = null;
window.glbRoot = null;

// We'll use a highlight layer for selection
window.hl = null;
// If you need references to shadow gen, directional lights, etc.
window.shadowGenerator = null;

function initBabylon() {
  // 1) Engine & Scene
  engine = new BABYLON.Engine(canvas, true, { stencil: true });
  scene = new BABYLON.Scene(engine);

  // 2) Set background color from the snippet
  scene.clearColor = new BABYLON.Color4(153 / 255, 204 / 255, 1, 1); // RGBA

  // 3) Snippet's ArcRotateCamera
  camera = new BABYLON.ArcRotateCamera(
    "Camera",
    -2.21,           // alpha
    1.088,           // beta
    35,              // radius
    new BABYLON.Vector3(19, 11, 6),  // target
    scene
  );
  camera.fov = 0.647;
  //camera.upVector = new BABYLON.Vector3(0, 0, 1);
  camera.rotation.z = Math.PI / 2;
  camera.attachControl(canvas, true);
  camera.upperBetaLimit = Math.PI;
  camera.lowerBetaLimit = 0;
  camera.lowerAlphaLimit = null;
  camera.upperAlphaLimit = null;
  camera.inertia = 0.9;
  camera.lowerRadiusLimit = 0.2;
  camera.upperRadiusLimit = 150;
  camera.wheelPrecision = 150;

  // Zoom rate & panning sensibility based on distance
  camera.onViewMatrixChangedObservable.add(() => {
    const distance = BABYLON.Vector3.Distance(camera.position, camera.target);
    camera.wheelPrecision = 200 / distance;
    camera.panningSensibility = 5000 / distance;
  });

  // Track original & last target for camera transitions
  const originalTarget = camera.target.clone();
  let lastTarget = camera.target.clone();

  // Middle-mouse click => pick & pivot
  canvas.addEventListener("pointerdown", function (evt) {
    // NOTE: Typically button===1 is Middle in most browsers
    if (evt.button === 1) {
      evt.preventDefault(); // skip context menu
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.hit) {
        lastTarget = camera.target.clone();
        smoothTransitionToTarget(pickResult.pickedPoint, camera, scene, 0.3);
      }
    }
  });



  canvas.addEventListener("dblclick", function () {
    const pickResult = scene.pick(scene.pointerX, scene.pointerY);
  
    if (pickResult.hit) {
      // Did we double-click the same object that is currently selected?
      const info = getMetadata(pickResult.pickedMesh);
      if (info && window.selectedComponent === info.mesh) {
        // Yes => open the edit modal
        openEditModalForSelected();
        return; 
      }
      // If we hit a different mesh (or unselected item), do nothing special,
      // or you can also choose to select it. But for now, we do nothing.
    }
  
    // If the user double-clicked empty space => revert to last target
    if (!pickResult.hit) {
      smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
    }
  });


  // Keyboard 'h' => lastTarget, 'o' => originalTarget
  window.addEventListener("keydown", function (evt) {
    if (evt.key === "h" || evt.key === "H") {
      smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
    } else if (evt.key === "o" || evt.key === "O") {
      smoothTransitionToTarget(originalTarget, camera, scene, 0.3);
    }
  });

  // 4) Lights from snippet
  const hemi_light_from_above = new BABYLON.HemisphericLight(
    "hemiLight_above",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  hemi_light_from_above.intensity = 0.5;
  hemi_light_from_above.diffuse = new BABYLON.Color3(1, 1, 1);

  const hemi_light_from_below = new BABYLON.HemisphericLight(
    "hemiLight_below",
    new BABYLON.Vector3(0, -1, 0),
    scene
  );
  hemi_light_from_below.intensity = 0.4;
  hemi_light_from_below.groundColor = new BABYLON.Color3(0, 0, 1);

  const dlight = new BABYLON.DirectionalLight(
    "dir_from_below",
    new BABYLON.Vector3(0, 0, 1),
    scene
  );
  dlight.position = new BABYLON.Vector3(0, 0, 0);
  dlight.intensity = 0.5;

  // Let directional light track camera direction
  scene.registerBeforeRender(function () {
    dlight.direction = camera.getTarget().subtract(camera.position).normalize();
  });

  // 5) Shadow generator (optional)
  window.shadowGenerator = new BABYLON.ShadowGenerator(2048, dlight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;

  // 6) Create a highlight layer
  window.hl = new BABYLON.HighlightLayer("hl1", scene);

  // 7) Create ground (from your original code):
  ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.alpha = 0.5;
  const dt = new BABYLON.DynamicTexture("groundDT", { width: 512, height: 512 }, scene, false);
  const ctx = dt.getContext();
  const tileSize = 64;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      ctx.fillStyle = ( (i + j) % 2 === 0 ) ? "#99ccff" : "#66b3ff";
      ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
  dt.update();
  groundMat.diffuseTexture = dt;
  ground.material = groundMat;
  ground.isPickable = true;

  // 8) Gizmo Manager
  gizmoManager = new BABYLON.GizmoManager(scene);
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = false;
  gizmoManager.scaleGizmoEnabled = false;

  // 9) Create the aircraft root
  createAircraftRoot();

  // 10) If glbRoot not existing, create it
  if (!window.glbRoot) {
    window.glbRoot = new BABYLON.TransformNode("glbRoot", scene);
    window.glbRoot.isPickable = false;
    window.glbRoot.metadata = { type: "glb", data: {} };
  }

  // 11) Start rendering
  engine.runRenderLoop(function () {
    scene.render();
  });

  // 12) Resize on window changes
  window.addEventListener("resize", function () {
    engine.resize();
  });
}

// Smooth transition function from the snippet
function smoothTransitionToTarget(newTarget, camera, scene, durationInSeconds) {
  const frameRate = 60;
  const totalFrames = durationInSeconds * frameRate;

  const animCamTarget = new BABYLON.Animation(
    "animCam",
    "target",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [];
  keys.push({ frame: 0, value: camera.target });
  keys.push({ frame: totalFrames, value: newTarget });

  animCamTarget.setKeys(keys);

  scene.beginDirectAnimation(camera, [animCamTarget], 0, totalFrames, false);
}

function createAircraftRoot() {
  if (window.aircraftRoot) {
    window.aircraftRoot.dispose();
  }
  window.aircraftRoot = new BABYLON.TransformNode("aircraftRoot", scene);
  // Rotate so that +z is up if you like:
  window.aircraftRoot.rotation.x = -Math.PI / 2;
  window.aircraftRoot.renderingGroupId = 2;
}

initBabylon();
