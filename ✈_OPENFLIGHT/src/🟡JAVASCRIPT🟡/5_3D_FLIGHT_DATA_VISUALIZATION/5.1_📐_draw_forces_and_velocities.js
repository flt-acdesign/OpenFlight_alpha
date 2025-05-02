/**
 * Converts radians to degrees
 * @param {number} rad - Angle in radians
 * @returns {number} Angle in degrees
 */
// Ensure this function is accessible globally or defined where needed (e.g., here or in initializations)
const rad2deg = rad => (rad * 180.0) / Math.PI;

function createVelocityLine() {
    // Create initial points - Check if scene exists
    if (typeof scene === 'undefined') {
        console.error("Scene not defined for createVelocityLine");
        return;
    }
    const points = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)];
    // Ensure velocityLine is declared globally (e.g., in initializations.js) or passed
    velocityLine = BABYLON.MeshBuilder.CreateLines("velocityLine", { points: points, updatable: true }, scene); // Add updatable: true
    if (velocityLine) {
        velocityLine.color = BABYLON.Color3.Red();
        velocityLine.renderingGroupId = 1; // Render on top
        velocityLine.isPickable = false;
    }
}

function createForceLine() {
     // Create initial points - Check if scene exists
    if (typeof scene === 'undefined') {
        console.error("Scene not defined for createForceLine");
        return;
    }
    const points = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)];
     // Ensure forceLine is declared globally (e.g., in initializations.js) or passed
    forceLine = BABYLON.MeshBuilder.CreateLines("forceLine", { points: points, updatable: true }, scene); // Add updatable: true
    if (forceLine) {
        forceLine.color = BABYLON.Color3.Blue();
        forceLine.renderingGroupId = 1; // Render on top
        forceLine.isPickable = false;
    }
}

function updateVelocityLine() {
    // Ensure aircraft, velocityLine, and velocity exist
    if (!aircraft || !aircraft.position || !velocityLine || typeof velocity === 'undefined') {
        // console.warn("updateVelocityLine: Missing required elements."); // Avoid spamming
        return;
    }
    const origin = aircraft.position.clone();
    const velocityVector = new BABYLON.Vector3(velocity.x, velocity.y, velocity.z);

    // Scale the velocity vector for visualization
    const scaleFactor = 0.3;
    const endPoint = origin.add(velocityVector.scale(scaleFactor));

    // Update existing line points using updateVerticesData
    velocityLine.updateVerticesData(BABYLON.VertexBuffer.PositionKind, [
        origin.x, origin.y, origin.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);
     velocityLine.refreshBoundingInfo(); // Important after updating vertices
}

function updateForceLine() {
     // Ensure aircraft, forceLine, and forces exist
    if (!aircraft || !aircraft.position || !forceLine || typeof forceGlobalX === 'undefined') {
         // console.warn("updateForceLine: Missing required elements."); // Avoid spamming
        return;
    }
    const origin = aircraft.position.clone();
    const forceVector = new BABYLON.Vector3(forceGlobalX, forceGlobalY, forceGlobalZ);

    // Scale the force vector for visualization
    const scaleFactor = .002; // Adjust scale if forces are very large/small
    const endPoint = origin.add(forceVector.scale(scaleFactor));

    // Update existing line points using updateVerticesData
    forceLine.updateVerticesData(BABYLON.VertexBuffer.PositionKind, [
        origin.x, origin.y, origin.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);
    forceLine.refreshBoundingInfo(); // Important after updating vertices
}