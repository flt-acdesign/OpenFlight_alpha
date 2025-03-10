/***************************************************************
 * 5.2_➰_draw_aircraft_trajectory.js
 *
 * Creates a "thin instance" system for trajectory spheres.
 * We switch to using serverTime instead of local 'elapsedTime'.
 ***************************************************************/

// We'll track all instance transforms/colors in arrays
let trajectoryBaseSphere;
let trajectoryMatrixData = [];
let trajectoryColorData  = [];

/**
 * Initializes the base sphere for trajectory thin-instances.
 */
function initializeTrajectorySystem() {
    trajectoryBaseSphere = BABYLON.MeshBuilder.CreateSphere("trajectoryBase", {
        diameter: 1.1,
        segments: 4
    }, scene);

    trajectoryBaseSphere.isPickable = false; // unpickable

    const trajectoryMaterial = new BABYLON.StandardMaterial("trajectoryMaterial", scene);
    trajectoryMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    trajectoryMaterial.instancedColor = true;

    trajectoryBaseSphere.material = trajectoryMaterial;
    trajectoryBaseSphere.useThinInstances = true;
    trajectoryBaseSphere.isVisible = false; // base alone is hidden
}

/**
 * Adds a new sphere instance at the aircraft's position. Color depends on:
 *   - if `serverTime` ∈ [start_flight_data_recording_at, finish_flight_data_recording_at],
 *     then pink; else green.
 * @param {number} serverTime - The time from the Julia server.
 */
function updateTrajectory(serverTime) {
    if (show_trajectory !== "true") {
        return;
    }
    if (!aircraft) {
        return;
    }

    // 1) Build transform for the new sphere
    const matrix = BABYLON.Matrix.Translation(
        aircraft.position.x,
        aircraft.position.y,
        aircraft.position.z
    );
    trajectoryMatrixData.push(matrix);

    // 2) Decide color (pink if in record interval, else green)
    let sphereColor;
    if (
        serverTime >= start_flight_data_recording_at &&
        serverTime <= finish_flight_data_recording_at
    ) {
        // pink
        sphereColor = new BABYLON.Color3(1.0, 0.7, 0.85);
    } else {
        // green
        sphereColor = new BABYLON.Color3(0.6, 1.0, 0.6);
    }

    trajectoryColorData.push([sphereColor.r, sphereColor.g, sphereColor.b, 1.0]);

    // Convert to typed arrays
    const matrixData = new Float32Array(trajectoryMatrixData.length * 16);
    for (let i = 0; i < trajectoryMatrixData.length; i++) {
        trajectoryMatrixData[i].copyToArray(matrixData, i * 16);
    }

    const colorData = new Float32Array(trajectoryColorData.length * 4);
    for (let i = 0; i < trajectoryColorData.length; i++) {
        colorData[i * 4 + 0] = trajectoryColorData[i][0];
        colorData[i * 4 + 1] = trajectoryColorData[i][1];
        colorData[i * 4 + 2] = trajectoryColorData[i][2];
        colorData[i * 4 + 3] = trajectoryColorData[i][3];
    }

    trajectoryBaseSphere.isVisible = true;
    trajectoryBaseSphere.thinInstanceSetBuffer("matrix", matrixData, 16);
    trajectoryBaseSphere.thinInstanceSetBuffer("color", colorData, 4);
    trajectoryBaseSphere.thinInstanceCount = trajectoryMatrixData.length;
}
