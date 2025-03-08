/**
 * Creates and configures a text block with improved readability.
 * @param {string} color - Color of the text.
 * @returns {BABYLON.GUI.TextBlock} Configured text block.
 */
function createStyledTextBlock(color = "white") {
  const textBlock = new BABYLON.GUI.TextBlock();
  textBlock.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
  textBlock.resizeToFit = true;
  textBlock.width = "100%";
  textBlock.color = color;
  textBlock.fontSize = 18;
  textBlock.fontFamily = "Arial";
  textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  // Add a subtle shadow for better contrast.
  textBlock.shadowColor = "black";
  textBlock.shadowBlur = 0;
  textBlock.shadowOffsetX = 1;
  textBlock.shadowOffsetY = 1;
  return textBlock;
}

/**
 * Creates the main GUI interface.
 */
function createGUI() {
  // Create the fullscreen UI texture.
  advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  // Create the main container panel.
  const mainPanel = new BABYLON.GUI.StackPanel();
  mainPanel.width = "350px";
  mainPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  mainPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  mainPanel.padding = "20px";
  mainPanel.spacing = 8;
  mainPanel.background = "rgba(44, 62, 80, 0.8)";
  advancedTexture.addControl(mainPanel);

  // Create a small toggle button to hide/show the panel.
  createPanelToggleButton(advancedTexture, mainPanel);

  // Create header text.
  const headerText = createStyledTextBlock("white");
  headerText.text = "Flight Data";
  headerText.fontSize = 24;
  headerText.fontWeight = "bold";
  headerText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  mainPanel.addControl(headerText);

  // Create information text blocks.
  positionText = createStyledTextBlock();
  velocityText = createStyledTextBlock();
  timeText = createStyledTextBlock();
  alpha_beta_Text = createStyledTextBlock();
  joystickText = createStyledTextBlock();
  joystickText.fontSize = 16; // Slightly smaller for compactness

  [positionText, velocityText, timeText, alpha_beta_Text, joystickText].forEach(text => {
    mainPanel.addControl(text);
  });

  // Create a horizontal container for the buttons.
  const buttonRow = new BABYLON.GUI.StackPanel();
  buttonRow.isVertical = false;
  buttonRow.width = "100%";
  buttonRow.height = "50px"; // Explicit height to ensure the container is visible
  buttonRow.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  buttonRow.spacing = 10;
  // (Optional: set a temporary background to verify visibility)
  // buttonRow.background = "rgba(255,0,0,0.1)";
  mainPanel.addControl(buttonRow);

  // Create the file load and pause buttons (smaller).
  const fileLoadBtn = createFileLoadButton();
  pauseButton = createPauseButton(); // Global variable used in pauseSimulation.
  buttonRow.addControl(fileLoadBtn);
  buttonRow.addControl(pauseButton);
}

/**
 * Creates a small toggle button in the top-left corner that hides/shows the main panel.
 * @param {BABYLON.GUI.AdvancedDynamicTexture} advancedTexture - The main UI texture.
 * @param {BABYLON.GUI.StackPanel} mainPanel - The main panel to toggle.
 */
function createPanelToggleButton(advancedTexture, mainPanel) {
  const toggleButton = BABYLON.GUI.Button.CreateSimpleButton("toggleButton", "");
  toggleButton.width = "20px";
  toggleButton.height = "20px";
  toggleButton.color = "white";
  toggleButton.fontSize = 14;
  toggleButton.cornerRadius = 15;
  toggleButton.background = "lightblue";
  toggleButton.thickness = 1;
  toggleButton.hoverCursor = "pointer";
  toggleButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  toggleButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  toggleButton.left = "5px";
  toggleButton.top = "5px";

  let panelVisible = true;
  toggleButton.onPointerUpObservable.add(() => {
    panelVisible = !panelVisible;
    mainPanel.isVisible = panelVisible;
  });

  advancedTexture.addControl(toggleButton);
}

/**
 * Creates and returns a button to load .glb files by triggering a hidden HTML <input type="file"> element.
 * @returns {BABYLON.GUI.Button} The file load button.
 */
