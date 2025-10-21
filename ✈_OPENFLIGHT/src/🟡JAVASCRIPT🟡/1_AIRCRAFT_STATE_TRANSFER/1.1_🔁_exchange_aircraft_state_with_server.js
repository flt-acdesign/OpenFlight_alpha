

/***************************************************************
 * 1.1_🔁_exchange_aircraft_state_with_server.js
 *
 * **MODIFIED FOR MsgPack & DOMContentLoaded**
 * Manages the WebSocket connection with the Julia server using
 * binary MsgPack format for high performance. The code is wrapped
 * in a DOMContentLoaded listener to ensure libraries are loaded first.
 ***************************************************************/

// NEW: Wait for the DOM and all scripts to be loaded before executing.
window.addEventListener('DOMContentLoaded', (event) => {

    // Initialize WebSocket connection
    // freeport is a variable that holds the port number of the server, defined in
    // "src/🟡JAVASCRIPT🟡/0_INITIALIZATION/0.1_🧾_initializations.js" by the Julia code
    // "src/🟣JULIA🟣/1_Maths_and_Auxiliary_Functions/1.0_📚_Check_packages_and_websockets_port/🔌_Find_free_port.jl"
    let ws = new WebSocket(`ws://localhost:${freeport}`);

    // Set the binary type to 'arraybuffer' to handle binary messages
    ws.binaryType = "arraybuffer";

    // Keep track of the last update time to compute a variable deltaTime for server calls.
    let lastUpdateTime = performance.now();

    // Connection opened handler
    ws.onopen = () => {
        console.log('Connected to WebSocket server (using MsgPack)');
    };

    // Error handler
    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    // Connection closed handler
    ws.onclose = () => {
        console.log('Disconnected from WebSocket server');
        window.initialDataReceived = false; // Reset flag on disconnect
    };

    // --------------------------------------------------------------------------
    // Function to send aircraft state to server.
    // --------------------------------------------------------------------------
    function sendStateToServer() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastUpdateTime) / 1000.0; // ms -> s
        lastUpdateTime = currentTime;

        if (ws.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return;
        }

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
        
        // Send state as a binary MsgPack object
        ws.send(msgpack.encode(aircraftState));
    }

    // --------------------------------------------------------------------------
    // Message handler for receiving server updates.
    // --------------------------------------------------------------------------
    ws.onmessage = (event) => {
        try {
            // Parse received binary data using MsgPack.decode
            const responseData = msgpack.decode(new Uint8Array(event.data));
            let dataIsValid = true;

            if (aircraft && aircraft.position) {
                const newX = parseFloat(responseData.x);
                const newY = parseFloat(responseData.y);
                const newZ = parseFloat(responseData.z);
                if (!isNaN(newX)) aircraft.position.x = newX; else dataIsValid = false;
                if (!isNaN(newY)) aircraft.position.y = newY; else dataIsValid = false;
                if (!isNaN(newZ)) aircraft.position.z = newZ; else dataIsValid = false;
            } else {
                dataIsValid = false;
            }

            const newVx = parseFloat(responseData.vx);
            const newVy = parseFloat(responseData.vy);
            const newVz = parseFloat(responseData.vz);
            if (!isNaN(newVx)) velocity.x = newVx; else dataIsValid = false;
            if (!isNaN(newVy)) velocity.y = newVy; else dataIsValid = false;
            if (!isNaN(newVz)) velocity.z = newVz; else dataIsValid = false;

            const newQx = parseFloat(responseData.qx);
            const newQy = parseFloat(responseData.qy);
            const newQz = parseFloat(responseData.qz);
            const newQw = parseFloat(responseData.qw);
            if (!isNaN(newQx)) orientation.x = newQx; else dataIsValid = false;
            if (!isNaN(newQy)) orientation.y = newQy; else dataIsValid = false;
            if (!isNaN(newQz)) orientation.z = newQz; else dataIsValid = false;
            if (!isNaN(newQw)) orientation.w = newQw; else dataIsValid = false;

            const newWx = parseFloat(responseData.wx);
            const newWy = parseFloat(responseData.wy);
            const newWz = parseFloat(responseData.wz);
            if (!isNaN(newWx)) angularVelocity.x = newWx; else dataIsValid = false;
            if (!isNaN(newWy)) angularVelocity.y = newWy; else dataIsValid = false;
            if (!isNaN(newWz)) angularVelocity.z = newWz; else dataIsValid = false;

            const newFx = parseFloat(responseData.fx_global);
            const newFy = parseFloat(responseData.fy_global);
            const newFz = parseFloat(responseData.fz_global);
            if (!isNaN(newFx)) forceGlobalX = newFx; else dataIsValid = false;
            if (!isNaN(newFy)) forceGlobalY = newFy; else dataIsValid = false;
            if (!isNaN(newFz)) forceGlobalZ = newFz; else dataIsValid = false;

            if (aircraft && aircraft.rotationQuaternion && dataIsValid) {
                // <<< START RECOMMENDED QUATERNION FIX >>>
                // Create a temporary quaternion from the server data
                const tempQuaternion = new BABYLON.Quaternion(
                    orientation.x,
                    orientation.y,
                    orientation.z,
                    orientation.w
                );

                // Normalize it to ensure it's a pure rotation (magnitude = 1)
                tempQuaternion.normalize();

                // Assign the normalized values
                aircraft.rotationQuaternion.x = tempQuaternion.x;
                aircraft.rotationQuaternion.y = tempQuaternion.y;
                aircraft.rotationQuaternion.z = tempQuaternion.z;
                aircraft.rotationQuaternion.w = tempQuaternion.w;
                // <<< END RECOMMENDED QUATERNION FIX >>>
            }

            const newAlpha = parseFloat(responseData.alpha_RAD);
            const newBeta = parseFloat(responseData.beta_RAD);
            if (!isNaN(newAlpha)) alpha_RAD = newAlpha; else dataIsValid = false;
            if (!isNaN(newBeta)) beta_RAD = newBeta; else dataIsValid = false;

            const newPitchAtt = parseFloat(responseData.pitch_demand_attained);
            const newRollAtt = parseFloat(responseData.roll_demand_attained);
            const newYawAtt = parseFloat(responseData.yaw_demand_attained);
            if (!isNaN(newPitchAtt)) pitch_demand_attained = newPitchAtt; else dataIsValid = false;
            if (!isNaN(newRollAtt)) roll_demand_attained = newRollAtt; else dataIsValid = false;
            if (!isNaN(newYawAtt)) yaw_demand_attained = newYawAtt; else dataIsValid = false;

            const newThrustAtt = parseFloat(responseData.thrust_attained);
            if (!isNaN(newThrustAtt)) thrust_attained = newThrustAtt; else dataIsValid = false;

            if ("server_time" in responseData) {
                const serverTime = parseFloat(responseData.server_time);
                if (!isNaN(serverTime)) {
                    window.serverElapsedTime = serverTime;
                } else {
                    dataIsValid = false;
                }
            } else {
                window.serverElapsedTime = window.serverElapsedTime || 0;
            }

            // --- NEW: Load Factor Calculation ---
            // If we have a valid weight, calculate the load factor
            // Assumption: forceGlobalY is the Lift force.
            if (aircraftWeight !== null && aircraftWeight > 0.01) {
                if (!isNaN(forceGlobalY)) {
                    loadFactor = forceGlobalY / aircraftWeight;
                }
            } else {
                loadFactor = 1.0; // Default to 1.0 until weight is captured
            }
            // --- End Load Factor ---

            if (!window.initialDataReceived && dataIsValid) {
                window.initialDataReceived = true;
                console.log("Initial VALID data received from server. Enabling line updates.");

                // --- NEW: Capture Aircraft Weight on First Valid Packet ---
                // Assumption: forceGlobalY is Lift, and sim starts at 1G.
                if (aircraftWeight === null && forceGlobalY > 0) {
                    aircraftWeight = forceGlobalY;
                    console.log(`Captured aircraft weight (from 1G Lift): ${aircraftWeight.toFixed(2)} N`);
                } else if (aircraftWeight === null) {
                    console.warn("Could not capture weight. Initial forceGlobalY is not positive.");
                }
                // --- End Weight Capture ---
            }

        } catch (e) {
            console.error("Error processing WebSocket message:", e, "Data:", event.data);
        }
    };
    
    // **NEW: Make the sendStateToServer function globally accessible**
    // The main render loop in 6.1_...js needs to be able to call it.
    window.sendStateToServer = sendStateToServer;

}); // NEW: Close the DOMContentLoaded listener