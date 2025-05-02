/*************************************************************
 * 3.1_🕹_joystick_gamepad.js
 *
 * Allows:
 * 1) Keyboard controls for flight: (Current Mappings)
 * - Pitch Up/Down:  A / Q
 * - Roll Left/Right: O / P
 * - Yaw Left/Right: K / L
 * - Camera Select:  I / U / Y / T
 * - Thrust Level:   0..9
 * - Reset (Reload): R
 * - Pause/Resume:   Space
 * 2) Gamepad/joystick controls for: (Original Mappings, XBOX pause/restart updated)
 * - pitch/roll/yaw/thrust (Varies by controller type)
 * - camera selection (Varies by controller type)
 * - reset (Varies by controller type - XBOX uses Button 9)
 * - pause/resume (Varies by controller type - XBOX uses Button 8)
 * 3) Updated "FLIGHT CONTROLS" pop-up in pause mode
 * to reflect these mappings.
 *************************************************************/

// --- Function called by Main Loop (6.1_...) ---
function handleGamepadPauseControls() {
  if (typeof handleGamepadPause === 'function') {
      handleGamepadPause();
  } else {
      console.warn("handleGamepadPause function not found when called by handleGamepadPauseControls.");
      const valid = getValidGamepad();
      if (!valid) return;
      const { gamepad } = valid;
      const checkButtons = [8, 9];
      checkButtons.forEach((btnIndex) => {
           if (gamepad && gamepad.buttons && gamepad.buttons[btnIndex] && gamepad.buttons[btnIndex].pressed) {
              if (typeof pauseSimulation === 'function') {
                   pauseSimulation();
              }
          }
      });
  }
}
// --- END Function called by Main Loop ---


// Track last state of gamepad buttons to detect "just pressed" events
let previousButtonStates = {};
let lastPauseToggleTime = 0; // Debounce timer for gamepad pause

// --- Gamepad Detection & Helper Functions ---

function detectControllerType(gamepad) {
if (!gamepad || !gamepad.id) return 'UNKNOWN';
const id = gamepad.id.toLowerCase();
if (id.includes('xbox') || id.includes('xinput')) {
  return 'XBOX';
} else if (
  id.includes('playstation') ||
  id.includes('ps4') ||
  id.includes('ps5') ||
  id.includes('dualshock')
) {
  return 'PLAYSTATION';
} else if (id.includes('gamepad')) {
  return 'GENERIC';
} else if (id.includes('joystick')) {
  return 'JOYSTICK';
} else {
  return 'JOYSTICK'; // fallback
}
}

function getValidGamepad() {
try {
    const gps = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = Array.from(gps).find(gp => gp && gp.connected);
    if (gamepad) {
      const type = detectControllerType(gamepad);
      return { gamepad, type };
    }
} catch (e) {
    console.error("Error accessing gamepads:", e);
}
return null;
}

function isButtonJustPressed(gamepad, buttonIndex) {
  if (!gamepad || !gamepad.buttons || buttonIndex < 0 || buttonIndex >= gamepad.buttons.length || !gamepad.buttons[buttonIndex]) {
      return false;
  }
  const button = gamepad.buttons[buttonIndex];
  const pressedNow = button.pressed || (typeof button.value === 'number' && button.value > 0.5);
  const buttonId = `${gamepad.index}-${buttonIndex}`;
  const wasPressed = previousButtonStates[buttonId] === true;
  previousButtonStates[buttonId] = pressedNow;
  return (pressedNow && !wasPressed);
}


// --- Keyboard State & Listeners ---
const keysPressed = {};
window.addEventListener('keydown', (event) => {
if (event.code === 'Space' && !event.repeat) {
  if (typeof pauseSimulation === 'function') {
    pauseSimulation();
  } else {
      console.warn("pauseSimulation function not found for spacebar.");
  }
}
keysPressed[event.code] = true;
});

window.addEventListener('keyup', (event) => {
keysPressed[event.code] = false;
});

