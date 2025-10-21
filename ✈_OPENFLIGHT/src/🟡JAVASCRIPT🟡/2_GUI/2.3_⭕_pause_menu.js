// ------------------------------------------------------------
// gui/pauseMenu.js
// Description: Creates the 'FLIGHT CONTROLS' help panel.
// Relies on createControlRow from guiComponents.js
// ------------------------------------------------------------

/**
 * Creates the "FLIGHT CONTROLS" help panel.
 * This panel is stored on 'window.controlsHelp' for global access.
 * @param {BABYLON.GUI.AdvancedDynamicTexture} advancedTexture
 */
function createControlsHelpPanel(advancedTexture) {
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

  // Add spacing
  const spacer = new BABYLON.GUI.Rectangle("spacer");
  spacer.height = "10px";
  spacer.thickness = 0;
  spacer.background = "transparent";
  contentPanel.addControl(spacer);

  // GAMEPAD CONTROLS SECTION
  const gamepadSection = new BABYLON.GUI.Rectangle("gamepadSection");
  const gamepadRows = 5;
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
  gamepadTitle.text = "GAMEPAD / JOYSTICK";
  gamepadTitle.color = "#4CAF50";
  gamepadTitle.fontSize = 23;
  gamepadTitle.height = "40px";
  gamepadTitle.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  gamepadTitle.paddingTop = "15px";
  gamepadPanel.addControl(gamepadTitle);

  // --- Gamepad Rows ---
  gamepadPanel.addControl(createControlRow("Pitch/Roll:", "Right Stick"));
  gamepadPanel.addControl(createControlRow("Yaw/Throttle:", "Left Stick / Turn Joystick"));
  gamepadPanel.addControl(createControlRow("Pause/Resume:", "Start/Options Button"));
  gamepadPanel.addControl(createControlRow("Camera Toggle:", "X, Y, A, B (Varies)"));
  gamepadPanel.addControl(createControlRow("Reload/Reset:", "Select/Back/Other (Varies)"));
  // --- END Gamepad Rows ---

  gamepadSection.addControl(gamepadPanel);
  contentPanel.addControl(gamepadSection);

  // Tip at the bottom
  const tipText = new BABYLON.GUI.TextBlock("tipText");
  tipText.text = "TIP: Mappings vary by controller type.";
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
}