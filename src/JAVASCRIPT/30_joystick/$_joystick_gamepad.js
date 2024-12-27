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






function detectControllerType(gamepad) {
    const id = gamepad.id.toLowerCase();
    
    if (id.includes('xbox') || id.includes('xinput')) {
        return 'XBOX';
    } else if (id.includes('playstation') || id.includes('ps4') || id.includes('ps5') || id.includes('dualshock')) {
        return 'PLAYSTATION';
    } else {
        return 'GENERIC';
    }
}




function updateForcesFromJoystickOrKeyboard(scene) {
    const gamepads = navigator.getGamepads();
    const joystick = gamepads[gamepadIndex];

    if (joystick) {

        joystickAxes = joystick.axes;

if (detectControllerType(joystick) === 'XBOX') {


        // Map joystick axes to forces and moments
        thrust_setting_demand = -1 * joystick.axes[1]; // Left stick vertical

        roll_demand = -0.1 * joystick.axes[2]; // Right stick horizontal
        pitch_demand = 0.1 * joystick.axes[3]; // Right stick vertical
        yaw_demand = 0.1 * joystick.axes[0]; // Left stick horizontal

//      forceY = -1 * joystick.buttons[1].value + joystick.buttons[3].value;
//      forceX = -1 * joystick.buttons[14].value + joystick.buttons[15].value;

        // Update buttons
        joystickButtons = joystick.buttons.map(button => button.pressed ? "1" : "0");

                   // Check if the "Start" button is pressed
                   if (joystick.buttons[9].value == 1) {
                    location.reload(); // Reload the page
                }

        // Checking joystick buttons for camera selection
        if (joystick.buttons[1].value == 1) {
            // Chase camera => index 1
            setActiveCamera(1, scene);
        }
        if (joystick.buttons[0].value == 1) {
            // External camera => index 0
            setActiveCamera(0, scene);
        }
        if (joystick.buttons[3].value == 1) {
            // Cockpit camera => index 2
            setActiveCamera(2, scene);
        }
        if (joystick.buttons[2].value == 1) {
            setActiveCamera(3, scene);
        }





    if (joystick.buttons[8].value == 1) { pauseSimulation() } // Pause-RESUME simulation
                                
    } // end of XBOX controller




    else if (detectControllerType(gamepad) === 'GENERIC') {










    }


    } else {  // Keyboard
        // Fallback to keyboard controls if no joystick is detected
        // Map keyboard input to forces and moments
        forceX = keyState.left ? -1 : keyState.right ? 1 : 0;
        thrust_setting_demand = keyState.up ? -1 : keyState.down ? 1 : 0;
        roll_demand = keyState.rotateLeft ? -0.1 : keyState.rotateRight ? 0.1 : 0;
        momentY = keyState.momentUp ? 0.1 : keyState.momentDown ? -0.1 : 0;

        // You can customize this to include more complex keyboard-mapping logic
    }



    
}

