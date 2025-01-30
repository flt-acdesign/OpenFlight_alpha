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

        if (aircraft !== undefined) { sendStateToServer(global_time_step) } // Send state to server if aircraft is defined
      }
    }

    // Update displayed coordinates and speed once the aircraft is defined (active object)
    if (aircraft !== undefined) { updateInfo() }

    scene.render() // Render the scene

  })

  // Resize the engine on resize
  window.addEventListener("resize", function () {  engine.resize()  }) // Resize the engine when the window is resized

  // Gamepad event listeners
  window.addEventListener("gamepadconnected", (event) => {
    gamepadIndex = event.gamepad.index
    console.log(`Gamepad connected at index ${gamepadIndex}: ${event.gamepad.id}.`)
  })

  window.addEventListener("gamepaddisconnected", () => { // Gamepad disconnected
    console.log("Gamepad disconnected.")
    gamepadIndex = null
  })

}) // End of window.addEventListener("DOMContentLoaded", function () { ... })

