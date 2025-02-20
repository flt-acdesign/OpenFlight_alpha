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
// Shadow generator for casting shadows
window.shadowGenerator = null;

// --------------- CONSTANTS ---------------
const CAMERA_SPHERE_NAME = "cameraSphere"; // name for the big "sky" sphere

function initBabylon() {
  // 1) Create Engine & Scene
  engine = new BABYLON.Engine(canvas, true, { stencil: true });
  scene = new BABYLON.Scene(engine);

  // 2) Scene background color (light sky blue)
  scene.clearColor = new BABYLON.Color4(153 / 255, 204 / 255, 1, 1);

  // 3) Fog: linear mode, from 200 to 300
  scene.fogMode   = BABYLON.Scene.FOGMODE_LINEAR
  scene.fogStart  = 40.0;
  scene.fogEnd    = 340.0;
  scene.fogColor  = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);
  scene.fogDensity = 0.01258; // not used in FOGMODE_LINEAR but can stay for reference

  // 4) Create ArcRotateCamera
  camera = new BABYLON.ArcRotateCamera(
    "Camera",
    -2.21, // alpha
    1.088, // beta
    100,   // radius
    new BABYLON.Vector3(19, 11, 6), // target
    scene
  );
  camera.fov = 0.647;
  camera.rotation.z = Math.PI / 2;    // tilt your camera if needed
  camera.attachControl(canvas, true);
  camera.upperBetaLimit = Math.PI;    // can look overhead
  camera.lowerBetaLimit = 0;         // can't go below ground if you prefer
  camera.inertia = 0.9;              // camera smoothing
  camera.lowerRadiusLimit = 0.2;     // zoom in limit
  camera.upperRadiusLimit = 1500;    // zoom out limit

  // Dynamically adjust wheel & panning with distance
  camera.onViewMatrixChangedObservable.add(() => {
    const distance = BABYLON.Vector3.Distance(camera.position, camera.target);
    camera.wheelPrecision = 200 / distance;
    camera.panningSensibility = 5000 / distance;
  });

  // Middle-click => pivot camera to clicked point
  let originalTarget = camera.target.clone();
  let lastTarget = camera.target.clone();
  canvas.addEventListener("pointerdown", function (evt) {
    if (evt.button === 1) {
      evt.preventDefault();
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.hit) {
        lastTarget = camera.target.clone();
        smoothTransitionToTarget(pickResult.pickedPoint, camera, scene, 0.3);
      }
    }
  });

  // Double-click => either open edit or revert to last pivot
  canvas.addEventListener("dblclick", function () {
    const pickResult = scene.pick(scene.pointerX, scene.pointerY);
    if (pickResult.hit) {
      const info = getMetadata(pickResult.pickedMesh);
      if (info && window.selectedComponent === info.mesh) {
        openEditModalForSelected(); // from ui-logic.js
        return;
      }
    }
    if (!pickResult.hit) {
      smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
    }
  });

  // Keyboard shortcuts
  window.addEventListener("keydown", function (evt) {
    if (evt.key === "h" || evt.key === "H") {
      smoothTransitionToTarget(lastTarget, camera, scene, 0.3);
    } else if (evt.key === "o" || evt.key === "O") {
      smoothTransitionToTarget(originalTarget, camera, scene, 0.3);
    }
  });

  // Lights
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

  // Directional Light from above
  const dlight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 0), scene);
  dlight.position = new BABYLON.Vector3(0, 50, 0);
  dlight.intensity = 1.0;

  // 5) Shadow generator with large orthographic bounds
  window.shadowGenerator = new BABYLON.ShadowGenerator(2048, dlight);
  // Enable transparent shadows:
  shadowGenerator.useTransparentShadow = true;



  // Setup ortho shadow bounds
  dlight.autoCalcShadowZBounds = false;
  dlight.shadowMinZ = -100;
  dlight.shadowMaxZ = 1000;
  dlight.orthoTop = 200;
  dlight.orthoBottom = -200;
  dlight.orthoLeft = -200;
  dlight.orthoRight = 200;

  // -----------------------------------------------------------
  // We no longer use onNewMeshAddedObservable or the initial
  // mesh-forEach here; we add shadow casters explicitly after
  // JSON/GLB loading in other files (render_aircraft.js, load_glb_file.js).
  // -----------------------------------------------------------

// 6) Build ground: 500 x 500
ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 500, height: 500 }, scene);
const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
groundMat.alpha = 0.5;

// Checkerboard dynamic texture with higher resolution
const textureSize = 2048; // Increase texture resolution for crispness
const dt = new BABYLON.DynamicTexture("groundDT", { width: textureSize, height: textureSize }, scene, false);
const ctx = dt.getContext();

// Number of tiles along one side
const squaresCount = 10 // Each tile will be 10x10 units (500 / 50 = 10)
const tileSize = textureSize / squaresCount; // Calculate tile size based on texture resolution

// Draw checkerboard pattern
for (let i = 0; i < squaresCount; i++) {
  for (let j = 0; j < squaresCount; j++) {
    ctx.fillStyle = (i + j) % 2 === 0 ? "#99ccff" : "#66b3ff";
    ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
  }
}
dt.update();

// Apply texture to ground material
groundMat.diffuseTexture = dt;
groundMat.diffuseTexture.uScale = squaresCount; // Tile the texture horizontally
groundMat.diffuseTexture.vScale = squaresCount; // Tile the texture vertically
groundMat.diffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE; // Enable wrapping
groundMat.diffuseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE; // Enable wrapping
groundMat.diffuseTexture.anisotropicFilteringLevel = 16; // Improve texture quality
groundMat.diffuseTexture.samplingMode = BABYLON.Texture.NEAREST_SAMPLINGMODE; // Prevent blurring

