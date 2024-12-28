let ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

function sendStateToServer(deltaTime) {
    if (ws.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
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
        roll_demand_attained: roll_demand_attained,
        pitch_demand_attained: pitch_demand_attained,
        yaw_demand_attained: yaw_demand_attained,
        deltaTime: deltaTime
    };

    ws.send(JSON.stringify(aircraftState));
}

ws.onmessage = (event) => {
    const responseData = JSON.parse(event.data);
    
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

    angularVelocity.x = parseFloat(responseData.wx);
    angularVelocity.y = parseFloat(responseData.wy);
    angularVelocity.z = parseFloat(responseData.wz);

    forceGlobalX = parseFloat(responseData.fx_global);
    forceGlobalY = parseFloat(responseData.fy_global);
    forceGlobalZ = parseFloat(responseData.fz_global);

    aircraft.rotationQuaternion = new BABYLON.Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w
    );

    alpha_DEG = parseFloat(responseData.alpha);
    beta_DEG = parseFloat(responseData.beta);
    pitch_demand_attained = parseFloat(responseData.pitch_demand_attained);
    roll_demand_attained = parseFloat(responseData.roll_demand_attained);
    yaw_demand_attained = parseFloat(responseData.yaw_demand_attained);
    
    updateVelocityLine();
    updateForceLine();

    if (elapsedTime < 20.0) {
        updateTrajectory();
    }
};
