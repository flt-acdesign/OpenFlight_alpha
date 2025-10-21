// ------------------------------------------------------------
// utils/fpsCalculator.js
// Description: Handles FPS calculation logic.
// ------------------------------------------------------------

// FPS calculation variables
let fpsArray = [];
const maxFpsArrayLength = 60;
let lastFpsUpdateTime = performance.now();

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