/***************************************************************
 * Creates trees across the terrain using thin instances based on given coordinates.
 * Thin instances allow for efficient rendering of many identical meshes.
 **************************************************************/
function createRandomTrees(scene, shadowGenerator, treePositions) {
    // Number of trees to scatter based on the provided positions
    const treeCount = treePositions.length;

    // Create the base tree mesh (a simple tapered cylinder)
    const baseTree = BABYLON.MeshBuilder.CreateCylinder(
        "baseTree",
        {
            diameterTop: 0,
            diameterBottom: 4,  // Placeholder, will scale individually
            height: 15,         // Placeholder, will scale individually
            tessellation: 6
        },
        scene
    );

    // Simple green material for the trees
    const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
    treeMaterial.diffuseColor = new BABYLON.Color3(0.13, 0.55, 0.13);
    treeMaterial.fogEnabled = true;
    baseTree.material = treeMaterial;

    // Enable shadows for the base tree
    shadowGenerator.addShadowCaster(baseTree);
    baseTree.isVisible = true;  // Ensure the base mesh is visible for thin instances to render

    // Create thin instances for the trees
    const matricesData = new Float32Array(treeCount * 16);

    for (let i = 0; i < treeCount; i++) {
        // Random dimension
        const treeHeight = Math.random() * 13 + 9;  // between 9 and 18
        const treeBaseRadius = Math.random() * 3 + 3; // between 3 and 6

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




















/***************************************************************
 * Creates a number of random "trees" across the terrain using thin instances.
 * Thin instances allow for efficient rendering of many identical meshes.
 **************************************************************/
function createRandomTrees_old(scene, shadowGenerator, groundConfig) {
    // Number of trees to scatter
    const treeCount = 15000

    // Extract config
    const { freqX, freqZ, amplitude } = groundConfig;

    // Create the base tree mesh (a simple tapered cylinder)
    const baseTree = BABYLON.MeshBuilder.CreateCylinder(
        "baseTree",
        {
            diameterTop: 0,
            diameterBottom: 4,  // Placeholder, will scale individually
            height: 15,         // Placeholder, will scale individually
            tessellation: 6
        },
        scene
    );

    // Simple green material for the trees
    const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
    treeMaterial.diffuseColor = new BABYLON.Color3(0.13, 0.55, 0.13);
    treeMaterial.fogEnabled = true;
    baseTree.material = treeMaterial;

    // Enable shadows for the base tree
    shadowGenerator.addShadowCaster(baseTree);
    baseTree.isVisible = true;  // Hide the base mesh

    // Create thin instances for the trees
    const matricesData = [];

    for (let i = 0; i < treeCount; i++) {
        // Random dimension
        const treeHeight = Math.random() * 15 + 7;  // between 7 and 18
        const treeBaseRadius = Math.random() * 4 + 2; // between 2 and 6

        // Random position in the x-z plane
        const xCoord = Math.random() * 580 + 90;
        const zCoord = Math.random() * 580 - 190;

        // Find the terrain height at (xCoord, zCoord)
        const groundY = compute_terrain_height_and_derivatives(xCoord, zCoord, freqX, freqZ, amplitude) - 1;
        const treeY = groundY + (treeHeight / 2);

        // Create transformation matrix
        const matrix = BABYLON.Matrix.Compose(
            new BABYLON.Vector3(treeBaseRadius / 4, treeHeight / 15, treeBaseRadius / 4), // Scaling
            BABYLON.Quaternion.Identity(), // No rotation
            new BABYLON.Vector3(xCoord, treeY, zCoord) // Position
        );

        // Add the matrix to the instance data
        matricesData.push(matrix);
    }

    // Apply thin instances
    baseTree.thinInstanceAdd(matricesData);
} 

/***************************************************************
 * Helper function to simulate terrain height at a given point.
 **************************************************************/
function un1dulationMap(x, z, freqX, freqZ, amplitude) {
    return Math.sin(x * freqX) * Math.cos(z * freqZ) * amplitude;
}
