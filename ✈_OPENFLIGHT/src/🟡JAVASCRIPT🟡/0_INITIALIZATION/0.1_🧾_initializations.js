let freeport = 8000  // default value for the server port, it will be updated by the server

let scenery_complexity = "high"

// Name of the aircraft aerodynamic data file in \🏭_HANGAR\📜_Aero_data
let aircraft_name = "SF25B.yaml"


// Initial velocity in m/s
let initial_velocity = 30

// Initial altitude in m
let initial_altitude = 40


// FLIGHT TEST PARAMETERS

// start recording in seconds after start of flight
let start_flight_data_recording_at = 6

//  finish recording in seconds
let finish_flight_data_recording_at = 9


let show_force_vectors = "true"
let show_velocity_vectors = "true"
let show_trajectory = "true"



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
let fps_demanded = 60 // Frames per second demanded
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

