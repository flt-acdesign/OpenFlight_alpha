window.addEventListener("DOMContentLoaded", function () {

  // Initialize Babylon.js engine
  const canvas = document.getElementById("renderCanvas")
  const engine = new BABYLON.Engine(canvas, true)

  // Call the external scene generation function
  const scene = createScene(engine, canvas)

  // Render loop
  engine.runRenderLoop(function () {
    if (!isPaused && !simulationEnded) {
      let currentTime = Date.now()
      let deltaTime = (currentTime - lastFrameTime) / 1000 // Time in seconds

      lastFrameTime = currentTime
      timeSinceLastUpdate += deltaTime

      // Process updates in steps of global_time_step seconds
      while (timeSinceLastUpdate >= global_time_step) {
        timeSinceLastUpdate -= global_time_step
        elapsedTime += global_time_step

        // Update forces and moments based on joystick input
        updateForcesFromJoystickOrKeyboard(scene)

        if (aircraft !== undefined) {
          sendStateToServer(global_time_step)
        }
      }
    }

    // Update displayed coordinates and speed
    if (aircraft !== undefined) {
      updateInfo()
    }

    scene.render()
  })

  // Resize the engine on resize
  window.addEventListener("resize", function () {
    engine.resize()
  })

  // Gamepad event listeners
  window.addEventListener("gamepadconnected", (event) => {
    gamepadIndex = event.gamepad.index
    console.log(`Gamepad connected at index ${gamepadIndex}: ${event.gamepad.id}.`)
  })

  window.addEventListener("gamepaddisconnected", () => {
    console.log("Gamepad disconnected.")
    gamepadIndex = null
  })
})
