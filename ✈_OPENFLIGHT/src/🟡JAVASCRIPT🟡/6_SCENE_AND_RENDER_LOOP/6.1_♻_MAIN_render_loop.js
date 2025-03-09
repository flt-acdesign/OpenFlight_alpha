/***************************************************************
 * 6.1_♻_MAIN_render_loop.js
 *
 * Main render loop for the simulation.
 ***************************************************************/

window.keysPressed = window.keysPressed || {};
window.isPaused = window.isPaused || false;
window.simulationEnded = window.simulationEnded || false;
window.elapsedTime = window.elapsedTime || 0;
window.gamepadIndex = window.gamepadIndex || null;


// (Other global variables like aircraft, velocity, etc. should be declared elsewhere.)

window.addEventListener("DOMContentLoaded", function () {

// Initialize Babylon.js engine
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, limitDeviceRatio: 1.0 });
engine.enableOfflineSupport = false;

// Create the scene (assumed to be defined in createScene.js)
const scene = createScene(engine, canvas);
window.scene = scene;  // Make scene globally available


// For the main loop, keep track of time
let lastFrameTime = performance.now();
const maxDeltaTime = 0.05; // Maximum allowed deltaTime

// Render loop
engine.runRenderLoop(function () {
  // Process gamepad pause control
  handleGamepadPauseControls();
  
  if (!isPaused && !simulationEnded) {
    let currentTime = performance.now();
    let deltaTime = (currentTime - lastFrameTime) / 1000;
    lastFrameTime = currentTime;
    
    if (deltaTime > maxDeltaTime) {
      deltaTime = maxDeltaTime;
    }
    
    if (aircraft !== undefined) {
      updateForcesFromJoystickOrKeyboard(scene);
      sendStateToServer();
    }
    
    if (aircraft !== undefined && elapsedTime < 200) {
      updateTrajectory();
    }
    
    elapsedTime += deltaTime;
  } else {
    if (keysPressed['F1']) setActiveCamera(0, scene);
    if (keysPressed['F2']) setActiveCamera(1, scene);
    if (keysPressed['F3']) setActiveCamera(2, scene);
    if (keysPressed['F4']) setActiveCamera(3, scene);
  }
  
  if (aircraft !== undefined) {
    updateInfo();
  }
  
  scene.render();
});

window.addEventListener("resize", function () {
  engine.resize();
});

window.addEventListener("gamepadconnected", (event) => {
  gamepadIndex = event.gamepad.index;
  console.log(`Gamepad connected at index ${gamepadIndex}: ${event.gamepad.id}.`);
});

window.addEventListener("gamepaddisconnected", () => {
  console.log("Gamepad disconnected.");
  gamepadIndex = null;
});

});
