/**
 * Creates and configures a text block with improved readability
 * @param {string} color - Color of the text
 * @returns {BABYLON.GUI.TextBlock} Configured text block
 */
function createStyledTextBlock(color = "white") {
  const textBlock = new BABYLON.GUI.TextBlock();
  // Automatically wrap and resize to avoid overlap
  textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
  textBlock.resizeToFit = true;

  // Match the width of the parent panel (minus padding)
  textBlock.width = "100%";

  // Basic text styling
  textBlock.color = color;
  textBlock.fontSize = 18;
  textBlock.fontFamily = "Arial";
  textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  // Add a subtle shadow for better contrast
  textBlock.shadowColor = "black";
  textBlock.shadowBlur = 0;
  textBlock.shadowOffsetX = 1;
  textBlock.shadowOffsetY = 1;

  return textBlock;
}

/**
* Creates the main GUI interface
*/
function createGUI() {
  // Create the fullscreen UI
  advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  // Create main container panel
  const mainPanel = new BABYLON.GUI.StackPanel();
  mainPanel.width = "350px"; // Increased width for larger text
  mainPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  mainPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  mainPanel.paddingTop = "20px";
  mainPanel.paddingLeft = "20px";
  mainPanel.paddingRight = "20px";
  mainPanel.paddingBottom = "20px";
  mainPanel.spacing = 8; // Increased spacing between elements
  mainPanel.background = "rgba(44, 62, 80, 0.8)"; // 80% translucency
  advancedTexture.addControl(mainPanel);

  // Create a button to toggle the panel's visibility
  createPanelToggleButton(advancedTexture, mainPanel);

  // Create header
  const headerText = createStyledTextBlock("white");
  headerText.text = "   Flight Information";
  headerText.fontSize = 24; // Larger header font
  headerText.fontWeight = "bold";
  mainPanel.addControl(headerText);

  // Create information text blocks
  positionText = createStyledTextBlock();
  velocityText = createStyledTextBlock();
  forceText = createStyledTextBlock();
  angularVelocityText = createStyledTextBlock();
  timeText = createStyledTextBlock();
  alphaText = createStyledTextBlock();
  betaText = createStyledTextBlock();

  // For joystick info, we can optionally keep a larger area if desired:
  joystickText = createStyledTextBlock();
  joystickText.fontSize = 16; // Slightly smaller, if you prefer

  // Add text blocks to panel
  [
    positionText,
    velocityText,
    forceText,
    angularVelocityText,
    timeText,
    alphaText,
    betaText,
    joystickText
  ].forEach(text => {
      mainPanel.addControl(text);
  });

  // Create pause button
  createPauseButton(mainPanel);
}

/**
* Creates a small toggle button in the top-left corner
* that hides/shows the main panel, with no text and a light blue color.
* @param {BABYLON.GUI.AdvancedDynamicTexture} advancedTexture - The main UI texture
* @param {BABYLON.GUI.StackPanel} mainPanel - The main panel to toggle
*/
function createPanelToggleButton(advancedTexture, mainPanel) {
  const toggleButton = BABYLON.GUI.Button.CreateSimpleButton("toggleButton", "");
  toggleButton.width = "30px";
  toggleButton.height = "30px";
  toggleButton.color = "white";
  toggleButton.fontSize = 14;
  toggleButton.cornerRadius = 15; // Make it rounder if you like
  toggleButton.background = "lightblue";
  toggleButton.thickness = 1;
  toggleButton.hoverCursor = "pointer";

  // Position the button at the top-left corner
  toggleButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  toggleButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  toggleButton.left = "10px";
  toggleButton.top = "10px";

  // Track panel visibility state
  let panelVisible = true;
  toggleButton.onPointerUpObservable.add(() => {
      panelVisible = !panelVisible;
      mainPanel.isVisible = panelVisible;
  });

  advancedTexture.addControl(toggleButton);
}

/**
* Creates and configures the pause button
* @param {BABYLON.GUI.StackPanel} panel - Panel to add the button to
*/
function createPauseButton(panel) {
  pauseButton = BABYLON.GUI.Button.CreateSimpleButton("pauseButton", "Pause Simulation");
  pauseButton.width = "250px"; // Wider button
  pauseButton.height = "50px"; // Taller button
  pauseButton.color = "white";
  pauseButton.fontSize = 20; // Larger button text
  pauseButton.cornerRadius = 10;
  pauseButton.thickness = 2;
  pauseButton.background = "#4CAF50";
  pauseButton.hoverCursor = "pointer";
  
  pauseButton.onPointerEnterObservable.add(() => {
      pauseButton.background = "#45a049";
  });
  pauseButton.onPointerOutObservable.add(() => {
      pauseButton.background = "#4CAF50";
  });
  
  pauseButton.onPointerUpObservable.add(pauseSimulation);
  panel.addControl(pauseButton);
}

/**
* Updates all GUI information elements with formatted text
*/
function updateInfo() {
  positionText.text = 
`X: ${aircraft.position.x.toFixed(1)}
Y: ${aircraft.position.y.toFixed(1)}
Z: ${aircraft.position.z.toFixed(1)}`;

  const speed = Math.sqrt(velocity.x**2 + velocity.y**2 + velocity.z**2);
  velocityText.text = 
`Speed: ${(speed * 3.6).toFixed(0)} km/h
Vertical Speed: ${velocity.y.toFixed(1)} m/s`;

  timeText.text = `Elapsed Time: ${elapsedTime.toFixed(1)} s`;
  alphaText.text = `Angle of Attack: ${rad2deg(alpha_RAD).toFixed(1)}°`;
  betaText.text = `Sideslip Angle: ${rad2deg(beta_RAD).toFixed(1)}°`;

  // Update joystick information
  updateJoystickInfo();
}

/**
* Updates joystick information display
*/
function updateJoystickInfo() {
  const joystickStatus = joystickAxes
      .map((value, index) => `Axis ${index}: ${value.toFixed(2)}`)
      .join('\n');
  joystickText.text = `Joystick Status:\n${joystickStatus}`;
}

/**
* Toggles simulation pause state
*/
function pauseSimulation() {
  isPaused = !isPaused;
  pauseButton.textBlock.text = isPaused ? "Resume Simulation" : "Pause Simulation";
  pauseButton.background = isPaused ? "#f44336" : "#4CAF50";

  if (!isPaused) {
      lastFrameTime = Date.now();
      timeSinceLastUpdate = 0;
  }
}
