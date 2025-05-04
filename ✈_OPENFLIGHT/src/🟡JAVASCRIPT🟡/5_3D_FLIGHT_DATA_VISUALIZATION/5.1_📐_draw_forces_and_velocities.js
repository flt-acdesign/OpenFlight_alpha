/**
 * Converts radians to degrees
 * @param {number} rad - Angle in radians
 * @returns {number} Angle in degrees
 */
const rad2deg = rad => (rad * 180.0) / Math.PI;

// --- Use a very simple, bright material for debugging ---
let lineDebugMaterialRed = null;
let lineDebugMaterialBlue = null;

// Gets or creates a simple emissive material for debugging lines
function getLineDebugMaterial(color, scene) {
    if (!scene) return null; // Safety check
    if (color === 'red' && !lineDebugMaterialRed) {
        lineDebugMaterialRed = new BABYLON.StandardMaterial("lineDebugMatRed", scene);
        lineDebugMaterialRed.emissiveColor = BABYLON.Color3.Red(); // Bright red
        lineDebugMaterialRed.disableLighting = true; // Ignore scene lighting
        lineDebugMaterialRed.wireframe = false; // Use solid lines
        lineDebugMaterialRed.zIndex = 10; // Try to force rendering on top
    } else if (color === 'blue' && !lineDebugMaterialBlue) {
        lineDebugMaterialBlue = new BABYLON.StandardMaterial("lineDebugMatBlue", scene);
        lineDebugMaterialBlue.emissiveColor = BABYLON.Color3.Blue(); // Bright blue
        lineDebugMaterialBlue.disableLighting = true;
        lineDebugMaterialBlue.wireframe = false;
        lineDebugMaterialBlue.zIndex = 10; // Try to force rendering on top
    }
    return color === 'red' ? lineDebugMaterialRed : lineDebugMaterialBlue;
}
// --- End Debug Material ---


// Creates the velocity line mesh
function createVelocityLine(scene) {
    if (!scene) { console.error("Scene object missing for createVelocityLine"); return null; }
    if (scene.getMeshByName("velocityLine")) {
        console.warn("Velocity line already exists.");
        velocityLine = scene.getMeshByName("velocityLine");
        // Ensure material is set correctly even if re-using
        if (velocityLine && !velocityLine.material) {
             velocityLine.material = getLineDebugMaterial('red', scene);
        }
        return velocityLine;
    }
    console.log("Attempting to CREATE Velocity line...");
    // Start with non-zero length points to avoid initial issues
    const points = [BABYLON.Vector3.Zero(), new BABYLON.Vector3(1, 0, 0)];
    velocityLine = BABYLON.MeshBuilder.CreateLines("velocityLine", { points: points, updatable: true }, scene);

    if (velocityLine) {
        velocityLine.material = getLineDebugMaterial('red', scene); // Use debug material
        velocityLine.renderingGroupId = 2; // Render in a later group
        velocityLine.isPickable = false;
        velocityLine.alwaysSelectAsActiveMesh = true; // Try preventing culling
        velocityLine.isVisible = true;
        velocityLine.setEnabled(true);
        console.log("Velocity line CREATED successfully.");
        return velocityLine;
    } else {
        console.error("Failed to create velocityLine mesh.");
        return null;
    }
}

// Creates the force line mesh
function createForceLine(scene) {
     if (!scene) { console.error("Scene object missing for createForceLine"); return null; }
    if (scene.getMeshByName("forceLine")) {
         console.warn("Force line already exists.");
         forceLine = scene.getMeshByName("forceLine");
         // Ensure material is set correctly even if re-using
         if (forceLine && !forceLine.material) {
             forceLine.material = getLineDebugMaterial('blue', scene);
         }
         return forceLine;
    }
    console.log("Attempting to CREATE Force line...");
    const points = [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 1, 0)]; // Start non-zero
    forceLine = BABYLON.MeshBuilder.CreateLines("forceLine", { points: points, updatable: true }, scene);

    if (forceLine) {
        forceLine.material = getLineDebugMaterial('blue', scene); // Use debug material
        forceLine.renderingGroupId = 2;
        forceLine.isPickable = false;
        forceLine.alwaysSelectAsActiveMesh = true; // Try preventing culling
        forceLine.isVisible = true;
        forceLine.setEnabled(true);
        console.log("Force line CREATED successfully.");
        return forceLine;
    } else {
        console.error("Failed to create forceLine mesh.");
        return null;
    }
}

