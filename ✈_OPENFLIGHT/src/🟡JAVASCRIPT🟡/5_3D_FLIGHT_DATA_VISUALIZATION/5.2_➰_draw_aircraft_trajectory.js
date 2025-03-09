// 5.2_➰_draw_aircraft_trajectory.js
// This file sets up the trajectory system to record and display the aircraft's path using thin instances.

let trajectoryBaseSphere;         // Base sphere for thin instances
let trajectoryMatrixData = [];    // Array to store transformation matrices

/**
 * Initializes the trajectory system by creating a single (invisible) base sphere
 * that will serve as the template for thin instances.
 *
 * @param {BABYLON.Scene} scene - The Babylon.js scene to which the trajectory sphere is added.
 */
function initializeTrajectorySystem(scene) {
    // Create a base sphere for thin instances.
    trajectoryBaseSphere = BABYLON.MeshBuilder.CreateSphere("trajectoryBase", { 
        diameter: 1.1, 
        segments: 4 
    }, scene);
    
    // Create and assign a material for the sphere.
    const trajectoryMaterial = new BABYLON.StandardMaterial("trajectoryMaterial", scene);
    trajectoryMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0); // Green color for visibility
    trajectoryBaseSphere.material = trajectoryMaterial;

    // Enable thin instances so that we can efficiently render many copies.
    trajectoryBaseSphere.useThinInstances = true;

    // Hide the base sphere so only the thin instances (the recorded trajectory points) are visible.
    trajectoryBaseSphere.isVisible = false;
}

/**
 * Updates the trajectory by recording the aircraft's current position as a new thin instance.
 */
function updateTrajectory() {
    // Make sure there's an aircraft and that the trajectory system has been initialized.
    if (!aircraft || !trajectoryBaseSphere) {
        return;
    }
    
    // Create a new transformation matrix corresponding to the current aircraft position.
    const matrix = BABYLON.Matrix.Translation(
        aircraft.position.x,
        aircraft.position.y,
        aircraft.position.z
    );
    
    // Add the new matrix to the array.
    trajectoryMatrixData.push(matrix);
    
    // Convert the array of matrices into a Float32Array.
    const matrixData = new Float32Array(trajectoryMatrixData.length * 16);
    trajectoryMatrixData.forEach((mat, index) => {
        mat.copyToArray(matrixData, index * 16);
    });
    
    // Make the base sphere visible once we start adding instances.
    trajectoryBaseSphere.isVisible = true;
    
    // Update the thin instance buffer with the new transformation matrices.
    trajectoryBaseSphere.thinInstanceSetBuffer("matrix", matrixData, 16);
    trajectoryBaseSphere.thinInstanceCount = trajectoryMatrixData.length;
}
