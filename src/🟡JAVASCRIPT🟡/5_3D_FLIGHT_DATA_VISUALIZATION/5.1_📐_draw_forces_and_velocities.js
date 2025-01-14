







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










