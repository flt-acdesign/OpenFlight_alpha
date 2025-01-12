// Initialize WebSocket connection
let ws = new WebSocket('ws://localhost:8080');

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

// Function to send aircraft state to server
function sendStateToServer(deltaTime) {
    // Check if connection is open before sending
    if (ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
    }

    // Create aircraft state object
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
        
        // Forces demands
        fx: forceX,
        fy: forceY,
        thrust_setting_demand: thrust_setting_demand,

        // Control demands
        roll_demand: roll_demand,
        pitch_demand: pitch_demand,
        yaw_demand: yaw_demand,    

        // Forces attained (interpreted as setting, not actual force value)
        thrust_attained: thrust_attained,

        // Attained control values
        roll_demand_attained: roll_demand_attained,
        pitch_demand_attained: pitch_demand_attained,
        yaw_demand_attained: yaw_demand_attained,

        // Time step
        deltaTime: deltaTime
    };

    // Send state as JSON string
    ws.send(JSON.stringify(aircraftState));
}

// Message handler for receiving server updates
ws.onmessage = (event) => {
    // Parse received JSON data
    const responseData = JSON.parse(event.data);
    
    // Update aircraft position
    aircraft.position.x = parseFloat(responseData.x);
    aircraft.position.y = parseFloat(responseData.y);
    aircraft.position.z = parseFloat(responseData.z);

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

    // Update 3D model rotation
    aircraft.rotationQuaternion = new BABYLON.Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w
    );

    // Update aerodynamic angles
    alpha_RAD = parseFloat(responseData.alpha_RAD);
    beta_RAD = parseFloat(responseData.beta_RAD);

    // Update control feedback
    pitch_demand_attained = parseFloat(responseData.pitch_demand_attained);
    roll_demand_attained = parseFloat(responseData.roll_demand_attained);
    yaw_demand_attained = parseFloat(responseData.yaw_demand_attained)

    // Update thrust feedback
    thrust_attained = parseFloat(responseData.thrust_attained);
    
    


    // Update trajectory if within time limit
    if (elapsedTime < 200.0) {
        updateTrajectory();
    }



    // Update visualization elements
    updateVelocityLine();
    updateForceLine();


}
