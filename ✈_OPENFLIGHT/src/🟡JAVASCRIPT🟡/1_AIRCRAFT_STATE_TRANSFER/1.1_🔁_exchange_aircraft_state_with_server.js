/***************************************************************
 * 1.1_🔁_exchange_aircraft_state_with_server.js
 *
 * Manages the WebSocket connection with the Julia server, sending
 * and receiving the aircraft’s state.
 * - Stores the server’s “server_time” into `window.serverElapsedTime`.
 * - Sets `window.initialDataReceived` to true after the first valid message.
 ***************************************************************/

// Initialize WebSocket connection
// freeport is a variable that holds the port number of the server, defined in
// "src/🟡JAVASCRIPT🟡/0_INITIALIZATION/0.1_🧾_initializations.js" by the Julia code
// "src/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.0_📚_Check_packages_and_websockets_port/🔌_Find_free_port.jl"
let ws = new WebSocket(`ws://localhost:${freeport}`);

// Keep track of the last update time to compute a variable deltaTime for server calls.
let lastUpdateTime = performance.now();

// Connection opened handler
ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

// Error handler
ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    // Optionally, try to reconnect or inform the user
};

// Connection closed handler
ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
    // Optionally, reset flags or attempt reconnection
    window.initialDataReceived = false; // Reset flag on disconnect
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

    // Create aircraft state object. We read the global state variables.
    // If the aircraft or orientation are undefined, skip sending.
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

        // Quaternion orientation (using global 'orientation' updated by server)
        qx: orientation.x,
        qy: orientation.y,
        qz: orientation.z,
        qw: orientation.w,

        // Angular velocity in body frame
        wx: angularVelocity.x,
        wy: angularVelocity.y,
        wz: angularVelocity.z,

        // Pilot force demands (potentially unused)
        fx: forceX,
        fy: forceY,
        // Pilot thrust demand (0.0 to 1.0)
        thrust_setting_demand: thrust_setting_demand,

        // Pilot control surface demands (normalized)
        roll_demand: roll_demand,
        pitch_demand: pitch_demand,
        yaw_demand: yaw_demand,

        // Attained thrust (feedback from server)
        thrust_attained: thrust_attained,

        // Attained control surface positions (feedback from server)
        roll_demand_attained: roll_demand_attained,
        pitch_demand_attained: pitch_demand_attained,
        yaw_demand_attained: yaw_demand_attained,

        // The measured variable time step for the server integrator
        deltaTime: deltaTime
    };

    // Send state as JSON string
    ws.send(JSON.stringify(aircraftState));
}

