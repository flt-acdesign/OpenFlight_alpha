/*************************************************************
 * 3.1_🕹_joystick_gamepad.js
 * 
 * Allows:
 *   1) Keyboard controls for flight:
 *       - Arrows => pitch/roll
 *       - Z / X => yaw
 *       - 0..9 => thrust level
 *       - R => reset (reload)
 *       - Space => pause/resume
 *       - U / I / O / P => camera selection
 *   2) Gamepad/joystick controls for:
 *       - pitch/roll/yaw/thrust (optional)
 *       - camera selection (face buttons)
 *       - reset (some button)
 *       - pause/resume (start/pause button)
 *   3) Updated "FLIGHT CONTROLS" pop-up in pause mode 
 *      to reflect these mappings.
 *************************************************************/

// This function is missing but called in the main render loop
// We can create it by calling the existing handleGamepadPause function
function handleGamepadPauseControls() {
  // Check if the handleGamepadPause function exists
  if (typeof handleGamepadPause === 'function') {
      handleGamepadPause();
  } else {
      // Fallback implementation if the function doesn't exist
      const valid = getValidGamepad();
      if (!valid) return;
      const { gamepad, type } = valid;

      // Check buttons 8 and 9 (common pause buttons)
      const checkButtons = [8, 9]; 
      
      checkButtons.forEach((btnIndex) => {
          if (gamepad.buttons[btnIndex] && gamepad.buttons[btnIndex].pressed) {
              // Only toggle pause if not already toggled recently
              if (
                !window.lastPauseToggleTime ||
                Date.now() - window.lastPauseToggleTime > 500
              ) {
                  if (typeof pauseSimulation === 'function') {
                      pauseSimulation();
                      window.lastPauseToggleTime = Date.now();
                  }
              }
          }
      });
  }
}

// Track last state of gamepad buttons to detect "just pressed" events
// (This is a simple version of what might already exist in the codebase)
let keyToggled = {};

// ------------------------------------------------------------
// 1) Detect Controller Type
// ------------------------------------------------------------
function detectControllerType(gamepad) {
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
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  const gamepad = Array.from(gps).find(gp => gp);
  if (gamepad) {
    const type = detectControllerType(gamepad);
    if (['XBOX','PLAYSTATION','GENERIC','JOYSTICK'].includes(type)) {
      return { gamepad, type };
    }
  }
  return null;
}

