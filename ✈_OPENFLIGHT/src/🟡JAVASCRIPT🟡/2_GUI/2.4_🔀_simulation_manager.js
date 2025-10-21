// ------------------------------------------------------------
// simulation/simulationManager.js
// Description: Manages the simulation pause state.
// Relies on createControlsHelpPanel from gui/pauseMenu.js
// Relies on global vars: isPaused, pauseButton, advancedTexture, etc.
// ------------------------------------------------------------

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
      // It doesn't exist, so create it.
      createControlsHelpPanel(advancedTexture);
    }
    // Now that we're sure it exists, make it visible.
    window.controlsHelp.isVisible = true;

  } else { // If not paused
    if (window.controlsHelp) { // Only hide if it exists
      window.controlsHelp.isVisible = false;
    }
  }
}