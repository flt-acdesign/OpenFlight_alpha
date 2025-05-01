/***************************************************************
 * 5.2_➰_draw_aircraft_trajectory.js
 *
 * Creates a "thin instance" system for trajectory spheres.
 * We switch to using serverTime instead of local 'elapsedTime'.
 * MODIFIED: Adds a sphere only once every 5 calls.
 ***************************************************************/

// We'll track all instance transforms/colors in arrays
let trajectoryBaseSphere;
let trajectoryMatrixData = [];
let trajectoryColorData  = [];
let updateTrajectoryCallCount = 0; // Counter for calls to updateTrajectory

/**
 * Initializes the base sphere for trajectory thin-instances.
 */
function initializeTrajectorySystem() {
    trajectoryBaseSphere = BABYLON.MeshBuilder.CreateSphere("trajectoryBase", {
        diameter: 1.1,
        segments: 3
    }, scene);

    trajectoryBaseSphere.isPickable = false; // unpickable

    const trajectoryMaterial = new BABYLON.StandardMaterial("trajectoryMaterial", scene);
    trajectoryMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // Base color (less important with instancedColor)
    trajectoryMaterial.instancedColor = true; // Enable per-instance color

    trajectoryBaseSphere.material = trajectoryMaterial;
    trajectoryBaseSphere.useThinInstances = true;
    trajectoryBaseSphere.isVisible = false; // base alone is hidden
}

/**
 * Adds a new sphere instance at the aircraft's position, but only once
 * every frames_per_trajectory_marker times this function is called. Color depends on:
 * - if `serverTime` ∈ [start_flight_data_recording_at, finish_flight_data_recording_at],
 * then pink; else green.
 * @param {number} serverTime - The time from the Julia server.
 */
function updateTrajectory(serverTime ) {
    if (show_trajectory !== "true") {
        return; // Exit if trajectory display is off
    }
    if (!aircraft) {
        return; // Exit if aircraft mesh doesn't exist yet
    }
    if (!trajectoryBaseSphere) {
        console.warn("Trajectory system not initialized yet.");
        return; // Exit if base sphere isn't ready
    }

    // Increment the call counter
    updateTrajectoryCallCount++;

    // Only proceed to add a sphere instance every 5 calls
    if (updateTrajectoryCallCount % frames_per_trajectory_marker === 0) {

        // 1) Build transform matrix for the new sphere based on current aircraft position
        const matrix = BABYLON.Matrix.Translation(
            aircraft.position.x,
            aircraft.position.y,
            aircraft.position.z
        );
        // Add the new matrix to our array
        trajectoryMatrixData.push(matrix);

        // 2) Decide the color for this new sphere instance
        let sphereColor;
        if (
            serverTime >= start_flight_data_recording_at &&
            serverTime <= finish_flight_data_recording_at
        ) {
            // Pink if within the recording interval
            sphereColor = new BABYLON.Color3(1.0, 0.7, 0.85);
        } else {
            // Green otherwise
            sphereColor = new BABYLON.Color3(0.7, 1.0, 0.7);
        }
        // Add the color components (RGBA) to our color array
        trajectoryColorData.push([sphereColor.r, sphereColor.g, sphereColor.b, 1.0]); // Add alpha = 1.0

        // --- Update the thin instance buffers ---
        // It's more efficient to create the typed arrays once with the correct size
        // than pushing elements individually in a loop inside the update function.
        // However, since the arrays grow, we rebuild them here. For very high
        // performance, consider pre-allocating or using a different strategy.

        // Convert matrix array to a flat Float32Array
        const matrixData = new Float32Array(trajectoryMatrixData.length * 16);
        for (let i = 0; i < trajectoryMatrixData.length; i++) {
            trajectoryMatrixData[i].copyToArray(matrixData, i * 16);
        }

        // Convert color array to a flat Float32Array
        const colorData = new Float32Array(trajectoryColorData.length * 4);
        // We can directly copy from the nested array structure
        for (let i = 0; i < trajectoryColorData.length; i++) {
             colorData[i * 4 + 0] = trajectoryColorData[i][0]; // R
             colorData[i * 4 + 1] = trajectoryColorData[i][1]; // G
             colorData[i * 4 + 2] = trajectoryColorData[i][2]; // B
             colorData[i * 4 + 3] = trajectoryColorData[i][3]; // A
         }

        // Make the base sphere visible only if there are instances to show
        trajectoryBaseSphere.isVisible = trajectoryMatrixData.length > 0;

        // Update the buffers on the GPU
        // The 'true' argument indicates the buffer size might change (dynamic)
        trajectoryBaseSphere.thinInstanceSetBuffer("matrix", matrixData, 16, true);
        trajectoryBaseSphere.thinInstanceSetBuffer("color", colorData, 4, true);

        // The thinInstanceCount MUST be set explicitly after updating buffers
        // It tells Babylon.js how many instances to actually draw.
        // It should always match the number of items in your data arrays.
        trajectoryBaseSphere.thinInstanceCount = trajectoryMatrixData.length;

        // --- End buffer update ---
    }
    // If it's not the 5th call (updateTrajectoryCallCount % 5 !== 0),
    // this function does nothing, effectively skipping the sphere addition.
}

// Optional: Consider adding a function to clear the trajectory if needed
function resetTrajectory() {
    trajectoryMatrixData = [];
    trajectoryColorData = [];
    updateTrajectoryCallCount = 0; // Reset the counter too
    if (trajectoryBaseSphere) {
        trajectoryBaseSphere.thinInstanceCount = 0; // Tell Babylon to draw 0 instances
        trajectoryBaseSphere.isVisible = false; // Hide the base sphere holder
        // Optionally clear the buffers explicitly, though setting count to 0 is usually enough
        // trajectoryBaseSphere.thinInstanceSetBuffer("matrix", null);
        // trajectoryBaseSphere.thinInstanceSetBuffer("color", null);
    }
    console.log("Trajectory reset.");
}