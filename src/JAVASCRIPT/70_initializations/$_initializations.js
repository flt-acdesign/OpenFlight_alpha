
let aircraft  // Reference to the aircraft
let engine, scene;
let velocity = { x: 20, y: 0, z: 0 }; // Initial velocity
let angularVelocity = { x: 0, y: 0, z: 0 }; // Initial angular velocity
let orientation = { x: 0, y: 0, z: 0, w: 1 }; // Initial orientation (quaternion)
let isPaused = false;
let simulationEnded = false;
let velocityLine; // Line to represent velocity vector
let forceLine; // Line to represent force vector
let simulationStartTime = Date.now();
let lastFrameTime = Date.now();
let elapsedTime = 0; // Total elapsed time
let timeSinceLastUpdate = 0; // Accumulated time since last update
let global_time_step = 0.015  // miliseconds, play ping-pong at this rate


let material; // Material for the aircraft

// Pilot control inputs
let forceX = 0.0;
let forceY = 0.0;
let thrust_lever = 0.0

let aileron_input = 0.0;
let elevator_input = 0.0
let rudder_input = 0.0

// Global force values from server
let forceGlobalX = 0.0;
let forceGlobalY = 0.0;
let forceGlobalZ = 0.0;

let alpha_DEG = 0.0;
let beta_DEG = 0.0;

// Gamepad variables
let gamepadIndex = null;

let advancedTexture;
let positionText, velocityText, forceText, angularVelocityText, momentText, timeText, joystickText, pauseButton, alphaText, betaTextText

let joystickAxes = [0, 0, 0, 0];
let joystickButtons = [];