// --- Keyboard Flight Controls (Current Mappings: A/Q, O/P, K/L, I/U/Y/T) ---
function handleKeyboardControls(scene) {
  // Reset flight demands each frame for axes controlled by non-latching keys
  roll_demand = 0;
  pitch_demand = 0;
  yaw_demand = 0;
  // Thrust is latching (set by number keys)

  // A) Pitch => A (Up) / Q (Down)
  if (keysPressed['KeyA']) pitch_demand =  0.8; // Pitch Up
  if (keysPressed['KeyQ']) pitch_demand = -0.8; // Pitch Down
  if (keysPressed['KeyA'] && keysPressed['KeyQ']) pitch_demand = 0; // Cancel opposing

  // B) Roll => O (Left) / P (Right)
  if (keysPressed['KeyO']) roll_demand =  0.8; // Roll Left
  if (keysPressed['KeyP']) roll_demand = -0.8; // Roll Right
  if (keysPressed['KeyO'] && keysPressed['KeyP']) roll_demand = 0; // Cancel opposing

  // C) Yaw => K (Left) / L (Right)
  if (keysPressed['KeyK']) yaw_demand = -0.8; // Yaw Left
  if (keysPressed['KeyL']) yaw_demand =  0.8; // Yaw Right
  if (keysPressed['KeyK'] && keysPressed['KeyL']) yaw_demand = 0; // Cancel opposing

  // D) Thrust => digits 0..9 => 0%..90%
  for (let digit = 0; digit <= 9; digit++) {
      if (keysPressed[`Digit${digit}`]) {
          thrust_setting_demand = digit * 0.1;
      }
  }

  // E) Reload => R
  if (keysPressed['KeyR']) {
      location.reload();
  }

  // F) Camera selection => I / U / Y / T
  if (typeof setActiveCamera === 'function') {
      if (keysPressed['KeyI'] && !previousButtonStates['KeyI']) setActiveCamera(0, scene); // Camera 1
      if (keysPressed['KeyU'] && !previousButtonStates['KeyU']) setActiveCamera(1, scene); // Camera 2
      if (keysPressed['KeyY'] && !previousButtonStates['KeyY']) setActiveCamera(2, scene); // Camera 3
      if (keysPressed['KeyT'] && !previousButtonStates['KeyT']) setActiveCamera(3, scene); // Camera 4

      // Update previous states for camera keys
      previousButtonStates['KeyI'] = keysPressed['KeyI'];
      previousButtonStates['KeyU'] = keysPressed['KeyU'];
      previousButtonStates['KeyY'] = keysPressed['KeyY'];
      previousButtonStates['KeyT'] = keysPressed['KeyT'];
  } else {
      // console.warn("setActiveCamera function not found.");
  }
}


// --- Gamepad Pause Handling (Called by handleGamepadPauseControls wrapper) ---
// Uses button 8 for XBOX pause, 9 for XBOX reload (in handleGamepadFlightAndCamera)
function handleGamepadPause() {
  const valid = getValidGamepad();
  if (!valid) return;
  const { gamepad, type } = valid;

  if (typeof pauseSimulation !== 'function') {
      console.warn("pauseSimulation function not available for gamepad.");
      return;
  }

  let pauseButtonPressed = false;
  let pauseButtonIndex = -1;

  // --- Pause Button Logic (XBOX uses Button 8, others as per original code) ---
  if (type === 'XBOX') {
      // *** MODIFIED: Use Button 8 (Back/Select) for Pause on XBOX ***
      if (isButtonJustPressed(gamepad, 8)) { pauseButtonPressed = true; pauseButtonIndex = 8; }
  } else if (type === 'PLAYSTATION' || type === 'GENERIC') {
      // Original code mentioned button 10 for pause.
      if (isButtonJustPressed(gamepad, 10)) { pauseButtonPressed = true; pauseButtonIndex = 10; }
  } else if (type === 'JOYSTICK') {
      // Original code mentioned button 11 for pause.
      if (isButtonJustPressed(gamepad, 11)) { pauseButtonPressed = true; pauseButtonIndex = 11; }
  } else { // Fallback if type is UNKNOWN (Matches original fallback)
      if (isButtonJustPressed(gamepad, 8)) { pauseButtonPressed = true; pauseButtonIndex = 8; }
      else if (isButtonJustPressed(gamepad, 9)) { pauseButtonPressed = true; pauseButtonIndex = 9; } // Start/Options as fallback pause
  }
  // --- END Pause Button Logic ---


  if (pauseButtonPressed) {
      const now = Date.now();
      if (now - lastPauseToggleTime > 500) { // 500ms debounce
          pauseSimulation();
          lastPauseToggleTime = now;
      }
  }
}

