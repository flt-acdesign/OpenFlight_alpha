


/***************************************************************
 * Creates a small reference "cube tower" near the origin so
 * players can see a "landmark" in the scene for orientation.
 * It stacks multiple colored cubes in a small 3x3 base.
 **************************************************************/
function create_control_tower(scene, shadowGenerator) {
    const baseSize = 3;  // NxN cubes in each layer
    const height = 10;   // how many layers to stack

    // Create the tower structure
    for (let yLayer = 0; yLayer < height; yLayer++) {
        for (let xIndex = 0; xIndex < baseSize; xIndex++) {
            for (let zIndex = 0; zIndex < baseSize; zIndex++) {
                const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 2 }, scene);

                cube.position = new BABYLON.Vector3(
                    40 + (xIndex - (baseSize - 1) / 2) * 2,
                    yLayer * 2 + 14,
                    (zIndex - (baseSize - 1) / 2) * 2 +20
                );

                const cubeMaterial = new BABYLON.StandardMaterial("cubeMaterial", scene);
                if ((xIndex + yLayer + zIndex) % 2 === 0) {
                    cubeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
                } else {
                    cubeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
                }
                cubeMaterial.fogEnabled = true;
                cube.material = cubeMaterial;

                shadowGenerator.addShadowCaster(cube);
                cube.isAlwaysActive = true;
            }
        }
    }

    // Create blinking sphere at the top of the tower
    const blinkingSphere = createBlinkingSphere(scene, 
        40,                     // x coordinate (tower center)
        height * 2 + 13,       // y coordinate (top of tower)
        20,                     // z coordinate (tower center)
        {
            sphereColor: new BABYLON.Color3(1, 0, 0),  // Red color
            diameter: 4,                               // 2x original size
            lightRange: 10,                           // 10 units light radius
            blinkInterval: 1000,                      // 1 second interval
            lightIntensity: 1,                        // Normal light intensity
            glowIntensity: 1,                          // Normal glow intensity
            createPointLight: false
        }
    );
    // Return the blinking sphere controller in case we need to dispose it later
    //return blinkingSphere;
}
