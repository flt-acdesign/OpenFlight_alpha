// Global variables (adjust to your code structure as needed)
let joystickAxes = [];
let joystickButtons = [];
let thrust_setting_demand = 0;
let roll_demand = 0;
let pitch_demand = 0;
let yaw_demand = 0;

// For reference, pick a gamepadIndex to track if multiple gamepads are connected
let gamepadIndex = 0;

// Example function to update from joystick or keyboard
function updateForcesFromJoystickOrKeyboard(scene) {
    const gamepads = navigator.getGamepads();
    const joystick = gamepads[gamepadIndex]; // pick the first recognized or your chosen index

    // If no joystick is connected (or it’s null), you may want a fallback:
    if (!joystick) {
        // Fallback to keyboard or do nothing
        // e.g.: handleKeyboardInput();
        return;
    }

    // ---- Read the axes safely ----
    // Some devices might have fewer than 4 axes, so we default to 0 if an axis is missing.
    joystickAxes = joystick.axes.map((value) => value || 0);

    // Map axes to your control inputs
    // These mappings follow “standard” gamepad layout but will also work on a generic joystick,
    // though the physical joystick layout may differ.
    thrust_setting_demand   = -1 * (joystickAxes[1] || 0);   // Left stick vertical: invert sign
    roll_demand  = -0.1 * (joystickAxes[2] || 0); // Right stick horizontal
    pitch_demand =  0.1 * (joystickAxes[3] || 0); // Right stick vertical
    yaw_demand   =  0.1 * (joystickAxes[0] || 0); // Left stick horizontal

    // ---- Read the buttons safely ----
    // Convert pressed state into "1" or "0" for display/logging.
    // If a button doesn’t exist, we treat it as not pressed.
    joystickButtons = joystick.buttons.map((btn) => (btn?.pressed ? "1" : "0"));

    // ---- Example checks for certain buttons ----
    //   * On an Xbox controller in “standard” mapping:
    //       0 => A, 1 => B, 2 => X, 3 => Y, 8 => BACK, 9 => START
    //   * A generic joystick might differ, but the code still runs:
    //     only the physical layout changes.
    
    // If "Start" button is pressed
    if (joystick.buttons[9]?.pressed) {
        location.reload(); // Reload the page
    }

    // "Select" button pressed? (often button[8] on a standard layout)
    if (joystick.buttons[8]?.pressed) {
        pauseSimulation();
    }

    // Switch cameras with three example buttons:
    // B => scene.cameras[1] (Chase camera), 
    // A => scene.cameras[0] (External camera),
    // Y => scene.cameras[2] (Cockpit camera)
    if (joystick.buttons[1]?.pressed) {
        // B button => camera index 1
        scene.activeCamera = scene.cameras[1];
    }
    if (joystick.buttons[0]?.pressed) {
        // A button => camera index 0
        scene.activeCamera = scene.cameras[0];
    }
    if (joystick.buttons[3]?.pressed) {
        // Y button => camera index 2
        scene.activeCamera = scene.cameras[2];
    }

    // ---- Optional: Display joystick info ----
    // e.g. in a debug panel or console
    const axesInfo = joystickAxes
        .map((value, i) => `[${i}]: ${value.toFixed(2)}`)
        .join(", ");
    const buttonsInfo = joystickButtons
        .map((value, i) => `[${i}]: ${value}`)
        .join(", ");

    console.log("Axes:", axesInfo);
    console.log("Buttons:", buttonsInfo);
}
