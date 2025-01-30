

let aircraft = null;  // The sphere
let planeNode = null; // TransformNode holding the simple plane
let glbNode = null;   // TransformNode holding the loaded GLB


let engine, scene;
let velocity = { x: 30, y: 0, z: 0 }; // Initial velocity



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
let fps_demanded = 50 // Frames per second demanded
let global_time_step = 1.0 / fps_demanded  // seconds, play ping-pong at this rate
let distanceFromCenter = 0

let material; // Material for the aircraft

// Pilot control inputs
let forceX = 0.0;
let forceY = 0.0;
let thrust_setting_demand = 0.0
let thrust_attained = 0.0

let roll_demand = 0.0;
let pitch_demand = 0.0
let yaw_demand = 0.0

let roll_demand_attained = 0.0;
let pitch_demand_attained = 0.0;
let yaw_demand_attained = 0.0;


// Global force values from server
let forceGlobalX = 0.0;
let forceGlobalY = 0.0;
let forceGlobalZ = 0.0;

let alpha_RAD = 0.0;
let beta_RAD = 0.0;

// Gamepad variables
let gamepadIndex = null;

let advancedTexture;
let positionText, velocityText, forceText, angularVelocityText, momentText, timeText, joystickText, pauseButton, alphaText, betaTextText

let joystickAxes = [0, 0, 0, 0];

let joystickButtons = [];

