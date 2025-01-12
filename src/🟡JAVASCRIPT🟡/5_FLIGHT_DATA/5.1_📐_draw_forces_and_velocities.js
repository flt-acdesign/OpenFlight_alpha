








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




function createVelocityLine() {
  const points = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)]
  velocityLine = BABYLON.MeshBuilder.CreateLines("velocityLine", { points: points }, scene)
  velocityLine.color = BABYLON.Color3.Red()
}

function createForceLine() {
  const points = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, 0)]
  forceLine = BABYLON.MeshBuilder.CreateLines("forceLine", { points: points }, scene)
  forceLine.color = BABYLON.Color3.Blue()
}

function updateVelocityLine() {
  // Dispose of the previous velocity line if it exists
  if (velocityLine) {
    velocityLine.dispose()
  }

  const origin = aircraft.position.clone()
  const velocityVector = new BABYLON.Vector3(velocity.x, velocity.y, velocity.z)

  // Scale the velocity vector for visualization purposes
  const scaleFactor = 0.5 // Adjust as necessary
  const endPoint = origin.add(velocityVector.scale(scaleFactor))

  const points = [origin, endPoint]

  // Create a new velocity line
  velocityLine = BABYLON.MeshBuilder.CreateLines("velocityLine", { points: points }, scene)
  velocityLine.color = BABYLON.Color3.Red()
  velocityLine.visibility = 1

  // Ensure lines are always visible (render on top of other objects)
  velocityLine.renderingGroupId = 1 // Higher render group
}

function updateForceLine() {
  // Dispose of the previous force line if it exists
  if (forceLine) {
    forceLine.dispose()
  }

  const origin = aircraft.position.clone()
  const forceVector = new BABYLON.Vector3(forceGlobalX, forceGlobalY, forceGlobalZ)

  // Scale the force vector for visualization purposes
  const scaleFactor = 1.5 // Adjust as necessary
  const endPoint = origin.add(forceVector.scale(scaleFactor))

  const points = [origin, endPoint]

  // Create a new force line
  forceLine = BABYLON.MeshBuilder.CreateLines("forceLine", { points: points }, scene)
  forceLine.color = BABYLON.Color3.Blue()
  forceLine.visibility = 1

  // Ensure lines are always visible (render on top of other objects)
  forceLine.renderingGroupId = 1 // Higher render group
}










