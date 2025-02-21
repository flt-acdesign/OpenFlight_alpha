/********************************************
 * FILE: babylon-setup.js
 * 
 * Here we store everything in window.scene,
 * and references to "scene" inside the functions
 * just point to that same global object.
 ********************************************/

// --------------------------------------------------------
// Global references
// --------------------------------------------------------
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

// Some constants we use
const CAMERA_SPHERE_NAME = "cameraSphere"; // name for the big "sky" sphere

/********************************************
 * START of createEngineAndScene()
 ********************************************/
function createEngineAndScene() {
  // 1) Create engine
  window.engine = new BABYLON.Engine(canvas, true, { stencil: true });

  // 2) Create scene
  window.scene = new BABYLON.Scene(engine);

  // For multiple transparent objects:
  window.scene.useOrderIndependentTransparency = true;

  // Scene background color
  window.scene.clearColor = new BABYLON.Color4(153 / 255, 204 / 255, 1, 1);

  // Optional: Fog
  window.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  window.scene.fogStart = 40.0;
  window.scene.fogEnd = 340.0;
  window.scene.fogColor = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);

  // Make sure we clear the depth/stencil buffers each frame
  window.scene.autoClear = true;
  window.scene.autoClearDepthAndStencil = true;
}
/********************************************
 * END of createEngineAndScene()
 ********************************************/


/********************************************
 * START of createAircraftRoot()
 ********************************************/
function createAircraftRoot() {
  if (window.aircraftRoot) {
    window.aircraftRoot.dispose();
  }
  window.aircraftRoot = new BABYLON.TransformNode("aircraftRoot", window.scene);
  // Rotate so that geometry aligns with typical x-forward, z-up
  window.aircraftRoot.rotation.x = -Math.PI / 2;
  // If you want them all in a particular renderingGroupId
  window.aircraftRoot.renderingGroupId = 2;
}
/********************************************
 * END of createAircraftRoot()
 ********************************************/


/********************************************
 * START of initBabylon()
 ********************************************/
function initBabylon() {
  // 1) engine + scene
  createEngineAndScene(); // creates window.scene

  // 2) camera
  setupCamera(); 

  // 3) lights + shadows
  setupLightsAndShadows(); 

  // 4) create ground
  createGround(); 

  // 5) axes + origin box
  addAxesAndOriginBox(); 

  // 6) sky sphere
  createSkySphere(); 

  // 7) create or reuse the highlight layer
  window.hl = new BABYLON.HighlightLayer("hl1", window.scene);

    // create the gizmo manager
    window.gizmoManager = new BABYLON.GizmoManager(window.scene);

  // 8) create main aircraft root
  createAircraftRoot();

  // 9) create or reuse glbRoot
  if (!window.glbRoot) {
    window.glbRoot = new BABYLON.TransformNode("glbRoot", window.scene);
    window.glbRoot.isPickable = false;
    window.glbRoot.metadata = { type: "glb", data: {} };
  }

  // 10) run the render loop
  window.engine.runRenderLoop(function () {
    window.scene.render();
  });

  // 11) handle window resize
  window.addEventListener("resize", function () {
    window.engine.resize();
  });
}



/********************************************
 * END of initBabylon()
 ********************************************/

// Optionally, you can call initBabylon() directly here
initBabylon();
