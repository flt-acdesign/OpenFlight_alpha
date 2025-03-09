// 5.1_📐_draw_forces_and_velocities.js

// Global variables to hold the lines
let velocityLine, forceLine;

/**
 * Creates a line mesh for visualizing velocity.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 */
function createVelocityLine(scene) {
    // Create initial points
    const points = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 0)
    ];
    velocityLine = BABYLON.MeshBuilder.CreateLines("velocityLine", { points: points }, scene);
    velocityLine.color = BABYLON.Color3.Red();
    velocityLine.renderingGroupId = 1;
}

/**
 * Creates a line mesh for visualizing force.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 */
function createForceLine(scene) {
    // Create initial points
    const points = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(0, 0, 0)
    ];
    forceLine = BABYLON.MeshBuilder.CreateLines("forceLine", { points: points }, scene);
    forceLine.color = BABYLON.Color3.Blue();
    forceLine.renderingGroupId = 1;
}

/**
 * Updates the velocity line based on the current aircraft position and velocity.
 */
function updateVelocityLine() {
    if (!aircraft || !velocityLine) return;
    
    const origin = aircraft.position.clone();
    const velocityVector = new BABYLON.Vector3(velocity.x, velocity.y, velocity.z);
    
    // Scale the velocity vector for visualization purposes.
    const scaleFactor = 0.3;
    const endPoint = origin.add(velocityVector.scale(scaleFactor));
    
    // Update the line's vertices.
    velocityLine.setVerticesData(BABYLON.VertexBuffer.PositionKind, [
        origin.x, origin.y, origin.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);
}

/**
 * Updates the force line based on the current aircraft position and global forces.
 */
function updateForceLine() {
    if (!aircraft || !forceLine) return;
    
    const origin = aircraft.position.clone();
    const forceVector = new BABYLON.Vector3(forceGlobalX, forceGlobalY, forceGlobalZ);
    
    // Scale the force vector for visualization purposes.
    const scaleFactor = 0.002;
    const endPoint = origin.add(forceVector.scale(scaleFactor));
    
    // Update the line's vertices.
    forceLine.setVerticesData(BABYLON.VertexBuffer.PositionKind, [
        origin.x, origin.y, origin.z,
        endPoint.x, endPoint.y, endPoint.z
    ]);
}
