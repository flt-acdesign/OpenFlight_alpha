



let trajectoryBaseSphere;   // The base sphere for thin instances
let trajectoryMatrixData = [];  // Array to store transformation matrices

function initializeTrajectorySystem() {
    // Create a single base sphere (invisible) for thin instances
    trajectoryBaseSphere = BABYLON.MeshBuilder.CreateSphere("trajectoryBase", { 
        diameter: 1.1, 
        segments: 4 
    }, scene);
    
    // Assign material once
    const trajectoryMaterial = new BABYLON.StandardMaterial("trajectoryMaterial", scene);
    trajectoryMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0); // Green color
    trajectoryBaseSphere.material = trajectoryMaterial;

    // Enable thin instances
    trajectoryBaseSphere.useThinInstances = true;

    // Hide the base sphere itself
    trajectoryBaseSphere.isVisible = false;
}

function updateTrajectory() {
    if (!trajectoryBaseSphere) {
        console.warn("Trajectory system not initialized. Call initializeTrajectorySystem() first.");
        return;
    }

    // Create a new transformation matrix for the current aircraft position
    const matrix = BABYLON.Matrix.Translation(aircraft.position.x, aircraft.position.y, aircraft.position.z);
    
    // Add the new matrix to the trajectory data
    trajectoryMatrixData.push(matrix);
    
    // Convert matrices to Float32Array
    const matrixData = new Float32Array(trajectoryMatrixData.length * 16);
    trajectoryMatrixData.forEach((matrix, index) => {
        matrix.copyToArray(matrixData, index * 16);
    });
    
    // Make base mesh visible when instances are added
    trajectoryBaseSphere.isVisible = true;
    
    // Set the buffer and update the number of instances
    trajectoryBaseSphere.thinInstanceSetBuffer("matrix", matrixData, 16);
    trajectoryBaseSphere.thinInstanceCount = trajectoryMatrixData.length;
}

