/***************************************************************
 * 1.1_🔁_exchange_aircraft_state_with_server.js
 *
 * Manages the WebSocket connection with the Julia server, sending
 * and receiving the aircraft’s state. The main change is that
 * we store the server’s “server_time” into `window.serverElapsedTime`
 * so the client can use it for flight-time, pink-trajectory intervals,
 * and data recording intervals.
 ***************************************************************/

// Initialize WebSocket connection
// freeport is a variable that holds the port number of the server, defined in
// "src/🟡JAVASCRIPT🟡/0_INITIALIZATION/0.1_🧾_initializations.js" by the Julia code
// "src/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.0_📚_Check_packages_and_websockets_port/🔌_Find_free_port.jl"
let ws = new WebSocket(`ws://localhost:${freeport}`);

// --------------------------------------------------------------------------
// Keep track of the last update time to compute a variable deltaTime for server calls.
// --------------------------------------------------------------------------
let lastUpdateTime = performance.now();

// Connection opened handler
ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

// Error handler
ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

// Connection closed handler
ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

// --------------------------------------------------------------------------
// Function to send aircraft state to server. We measure deltaTime ourselves;
// the server uses this to run the integrator with a stable time step.
// --------------------------------------------------------------------------
function sendStateToServer() {
    // Measure the actual time elapsed since the last call
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastUpdateTime) / 1000.0; // ms -> s

    lastUpdateTime = currentTime;

    // Check if connection is open before sending
    if (ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
    }

    // Create aircraft state object. We read the “aircraft” global state.
    // If the aircraft or orientation are undefined, skip.
    if (!aircraft || !orientation) {
        // console.warn("sendStateToServer: Aircraft or orientation not ready."); // Avoid spamming
        return;
    }

    const aircraftState = {
        // Position coordinates from Babylon.js object
        x: aircraft.position.x,
        y: aircraft.position.y,
        z: aircraft.position.z,

        // Velocity components
        vx: velocity.x,
        vy: velocity.y,
        vz: velocity.z,

        // Quaternion orientation from Babylon.js object
        qx: orientation.x,
        qy: orientation.y,
        qz: orientation.z,
        qw: orientation.w,

        // Angular velocity in body frame
        wx: angularVelocity.x,
        wy: angularVelocity.y,
        wz: angularVelocity.z,

        // Forces demands (these come from the user’s inputs)
        fx: forceX, // Note: forceX, forceY seem unused in input script? Check if needed.
        fy: forceY, // Note: forceX, forceY seem unused in input script? Check if needed.
        thrust_setting_demand: thrust_setting_demand,

        // Control demands (these ARE set by input script)
        roll_demand: roll_demand,
        pitch_demand: pitch_demand,
        yaw_demand: yaw_demand,

        // Forces attained (interpreted as setting, not actual force value)
        thrust_attained: thrust_attained,

        // Attained control values (feedback from server might override them)
        roll_demand_attained: roll_demand_attained,
        pitch_demand_attained: pitch_demand_attained,
        yaw_demand_attained: yaw_demand_attained,

        // The measured variable time step
        deltaTime: deltaTime
    };

    // Send state as JSON string
    ws.send(JSON.stringify(aircraftState));
}

// --------------------------------------------------------------------------
// Message handler for receiving server updates. The server integrator has
// advanced the state. We set the new position, velocity, orientation, etc.
// We also store `server_time` in `window.serverElapsedTime` for the GUI.
// --------------------------------------------------------------------------
ws.onmessage = (event) => {
    try {
        // Parse received JSON data
        const responseData = JSON.parse(event.data);

        // Update aircraft position in Babylon.js space
        if (aircraft && aircraft.position) { // Check if aircraft exists
            aircraft.position.x = parseFloat(responseData.x);
            aircraft.position.y = parseFloat(responseData.y);
            aircraft.position.z = parseFloat(responseData.z);
        }

        // Update velocity vector
        velocity.x = parseFloat(responseData.vx);
        velocity.y = parseFloat(responseData.vy);
        velocity.z = parseFloat(responseData.vz);

        // Update orientation quaternion
        orientation.x = parseFloat(responseData.qx);
        orientation.y = parseFloat(responseData.qy);
        orientation.z = parseFloat(responseData.qz);
        orientation.w = parseFloat(responseData.qw);

        // Update angular velocity
        angularVelocity.x = parseFloat(responseData.wx);
        angularVelocity.y = parseFloat(responseData.wy);
        angularVelocity.z = parseFloat(responseData.wz);

        // Update global forces
        forceGlobalX = parseFloat(responseData.fx_global);
        forceGlobalY = parseFloat(responseData.fy_global);
        forceGlobalZ = parseFloat(responseData.fz_global);

        // Update 3D model rotation (Babylon uses “rotationQuaternion”)
        if (aircraft && aircraft.rotationQuaternion) { // Check if aircraft exists
            aircraft.rotationQuaternion = new BABYLON.Quaternion(
                orientation.x,
                orientation.y,
                orientation.z,
                orientation.w
            );
        }

        // Update aerodynamic angles (in radians)
        alpha_RAD = parseFloat(responseData.alpha_RAD);
        beta_RAD = parseFloat(responseData.beta_RAD);

        // Update control feedback from server solution
        pitch_demand_attained = parseFloat(responseData.pitch_demand_attained);
        roll_demand_attained = parseFloat(responseData.roll_demand_attained);
        yaw_demand_attained = parseFloat(responseData.yaw_demand_attained);

        // Update thrust feedback
        thrust_attained = parseFloat(responseData.thrust_attained);

        // *** IMPORTANT FIX: Store server_time in a global var so the client sees it ***
        if ("server_time" in responseData) {
            window.serverElapsedTime = parseFloat(responseData.server_time);
        } else {
             window.serverElapsedTime = window.serverElapsedTime || 0; // Keep existing value or 0 if never set
        }


        // Update velocity and force lines (just the lines, not trajectory dots)
        // Check if functions exist before calling
        if (show_velocity_vectors === "true" && typeof updateVelocityLine === 'function') {
            updateVelocityLine();
        }

        if (show_force_vectors === "true" && typeof updateForceLine === 'function') {
            updateForceLine();
        }
    } catch (e) {
        console.error("Error processing WebSocket message:", e, "Data:", event.data);
    }
};