// --- Gamepad Flight Controls & Camera ---
function handleGamepadFlightAndCamera(scene) {
  const valid = getValidGamepad();
  if (!valid) {
      handleKeyboardControls(scene); // Use keyboard if no gamepad
      return;
  }

  // Gamepad is connected
  const { gamepad, type } = valid;
  const axes = gamepad.axes;
  joystickAxes = Array.from(axes); // Update global for GUI display

  // --- DEADZONE REMOVED --- Axis values are used directly

  // Reset demands - will be overwritten by gamepad axes
  roll_demand = 0;
  pitch_demand = 0;
  yaw_demand = 0;
  // Thrust is controlled by its axis

  const doSetActiveCamera = (idx, scn) => {
      if (typeof setActiveCamera === 'function') setActiveCamera(idx, scn);
  };

  // --- REVERTED GAMEPAD MAPPINGS (Matches original code) ---
  if (type === 'XBOX') {
      // Original XBOX Axis Mapping
      thrust_setting_demand = (-axes[1] + 1) / 2; // LS V -> Thrust
      roll_demand = -(axes[2] || 0);              // RS H -> Roll (Inverted?)
      pitch_demand = -(axes[3] || 0);             // RS V -> Pitch (Inverted)
      yaw_demand = -(axes[0] || 0);               // LS H -> Yaw (Inverted?)

      // Original XBOX Camera Mapping
      if (isButtonJustPressed(gamepad, 0)) doSetActiveCamera(0, scene); // A -> Cam 0
      if (isButtonJustPressed(gamepad, 1)) doSetActiveCamera(1, scene); // B -> Cam 1
      if (isButtonJustPressed(gamepad, 2)) doSetActiveCamera(3, scene); // X -> Cam 3 (Swap)
      if (isButtonJustPressed(gamepad, 3)) doSetActiveCamera(2, scene); // Y -> Cam 2 (Swap)

      // *** RELOAD: Uses Button 9 (Start) for XBOX ***
      if (isButtonJustPressed(gamepad, 9)) {
          location.reload();
      }

  } else if (type === 'PLAYSTATION' || type === 'GENERIC') {
      // Original PLAYSTATION/GENERIC Mapping
      thrust_setting_demand = -(axes[2] || 0); // Axis 2 -> Thrust?
      roll_demand  = -(axes[0] || 0);          // Axis 0 -> Roll
      pitch_demand = -(axes[1] || 0);          // Axis 1 -> Pitch
      yaw_demand   = -(axes[5] || 0);          // Axis 5 -> Yaw

      // Original Camera selection
      if (isButtonJustPressed(gamepad, 0)) doSetActiveCamera(0, scene); // Button 0 -> Cam 0
      if (isButtonJustPressed(gamepad, 3)) doSetActiveCamera(1, scene); // Button 3 -> Cam 1
      if (isButtonJustPressed(gamepad, 1)) doSetActiveCamera(2, scene); // Button 1 -> Cam 2
      if (axes[9] === -1.0) doSetActiveCamera(3, scene);                 // Axis 9 -> Cam 3

      // Original Reload => button 11
      if (isButtonJustPressed(gamepad, 11)) {
          location.reload();
      }

  } else if (type === 'JOYSTICK') {
      // Original JOYSTICK Mapping
      roll_demand = -(axes[0] || 0);      // Axis 0 -> Roll
      pitch_demand = -(axes[1] || 0);     // Axis 1 -> Pitch
      thrust_setting_demand = axes[2] !== undefined ? (-(axes[2] || 0) + 1) / 2 : 0; // Axis 2 -> Thrust
      yaw_demand = axes.length > 3 && axes[5] !== undefined ? -(axes[5] || 0) : 0;   // Axis 5 -> Yaw

      // Original Camera selection
      if (isButtonJustPressed(gamepad, 0)) doSetActiveCamera(2, scene); // Button 0 -> Cam 2
      if (isButtonJustPressed(gamepad, 1)) doSetActiveCamera(1, scene); // Button 1 -> Cam 1
      if (isButtonJustPressed(gamepad, 3)) doSetActiveCamera(3, scene); // Button 3 -> Cam 3
      if (axes[9] === -1) doSetActiveCamera(0, scene);                  // Axis 9 -> Cam 0

      // Original Reload => button 10
      if (isButtonJustPressed(gamepad, 10)) {
          location.reload();
      }
  } else { // Fallback for UNKNOWN type (Matches original fallback)
      roll_demand = -(axes[2] || 0);
      pitch_demand = -(axes[3] || 0);
      yaw_demand = -(axes[0] || 0);
      thrust_setting_demand = (-axes[1] + 1) / 2;

      // Default camera selection (Buttons 0-3 map directly)
      for (let camBtn = 0; camBtn < 4; camBtn++) {
          if (isButtonJustPressed(gamepad, camBtn)) {
              doSetActiveCamera(camBtn, scene);
          }
      }

      // Default reload button (Original used 11)
      if (isButtonJustPressed(gamepad, 11)) {
          location.reload();
      }
  }
  // --- END REVERTED GAMEPAD MAPPINGS ---
}


// ------------------------------------------------------------
// 7) Master update function
//    Called each frame by the main render loop (6.1_...)
// ------------------------------------------------------------
function updateForcesFromJoystickOrKeyboard(scene) {
  // Pause check is handled externally by handleGamepadPauseControls()

  if (typeof isPaused !== 'undefined' && isPaused) {
      return; // Skip controls if paused
  }

  // --- Clear Previous Button States for Disconnected Gamepads ---
  try {
      const connectedIndices = {};
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const gp of gps) {
          if (gp && gp.connected) {
              connectedIndices[gp.index] = true;
          }
      }
      for (const key in previousButtonStates) {
          if (key.includes('-')) { // Gamepad button state
              const index = parseInt(key.split('-')[0], 10);
              if (!isNaN(index) && !connectedIndices[index]) {
                  delete previousButtonStates[key];
              }
          } else { // Keyboard button state
               if (!keysPressed[key]) {
                   delete previousButtonStates[key];
               }
          }
      }
  } catch(e) {
      console.error("Error cleaning up button states:", e);
  }
  // --- End Cleanup ---

  // Handles EITHER gamepad OR keyboard controls internally.
  handleGamepadFlightAndCamera(scene);
}