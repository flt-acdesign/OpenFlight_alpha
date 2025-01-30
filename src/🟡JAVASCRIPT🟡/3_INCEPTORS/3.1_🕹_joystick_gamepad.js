// ------------------------------------------------------------
// 1) Detect Controller Type
// ------------------------------------------------------------
function detectControllerType(gamepad) {
  // First check if it's a valid gaming device by ID
  if (!gamepad.id.toLowerCase().match(/(xbox|xinput|playstation|ps4|ps5|dualshock|gamepad)/)) {
    return 'INVALID';
  }

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
  } else {
    return 'GENERIC';
  }
}

function getValidGamepad() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  
  // Find first valid gaming controller
  const gamepad = Array.from(gamepads).find(gp => {
    if (!gp) return false;
    
    // Filter out non-gaming devices
    const type = detectControllerType(gp);
    return type !== 'INVALID';
  });

  if (gamepad) {
    const type = detectControllerType(gamepad);
    if (type === 'XBOX' || type === 'PLAYSTATION' || type === 'GENERIC') {
      return { gamepad, type };
    }
  }
  
  return null;
}

// ------------------------------------------------------------
// 2) Keyboard State and Handlers
// ------------------------------------------------------------
const keysPressed = {};

/**
 * Listen for keyboard events and store which keys are currently pressed.
 */
window.addEventListener('keydown', (event) => {
  keysPressed[event.code] = true;
});

window.addEventListener('keyup', (event) => {
  keysPressed[event.code] = false;
});

/**
 * Handle keyboard controls.
 * You can adjust values for pitch, roll, yaw, thrust, etc. as needed.
 */
function handleKeyboardControls(scene) {
  // Reset demands each frame
  thrust_setting_demand = 0;
  roll_demand = 0;
  pitch_demand = 0;
  yaw_demand = 0;

  // Example keyboard mappings:

  // Pitch: up arrow => nose down, down arrow => nose up
  if (keysPressed['ArrowUp']) {
    pitch_demand = -0.2;
  } 
  if (keysPressed['ArrowDown']) {
    pitch_demand = 0.2;
  }

  // Roll: left arrow => roll left, right arrow => roll right
  if (keysPressed['ArrowLeft']) {
    roll_demand = -0.1;
  } 
  if (keysPressed['ArrowRight']) {
    roll_demand = 0.1;
  }

  // Yaw: A => yaw left, D => yaw right
  if (keysPressed['KeyA']) {
    yaw_demand = -0.1;
  }
  if (keysPressed['KeyD']) {
    yaw_demand = 0.1;
  }

  // Thrust: W => increase thrust, S => decrease
  if (keysPressed['KeyW']) {
    thrust_setting_demand = -0.5;
  }
  if (keysPressed['KeyS']) {
    thrust_setting_demand = 0.5;
  }

  // Camera Switching:
  if (keysPressed['Digit1']) setActiveCamera(0, scene);
  if (keysPressed['Digit2']) setActiveCamera(1, scene);
  if (keysPressed['Digit3']) setActiveCamera(2, scene);
  if (keysPressed['Digit4']) setActiveCamera(3, scene);

  // Reload: R => reload the page
  if (keysPressed['KeyR']) location.reload();

  // Pause: P => pause/resume simulation
  if (keysPressed['KeyP']) pauseSimulation();
}

// ------------------------------------------------------------
// 3) Main update function
// ------------------------------------------------------------
function updateForcesFromJoystickOrKeyboard(scene) {
  const validGamepad = getValidGamepad();

  if (validGamepad) {
    const { gamepad, type } = validGamepad;
    const axes = gamepad.axes;
    const buttons = gamepad.buttons;

    // <-- IMPORTANT: Capture the axes in our global array
    joystickAxes = Array.from(axes);

    // XBOX Controller
    if (type === 'XBOX') {
      thrust_setting_demand = (-1 * axes[1] + 1) / 2; // Left stick vertical
      roll_demand = -1.0 * axes[2];                  // Right stick horizontal
      pitch_demand = 1.0 * axes[3];                  // Right stick vertical
      yaw_demand = 1.0 * axes[0];                    // Left stick horizontal

      // Buttons
      trim_nose_down = buttons[12]?.value;
      trim_nose_up   = buttons[13]?.value;
      flaps_one_up   = buttons[5]?.value;
      flaps_one_down = buttons[7]?.value;
      ground_brakes_on = buttons[4]?.value;
      air_brakes_on    = buttons[6]?.value;

      if (buttons[9]?.value  === 1) location.reload();
      if (buttons[1]?.value  === 1) setActiveCamera(1, scene); // chase
      if (buttons[0]?.value  === 1) setActiveCamera(0, scene); // external
      if (buttons[3]?.value  === 1) setActiveCamera(2, scene); // cockpit
      if (buttons[2]?.value  === 1) setActiveCamera(3, scene); // wing
      if (buttons[14]?.value === 1) rotateCamera_left(scene);
      if (buttons[15]?.value === 1) rotateCamera_right(scene);
      if (buttons[8]?.value  === 1) pauseSimulation();
    } 
    // PLAYSTATION/GENERIC controller (based on your detectControllerType)
    else {
      // Example: GENERIC usage
      thrust_setting_demand = -1 * axes[2];
      roll_demand  = -1.0 * axes[0];
      pitch_demand =  1.0 * axes[1];
      yaw_demand   =  1.0 * axes[5];

      // You can add or adjust demands for other axes here as needed
      thrust_balance = 0.1 * axes[6];

      // Buttons
      trim_nose_down = buttons[6]?.value;
      trim_nose_up   = buttons[4]?.value;
      flaps_one_up   = buttons[8]?.value;
      flaps_one_down = buttons[9]?.value;
      ground_brakes_on = buttons[7]?.value;
      air_brakes_on    = buttons[5]?.value;

      // Example camera and reload
      if (buttons[11]?.value === 1) location.reload();
      if (buttons[3]?.value  === 1) setActiveCamera(1, scene);
      if (buttons[0]?.value  === 1) setActiveCamera(0, scene);
      if (buttons[1]?.value  === 1) setActiveCamera(2, scene);

      if (axes[9] === -1.0)  setActiveCamera(3, scene);
      if (axes[9] ===  0.71) rotateCamera_left(scene);
      if (axes[9] === -0.43) rotateCamera_right(scene);

      if (buttons[10]?.value === 1) pauseSimulation();
    }
  } 
  // Fallback to keyboard if no valid gamepad
  else {
    handleKeyboardControls(scene);
  }
}