


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
            glowIntensity: 1                          // Normal glow intensity
        }
    );
    // Return the blinking sphere controller in case we need to dispose it later
    //return blinkingSphere;
}


function createBlinkingSphere(scene, x, y, z, options = {}) {
    const defaults = {
        sphereColor: new BABYLON.Color3(1, 0, 0),
        diameter: 4,
        lightRange: 10,
        blinkInterval: 1000,
        lightIntensity: 1,
        glowIntensity: 1,
        waitingInterval: null,
        number_of_blinks: null
    };

    const settings = { ...defaults, ...options };

    const sphere = BABYLON.MeshBuilder.CreateSphere("blinkingSphere", { 
        diameter: settings.diameter,
        segments: 4
    }, scene);

    sphere.position = new BABYLON.Vector3(x, y, z);

    const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0); // Start off
    sphereMaterial.fogEnabled = true;
    sphere.material = sphereMaterial;

    const light = new BABYLON.PointLight("sphereLight", sphere.position, scene);
    light.intensity = 0; // Start off
    light.diffuse = settings.sphereColor;
    light.range = settings.lightRange;

    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = 0; // Start off
    glowLayer.addIncludedOnlyMesh(sphere);

    let isOn = false;
    let startTime = Date.now();
    let observer;

    if (settings.blinkInterval >= 0) {
        observer = scene.onBeforeRenderObservable.add(() => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (settings.number_of_blinks !== null) {
                const blinkCycleTime = settings.blinkInterval * 2; // Time for one complete on-off cycle
                const totalBlinkTime = blinkCycleTime * settings.number_of_blinks; // Time for all blinks
                const totalCycleTime = totalBlinkTime + (settings.waitingInterval || 0); // Total time including waiting
                const timeInMainCycle = elapsedTime % totalCycleTime;

                if (timeInMainCycle < totalBlinkTime) {
                    // We're in the blinking phase
                    const timeInBlinkCycle = timeInMainCycle % blinkCycleTime;
                    const shouldBeOn = timeInBlinkCycle < settings.blinkInterval;

                    if (shouldBeOn && !isOn) {
                        sphereMaterial.emissiveColor = settings.sphereColor;
                        sphereMaterial.diffuseColor = settings.sphereColor;
                        light.intensity = settings.lightIntensity;
                        glowLayer.intensity = settings.glowIntensity;
                        isOn = true;
                    } else if (!shouldBeOn && isOn) {
                        sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
                        sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                        light.intensity = 0;
                        glowLayer.intensity = 0;
                        isOn = false;
                    }
                } else if (isOn) {
                    // We're in the waiting phase
                    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
                    sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                    light.intensity = 0;
                    glowLayer.intensity = 0;
                    isOn = false;
                }
            } else if (settings.waitingInterval !== null) {
                // Original behavior with waiting interval
                const totalCycleTime = settings.waitingInterval + settings.blinkInterval;
                const timeInCycle = elapsedTime % totalCycleTime;

                if (timeInCycle < settings.waitingInterval) {
                    if (isOn) {
                        sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
                        sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                        light.intensity = 0;
                        glowLayer.intensity = 0;
                        isOn = false;
                    }
                } else {
                    if (!isOn) {
                        sphereMaterial.emissiveColor = settings.sphereColor;
                        sphereMaterial.diffuseColor = settings.sphereColor;
                        light.intensity = settings.lightIntensity;
                        glowLayer.intensity = settings.glowIntensity;
                        isOn = true;
                    }
                }
            } else {
                // Original behavior without waiting interval
                if (currentTime % (settings.blinkInterval * 2) < settings.blinkInterval) {
                    if (!isOn) {
                        sphereMaterial.emissiveColor = settings.sphereColor;
                        sphereMaterial.diffuseColor = settings.sphereColor;
                        light.intensity = settings.lightIntensity;
                        glowLayer.intensity = settings.glowIntensity;
                        isOn = true;
                    }
                } else {
                    if (isOn) {
                        sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
                        sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                        light.intensity = 0;
                        glowLayer.intensity = 0;
                        isOn = false;
                    }
                }
            }
        });
    } else {
        // Always on if blinkInterval is negative
        sphereMaterial.emissiveColor = settings.sphereColor;
        sphereMaterial.diffuseColor = settings.sphereColor;
        light.intensity = settings.lightIntensity;
        glowLayer.intensity = settings.glowIntensity;
    }

    return {
        sphere,
        light,
        glowLayer,
        dispose: () => {
            if (observer) {
                scene.onBeforeRenderObservable.remove(observer);
            }
            sphere.dispose();
            light.dispose();
            glowLayer.dispose();
        }
    };
}


