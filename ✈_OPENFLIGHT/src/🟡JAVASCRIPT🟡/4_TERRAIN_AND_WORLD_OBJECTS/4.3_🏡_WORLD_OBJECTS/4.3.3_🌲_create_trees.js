/***************************************************************
 * Creates trees across the terrain using thin instances with color variations
 * Includes natural green variations and 10% autumn-colored trees
 **************************************************************/
function createRandomTrees(scene, shadowGenerator, treePositions) {
    const treeCount = treePositions.length;
    console.log(`There are ${treeCount} trees on the island`);

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

    // Initialize data buffers
    const matricesData = new Float32Array(treeCount * 16);
    const colorData = new Float32Array(treeCount * 4);  // RGBA colors

    for (let i = 0; i < treeCount; i++) {
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
        ).copyToArray(matricesData, i * 16);

        // Set instance color
        let color;
        if (Math.random() < 0.01) {  // 10% chance for autumn color
            color = new BABYLON.Color3(97/255, 88/255, 11/255);  // Red-brown
        } else {  // Natural green variation
            color = new BABYLON.Color3(
                78/255 + Math.random() * 0.05,  // R
                124/255 + Math.random() * 0.1,  // G
                57/255                          // B
            );
        }
       

        // Store color in buffer (RGBA format)
        color.toArray(colorData, i * 4);
        colorData[i * 4 + 3] = 1;  // Alpha channel
    }

    // Set thin instance buffers
    baseTree.thinInstanceSetBuffer("matrix", matricesData, 16);
    baseTree.thinInstanceSetBuffer("color", colorData, 4);
    baseTree.isVisible = true;
}