// --------------------------------------------------------------------------
// Message handler for receiving server updates. The server integrator has
// advanced the state. We set the new position, velocity, orientation, etc.
// We also store `server_time` in `window.serverElapsedTime` for the GUI
// and set the `window.initialDataReceived` flag.
// --------------------------------------------------------------------------
ws.onmessage = (event) => {
    try {
        // Parse received JSON data
        const responseData = JSON.parse(event.data);
        // console.log("Raw Server Data:", event.data); // Uncomment for extreme debug

        let dataIsValid = true; // Assume data is valid initially

        // Update aircraft position in Babylon.js space
        if (aircraft && aircraft.position) {
            const newX = parseFloat(responseData.x);
            const newY = parseFloat(responseData.y);
            const newZ = parseFloat(responseData.z);
            if (!isNaN(newX)) aircraft.position.x = newX; else dataIsValid = false;
            if (!isNaN(newY)) aircraft.position.y = newY; else dataIsValid = false;
            if (!isNaN(newZ)) aircraft.position.z = newZ; else dataIsValid = false;
        } else {
            dataIsValid = false; // Cannot update if aircraft doesn't exist
        }

        // Update velocity vector
        const newVx = parseFloat(responseData.vx);
        const newVy = parseFloat(responseData.vy);
        const newVz = parseFloat(responseData.vz);
        if (!isNaN(newVx)) velocity.x = newVx; else dataIsValid = false;
        if (!isNaN(newVy)) velocity.y = newVy; else dataIsValid = false;
        if (!isNaN(newVz)) velocity.z = newVz; else dataIsValid = false;

        // Update orientation quaternion
        const newQx = parseFloat(responseData.qx);
        const newQy = parseFloat(responseData.qy);
        const newQz = parseFloat(responseData.qz);
        const newQw = parseFloat(responseData.qw);
        if (!isNaN(newQx)) orientation.x = newQx; else dataIsValid = false;
        if (!isNaN(newQy)) orientation.y = newQy; else dataIsValid = false;
        if (!isNaN(newQz)) orientation.z = newQz; else dataIsValid = false;
        if (!isNaN(newQw)) orientation.w = newQw; else dataIsValid = false;

        // Update angular velocity
        const newWx = parseFloat(responseData.wx);
        const newWy = parseFloat(responseData.wy);
        const newWz = parseFloat(responseData.wz);
        if (!isNaN(newWx)) angularVelocity.x = newWx; else dataIsValid = false;
        if (!isNaN(newWy)) angularVelocity.y = newWy; else dataIsValid = false;
        if (!isNaN(newWz)) angularVelocity.z = newWz; else dataIsValid = false;

        // Update global forces
        const newFx = parseFloat(responseData.fx_global);
        const newFy = parseFloat(responseData.fy_global);
        const newFz = parseFloat(responseData.fz_global);
        if (!isNaN(newFx)) forceGlobalX = newFx; else dataIsValid = false;
        if (!isNaN(newFy)) forceGlobalY = newFy; else dataIsValid = false;
        if (!isNaN(newFz)) forceGlobalZ = newFz; else dataIsValid = false;

        // Update 3D model rotation (Babylon uses “rotationQuaternion”)
        if (aircraft && aircraft.rotationQuaternion && dataIsValid) { // Only update if data was valid
            aircraft.rotationQuaternion.x = orientation.x;
            aircraft.rotationQuaternion.y = orientation.y;
            aircraft.rotationQuaternion.z = orientation.z;
            aircraft.rotationQuaternion.w = orientation.w;
        }

        // Update aerodynamic angles (in radians)
        const newAlpha = parseFloat(responseData.alpha_RAD);
        const newBeta = parseFloat(responseData.beta_RAD);
        if (!isNaN(newAlpha)) alpha_RAD = newAlpha; else dataIsValid = false;
        if (!isNaN(newBeta)) beta_RAD = newBeta; else dataIsValid = false;

        // Update control feedback from server solution
        const newPitchAtt = parseFloat(responseData.pitch_demand_attained);
        const newRollAtt = parseFloat(responseData.roll_demand_attained);
        const newYawAtt = parseFloat(responseData.yaw_demand_attained);
        if (!isNaN(newPitchAtt)) pitch_demand_attained = newPitchAtt; else dataIsValid = false;
        if (!isNaN(newRollAtt)) roll_demand_attained = newRollAtt; else dataIsValid = false;
        if (!isNaN(newYawAtt)) yaw_demand_attained = newYawAtt; else dataIsValid = false;

        // Update thrust feedback
        const newThrustAtt = parseFloat(responseData.thrust_attained);
        if (!isNaN(newThrustAtt)) thrust_attained = newThrustAtt; else dataIsValid = false;

        // Store server_time in a global var so the client sees it
        if ("server_time" in responseData) {
            const serverTime = parseFloat(responseData.server_time);
             if (!isNaN(serverTime)) {
                 window.serverElapsedTime = serverTime;
             } else {
                 dataIsValid = false;
             }
        } else {
            // Keep existing value or 0 if never set
             window.serverElapsedTime = window.serverElapsedTime || 0;
        }

        // *** MODIFIED: Set the global flag if not already set and data was valid ***
        if (!window.initialDataReceived && dataIsValid) {
            window.initialDataReceived = true;
            console.log("Initial VALID data received from server. Enabling line updates.");
        }
        // *** END MODIFIED ***

        // NOTE: Calls to updateVelocityLine() and updateForceLine() were removed from here
        // They are now called in the main render loop (6.1_...)

    } catch (e) {
        console.error("Error processing WebSocket message:", e, "Data:", event.data);
    }
};