// Updates the velocity line's position and vertices using actual velocity data
function updateVelocityLine(scene) {
    if (!scene) return;
    // Ensure the line mesh exists and is valid
    if (!velocityLine || velocityLine.isDisposed()) {
        // console.warn("updateVelocityLine: velocityLine mesh missing/disposed.");
        return;
    }
    // Ensure the aircraft exists and has a valid position & velocity data
    if (!aircraft || !aircraft.position || typeof velocity === 'undefined') {
        // console.warn("updateVelocityLine: Aircraft or velocity undefined.");
        return;
    }

    // --- Check Data Validity ---
    const pos = aircraft.position;
    const vel = velocity; // Get the global velocity object
    const isValidPos = pos && !isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z);
    // Check velocity components
    const isValidVel = vel && !isNaN(vel.x) && !isNaN(vel.y) && !isNaN(vel.z);

    if (!isValidPos || !isValidVel) {
        // console.warn("updateVelocityLine: Invalid data detected.", { isValidPos, pos, isValidVel, vel });
        // Optionally hide the line if data is invalid
        // velocityLine.isVisible = false;
        return; // Exit if data is invalid
    }
    // --- End Check ---

    const origin = pos.clone();
    const velocityVector = new BABYLON.Vector3(vel.x, vel.y, vel.z); // Create Vector3 from global object
    const scaleFactor = 0.3; // Adjust scale factor as needed for visibility
    const endPoint = origin.add(velocityVector.scale(scaleFactor)); // Calculate endpoint based on velocity

    // --- Optional Logging (Uncomment to debug specific values) ---
    // console.log(`Updating Velocity Line: O=(${origin.x.toFixed(1)}, ${origin.y.toFixed(1)}, ${origin.z.toFixed(1)}) V=(${vel.x.toFixed(1)}, ${vel.y.toFixed(1)}, ${vel.z.toFixed(1)}) E=(${endPoint.x.toFixed(1)}, ${endPoint.y.toFixed(1)}, ${endPoint.z.toFixed(1)})`);
    // --- End Logging ---

    // Check if start and end points are too close (line might be invisible)
    if (origin.equalsWithEpsilon(endPoint, 0.01)) {
        // console.warn("Velocity line start/end points are very close.");
        // Make line zero-length but keep it available
         velocityLine.updateVerticesData(BABYLON.VertexBuffer.PositionKind, [
             origin.x, origin.y, origin.z,
             origin.x, origin.y, origin.z // Start and end are the same
         ]);
         // velocityLine.isVisible = false; // Optionally hide
    } else {
         velocityLine.isVisible = true; // Ensure it's visible if points are distinct
         try {
             // Update the vertex data for the line
             velocityLine.updateVerticesData(BABYLON.VertexBuffer.PositionKind, [
                 origin.x, origin.y, origin.z,
                 endPoint.x, endPoint.y, endPoint.z
             ]);
             // Force update of the world matrix (important after vertex updates)
             velocityLine.computeWorldMatrix(true);
         } catch (e) {
             console.error("Error in velocityLine.updateVerticesData:", e);
         }
    }
}

// Updates the force line's position and vertices using actual force data
function updateForceLine(scene) {
     if (!scene) return;
     // Ensure the line mesh exists and is valid
     if (!forceLine || forceLine.isDisposed()) {
        // console.warn("updateForceLine: forceLine mesh missing/disposed.");
        return;
    }
     // Ensure the aircraft exists and has valid position & force data
     if (!aircraft || !aircraft.position ||
         typeof forceGlobalX === 'undefined' || typeof forceGlobalY === 'undefined' || typeof forceGlobalZ === 'undefined')
    {
        // console.warn("updateForceLine: Aircraft or forces undefined.");
        return;
    }

    // --- Check Data Validity ---
    const pos = aircraft.position;
    const fX = forceGlobalX; const fY = forceGlobalY; const fZ = forceGlobalZ; // Get global forces
    const isValidPos = pos && !isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z);
    // Check force components
    const isValidForce = !isNaN(fX) && !isNaN(fY) && !isNaN(fZ);

    if (!isValidPos || !isValidForce) {
        // console.warn("updateForceLine: Invalid data detected.", { isValidPos, pos, isValidForce, fX, fY, fZ });
        // Optionally hide the line if data is invalid
        // forceLine.isVisible = false;
        return; // Exit if data is invalid
    }
    // --- End Check ---

    const origin = pos.clone();
    const forceVector = new BABYLON.Vector3(fX, fY, fZ); // Create Vector3 from global forces
    const scaleFactor = 0.002; // Adjust scale factor as needed
    const endPoint = origin.add(forceVector.scale(scaleFactor)); // Calculate endpoint based on force

    // --- Optional Logging (Uncomment to debug specific values) ---
    // console.log(`Updating Force Line: O=(${origin.x.toFixed(1)}, ${origin.y.toFixed(1)}, ${origin.z.toFixed(1)}) F=(${fX.toFixed(1)}, ${fY.toFixed(1)}, ${fZ.toFixed(1)}) E=(${endPoint.x.toFixed(1)}, ${endPoint.y.toFixed(1)}, ${endPoint.z.toFixed(1)})`);
    // --- End Logging ---

    // Check if start and end points are too close
    if (origin.equalsWithEpsilon(endPoint, 0.01)) {
        // console.warn("Force line start/end points are very close.");
        // Make line zero-length
         forceLine.updateVerticesData(BABYLON.VertexBuffer.PositionKind, [
             origin.x, origin.y, origin.z,
             origin.x, origin.y, origin.z
         ]);
         // forceLine.isVisible = false; // Optionally hide
    } else {
         forceLine.isVisible = true; // Ensure visible
        try {
            // Update the vertex data for the line
            forceLine.updateVerticesData(BABYLON.VertexBuffer.PositionKind, [
                origin.x, origin.y, origin.z,
                endPoint.x, endPoint.y, endPoint.z
            ]);
            // Force update of the world matrix
            forceLine.computeWorldMatrix(true);
        } catch (e) {
            console.error("Error in forceLine.updateVerticesData:", e);
        }
    }
}