// Assign material to ground
ground.material = groundMat;
ground.isPickable = true;
ground.receiveShadows = true;




// --- Add Coordinate Axes and Origin Box ---
  // Red line for X-axis
  var axisX = BABYLON.MeshBuilder.CreateLines("axisX", {
    points: [new BABYLON.Vector3(-40, 0, 0), new BABYLON.Vector3(40, 0, 0)]
}, scene);
axisX.color = new BABYLON.Color3(1, 0, 0);

// Green line for Y-axis
var axisY = BABYLON.MeshBuilder.CreateLines("axisY", {
    points: [new BABYLON.Vector3(0, -40, 0), new BABYLON.Vector3(0, 40, 0)]
}, scene);
axisY.color = new BABYLON.Color3(0, 1, 0);

// Blue line for Z-axis
var axisZ = BABYLON.MeshBuilder.CreateLines("axisZ", {
    points: [new BABYLON.Vector3(0, 0, -40), new BABYLON.Vector3(0, 0, 40)]
}, scene);
axisZ.color = new BABYLON.Color3(0, 0, 1);


// Reference box at origin
// Store it as a global so it can be updated later.
window.originBox = BABYLON.MeshBuilder.CreateBox("originBox", { size: 1 }, scene);

// Create a material for the box
var originBoxMat = new BABYLON.StandardMaterial("originBoxMat", scene);

// Set the diffuse color to pink (RGB: 1, 0.4, 0.7)
originBoxMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0.7);

// Set the alpha (transparency) to 0.4
originBoxMat.alpha = 0.4;

// Enable transparency in the material using alpha blending
originBoxMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

// Enable a depth pre-pass to ensure proper blending of the transparent surfaces
originBoxMat.needDepthPrePass = true;

// Disable backface culling so the box is visible from all angles
originBoxMat.backFaceCulling = false;

// Assign the material to the box
window.originBox.material = originBoxMat;

// Optionally, if you need to adjust how transparency is rendered, you can tweak engine settings.
// For example, the following settings help with blending but are not always required:
 scene.autoClear = false;
 scene.autoClearDepthAndStencil = false;





  // 7) Highlight layer for selection
  window.hl = new BABYLON.HighlightLayer("hl1", scene);

  // 8) Gizmo manager (used for drag/rotate with Ctrl, etc.)
  gizmoManager = new BABYLON.GizmoManager(scene);
  gizmoManager.positionGizmoEnabled = true;
  gizmoManager.rotationGizmoEnabled = false;
  gizmoManager.scaleGizmoEnabled = false;




  // 9) Large sphere that won't be disposed or shadowed (Sky Sphere)
  const sphere = BABYLON.MeshBuilder.CreateSphere(CAMERA_SPHERE_NAME, { diameter: 600 }, scene);
  sphere.receiveShadows = false;
  sphere.isPickable = false;

  // Create a dynamic texture for a vertical gradient:
  const skyDt = new BABYLON.DynamicTexture("skyTexture", { width: 512, height: 256 }, scene, false);
  const skyCtx = skyDt.getContext();
  // Create a vertical gradient (top to bottom)
  const grd = skyCtx.createLinearGradient(0, 0, 0, 256);

  grd.addColorStop(0, "#003366");     // Top: marine blue
  grd.addColorStop(0.5, "#ffffff");   // Equator: white (cloud-like)
  grd.addColorStop(1, "#ffff66");   // Bottom: light sky blue
  skyCtx.fillStyle = grd;
  skyCtx.fillRect(0, 0, 512, 256);
  skyDt.update();

  // Create and assign a material with the custom texture:
  const sphereMat = new BABYLON.StandardMaterial("cameraSphereMat", scene);
  // Use emissiveTexture so the sphere is self-illuminated
  sphereMat.emissiveTexture = skyDt;
  sphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
  sphereMat.backFaceCulling = false;   // Allows seeing inside the sphere
  sphereMat.disableLighting = true;    // Ensures the texture shows as-is
  sphere.material = sphereMat;

  // Move sphere with camera each frame
  scene.onBeforeRenderObservable.add(() => {
    sphere.position.copyFrom(camera.position);
  });

  // Create the main aircraft root transform
  createAircraftRoot();

  // Create or reuse glbRoot
  if (!window.glbRoot) {
    window.glbRoot = new BABYLON.TransformNode("glbRoot", scene);
    window.glbRoot.isPickable = false;
    window.glbRoot.metadata = { type: "glb", data: {} };
  }

  // 10) Render loop
  engine.runRenderLoop(function () {
    scene.render();
  });

  // 11) Handle window resize
  window.addEventListener("resize", function () {
    engine.resize();
  });
}

/**
 * Create or recreate the aircraftRoot transform node.
 */
function createAircraftRoot() {
  if (window.aircraftRoot) {
    window.aircraftRoot.dispose();
  }
  window.aircraftRoot = new BABYLON.TransformNode("aircraftRoot", scene);
  // Rotate so that our geometry aligns with the typical x-forward, z-up, etc. as you wish
  window.aircraftRoot.rotation.x = -Math.PI / 2;
  // If you want them all in a particular rendering group, do so:
  window.aircraftRoot.renderingGroupId = 2;
}

// Finally, initialize everything
initBabylon();
