// ------------------------------------------------------------
// 1) Detect Controller Type
// ------------------------------------------------------------
function detectControllerType(gamepad) {
  // Lowercase the id for easier matching
  const id = gamepad.id.toLowerCase();

  // Check for known keywords.
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
    // If none of the expected keywords appear,
    // assume it’s a joystick (or at least a valid controller)
    return 'JOYSTICK';
  }
}

function getValidGamepad() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  
  // Find the first connected gamepad (or joystick)
  const gamepad = Array.from(gamepads).find(gp => gp);
  
  if (gamepad) {
    const type = detectControllerType(gamepad);
    // Accept all recognized types including JOYSTICK
    if (type === 'XBOX' || type === 'PLAYSTATION' || type === 'GENERIC' || type === 'JOYSTICK') {
      return { gamepad, type };
    }
  }
  
  return null;
}

// ------------------------------------------------------------
// 2) Keyboard State and Handlers
// ------------------------------------------------------------
const keysPressed = {};

// Listen for keyboard events.
window.addEventListener('keydown', (event) => {
  keysPressed[event.code] = true;
});
window.addEventListener('keyup', (event) => {
  keysPressed[event.code] = false;
});

// Example keyboard controls.
function handleKeyboardControls(scene) {
  // Reset demands each frame
  thrust_setting_demand = 0;
  roll_demand = 0;
  pitch_demand = 0;
  yaw_demand = 0;

  // Pitch: Up arrow (nose down), Down arrow (nose up)
  if (keysPressed['ArrowUp']) {
    pitch_demand = -0.2;
  }
  if (keysPressed['ArrowDown']) {
    pitch_demand = 0.2;
  }

  // Roll: Left arrow (roll left), Right arrow (roll right)
  if (keysPressed['ArrowLeft']) {
    roll_demand = -0.1;
  }
  if (keysPressed['ArrowRight']) {
    roll_demand = 0.1;
  }

  // Yaw: A (yaw left), D (yaw right)
  if (keysPressed['KeyA']) {
    yaw_demand = -0.1;
  }
  if (keysPressed['KeyD']) {
    yaw_demand = 0.1;
  }

  // Thrust: W (increase thrust), S (decrease thrust)
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
// 3) Main update function for Joystick/Keyboard
// ------------------------------------------------------------
function updateForcesFromJoystickOrKeyboard(scene) {
  const validGamepad = getValidGamepad();

  if (validGamepad) {
    const { gamepad, type } = validGamepad;
    const axes = gamepad.axes;
    const buttons = gamepad.buttons;

    // Capture the axes in a global array (if needed)
    joystickAxes = Array.from(axes);

    if (type === 'XBOX') {
      // XBOX Mapping
      thrust_setting_demand = (-axes[1] + 1) / 2; // Left stick vertical
      roll_demand = -axes[2];                   // Right stick horizontal
      pitch_demand = axes[3];                   // Right stick vertical
      yaw_demand = axes[0];                     // Left stick horizontal

      // Button mappings
      trim_nose_down   = buttons[12]?.value;
      trim_nose_up     = buttons[13]?.value;
      flaps_one_up     = buttons[5]?.value;
      flaps_one_down   = buttons[7]?.value;
      ground_brakes_on = buttons[4]?.value;
      air_brakes_on    = buttons[6]?.value;

      if (buttons[9]?.value === 1) location.reload();
      if (buttons[1]?.value === 1) setActiveCamera(1, scene); // chase
      if (buttons[0]?.value === 1) setActiveCamera(0, scene); // external
      if (buttons[3]?.value === 1) setActiveCamera(2, scene); // cockpit
      if (buttons[2]?.value === 1) setActiveCamera(3, scene); // wing
      if (buttons[14]?.value === 1) rotateCamera_left(scene);
      if (buttons[15]?.value === 1) rotateCamera_right(scene);
      if (buttons[8]?.value === 1) pauseSimulation();

    } else if (type === 'PLAYSTATION' || type === 'GENERIC') {
      // PLAYSTATION/GENERIC Mapping
      thrust_setting_demand = -axes[2];
      roll_demand  = -axes[0];
      pitch_demand = axes[1];
      yaw_demand   = axes[5];

      // Example additional axis
      thrust_balance = 0.1 * axes[6];

      // Button mappings
      trim_nose_down   = buttons[6]?.value;
      trim_nose_up     = buttons[4]?.value;
      flaps_one_up     = buttons[8]?.value;
      flaps_one_down   = buttons[9]?.value;
      ground_brakes_on = buttons[7]?.value;
      air_brakes_on    = buttons[5]?.value;

      if (buttons[11]?.value === 1) location.reload();
      if (buttons[3]?.value === 1) setActiveCamera(1, scene);
      if (buttons[0]?.value === 1) setActiveCamera(0, scene);
      if (buttons[1]?.value === 1) setActiveCamera(2, scene);

      if (axes[9] === -1.0)  setActiveCamera(3, scene);
      if (axes[9] ===  0.71) rotateCamera_left(scene);
      if (axes[9] === -0.43) rotateCamera_right(scene);

      if (buttons[10]?.value === 1) pauseSimulation();

    } else if (type === 'JOYSTICK') {
      // JOYSTICK Mapping
      // (Adjust the following axis indices and scaling as needed for your device.)
      roll_demand = - axes[0] || 0;
      pitch_demand = axes[1] || 0;
      // Convert throttle axis (assumed to be in the range -1 to 1) to 0 to 1:
      thrust_setting_demand = axes[2] !== undefined ? (-axes[2] + 1) / 2 : 0;
      // Use a twist axis for yaw if available; otherwise default to 0.
      yaw_demand = axes.length > 3 ? axes[5] : 0;

      // Example button mappings for a joystick:
      if (buttons[10]?.value === 1) location.reload();
      if (buttons[11]?.value === 1) pauseSimulation();
      if (axes[9] === -1) setActiveCamera(0, scene);


      if (buttons[0]?.value === 1) setActiveCamera(2, scene);
      if (buttons[1]?.value === 1) setActiveCamera(1, scene);
      if (buttons[3]?.value === 1) setActiveCamera(3, scene);
      // Add additional button mappings as needed.
    }
  } else {
    // No valid gamepad/joystick detected; fall back to keyboard controls.
    handleKeyboardControls(scene);
  }
}
