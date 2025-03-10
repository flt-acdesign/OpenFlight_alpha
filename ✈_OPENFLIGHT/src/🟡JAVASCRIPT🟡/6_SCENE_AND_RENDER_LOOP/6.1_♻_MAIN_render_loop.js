/***************************************************************
 * 6.1_♻_MAIN_render_loop.js
 *
 * Master render loop. We rely on "serverElapsedTime" (provided by
 * the server in onmessage) for consistent timing. If the server
 * hasn't yet responded, fallback is 0.
 ***************************************************************/

window.addEventListener("DOMContentLoaded", function () {
  // 1) Initialize Babylon engine
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    limitDeviceRatio: 1.0
  });
  engine.enableOfflineSupport = false;

  // 2) Create the scene
  const scene = createScene(engine, canvas);

  // 3) Our main render loop
  engine.runRenderLoop(function () {
    // Check if paused, etc.
    handleGamepadPauseControls();

    if (!isPaused && !simulationEnded) {
      // Update pilot controls from gamepad or keyboard
      updateForcesFromJoystickOrKeyboard(scene);

      // Send aircraft state to the server
      sendStateToServer();

      // Retrieve server time (default to 0 if not set)
      const serverTime = window.serverElapsedTime || 0;
      // Update trajectory with the server time
      updateTrajectory(serverTime);

    } else {
      // paused => do minimal
    }

    // Update textual info
    if (aircraft) {
      // Now the GUI’s timeText references window.serverElapsedTime.
      updateInfo();
    }


    /**
    // Ensure consistent FOV for all cameras
    scene.cameras.forEach(camera => {
      if (camera.fov > 1.2) { // Check if FOV has expanded too much
          camera.fov = 1.0; // Reset to default FOV
      }
  });
  */


    // Render the scene
    scene.render();
  });

  // 4) Resize handling
  window.addEventListener("resize", function () {
    engine.resize();
  });

  // 5) Gamepad connect/disconnect
  window.addEventListener("gamepadconnected", (event) => {
    gamepadIndex = event.gamepad.index;
    console.log(`Gamepad connected: index ${gamepadIndex}`);
  });
  window.addEventListener("gamepaddisconnected", () => {
    console.log("Gamepad disconnected.");
    gamepadIndex = null;
  });
});
