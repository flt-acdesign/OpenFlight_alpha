// 0.1_🧾_initializations.js
//
// This file initializes mission parameters and graphics settings for the simulation.


// default value for the server port, it will be updated by the server
let freeport = 8000  // Default value for the scenery complexity, will be overriden by the value set in the mission.yaml file
let scenery_complexity= "medium"


let current_graphic_settings = getGraphicSettings(scenery_complexity);

// Expose the default settings globally so that they can be updated by other modules.
window.current_graphic_settings = current_graphic_settings;


//---------------------------------------------------------------------
// Function to return graphics settings based on the complexity level.
// It normalizes the input string (trimming whitespace and converting to lower case)
// so that any valid specification (e.g., "High", " high", "HIGH") is correctly matched.
//---------------------------------------------------------------------
function getGraphicSettings(complexity) {
    const level = complexity.trim().toLowerCase();
    const settings = {
        low: {
            ground: "none",
            trees: "none",
            sky: "flat"
        },
        medium: {
            ground: "flat",
            trees: "few",
            sky: "medium"
        },
        high: {
            ground: "island",
            trees: "many",
            sky: "full"
        }
    };
    return settings[level] || settings.low;
}


//---------------------------------------------------------------------
// Default mission parameters
//---------------------------------------------------------------------
let MISSION_INITIAL_VELOCITY = 30;   // Default initial velocity (m/s)
let MISSION_INITIAL_ALTITUDE = 400;  // Default initial altitude (m)

// Other global simulation variables:
let aircraft = null;
let velocity = { x: 30, y: 0, z: 0 };
let orientation = { x: 0, y: 0, z: 0, w: 1 };
let angularVelocity = { x: 0, y: 0, z: 0 };

let forceX = 0
let forceY = 0.0;
let thrust_setting_demand = 0.0;
let thrust_attained = 0.0;

let roll_demand = 0.0;
let pitch_demand = 0.0;
let yaw_demand = 0.0;

let roll_demand_attained  = 0.0;
let pitch_demand_attained = 0.0;
let yaw_demand_attained   = 0.0;

let forceGlobalX = 0.0;
let forceGlobalY = 0.0;
let forceGlobalZ = 0.0;

let alpha_RAD = 0.0;
let beta_RAD  = 0.0;

let gamepadIndex = null;
let advancedTexture;
let positionText, velocityText, forceText, angularVelocityText,
    momentText, timeText, joystickText, pauseButton,
    alphaText, betaTextText;

let joystickAxes = [0, 0, 0, 0];
let joystickButtons = [];

console.log("Loaded 0.1_🧾_initializations.js. current_graphic_settings=null until mission data arrives...");
