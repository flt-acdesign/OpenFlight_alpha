// ------------------------------------------------------------
// GUI Creation Functions
// ------------------------------------------------------------

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

// FPS calculation variables
let fpsArray = [];
const maxFpsArrayLength = 60;
let lastFpsUpdateTime = performance.now();
// GUI elements declared globally in initializations.js are assigned here:
// let fpsText, alpha_beta_Text;

/**
 * Calculates current FPS based on recent frame times
 */
function calculateFPS() {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastFpsUpdateTime;
  lastFpsUpdateTime = currentTime;

  fpsArray.push(deltaTime);
  if (fpsArray.length > maxFpsArrayLength) {
    fpsArray.shift();
  }

  const averageFrameTime = fpsArray.reduce((sum, time) => sum + time, 0) / fpsArray.length;
  // Avoid division by zero if array is empty
  return averageFrameTime > 0 ? Math.round(1000 / averageFrameTime) : 0;
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

  // Create information text blocks and assign to global variables
  positionText = createStyledTextBlock();
  velocityText = createStyledTextBlock();
  timeText = createStyledTextBlock();
  alpha_beta_Text = createStyledTextBlock(); // Assign created block
  joystickText = createStyledTextBlock();
  fpsText = createStyledTextBlock("#00ff00"); // Assign created block
  joystickText.fontSize = 16; // Slightly smaller for compactness

  [positionText, velocityText, timeText, alpha_beta_Text, joystickText, fpsText].forEach(text => {
    if (text) mainPanel.addControl(text); // Add check just in case
  });

  // Create a horizontal container for the buttons.
  const buttonRow = new BABYLON.GUI.StackPanel();
  buttonRow.isVertical = false;
  buttonRow.width = "100%";
  buttonRow.height = "50px"; // Explicit height to ensure the container is visible
  buttonRow.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  buttonRow.spacing = 10;
  mainPanel.addControl(buttonRow);

  // Create the file load and pause buttons (smaller).
  const fileLoadBtn = createFileLoadButton();
  pauseButton = createPauseButton(); // Assign to global variable
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

  // Action: Trigger the hidden file input when the GUI button is clicked.
  fileLoadButton.onPointerUpObservable.add(() => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click(); // Programmatically click the hidden input
    } else {
      console.error("fileInput element not found in the DOM!");
    }
  });

  // Note: The actual 'change' event listener for fileInput is expected
  // to be set up in 4.3_🔼_import_parameters_for_glb_aircraft.js

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

  pauseBtn.onPointerEnterObservable.add(() => {
    // Check if textBlock exists before accessing text
    if (pauseBtn.textBlock && pauseBtn.textBlock.text === "Pause Simulation") {
      pauseBtn.background = "#45a049";
    }
  });
  pauseBtn.onPointerOutObservable.add(() => {
     // Check if textBlock exists before accessing text
    if (pauseBtn.textBlock && pauseBtn.textBlock.text === "Pause Simulation") {
      pauseBtn.background = "#4CAF50";
    }
  });

  // Ensure pauseSimulation function exists before adding listener
  if (typeof pauseSimulation === 'function') {
      pauseBtn.onPointerUpObservable.add(pauseSimulation);
  } else {
      console.error("pauseSimulation function not found for pause button.");
  }
  return pauseBtn;
}

/**
 * Updates all GUI information elements with compact, formatted text.
 */
function updateInfo() {
    // Check if aircraft and all text elements are initialized
    if (!aircraft || !aircraft.position || !positionText || !velocityText || !timeText || !alpha_beta_Text || !joystickText || !fpsText) {
        // console.warn("updateInfo: Aircraft or GUI text elements not ready."); // Avoid spamming
        return;
    }

  // Update location and altitude on separate lines.
  positionText.text =
    `Location: N:${(-aircraft.position.z).toFixed(0)} | E:${(-aircraft.position.x).toFixed(0)}\nAlt: ${(3.2808399 * aircraft.position.y).toFixed(0)} ft / ${aircraft.position.y.toFixed(0)} m`;

  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  // Separate lines for speed and vertical speed.
  velocityText.text =
    `Speed: ${(speed * 1.94384449).toFixed(0)} kt / ${(speed * 3.6).toFixed(0)} km/h / ${speed.toFixed(0)} m/s\nVario: ${velocity.y.toFixed(1)} m/s`;

  // *** Uses window.serverElapsedTime set by server communication script ***
  timeText.text = `Flight time: ${(window.serverElapsedTime || 0).toFixed(1)} s`;

  // Ensure rad2deg is defined before calling
  if (typeof rad2deg === 'function') {
      alpha_beta_Text.text = `α: ${rad2deg(alpha_RAD).toFixed(1)}°  β: ${rad2deg(beta_RAD).toFixed(1)}°`;
  } else {
      alpha_beta_Text.text = `α: N/A β: N/A`; // Fallback text
  }

  // Update controls information (make sure joystickAxes is updated elsewhere)
  joystickText.text = `Controls: ${joystickAxes.map(v => v.toFixed(2)).join(", ")}`;

  // Update FPS counter
  const currentFPS = calculateFPS();
  fpsText.text = `FPS: ${currentFPS}`;

  // Change color based on FPS
  if (currentFPS > 45) {
    fpsText.color = "#00ff00"; // Green for good performance
  } else if (currentFPS > 30) {
    fpsText.color = "#ffff00"; // Yellow for moderate performance
  } else {
    fpsText.color = "#ff0000"; // Red for poor performance
  }
}


