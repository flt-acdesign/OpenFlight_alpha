const rad2deg = rad => (rad * 180.0) / Math.PI;

// rad2deg(Math.PI / 2); // 90


function createGUI() {

  advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")

  // Create a stack panel to hold the text blocks
  const panel = new BABYLON.GUI.StackPanel()
  panel.width = "800px"
  panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
  panel.paddingTop = "10px"
  panel.paddingLeft = "10px"
  advancedTexture.addControl(panel)

  positionText = new BABYLON.GUI.TextBlock()
  positionText.height = "20px"
  positionText.color = "white"
  positionText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(positionText)

  velocityText = new BABYLON.GUI.TextBlock()
  velocityText.height = "20px"
  velocityText.color = "white"
  velocityText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(velocityText)

  forceText = new BABYLON.GUI.TextBlock()
  forceText.height = "20px"
  forceText.color = "white"
  forceText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(forceText)

  angularVelocityText = new BABYLON.GUI.TextBlock()
  angularVelocityText.height = "20px"
  angularVelocityText.color = "white"
  angularVelocityText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(angularVelocityText)

  momentText = new BABYLON.GUI.TextBlock()
  momentText.height = "20px"
  momentText.color = "white"
  momentText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(momentText)

  timeText = new BABYLON.GUI.TextBlock()
  timeText.height = "20px"
  timeText.color = "white"
  timeText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(timeText)

  alphaText = new BABYLON.GUI.TextBlock()
  alphaText.height = "20px"
  alphaText.color = "white"
  alphaText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(alphaText)

  betaText = new BABYLON.GUI.TextBlock()
  betaText.height = "20px"
  betaText.color = "white"
  betaText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  panel.addControl(betaText)

  joystickText = new BABYLON.GUI.TextBlock()
  joystickText.height = "60px"
  joystickText.color = "white"
  joystickText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT
  joystickText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
  joystickText.textWrapping = true
  panel.addControl(joystickText)

  pauseButton = BABYLON.GUI.Button.CreateSimpleButton("pauseButton", "Pause Simulation")
  pauseButton.width = "200px"
  pauseButton.height = "40px"
  pauseButton.color = "white"
  pauseButton.background = "grey"
  pauseButton.cornerRadius = 10
  pauseButton.onPointerUpObservable.add(function () {
    pauseSimulation()
  })
  panel.addControl(pauseButton)
}

function updateInfo() {
  // Update GUI text blocks
  positionText.text = `Position: x = ${aircraft.position.x.toFixed(2)}, y = ${aircraft.position.y.toFixed(2)}, z = ${aircraft.position.z.toFixed(2)}`


  velocityText.text = `Speed:  = ${(((velocity.x**2 + velocity.y**2 + velocity.z**2)**0.5)*3.6).toFixed(0) } Km/h, VSI = ${velocity.y.toFixed(1)} m/s`


  forceText.text = `Force: fx = ${forceGlobalX.toFixed(2)} N, fy = ${forceGlobalX.toFixed(2)} N, fz = ${forceGlobalX.toFixed(2)} N`
  angularVelocityText.text = `Angular Velocity: wx = ${angularVelocity.x.toFixed(2)} rad/s, wy = ${angularVelocity.y.toFixed(2)} rad/s, wz = ${angularVelocity.z.toFixed(2)} rad/s`
  //momentText.text = `Moment: mx = ${momentX.toFixed(2)} Nm, my = ${momentY.toFixed(2)} Nm, mz = ${momentZ.toFixed(2)} Nm`
  timeText.text = `Time: ${elapsedTime.toFixed(2)} s`

  alphaText.text = `Alpha: ${rad2deg(alpha_RAD).toFixed(2)}`
  betaText.text = `Beta: ${rad2deg(beta_RAD).toFixed(2)}`



  // Update joystick input display with input channel numbers
  const axesInfo = joystickAxes.map((value, index) => `[${index}]: ${value.toFixed(2)}`).join(", ")
  const buttonsInfo = joystickButtons.map((value, index) => `[${index}]: ${value}`).join(", ")

  joystickText.text = `Joystick Inputs:
Axes: ${axesInfo}
Buttons: ${buttonsInfo}`
}

function pauseSimulation() {
  isPaused = !isPaused
  pauseButton.textBlock.text = isPaused ? "Resume Simulation" : "Pause Simulation"
  if (!isPaused) {
    // Reset lastFrameTime to prevent large deltaTime
    lastFrameTime = Date.now()
    timeSinceLastUpdate = 0
  }
}











