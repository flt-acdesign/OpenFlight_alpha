






/***************************************************************
 * Creates a number of random "trees" across the terrain.
 * Each tree is a simple tapered cylinder placed at the local
 * terrain height (the trunk top extends upward from that height).
 **************************************************************/
function createRandomTrees(scene, shadowGenerator, groundConfig) {
    // How many trees to scatter
    const treeCount = 150;

    // Extract config
    const { freqX, freqZ, amplitude } = groundConfig;

    for (let i = 0; i < treeCount; i++) {
        // Random dimension
        const treeHeight = Math.random() * 15 + 7;  // between 7 and 18
        const treeBaseRadius = Math.random() * 4 + 2; // between 2 and 6

        // Random position in the x-z plane
        // (Adjust range to whatever region you want the trees scattered)
        const xCoord = Math.random() * 580 + 390;   // e.g., 90 -> 670
        const zCoord = Math.random() * 580 - 90;   // e.g., -90 -> 490

        // Find the terrain height at (xCoord, zCoord)
        const groundY = undulationMap(xCoord, zCoord, freqX, freqZ, amplitude) - 1

        // We'll position the cylinder so that it emerges out of the ground
        const treeY = groundY + (treeHeight / 2);

        // Create a simple tapered cylinder
        const tree = BABYLON.MeshBuilder.CreateCylinder(
            "tree",
            {
                diameterTop: 0,
                diameterBottom: treeBaseRadius,
                height: treeHeight,
                tessellation: 6
            },
            scene
        );

        // Set the final position of the tree
        tree.position = new BABYLON.Vector3(xCoord, treeY, zCoord);

        // Simple material (green)
        const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
        treeMaterial.diffuseColor = new BABYLON.Color3(0.13, 0.55, 0.13);
        treeMaterial.fogEnabled = true;
        tree.material = treeMaterial;

        // Let the tree cast shadows
        shadowGenerator.addShadowCaster(tree);

        // Keep the tree active at all times (useful in large scenes)
        tree.isAlwaysActive = true;
    }
}
