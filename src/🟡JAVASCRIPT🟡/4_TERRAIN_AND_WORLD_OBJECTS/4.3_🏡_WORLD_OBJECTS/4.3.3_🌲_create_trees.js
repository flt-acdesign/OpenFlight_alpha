/***************************************************************
 * Creates trees across the terrain using thin instances based on given coordinates.
 * Thin instances allow for efficient rendering of many identical meshes.
 **************************************************************/
function createRandomTrees(scene, shadowGenerator, treePositions) {
    // Number of trees to scatter based on the provided positions
    const treeCount = treePositions.length;

    console.log(`There are ${treeCount} trees on the island`);

    // Create the base tree mesh (a simple tapered cylinder)
    const baseTree = BABYLON.MeshBuilder.CreateCylinder(
        "baseTree",
        {
            diameterTop: 0,
            diameterBottom: 5,  // Placeholder, will scale individually
            height: 15,         // Placeholder, will scale individually
            tessellation: 5
        },
        scene
    );

    // Simple green material for the trees
    const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
    treeMaterial.diffuseColor = new BABYLON.Color3(0.13, 0.55, 0.13);
    treeMaterial.fogEnabled = true;
    treeMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    treeMaterial.specularPower = 0;

    baseTree.material = treeMaterial

    // Enable shadows for the base tree
    //shadowGenerator.addShadowCaster(baseTree);
    baseTree.isVisible = true;  // Ensure the base mesh is visible for thin instances to render

    // Create thin instances for the trees
    const matricesData = new Float32Array(treeCount * 16);

    for (let i = 0; i < treeCount; i++) {
        // Random dimension
        const treeHeight = Math.random() * 9 + 7;  // between 7 and 16
        const treeBaseRadius = Math.random() * 2 + 3; // between 3 and 5

        // Use provided coordinates for the tree position
        const [xCoord, yCoord, zCoord] = treePositions[i];

        // Assume groundY is 0 for simplicity or adjust as needed
        
        const treeX = xCoord + Math.random() * 3 - 1
        const treeY = yCoord + (treeHeight / 2);
        const treeZ = zCoord + Math.random() * 3 - 1

        // Create transformation matrix
        const matrix = BABYLON.Matrix.Compose(
            new BABYLON.Vector3(treeBaseRadius / 4, treeHeight / 15, treeBaseRadius / 4), // Scaling
            BABYLON.Quaternion.Identity(), // No rotation
            new BABYLON.Vector3(treeX, treeY, treeZ) // Position
        );

        // Store matrix in the Float32Array
        matrix.copyToArray(matricesData, i * 16);
    }

    // Apply thin instances
    baseTree.thinInstanceSetBuffer("matrix", matricesData, 16);
}








