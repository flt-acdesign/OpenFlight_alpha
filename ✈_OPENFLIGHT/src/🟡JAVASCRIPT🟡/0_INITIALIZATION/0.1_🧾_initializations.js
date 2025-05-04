// Default value for the server port, it will be updated by the server
let freeport = 8000  // Default aircraft configuration file name
let aircraft_name = "SF25B.yaml"

// Initial flight conditions
let initial_velocity = 30
let initial_altitude = 30

// Time interval (in server time seconds) for flight data recording visualization (pink trajectory)
let start_flight_data_recording_at = 3
let finish_flight_data_recording_at = 50

// Flags to control 3D visualization elements
let show_force_vectors = "true"
let show_velocity_vectors = "true"
let show_trajectory = "true"
let frames_per_trajectory_marker = 2; // Add a trajectory dot every N frames

// Scenery complexity level: 0 = checkered ground only, 1 = low, 2 = medium, 3 = high
let scenery_complexity = 3

// Flag to enable/disable the glow effect layer (performance impact)
let enable_glow_effect = false;

// === Core Simulation State Variables ===

// The main (invisible) sphere representing the aircraft's physics body and position/orientation
let aircraft = null;
// TransformNode holding the simple default aircraft visual geometry
let planeNode = null;
// TransformNode holding the loaded GLB aircraft visual geometry
let glbNode = null;

// Babylon.js engine and scene instances (will be assigned in 6.1_...)
let engine, scene;

// Aircraft velocity vector components (m/s)
let velocity = { x: initial_velocity, y: 0, z: 0 };
// Aircraft angular velocity vector components (rad/s)
let angularVelocity = { x: 0, y: 0, z: 0 };
// Aircraft orientation represented as a quaternion
let orientation = { x: 0, y: 0, z: 0, w: 1 };

// Simulation control flags
let isPaused = false; // Is the simulation currently paused?
let simulationEnded = false; // Has the simulation ended (e.g., crash)?

// Visualization line meshes (will be assigned in 5.1_...)
let velocityLine;
let forceLine;

// Timing variables
let simulationStartTime = Date.now(); // Timestamp when the simulation started
let lastFrameTime = Date.now(); // Timestamp of the last rendered frame
let elapsedTime = 0; // Total elapsed simulation time (client-side, may differ from server)
let timeSinceLastUpdate = 0; // Accumulated time since last physics update (client-side)
let fps_demanded = 60; // Target frames per second for the simulation
let global_time_step = 1.0 / fps_demanded; // Ideal time step per frame (seconds)
let distanceFromCenter = 0; // Aircraft distance from world origin (0,0,0)

// Material reference (can be used for shared materials if needed)
let material;

// === Pilot Control Inputs ===

// Raw force inputs (potentially unused if using control surface demands)
let forceX = 0.0;
let forceY = 0.0;
// Thrust demand (0.0 to 1.0) set by pilot input
let thrust_setting_demand = 0.0;
// Actual thrust attained (feedback from server simulation)
let thrust_attained = 0.0;

// Control surface demands (normalized, e.g., -1.0 to 1.0 or 0.0 to 1.0) set by pilot input
let roll_demand = 0.0;
let pitch_demand = 0.0;
let yaw_demand = 0.0;

// Actual control surface positions/effects attained (feedback from server simulation)
let roll_demand_attained = 0.0;
let pitch_demand_attained = 0.0;
let yaw_demand_attained = 0.0;

// === Server Feedback Variables ===

// Global forces acting on the aircraft (feedback from server simulation)
let forceGlobalX = 0.0;
let forceGlobalY = 0.0;
let forceGlobalZ = 0.0;

// Aerodynamic angles (feedback from server simulation)
let alpha_RAD = 0.0; // Angle of attack in radians
let beta_RAD = 0.0; // Sideslip angle in radians

// === Gamepad/Input Variables ===

// Index of the currently connected gamepad
let gamepadIndex = null;
// Array holding the current state of gamepad axes
let joystickAxes = [0, 0, 0, 0]; // Initialize with default values
// Array holding the current state of gamepad buttons (can be populated if needed)
let joystickButtons = [];

// === GUI Variables ===

// Babylon.GUI AdvancedDynamicTexture instance
let advancedTexture;
// Babylon.GUI TextBlock elements for displaying data (will be assigned in 2.1_...)
let positionText, velocityText, timeText, alpha_beta_Text, joystickText, fpsText;
// Babylon.GUI Button element for pausing/resuming (will be assigned in 2.1_...)
let pauseButton;

// === Global State Flags ===

// Server time received from the WebSocket connection (updated in 1.1_...)
window.serverElapsedTime = 0;

// *** MODIFIED: Define initialDataReceived on the window object ***
// Flag to indicate if the first valid data packet has been received from the server
window.initialDataReceived = false;
