// Variables to store key states
let keyState = {
    up: false,
    down: false,
    left: false,
    right: false,
    rotateLeft: false,
    rotateRight: false,
    momentUp: false,
    momentDown: false,
};

// Add event listeners for key presses and releases
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyO':
            keyState.up = true;
            break;
        case 'KeyP':
            keyState.down = true;
            break;
        case 'KeyQ':
            keyState.left = true;
            break;
        case 'KeyW':
            keyState.right = true;
            break;
        case 'KeyA':
            keyState.rotateLeft = true;
            break;
        case 'KeyS':
            keyState.rotateRight = true;
            break;
        case 'KeyK':
            keyState.momentUp = true;
            break;
        case 'KeyL':
            keyState.momentDown = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyO':
            keyState.up = false
            break;
        case 'KeyP':
            keyState.down = false;
            break;
        case 'KeyQ':
            keyState.left = false;
            break;
        case 'KeyW':
            keyState.right = false;
            break;
        case 'KeyA':
            keyState.rotateLeft = false;
            break;
        case 'KeyS':
            keyState.rotateRight = false;
            break;
        case 'KeyK':
            keyState.momentUp = false;
            break;
        case 'KeyL':
            keyState.momentDown = false;
            break;
    }
});

function updateForcesFromJoystickOrKeyboard(scene) {
    const gamepads = navigator.getGamepads();
    const joystick = gamepads[gamepadIndex];

    if (joystick) {
        // Update axes (assuming standard gamepad layout)
        joystickAxes = joystick.axes;

        // Map joystick axes to forces and moments
        thrust_lever = -1 * joystick.axes[1]; // Left stick vertical

        aileron_input = -0.1 * joystick.axes[2]; // Right stick horizontal
        elevator_input = 0.1 * joystick.axes[3]; // Right stick vertical
        rudder_input = 0.1 * joystick.axes[0]; // Left stick horizontal

//      forceY = -1 * joystick.buttons[1].value + joystick.buttons[3].value;
//      forceX = -1 * joystick.buttons[14].value + joystick.buttons[15].value;

        // Update buttons
        joystickButtons = joystick.buttons.map(button => button.pressed ? "1" : "0");

                   // Check if the "Start" button is pressed
                   if (joystick.buttons[9].value == 1) {
                    location.reload(); // Reload the page
                }


    // Check if the "Select" button is pressed
    if (joystick.buttons[1].value == 1) {scene.activeCamera = scene.cameras[1]} // Chase camera
    if (joystick.buttons[0].value == 1) {scene.activeCamera = scene.cameras[0]} // External camera
    if (joystick.buttons[3].value == 1) {scene.activeCamera = scene.cameras[2]} // Cockpit camer
    if (joystick.buttons[8].value == 1) { pauseSimulation() } // Pause-RESUME simulation
                                
                       




    } else {
        // Fallback to keyboard controls if no joystick is detected
        // Map keyboard input to forces and moments
        forceX = keyState.left ? -1 : keyState.right ? 1 : 0;
        thrust_lever = keyState.up ? -1 : keyState.down ? 1 : 0;
        aileron_input = keyState.rotateLeft ? -0.1 : keyState.rotateRight ? 0.1 : 0;
        momentY = keyState.momentUp ? 0.1 : keyState.momentDown ? -0.1 : 0;

        // You can customize this to include more complex keyboard-mapping logic
    }
}
