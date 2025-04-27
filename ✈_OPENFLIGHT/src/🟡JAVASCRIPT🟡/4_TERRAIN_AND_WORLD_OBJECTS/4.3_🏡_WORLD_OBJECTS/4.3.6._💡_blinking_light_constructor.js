

function createBlinkingSphere(scene, x, y, z, options = {}) {
    const defaults = {
        sphereColor: new BABYLON.Color3(1, 0, 0),
        diameter: 4,
        lightRange: 10,
        blinkInterval: 1000, // Time for ON phase or total cycle if waitingInterval is null
        lightIntensity: 1,
        glowIntensity: 1, // Target global intensity for the layer (used if layer is created AND enabled)
        waitingInterval: null, // Time for OFF phase (if specified)
        number_of_blinks: null, // Number of blinks before waiting
        name: "blinkingSphere",
        createPointLight: true // Option to skip PointLight creation
    };

    const settings = { ...defaults, ...options };

    // --- Sphere Mesh and Material ---
    const sphere = BABYLON.MeshBuilder.CreateSphere(settings.name, {
        diameter: settings.diameter,
        segments: 8 // Reduced segments for performance if many spheres
    }, scene);

    sphere.position = new BABYLON.Vector3(x, y, z);
    sphere.isPickable = false; // Usually not needed for lights

    const sphereMaterial = new BABYLON.StandardMaterial(settings.name + "Material", scene);
    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0); // Start off
    sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    sphereMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    sphereMaterial.fogEnabled = true;
    sphere.material = sphereMaterial;

    // --- Optional Point Light ---
    let light = null;
    if (settings.createPointLight) {
        light = new BABYLON.PointLight(settings.name + "Light", sphere.position, scene);
        light.intensity = 0; // Start off
        light.diffuse = settings.sphereColor;
        light.range = settings.lightRange;
    }

    // --- Optional Shared Glow Layer ---
    let glowLayer = null; // Initialize glowLayer as null

    // Check the global setting BEFORE attempting to use the glow layer
    // (Assuming 'enable_glow_effect' is a global variable set in initializations.js)
    if (typeof enable_glow_effect !== 'undefined' && enable_glow_effect === true) {
        glowLayer = scene.getGlowLayerByName("sharedGlowLayer");
        if (!glowLayer) {
            glowLayer = new BABYLON.GlowLayer("sharedGlowLayer", scene, {
                mainTextureRatio: 0.5 // Adjust ratio for performance/quality
            });
            glowLayer.intensity = settings.glowIntensity; // Use intensity from defaults/options
            console.log("Created shared GlowLayer with intensity:", glowLayer.intensity);
        }
    } else {
        // console.log("Glow effect is disabled globally."); // Optional log
    }
    // END Optional Shared Glow Layer

    // --- Animation Logic ---
    let isOn = false;
    let startTime = Date.now();
    let observer = null;

    function setLightState(shouldBeOn) {
        if (isOn === shouldBeOn) {
            return;
        }

        const targetEmissive = shouldBeOn ? settings.sphereColor : BABYLON.Color3.Black();
        const targetLightIntensity = shouldBeOn ? settings.lightIntensity : 0;

        sphereMaterial.emissiveColor = targetEmissive;

        if (light) {
            light.intensity = targetLightIntensity;
        }

        // ** MODIFIED GLOW LOGIC - Only interact if glowLayer exists (i.e., is enabled) **
        if (glowLayer) {
            if (shouldBeOn) {
                glowLayer.addIncludedOnlyMesh(sphere);
            } else {
                glowLayer.removeIncludedOnlyMesh(sphere);
            }
        }
        // ** END MODIFIED GLOW LOGIC **

        isOn = shouldBeOn;
    }

    // --- Blinking Timer Logic (unchanged) ---
    if (settings.blinkInterval >= 0) {
        observer = scene.onBeforeRenderObservable.add(() => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (settings.number_of_blinks !== null && settings.waitingInterval !== null) {
                const blinkCycleTime = settings.blinkInterval * 2;
                const totalBlinkTime = blinkCycleTime * settings.number_of_blinks;
                const totalCycleTime = totalBlinkTime + settings.waitingInterval;
                const timeInMainCycle = elapsedTime % totalCycleTime;

                if (timeInMainCycle < totalBlinkTime) {
                    const timeInBlinkSubCycle = timeInMainCycle % blinkCycleTime;
                    const shouldBeOn = timeInBlinkSubCycle < settings.blinkInterval;
                    setLightState(shouldBeOn);
                } else {
                    setLightState(false);
                }
            } else if (settings.waitingInterval !== null) {
                const totalCycleTime = settings.waitingInterval + settings.blinkInterval;
                const timeInCycle = elapsedTime % totalCycleTime;
                const shouldBeOn = timeInCycle >= settings.waitingInterval;
                setLightState(shouldBeOn);
            } else {
                const shouldBeOn = (currentTime % (settings.blinkInterval * 2)) < settings.blinkInterval;
                setLightState(shouldBeOn);
            }
        });
    } else {
        setLightState(true); // Always on if blinkInterval is negative
    }

    // Return object with a dispose function
    return {
        sphere,
        light, // Might be null
        // glowLayer, // No need to return the shared layer reference here
        dispose: () => {
            if (observer) {
                scene.onBeforeRenderObservable.remove(observer);
            }
            // ** Dispose Logic - Only interact if glowLayer exists **
            if (glowLayer) {
                glowLayer.removeIncludedOnlyMesh(sphere);
            }
            // ** END Dispose Logic **
            if (light) {
                light.dispose();
            }
            sphere.material.dispose();
            sphere.dispose();
        }
    };
}