// ------------------------------------------------------------
// 2) Keyboard State & Pause Toggle
// ------------------------------------------------------------
const keysPressed = {};
window.addEventListener('keydown', (event) => {
  // Prevent repeated pause toggles if key is held
  if (event.code === 'Space' && !event.repeat) {
    if (typeof pauseSimulation === 'function') {
      pauseSimulation();
    }
  }
  // Mark pressed
  keysPressed[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keysPressed[event.code] = false;
});

// ------------------------------------------------------------
// 3) Keyboard Flight Controls
//    (Arrows => pitch/roll, Z/X => yaw, 0..9 => thrust, 
//     R => reload, Space => pause, U/I/O/P => camera.)
// ------------------------------------------------------------
function handleKeyboardControls(scene) {
  // Reset flight demands each frame
  roll_demand = 0;
  pitch_demand = 0;
  yaw_demand = 0;

  // A) Pitch/roll => arrow keys
  //    (They control flight, not camera.)
  if (keysPressed['ArrowUp']) {
    pitch_demand = -0.8; 
  }
  if (keysPressed['ArrowDown']) {
    pitch_demand = 0.8;
  }
  if (keysPressed['ArrowLeft']) {
    roll_demand = 0.8;
  }
  if (keysPressed['ArrowRight']) {
    roll_demand = -0.8;
  }

  // B) Yaw => Z / X
  if (keysPressed['KeyZ']) {
    yaw_demand = -0.8;
  }
  if (keysPressed['KeyX']) {
    yaw_demand = 0.8;
  }

  // C) Thrust => digits 0..9 => 0%..90%
  //    0 => 0.0, 1 => 0.1, ... 9 => 0.9
  for (let digit = 0; digit <= 9; digit++) {
    if (keysPressed[`Digit${digit}`]) {
      thrust_setting_demand = digit * 0.1;
    }
  }

  // D) Reload => R
  if (keysPressed['KeyR']) {
    location.reload();
  }

  // E) Camera selection => U/I/O/P => setActiveCamera(0..3)
  if (keysPressed['KeyU']) {
    setActiveCamera(0, scene);
  }
  if (keysPressed['KeyI']) {
    setActiveCamera(1, scene);
  }
  if (keysPressed['KeyO']) {
    setActiveCamera(2, scene);
  }
  if (keysPressed['KeyP']) {
    setActiveCamera(3, scene);
  }
}

// ------------------------------------------------------------
// 4) One-press detection for gamepad buttons (to detect toggles)
// ------------------------------------------------------------
let previousButtonStates = {};
function isButtonJustPressed(gamepad, buttonIndex) {
  const pressedNow = gamepad.buttons[buttonIndex]?.value === 1;
  const wasPressed = previousButtonStates[`${gamepad.index}-${buttonIndex}`] === true;
  previousButtonStates[`${gamepad.index}-${buttonIndex}`] = pressedNow;
  return (pressedNow && !wasPressed);
}

// ------------------------------------------------------------
// 5) Handle gamepad pause/resume (works even if paused)
// ------------------------------------------------------------
function handleGamepadPause() {
  const valid = getValidGamepad();
  if (!valid) return;
  const { gamepad, type } = valid;

  // Button mappings based on controller type (from the second code)
  if (type === 'XBOX') {
    // XBOX => button 8 for pause
    if (isButtonJustPressed(gamepad, 8)) {
      pauseSimulation();
    }
  } else if (type === 'PLAYSTATION' || type === 'GENERIC') {
    // PLAYSTATION/GENERIC => button 10 for pause
    if (isButtonJustPressed(gamepad, 10)) {
      pauseSimulation();
    }
  } else if (type === 'JOYSTICK') {
    // JOYSTICK => button 11 for pause (from second code)
    if (isButtonJustPressed(gamepad, 11)) {
      pauseSimulation();
    }
  } else {
    // Fallback to general buttons for pause (from first code)
    const checkButtons = [8, 9];
    checkButtons.forEach((btnIndex) => {
      if (isButtonJustPressed(gamepad, btnIndex)) {
        pauseSimulation();
      }
    });
  }
}

// ------------------------------------------------------------
// 6) If you want gamepad flight controls & camera selection
//    in addition to keyboard
// ------------------------------------------------------------
function handleGamepadFlightAndCamera(scene) {
  const valid = getValidGamepad();
  if (!valid) {
    // fallback to keyboard only
    handleKeyboardControls(scene);
    return;
  }
  const { gamepad, type } = valid;
  const axes = gamepad.axes;
  const buttons = gamepad.buttons;
  joystickAxes = Array.from(axes); // optional display

  // Handle controls based on controller type
  if (type === 'XBOX') {
    // XBOX Mapping
    thrust_setting_demand = (-axes[1] + 1) / 2; // Left stick vertical
    roll_demand = -axes[2];                   // Right stick horizontal
    pitch_demand = axes[3];                   // Right stick vertical
    yaw_demand = axes[0];                     // Left stick horizontal

    // Camera selection via face buttons
    if (isButtonJustPressed(gamepad, 0)) setActiveCamera(0, scene); // external
    if (isButtonJustPressed(gamepad, 1)) setActiveCamera(1, scene); // chase
    if (isButtonJustPressed(gamepad, 2)) setActiveCamera(3, scene); // wing
    if (isButtonJustPressed(gamepad, 3)) setActiveCamera(2, scene); // cockpit

    // Reload => button 9 (from second code)
    if (isButtonJustPressed(gamepad, 9)) {
      location.reload();
    }

  } else if (type === 'PLAYSTATION' || type === 'GENERIC') {
    // PLAYSTATION/GENERIC Mapping
    thrust_setting_demand = -axes[2];
    roll_demand  = -axes[0];
    pitch_demand = axes[1];
    yaw_demand   = axes[5];

    // Camera selection
    if (isButtonJustPressed(gamepad, 0)) setActiveCamera(0, scene);
    if (isButtonJustPressed(gamepad, 3)) setActiveCamera(1, scene);
    if (isButtonJustPressed(gamepad, 1)) setActiveCamera(2, scene);
    
    // Additional camera from axes
    if (axes[9] === -1.0) setActiveCamera(3, scene);

    // Reload => button 11 (from second code)
    if (isButtonJustPressed(gamepad, 11)) {
      location.reload();
    }

  } else if (type === 'JOYSTICK') {
    // JOYSTICK Mapping
    roll_demand = -axes[0] || 0;
    pitch_demand = axes[1] || 0;
    thrust_setting_demand = axes[2] !== undefined ? (-axes[2] + 1) / 2 : 0;
    yaw_demand = axes.length > 3 ? axes[5] : 0;

    // Camera selection
    if (isButtonJustPressed(gamepad, 0)) setActiveCamera(2, scene);
    if (isButtonJustPressed(gamepad, 1)) setActiveCamera(1, scene);
    if (isButtonJustPressed(gamepad, 3)) setActiveCamera(3, scene);
    if (axes[9] === -1) setActiveCamera(0, scene);

    // Reload => button 10 (from second code)
    if (isButtonJustPressed(gamepad, 10)) {
      location.reload();
    }
  } else {
    // Default mapping if type not recognized
    roll_demand = -(axes[2] || 0);  // right stick horizontal
    pitch_demand = (axes[3] || 0);  // right stick vertical
    yaw_demand = (axes[0] || 0);    // left stick horizontal
    thrust_setting_demand = (-axes[1] + 1) / 2; 

    // Default camera selection
    for (let camBtn = 0; camBtn < 4; camBtn++) {
      if (isButtonJustPressed(gamepad, camBtn)) {
        setActiveCamera(camBtn, scene);
      }
    }

    // Default reload button from first code
    if (isButtonJustPressed(gamepad, 11)) {
      location.reload();
    }
  }
}

// ------------------------------------------------------------
// 7) Master update function
//    Called each frame by your main render loop
// ------------------------------------------------------------
function updateForcesFromJoystickOrKeyboard(scene) {
  // Always let the gamepad check pause
  handleGamepadPause();

  if (isPaused) {
    // If paused, skip flight controls
    return;
  }

  // If you want gamepad flight control & camera selection,
  // call handleGamepadFlightAndCamera(scene).
  // Otherwise, just call handleKeyboardControls(scene).
  handleGamepadFlightAndCamera(scene);
}