// --- Helper function defined within GUI script scope ---
/**
 * Creates a row for the controls help panel.
 * @param {string} command - The control action text.
 * @param {string} keys - The corresponding keys/buttons text.
 * @returns {BABYLON.GUI.Grid} The created grid row.
 */
function createControlRow(command, keys) {
    const row = new BABYLON.GUI.Grid();
    row.addColumnDefinition(0.4); // Command takes 40%
    row.addColumnDefinition(0.6); // Keys take 60%
    row.height = "30px"; // Row height

    const cmdText = new BABYLON.GUI.TextBlock();
    cmdText.text = command;
    cmdText.color = "white";
    cmdText.fontSize = 21; // Font size
    cmdText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    const keysText = new BABYLON.GUI.TextBlock();
    keysText.text = keys;
    keysText.color = "#FFD700"; // Gold color for keys
    keysText.fontSize = 21; // Font size
    keysText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    row.addControl(cmdText, 0, 0);
    row.addControl(keysText, 0, 1);
    return row;
}
// --- End Helper Function ---


function pauseSimulation() {
  isPaused = !isPaused;
  console.log(`Simulation ${isPaused ? "paused" : "resumed"}`);

  // If you have a global "pauseButton" in your GUI, update it
  if (typeof pauseButton !== "undefined" && pauseButton && pauseButton.textBlock) {
    pauseButton.textBlock.text = isPaused ? "Resume" : "Pause Simulation";
    pauseButton.background = isPaused ? "#f44336" : "#4CAF50";
  }


  // On resume, reset timing to avoid large deltaTime spikes
  if (!isPaused) {
      lastUpdateTime = performance.now(); // Reset server communication timer
      lastFrameTime = Date.now(); // Reset any internal frame timing if used
      timeSinceLastUpdate = 0; // Reset any accumulated time
  }

  // Show/hide the "FLIGHT CONTROLS" help panel
  // Check if advancedTexture exists before creating GUI elements
  if (isPaused && typeof advancedTexture !== 'undefined' && advancedTexture) {
    if (!window.controlsHelp) {
      // Build the container for controls
      const controlsHelpRect = new BABYLON.GUI.Rectangle("controlsHelp");
      controlsHelpRect.width = "550px";
      controlsHelpRect.height = "820px"; // Adjusted height
      controlsHelpRect.cornerRadius = 10;
      controlsHelpRect.color = "white";
      controlsHelpRect.thickness = 2;
      controlsHelpRect.background = "rgba(0,0,0,0.85)";
      controlsHelpRect.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      controlsHelpRect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      controlsHelpRect.top = "20px";
      controlsHelpRect.left = "-20px";
      controlsHelpRect.zIndex = 100; // Ensure it's on top

      // Title bar
      const titleBar = new BABYLON.GUI.Rectangle("titleBar");
      titleBar.height = "60px";
      titleBar.background = "#4CAF50";
      titleBar.thickness = 0;
      titleBar.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

      const titleText = new BABYLON.GUI.TextBlock("titleText");
      titleText.text = "FLIGHT CONTROLS";
      titleText.color = "white";
      titleText.fontSize = 28;
      titleText.fontWeight = "bold";
      titleBar.addControl(titleText);

      // Main content panel
      const contentPanel = new BABYLON.GUI.StackPanel("contentPanel");
      contentPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      contentPanel.top = "80px"; // Position below title bar
      contentPanel.width = "500px";
      contentPanel.paddingLeft = "20px";
      contentPanel.paddingRight = "20px";
      contentPanel.spacing = 8;

      // KEYBOARD CONTROLS SECTION
      const keyboardTitle = new BABYLON.GUI.TextBlock("keyboardTitle");
      keyboardTitle.text = "KEYBOARD CONTROLS";
      keyboardTitle.color = "#4CAF50";
      keyboardTitle.fontSize = 23;
      keyboardTitle.height = "30px";
      keyboardTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      contentPanel.addControl(keyboardTitle);


      // --- Keyboard rows (Reflecting current setup) ---
      contentPanel.addControl(createControlRow("Pitch Up/Down:", "A / Q"));
      contentPanel.addControl(createControlRow("Roll Left/Right:", "O / P"));
      contentPanel.addControl(createControlRow("Yaw Left/Right:", "K / L"));
      contentPanel.addControl(createControlRow("Camera Select:", "I / U / Y / T"));
      contentPanel.addControl(createControlRow("Thrust Level:", "Keys 1..9"));
      contentPanel.addControl(createControlRow("Reload/Reset:", "R"));
      contentPanel.addControl(createControlRow("Pause/Resume:", "Spacebar"));
      // --- END Keyboard rows ---


      // Add spacing between keyboard and gamepad sections
      const spacer = new BABYLON.GUI.Rectangle("spacer");
      spacer.height = "10px";
      spacer.thickness = 0;
      spacer.background = "transparent";
      contentPanel.addControl(spacer);

      // GAMEPAD CONTROLS SECTION
      const gamepadSection = new BABYLON.GUI.Rectangle("gamepadSection");
      const gamepadRows = 5; // Update if adding/removing rows
      const gamepadRowHeight = 30;
      const gamepadTitleHeight = 40;
      const gamepadPadding = 20;
      const gamepadSpacing = 5 * (gamepadRows);
      gamepadSection.height = `${gamepadTitleHeight + (gamepadRows * gamepadRowHeight) + gamepadSpacing + gamepadPadding}px`;
      gamepadSection.background = "rgba(30, 30, 60, 0.5)";
      gamepadSection.thickness = 1;
      gamepadSection.color = "#4CAF50";
      gamepadSection.cornerRadius = 5;
      gamepadSection.paddingBottom = "10px";

      const gamepadPanel = new BABYLON.GUI.StackPanel("gamepadPanel");
      gamepadPanel.spacing = 5;
      gamepadPanel.paddingLeft = "10px";
      gamepadPanel.paddingRight = "10px";

      const gamepadTitle = new BABYLON.GUI.TextBlock("gamepadTitle");
      // --- MODIFIED Gamepad Title/Desc ---
      gamepadTitle.text = "GAMEPAD / JOYSTICK"; // More general title
      gamepadTitle.color = "#4CAF50";
      gamepadTitle.fontSize = 23;
      gamepadTitle.height = "40px";
      gamepadTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      gamepadTitle.paddingTop = "15px";
      gamepadPanel.addControl(gamepadTitle);

      // --- MODIFIED Gamepad Rows (More General) ---
      gamepadPanel.addControl(createControlRow("Pitch/Roll:", "Right Stick"));
      gamepadPanel.addControl(createControlRow("Yaw/Throttle:", "Left Stick / Turn Joystick"));
      gamepadPanel.addControl(createControlRow("Pause/Resume:", "Start/Options Button"));
      gamepadPanel.addControl(createControlRow("Camera Toggle:", "X, Y, A, B (Varies)"));
      gamepadPanel.addControl(createControlRow("Reload/Reset:", "Select/Back/Other (Varies)"));
      // --- END MODIFIED ---

      gamepadSection.addControl(gamepadPanel);
      contentPanel.addControl(gamepadSection);

      // Tip at the bottom
      const tipText = new BABYLON.GUI.TextBlock("tipText");
      tipText.text = "TIP: Mappings vary by controller type."; // Changed tip
      tipText.color = "#FFD700";
      tipText.fontSize = 18;
      tipText.height = "30px";
      tipText.paddingTop = "12px";
      contentPanel.addControl(tipText);

      // Dismiss (X) button
      const dismissButton = BABYLON.GUI.Button.CreateSimpleButton("dismissButton", "X");
      dismissButton.width = "50px";
      dismissButton.height = "50px";
      dismissButton.color = "white";
      dismissButton.fontSize = 21;
      dismissButton.background = "#f44336";
      dismissButton.cornerRadius = 25;
      dismissButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
      dismissButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      dismissButton.top = "10px";
      dismissButton.left = "-10px";
      dismissButton.zIndex = 101;
      dismissButton.onPointerDownObservable.add(() => {
        controlsHelpRect.isVisible = false;
      });

      // Add everything to the main container
      controlsHelpRect.addControl(titleBar);
      controlsHelpRect.addControl(contentPanel);
      controlsHelpRect.addControl(dismissButton);

      advancedTexture.addControl(controlsHelpRect);
      window.controlsHelp = controlsHelpRect; // Store reference

    } else if (window.controlsHelp) { // Only make visible if it exists
      window.controlsHelp.isVisible = true;
    }
  } else { // If not paused
    if (window.controlsHelp) { // Only hide if it exists
      window.controlsHelp.isVisible = false;
    }
  }
}