function createFileLoadButton() {
  const fileLoadButton = BABYLON.GUI.Button.CreateSimpleButton("fileLoadButton", "Load Aircraft (.glb)");
  fileLoadButton.width = "120px";
  fileLoadButton.height = "40px";
  fileLoadButton.color = "white";
  fileLoadButton.fontSize = 16;
  fileLoadButton.cornerRadius = 10;
  fileLoadButton.thickness = 2;
  fileLoadButton.background = "#6C757D";
  fileLoadButton.hoverCursor = "pointer";

  fileLoadButton.onPointerEnterObservable.add(() => {
    fileLoadButton.background = "#5a6268";
  });
  fileLoadButton.onPointerOutObservable.add(() => {
    fileLoadButton.background = "#6C757D";
  });

  fileLoadButton.onPointerUpObservable.add(() => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    } else {
      console.error("fileInput element not found in the DOM!");
    }
  });

  // Setup file input event listener.
  const fileInput = document.getElementById("fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log("Selected .glb file:", file.name);
        // TODO: Load the .glb file into Babylon.
      }
    });
  }

  return fileLoadButton;
}

/**
 * Creates and returns a pause button.
 * @returns {BABYLON.GUI.Button} The pause button.
 */
function createPauseButton() {
  const pauseBtn = BABYLON.GUI.Button.CreateSimpleButton("pauseButton", "Pause Simulation");
  pauseBtn.width = "120px";
  pauseBtn.height = "40px";
  pauseBtn.color = "white";
  pauseBtn.fontSize = 16;
  pauseBtn.cornerRadius = 10;
  pauseBtn.thickness = 2;
  // Set initial background to green (for "Pause Simulation")
  pauseBtn.background = "#4CAF50";
  pauseBtn.hoverCursor = "pointer";
  
  // Apply hover effects only if the button text is "Pause Simulation"
  pauseBtn.onPointerEnterObservable.add(() => {
    if (pauseBtn.textBlock.text === "Pause Simulation") {
      pauseBtn.background = "#45a049";
    }
  });
  pauseBtn.onPointerOutObservable.add(() => {
    if (pauseBtn.textBlock.text === "Pause Simulation") {
      pauseBtn.background = "#4CAF50";
    }
  });
  
  pauseBtn.onPointerUpObservable.add(pauseSimulation);
  return pauseBtn;
}

/**
 * Updates all GUI information elements with compact, formatted text.
 */
function updateInfo() {
  // Update location and altitude on separate lines.
  positionText.text =
    `Location: N:${(-aircraft.position.z).toFixed(0)} | E:${(-aircraft.position.x).toFixed(0)}\nAlt: ${(3.2808399 * aircraft.position.y).toFixed(0)} ft / ${aircraft.position.y.toFixed(0)} m`;

  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  // Separate lines for speed and vertical speed.
  velocityText.text =
    `Speed: ${(speed * 1.94384449).toFixed(0)} kt / ${(speed * 3.6).toFixed(0)} km/h / ${speed.toFixed(0)} m/s\nVario: ${velocity.y.toFixed(1)} m/s`;

  timeText.text = `Flight time: ${elapsedTime.toFixed(1)} s`;

  alpha_beta_Text.text = `α: ${rad2deg(alpha_RAD).toFixed(1)}°  β: ${rad2deg(beta_RAD).toFixed(1)}°`;

  // Update controls information.
  joystickText.text = `Controls: ${joystickAxes.map(v => v.toFixed(2)).join(", ")}`;
}

/**
 * Toggles the simulation pause state.
 */
function pauseSimulation() {
  isPaused = !isPaused;
  // Update the button text and background color.
  pauseButton.textBlock.text = isPaused ? "Resume Simulation" : "Pause Simulation";
  pauseButton.background = isPaused ? "#f44336" : "#4CAF50";

  if (!isPaused) {
    lastFrameTime = Date.now();
    timeSinceLastUpdate = 0;
  }
}
