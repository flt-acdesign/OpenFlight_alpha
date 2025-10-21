// ------------------------------------------------------------
// gui/guiComponents.js
// Description: Generic, reusable GUI component functions.
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