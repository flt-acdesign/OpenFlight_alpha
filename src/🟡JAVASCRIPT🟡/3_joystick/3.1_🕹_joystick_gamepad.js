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
    } else {
      return 'GENERIC';
    }
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
  
    // Thrust: W => increase thrust (negative in the original code), S => decrease
    if (keysPressed['KeyW']) {
      thrust_setting_demand = -0.5; // negative because original code used -1 * axis
    }
    if (keysPressed['KeyS']) {
      thrust_setting_demand = 0.5; // positive to reduce thrust
    }
  
    // Camera Switching:
    // 1 => external camera index 0
    if (keysPressed['Digit1']) {
      setActiveCamera(0, scene);
    }
    // 2 => chase camera index 1
    if (keysPressed['Digit2']) {
      setActiveCamera(1, scene);
    }
    // 3 => cockpit camera index 2
    if (keysPressed['Digit3']) {
      setActiveCamera(2, scene);
    }
    // 4 => wing camera index 3
    if (keysPressed['Digit4']) {
      setActiveCamera(3, scene);
    }
  
    // Reload: R => reload the page
    if (keysPressed['KeyR']) {
      location.reload();
    }
  
    // Pause: P => pause/resume simulation
    if (keysPressed['KeyP']) {
      pauseSimulation();
    }
  
    // Example: flaps/brakes/trims (optional)
    // if (keysPressed['KeyF']) { flaps_one_down = 1; }
    // if (keysPressed['Space']) { ground_brakes_on = 1; }
  }
  
  // ------------------------------------------------------------
  // 3) Main update function
  // ------------------------------------------------------------
  function updateForcesFromJoystickOrKeyboard(scene, gamepadIndex = 0) {
    const gamepads = navigator.getGamepads();
    const joystick = gamepads[gamepadIndex];
  
    // ----------------------------------------------------------
    // If a joystick/gamepad is detected
    // ----------------------------------------------------------
    if (joystick) {
      const type = detectControllerType(joystick);
      const axes = joystick.axes;
      const buttons = joystick.buttons;
  
      // XBOX Controller
      if (type === 'XBOX') {
        // Map axes
        thrust_setting_demand = -1 * axes[1]; // Left stick vertical
        roll_demand = -0.1 * axes[2];         // Right stick horizontal
        pitch_demand = 0.1 * axes[3];         // Right stick vertical
        yaw_demand = 0.1 * axes[0];          // Left stick horizontal
  
        // Buttons
        trim_nose_down   = buttons[12]?.value;
        trim_nose_up     = buttons[13]?.value;
        flaps_one_up     = buttons[5]?.value;
        flaps_one_down   = buttons[7]?.value;
        ground_brakes_on = buttons[4]?.value;
        air_brakes_on    = buttons[6]?.value;
  
        // “Start” => reload
        if (buttons[9]?.value === 1) {
          location.reload();
        }
        // Camera selection
        if (buttons[1]?.value === 1) { setActiveCamera(1, scene); } // chase
        if (buttons[0]?.value === 1) { setActiveCamera(0, scene); } // external
        if (buttons[3]?.value === 1) { setActiveCamera(2, scene); } // cockpit
        if (buttons[2]?.value === 1) { setActiveCamera(3, scene); } // wing
        // Camera rotate left/right
        if (buttons[14]?.value === 1) { rotateCamera_left(scene); }
        if (buttons[15]?.value === 1) { rotateCamera_right(scene); }
        // Pause
        if (buttons[8]?.value === 1) {
          pauseSimulation();
        }
      }
  
      // GENERIC Controller
      else {
        // Map axes
        thrust_setting_demand = -1 * axes[2]; // Possibly left stick vertical
        roll_demand = -0.1 * axes[0];
        pitch_demand = 0.1 * axes[1];
        yaw_demand = 0.1 * axes[5];
        thrust_balance = 0.1 * axes[6];       // Example usage
  
        // Buttons
        trim_nose_down   = buttons[6]?.value;
        trim_nose_up     = buttons[4]?.value;
        flaps_one_up     = buttons[8]?.value;
        flaps_one_down   = buttons[9]?.value;
        ground_brakes_on = buttons[7]?.value;
        air_brakes_on    = buttons[5]?.value;
  
        // “Start” => reload (button index 11?)
        if (buttons[11]?.value === 1) {
          // Reset it so it doesn’t keep reloading
          buttons[11].value = 0;
          location.reload();
        }
        // Camera selection
        if (buttons[3]?.value === 1) { setActiveCamera(1, scene); } // chase
        if (buttons[0]?.value === 1) { setActiveCamera(0, scene); } // external
        if (buttons[1]?.value === 1) { setActiveCamera(2, scene); } // cockpit
  
        // Axis-based camera triggers (example checks)
        if (axes[9] === -1.0) {
          setActiveCamera(3, scene); // wing
        }
        if (axes[9] === 0.71) {
          rotateCamera_left(scene);
        }
        if (axes[9] === -0.43) {
          rotateCamera_right(scene);
        }
  
        // Pause
        if (buttons[10]?.value === 1) {
          pauseSimulation();
        }
      }
    } 
    // ----------------------------------------------------------
    // Else: No gamepad => use keyboard
    // ----------------------------------------------------------
    else {
      handleKeyboardControls(scene);
    }
  }
  