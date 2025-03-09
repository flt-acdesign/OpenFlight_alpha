// 1.1_🔁_exchange_aircraft_state_with_server.js

// Ensure freeport is defined
//if (typeof freeport === "undefined") {
//    var freeport = 8000; // default port if not defined elsewhere
//}

// Initialize WebSocket connection
let ws = new WebSocket(`ws://localhost:${freeport}`);

// For measuring time between client updates to pass deltaTime to the server
let lastUpdateTime = performance.now();

// Connection opened
ws.onopen = () => {
    console.log('Connected to WebSocket server, awaiting mission data...');
};

// Error handler
ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

// Connection closed
ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

/**
 * Sends the current aircraft state to the server for integration.
 * Called once per frame in the main render loop.
 */
function sendStateToServer() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        return;
    }

    const now = performance.now();
    const deltaTime = (now - lastUpdateTime) / 1000;
    lastUpdateTime = now;

    if (!aircraft || !orientation) {
        return;
    }

    const aircraftState = {
        x: aircraft.position.x,
        y: aircraft.position.y,
        z: aircraft.position.z,
        vx: velocity.x,
        vy: velocity.y,
        vz: velocity.z,
        qx: orientation.x,
        qy: orientation.y,
        qz: orientation.z,
        qw: orientation.w,
        wx: angularVelocity.x,
        wy: angularVelocity.y,
        wz: angularVelocity.z,
        fx: forceX,
        fy: forceY,
        thrust_setting_demand: thrust_setting_demand,
        roll_demand: roll_demand,
        pitch_demand: pitch_demand,
        yaw_demand: yaw_demand,
        thrust_attained: thrust_attained,
        roll_demand_attained: roll_demand_attained,
        pitch_demand_attained: pitch_demand_attained,
        yaw_demand_attained: yaw_demand_attained,
        deltaTime: deltaTime
    };

    ws.send(JSON.stringify(aircraftState));
}

/**
 * Handler for messages from the server:
 * 1) "missionData" => initial altitude, velocity, scenery_complexity, etc.
 * 2) Normal integrator updates for aircraft state.
 */
ws.onmessage = (event) => {
    const responseData = JSON.parse(event.data);

    if (responseData.messageType === "missionData") {
        console.log("Received mission data from server:", responseData);

        if (typeof window.MISSION_DATA === 'undefined') {
            window.MISSION_DATA = {};
        }
        
        const previousComplexity = window.MISSION_DATA.scenery_complexity || null;
        
        MISSION_DATA.initial_velocity = responseData.initial_velocity || MISSION_INITIAL_VELOCITY;
        MISSION_DATA.initial_altitude = responseData.initial_altitude || MISSION_INITIAL_ALTITUDE;
        MISSION_DATA.scenery_complexity = responseData.scenery_complexity || "low";
        MISSION_DATA.aircraft_name = responseData.aircraft_name;
        
        MISSION_INITIAL_VELOCITY = MISSION_DATA.initial_velocity;
        MISSION_INITIAL_ALTITUDE = MISSION_DATA.initial_altitude;
        
        current_graphic_settings = getGraphicSettings(MISSION_DATA.scenery_complexity);
        console.log("=> Setting current_graphic_settings =>", current_graphic_settings);
        
        const complexityChanged = previousComplexity !== MISSION_DATA.scenery_complexity;
        
        // Use window.scene to ensure the scene is globally available
        if (window.scene) {
            if (!aircraft || complexityChanged || MISSION_DATA.scenery_complexity === "high") {
                console.log("Building/rebuilding scene with new complexity:", MISSION_DATA.scenery_complexity);
                
                if (aircraft) {
                    console.log("Disposing existing aircraft and scenery elements");
                    if (glbNode) glbNode.dispose();
                    if (planeNode) planeNode.dispose();
                    
                    const meshes = window.scene.meshes.slice();
                    meshes.forEach(mesh => {
                        if (mesh.name.includes("ground") ||
                            mesh.name.includes("sky") ||
                            mesh.name.includes("tree") ||
                            mesh.name.includes("building") ||
                            mesh.name.includes("runway")) {
                            mesh.dispose();
                        }
                    });
                    
                    aircraft.dispose();
                    aircraft = null;
                }
                
                createWorldScenery(window.scene, shadowGenerator, window.scene.activeCamera);
                createAircraft(window.scene.shadowGenerator, window.scene);
            } else if (aircraft) {
                aircraft.position.y = MISSION_INITIAL_ALTITUDE;
                if (window.scene.updateCamerasForAircraft) {
                    window.scene.updateCamerasForAircraft(aircraft);
                }
            }
        }
        return;
    }

    // Normal state update
    aircraft.position.x = parseFloat(responseData.x);
    aircraft.position.y = parseFloat(responseData.y);
    aircraft.position.z = parseFloat(responseData.z);

    velocity.x = parseFloat(responseData.vx);
    velocity.y = parseFloat(responseData.vy);
    velocity.z = parseFloat(responseData.vz);

    orientation.x = parseFloat(responseData.qx);
    orientation.y = parseFloat(responseData.qy);
    orientation.z = parseFloat(responseData.qz);
    orientation.w = parseFloat(responseData.qw);
    aircraft.rotationQuaternion = new BABYLON.Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w
    );

    angularVelocity.x = parseFloat(responseData.wx);
    angularVelocity.y = parseFloat(responseData.wy);
    angularVelocity.z = parseFloat(responseData.wz);

    forceGlobalX = parseFloat(responseData.fx_global);
    forceGlobalY = parseFloat(responseData.fy_global);
    forceGlobalZ = parseFloat(responseData.fz_global);

    alpha_RAD = parseFloat(responseData.alpha_RAD);
    beta_RAD  = parseFloat(responseData.beta_RAD);

    pitch_demand_attained = parseFloat(responseData.pitch_demand_attained);
    roll_demand_attained  = parseFloat(responseData.roll_demand_attained);
    yaw_demand_attained   = parseFloat(responseData.yaw_demand_attained);
    thrust_attained       = parseFloat(responseData.thrust_attained);

    updateVelocityLine();
    updateForceLine();
};
