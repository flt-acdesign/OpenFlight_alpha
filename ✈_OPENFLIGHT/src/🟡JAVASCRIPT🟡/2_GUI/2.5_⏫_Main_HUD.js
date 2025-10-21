// ------------------------------------------------------------
// gui/mainHud.js
// Description: Creates the main "Flight Data" HUD and
//              handles its per-frame updates.
// Relies on:
// - createStyledTextBlock from gui/guiComponents.js
// - pauseSimulation from simulation/simulationManager.js
// - calculateFPS from utils/fpsCalculator.js
// - Many global variables (advancedTexture, aircraft, velocity, etc.)
// ------------------------------------------------------------

/**
 * Creates the main GUI interface.
 */
function createGUI() {
  // Create the fullscreen UI texture.
  advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  // === G-Force Effect Overlay ===
  gForceOverlay = new BABYLON.GUI.Rectangle("gForceOverlay");
  gForceOverlay.width = "100%";
  gForceOverlay.height = "100%";
  gForceOverlay.thickness = 0;
  gForceOverlay.background = "black";
  gForceOverlay.alpha = 0;
  gForceOverlay.zIndex = -10;
  advancedTexture.addControl(gForceOverlay);
  // === END ===

  // Create the main container panel.
  const mainPanel = new BABYLON.GUI.StackPanel();
  mainPanel.width = "350px";
  mainPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  mainPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  mainPanel.padding = "20px";
  mainPanel.spacing = 8;
  mainPanel.background = "rgba(44, 62, 80, 0.8)";
  advancedTexture.addControl(mainPanel); // Add this *after* the overlay

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
  alpha_beta_Text = createStyledTextBlock();
  joystickText = createStyledTextBlock();
  fpsText = createStyledTextBlock("#00ff00");
  loadFactorText = createStyledTextBlock("#FFFFFF");
  joystickText.fontSize = 16;

  // Add all text blocks to the main panel
  [positionText, velocityText, timeText, alpha_beta_Text, loadFactorText, joystickText, fpsText].forEach(text => {
    if (text) mainPanel.addControl(text);
  });

  // Create a horizontal container for the buttons.
  const buttonRow = new BABYLON.GUI.StackPanel();
  buttonRow.isVertical = false;
  buttonRow.width = "100%";
  buttonRow.height = "50px";
  buttonRow.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
  buttonRow.spacing = 10;
  mainPanel.addControl(buttonRow);

  // Create the file load and pause buttons.
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
 * Creates and returns a button to load .glb files.
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
  pauseBtn.background = "#4CAF50";
  pauseBtn.hoverCursor = "pointer";

  pauseBtn.onPointerEnterObservable.add(() => {
    if (pauseBtn.textBlock && pauseBtn.textBlock.text === "Pause Simulation") {
      pauseBtn.background = "#45a049";
    }
  });
  pauseBtn.onPointerOutObservable.add(() => {
    if (pauseBtn.textBlock && pauseBtn.textBlock.text === "Pause Simulation") {
      pauseBtn.background = "#4CAF50";
    }
  });

  // This relies on pauseSimulation being in the global scope
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
  if (!aircraft || !aircraft.position || !positionText || !velocityText || !timeText || !alpha_beta_Text || !joystickText || !fpsText || !loadFactorText) {
    return;
  }

  positionText.text =
    `Location: N:${(-aircraft.position.z).toFixed(0)} | E:${(-aircraft.position.x).toFixed(0)}\nAlt: ${(3.2808399 * aircraft.position.y).toFixed(0)} ft / ${aircraft.position.y.toFixed(0)} m`;

  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
  velocityText.text =
    `Speed: ${(speed * 1.94384449).toFixed(0)} kt / ${(speed * 3.6).toFixed(0)} km/h / ${speed.toFixed(0)} m/s\nVario: ${velocity.y.toFixed(1)} m/s`;

  timeText.text = `Flight time: ${(window.serverElapsedTime || 0).toFixed(1)} s`;

  if (typeof rad2deg === 'function') {
    alpha_beta_Text.text = `α: ${rad2deg(alpha_RAD).toFixed(1)}°  β: ${rad2deg(beta_RAD).toFixed(1)}°`;
  } else {
    alpha_beta_Text.text = `α: N/A β: N/A`;
  }

  loadFactorText.text = `Load Factor (G): ${nz.toFixed(2)}`;
  joystickText.text = `Controls: ${joystickAxes.map(v => v.toFixed(2)).join(", ")}`;

  // Update FPS counter
  const currentFPS = calculateFPS();
  fpsText.text = `FPS: ${currentFPS}`;

  if (currentFPS > 45) {
    fpsText.color = "#00ff00";
  } else if (currentFPS > 30) {
    fpsText.color = "#ffff00";
  } else {
    fpsText.color = "#ff0000";
  }

  // === G-Force Overlay Logic using nz ===
  if (gForceOverlay) {
    const positiveGStart = 3.0;
    const positiveGMax = 9.0;
    const negativeGStart = -1.5;
    const negativeGMax = -3.0;
    const maxAlpha = 0.75;

    if (nz > positiveGStart) {
      let alpha = (nz - positiveGStart) / (positiveGMax - positiveGStart);
      alpha = Math.min(Math.max(alpha, 0), 1.0) * maxAlpha;
      gForceOverlay.background = "black";
      gForceOverlay.alpha = alpha;
    } else if (nz < negativeGStart) {
      let alpha = (nz - negativeGStart) / (negativeGMax - negativeGStart);
      alpha = Math.min(Math.max(alpha, 0), 1.0) * maxAlpha;
      gForceOverlay.background = "red";
      gForceOverlay.alpha = alpha;
    } else {
      gForceOverlay.alpha = 0;
    }
  }
  // === END ===
}