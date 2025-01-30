/**
 * Converts radians to degrees
 * @param {number} rad - Angle in radians
 * @returns {number} Angle in degrees
 */
const rad2deg = rad => (rad * 180.0) / Math.PI;

function createVelocityLine() {
    // Create initial points
    const points = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)];
    velocityLine = BABYLON.MeshBuilder.CreateLines("velocityLine", { points: points }, scene);
    velocityLine.color = BABYLON.Color3.Red();
    velocityLine.renderingGroupId = 1;
}

function createForceLine() {
    // Create initial points
    const points = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)];
    forceLine = BABYLON.MeshBuilder.CreateLines("forceLine", { points: points }, scene);
    forceLine.color = BABYLON.Color3.Blue();
    forceLine.renderingGroupId = 1;
}

function updateVelocityLine() {
    const origin = aircraft.position.clone();
    const velocityVector = new BABYLON.Vector3(velocity.x, velocity.y, velocity.z);
    
    // Scale the velocity vector for visualization
    const scaleFactor = 0.5;
    const endPoint = origin.add(velocityVector.scale(scaleFactor));
    
    // Update existing line points
    velocityLine.setVerticesData(BABYLON.VertexBuffer.PositionKind, [
        origin.x, origin.y, origin.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);
}

function updateForceLine() {
    const origin = aircraft.position.clone();
    const forceVector = new BABYLON.Vector3(forceGlobalX, forceGlobalY, forceGlobalZ);
    
    // Scale the force vector for visualization
    const scaleFactor = 1.5;
    const endPoint = origin.add(forceVector.scale(scaleFactor));
    
    // Update existing line points
    forceLine.setVerticesData(BABYLON.VertexBuffer.PositionKind, [
        origin.x, origin.y, origin.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);
}
