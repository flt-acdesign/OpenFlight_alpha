/***************************************************************
 * 6.1_♻_MAIN_render_loop.js
 *
 * This is the main entry point for rendering and simulation steps.
 * We do exactly ONE simulation step per frame, and clamp deltaTime
 * to avoid big jumps. The old "while (timeSinceLastUpdate >= global_time_step)"
 * is removed. We also call updateTrajectory() once per frame if not paused.
 ***************************************************************/

window.addEventListener("DOMContentLoaded", function () {

  // Initialize Babylon.js engine
  const canvas = document.getElementById("renderCanvas");

  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, limitDeviceRatio: 1.0 });
  engine.enableOfflineSupport = false;
  
  // Create the scene (see createScene.js)
  const scene = createScene(engine, canvas);

  // For the main loop, we keep track of time ourselves.
  let lastFrameTime = performance.now();
  let maxDeltaTime = 0.05;    // 0.05s => 20 FPS minimum to avoid giant steps

  // Render loop
  engine.runRenderLoop(function () {
    // Process gamepad inputs for pause control regardless of pause state
    handleGamepadPauseControls();
    

    if (!isPaused && !simulationEnded) {
      // Compute deltaTime since last frame in seconds
      let currentTime = performance.now();
      let deltaTime = (currentTime - lastFrameTime) / 1000;
      lastFrameTime = currentTime;

      // Clamp deltaTime to avoid large steps if the user tab was inactive, etc.
      if (deltaTime > maxDeltaTime) {
        deltaTime = maxDeltaTime;
      }
      
      // We do exactly one simulation step here, if the aircraft exists.
      // 1) Update local user forces from joystick or keyboard.
      updateForcesFromJoystickOrKeyboard(scene);

      // 2) Send state to the server for the next integration step.
      if (aircraft !== undefined) {
        sendStateToServer();
      }

      // 3) If we want to record the aircraft trajectory, do it once per frame.
      //    (We also can check if (elapsedTime < 200.0) to limit how many spheres.)
      if (aircraft !== undefined && elapsedTime < 200) {
        updateTrajectory();
      }

      // 4) Increase the total elapsed time by the same deltaTime, in case the GUI needs it.
      elapsedTime += deltaTime;
    } else {
      // Even in paused state, we want to handle keyboard inputs for camera control
      // and pause toggle, but not affect physics
      if (keysPressed['F1']) setActiveCamera(0, scene);
      if (keysPressed['F2']) setActiveCamera(1, scene);
      if (keysPressed['F3']) setActiveCamera(2, scene);
      if (keysPressed['F4']) setActiveCamera(3, scene);
    }

    // Update the GUI or other info each frame if aircraft is defined.
    if (aircraft !== undefined) {
      updateInfo();
    }

    // Render the scene.
    scene.render();
  });

  // Resize the engine on window resize
  window.addEventListener("resize", function () {
    engine.resize();
  });

  // Gamepad event listeners
  window.addEventListener("gamepadconnected", (event) => {
    gamepadIndex = event.gamepad.index;
    console.log(`Gamepad connected at index ${gamepadIndex}: ${event.gamepad.id}.`);
  });

  window.addEventListener("gamepaddisconnected", () => {
    console.log("Gamepad disconnected.");
    gamepadIndex = null;
  });

});