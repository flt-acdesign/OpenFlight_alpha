

function createBlinkingSphere(scene, x, y, z, options = {}) {
    const defaults = {
        sphereColor: new BABYLON.Color3(1, 0, 0),
        diameter: 4,
        lightRange: 10,
        blinkInterval: 1000,
        lightIntensity: 1,
        glowIntensity: 1,
        waitingInterval: null,
        number_of_blinks: null,
        name: "blinkingSphere"
    };

    const settings = { ...defaults, ...options };

    const sphere = BABYLON.MeshBuilder.CreateSphere(settings.name, { 
        diameter: settings.diameter,
        segments: 8
    }, scene);

    sphere.position = new BABYLON.Vector3(x, y, z);

    const sphereMaterial = new BABYLON.StandardMaterial(settings.name + "Material", scene);
    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    sphereMaterial.fogEnabled = true;
    sphere.material = sphereMaterial;

    const light = new BABYLON.PointLight(settings.name + "Light", sphere.position, scene);
    light.intensity = 0;
    light.diffuse = settings.sphereColor;
    light.range = settings.lightRange;

    const glowLayer = new BABYLON.GlowLayer(settings.name + "Glow", scene);
    glowLayer.intensity = 0;
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


