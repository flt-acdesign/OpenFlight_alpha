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
        x: aircraft_geometric_reference.position.x,
        y: aircraft_geometric_reference.position.y,
        z: aircraft_geometric_reference.position.z,
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
        thrust_lever: thrust_lever,
        aileron_input: aileron_input,
        elevator_input: elevator_input,
        rudder_input: rudder_input,
        deltaTime: deltaTime
    };

    ws.send(JSON.stringify(aircraftState));
}

ws.onmessage = (event) => {
    const responseData = JSON.parse(event.data);
    
    aircraft_geometric_reference.position.x = parseFloat(responseData.x);
    aircraft_geometric_reference.position.y = parseFloat(responseData.y);
    aircraft_geometric_reference.position.z = parseFloat(responseData.z);

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

    aircraft_geometric_reference.rotationQuaternion = new BABYLON.Quaternion(
        orientation.x,
        orientation.y,
        orientation.z,
        orientation.w
    );

    alpha_DEG = parseFloat(responseData.alpha);
    beta_DEG = parseFloat(responseData.beta);

    updateVelocityLine();
    updateForceLine();

    if (elapsedTime < 20.0) {
        updateTrajectory();
    }
};
