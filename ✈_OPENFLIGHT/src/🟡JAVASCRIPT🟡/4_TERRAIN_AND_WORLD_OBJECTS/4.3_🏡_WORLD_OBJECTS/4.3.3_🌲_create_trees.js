// In file: 4.3_🏡_WORLD_OBJECTS/4.3.3_🌲_create_trees.js

/***************************************************************
 * Creates trees across the terrain using thin instances with color variations
 * Includes natural green variations and 10% autumn-colored trees
 **************************************************************/
function createRandomTrees(scene, shadowGenerator, treePositions) {
    // Check if we should create trees based on graphics settings
    if (current_graphic_settings.trees === 'none') {
        console.log("Tree creation skipped: graphic settings set to 'none'");
        return;
    }

    const treeCount = treePositions.length;
    console.log(`Creating ${treeCount} trees on the island with setting: ${current_graphic_settings.trees}`);

    // Create base tree mesh
    const baseTree = BABYLON.MeshBuilder.CreateCylinder(
        "baseTree",
        {
            diameterTop: 0,
            diameterBottom: 5,  // Base diameter (will be scaled)
            height: 15,         // Base height (will be scaled)
            tessellation: 5
        },
        scene
    );

    // Configure material with instanced color support
    const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
    treeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);  // White base (overridden by instances)
    treeMaterial.instancedColor = true;  // Enable per-instance coloring
    treeMaterial.fogEnabled = true;
    treeMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    baseTree.material = treeMaterial;

    // Adjust tree count based on graphics setting
    let adjustedTreeCount = treeCount;
    if (current_graphic_settings.trees === 'few') {
        // Reduce to 20% of the original count for 'few' setting
        adjustedTreeCount = Math.max(50, Math.floor(treeCount * 0.2));
        console.log(`Adjusted tree count to ${adjustedTreeCount} (${current_graphic_settings.trees} setting)`);
    }

    // Initialize data buffers
    const matricesData = new Float32Array(adjustedTreeCount * 16);
    const colorData = new Float32Array(adjustedTreeCount * 4);  // RGBA colors

    // Use a sampling step to skip trees based on adjusted count
    const samplingStep = Math.max(1, Math.floor(treeCount / adjustedTreeCount));
    console.log(`Using sampling step of ${samplingStep} for tree creation`);

    let actualTreeCount = 0;
    for (let i = 0; i < treeCount; i += samplingStep) {
        if (actualTreeCount >= adjustedTreeCount) break;

        // Random dimensions
        const treeHeight = Math.random() * 9 + 7;
        const treeBaseRadius = Math.random() * 2 + 3;

        // Position with random offset
        const [xCoord, yCoord, zCoord] = treePositions[i];
        const treeX = xCoord + Math.random() * 3 - 1;
        const treeY = yCoord + (treeHeight / 2);
        const treeZ = zCoord + Math.random() * 3 - 1;

        // Create transformation matrix
        BABYLON.Matrix.Compose(
            new BABYLON.Vector3(treeBaseRadius / 4, treeHeight / 15, treeBaseRadius / 4),
            BABYLON.Quaternion.Identity(),
            new BABYLON.Vector3(treeX, treeY, treeZ)
        ).copyToArray(matricesData, actualTreeCount * 16);

        // Set instance color
        let color;
        if (Math.random() < 0.1) {  // 10% chance for autumn color
            color = new BABYLON.Color3(97/255, 88/255, 11/255);  // Red-brown
        } else {  // Natural green variation
            color = new BABYLON.Color3(
                78/255 + Math.random() * 0.05,  // R
                124/255 + Math.random() * 0.1,  // G
                57/255                          // B
            );
        }
       
        // Store color in buffer (RGBA format)
        color.toArray(colorData, actualTreeCount * 4);
        colorData[actualTreeCount * 4 + 3] = 1;  // Alpha channel
        
        actualTreeCount++;
    }

    // Set thin instance buffers
    baseTree.thinInstanceSetBuffer("matrix", matricesData.slice(0, actualTreeCount * 16), 16);
    baseTree.thinInstanceSetBuffer("color", colorData.slice(0, actualTreeCount * 4), 4);
    baseTree.isVisible = true;
    
    console.log(`Successfully created ${actualTreeCount} trees`);
}