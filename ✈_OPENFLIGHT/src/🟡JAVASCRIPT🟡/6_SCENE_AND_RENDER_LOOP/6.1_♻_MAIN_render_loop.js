/***************************************************************
 * 6.1_♻_MAIN_render_loop.js — FINAL REVISION
 *
 * 1  Keeps a single global `engine` and `scene` so helper scripts
 * ("draw_forces_and_velocities.js" etc.) see the same object.
 * 2  Calls `updateVelocityLine()` and `updateForceLine()` every
 * frame, but only AFTER initial data is received from the server.
 * 3  Passes the `scene` object explicitly to the update functions.
 ***************************************************************/

// Wait for the DOM content to be fully loaded before initializing Babylon
window.addEventListener("DOMContentLoaded", () => {
  /*------------------------------------------------------------
   * ENGINE + SCENE (use the globals declared in initialisations)
   *-----------------------------------------------------------*/
  const canvas = document.getElementById("renderCanvas");

  // Ensure canvas exists
  if (!canvas) {
      console.error("renderCanvas not found in the DOM!");
      return;
  }

  // Initialize the Babylon engine (assigns to global 'engine')
  engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      limitDeviceRatio: 1.0 // Optional: Limit device pixel ratio for performance
  });
  window.engine = engine; // Expose engine globally if needed elsewhere

  // Create the Babylon scene (assigns to global 'scene' via createScene function)
  // createScene itself should assign to window.scene
  scene = createScene(engine, canvas);

  // Verify scene creation
  if (!scene) {
      console.error("Scene creation failed!");
      return;
  }
  // Ensure window.scene is set if createScene doesn't do it reliably
  if (!window.scene) {
      window.scene = scene;
  }

  /*------------------------------------------------------------
   * MAIN RENDER LOOP
   *-----------------------------------------------------------*/
  engine.runRenderLoop(() => {
      // Handle gamepad pause/resume controls first
      // Assumes handleGamepadPauseControls uses global 'isPaused'
      if (typeof handleGamepadPauseControls === 'function') {
          handleGamepadPauseControls();
      }

      // --- Simulation Logic (only when not paused) ---
      if (!isPaused && !simulationEnded) {
          // Get pilot inputs (keyboard/gamepad)
          // Pass scene if the function requires it (check its definition)
          if (typeof updateForcesFromJoystickOrKeyboard === 'function') {
              updateForcesFromJoystickOrKeyboard(scene);
          }

          // Send current state to the server
          // Checks WebSocket connection internally
          if (typeof sendStateToServer === 'function') {
              sendStateToServer();
          }

          // Update trajectory visualization based on server time
          const serverTime = window.serverElapsedTime || 0;
          if (typeof updateTrajectory === 'function') {
               // Pass scene if the function requires it (check its definition)
              updateTrajectory(serverTime);
          }
      }

      // --- Visualization Updates (run even when paused, but depend on data) ---

      // Update Force & Velocity lines ONLY if initial data has been received
      // and the corresponding display flag is true.
      // Pass the 'scene' object explicitly.
      if (initialDataReceived) {
          if (typeof updateVelocityLine === 'function' && show_velocity_vectors === "true") {
              updateVelocityLine(scene); // Pass scene
          }
          if (typeof updateForceLine === 'function' && show_force_vectors === "true") {
              updateForceLine(scene); // Pass scene
          }
      }

      // Update GUI display text if aircraft exists
      // Assumes updateInfo uses global variables like 'aircraft', 'velocity', etc.
      if (aircraft && typeof updateInfo === 'function') {
           updateInfo();
      }

      // Render the scene
      if (scene && scene.isReady()) { // Check if scene is ready
          scene.render();
      }
  });

  /*------------------------------------------------------------
   * WINDOW / GAMEPAD EVENTS
   *-----------------------------------------------------------*/
  // Handle window resize
  window.addEventListener("resize", () => {
      if (engine) {
          engine.resize();
      }
  });

  // Handle gamepad connection/disconnection
  window.addEventListener("gamepadconnected", (e) => {
      // Ensure gamepad property exists
      if (e.gamepad) {
          gamepadIndex = e.gamepad.index;
          console.log(`Gamepad connected (index ${gamepadIndex}, ID: ${e.gamepad.id})`);
      } else {
          console.warn("Gamepad connected event fired without gamepad data.");
      }
  });

  window.addEventListener("gamepaddisconnected", (e) => {
       // Ensure gamepad property exists
      if (e.gamepad) {
          console.log(`Gamepad disconnected (index ${e.gamepad.index}, ID: ${e.gamepad.id})`);
          // Only reset index if the disconnected gamepad is the one we were tracking
          if (gamepadIndex === e.gamepad.index) {
              gamepadIndex = null;
          }
      } else {
           console.warn("Gamepad disconnected event fired without gamepad data.");
      }
  });
});
