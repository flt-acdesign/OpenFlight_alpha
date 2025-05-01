/***************************************************************
 * Creates a cylindrical tower with alternating white/red segments.
 * On top is a blinking sphere whose pattern follows the specified
 * Morse code.
 *
 * Parameters:
 * - scene: The Babylon.js scene object.
 * - shadowGenerator: (Optional) a ShadowGenerator to add the tower
 * and sphere as shadow casters.
 * - options: An object with the following properties:
 * basePosition: (BABYLON.Vector3) Base position of the tower.
 * towerHeightInSegments: (number) number of cylindrical segments.
 * segmentHeight: (number) height of each cylindrical segment.
 * towerRadius: (number) radius for each cylinder.
 * topSphereDiameter: (number) diameter of the blinking sphere.
 * morseCode: (string) e.g. "...---..." (SOS).
 * blinkUnit: (number) ms for a 'dot' duration.
 * separationTime: (number) ms of quiet time after entire pattern repeats.
 * conicity: (number) ratio of the diameter of the top of the tower to the diameter of the base (default: 1).
 *
 * Returns:
 * An object with references to the blinking sphere, light, and a
 * dispose() function if you need to remove them later. (glowLayer reference removed as it's managed internally based on setting)
 ***************************************************************/
function createMorseTower(scene, shadowGenerator, options = {}) {
    /***************************************************************
     * 1) Configure defaults and parse input options
     ***************************************************************/
    const defaults = {
        basePosition: new BABYLON.Vector3(0, 0, 0), // Base position for the tower
        towerHeightInSegments: 5,                   // How many cylindrical segments
        segmentHeight: 1,                           // Each cylinder's height
        towerRadius: 1,                             // Cylinder radius
        topSphereDiameter: 2,                       // Sphere diameter at top
        morseCode: "...---...",                     // Default code: SOS
        blinkUnit: 300,                             // ms for a dot
        separationTime: 1000,                       // ms after full pattern
        conicity: 1,                                // Ratio of top diameter to base diameter (default: 1 for straight tower)
        glowIntensity: 1                            // Added default for glow
    };
    const {
        basePosition,
        towerHeightInSegments,
        segmentHeight,
        towerRadius,
        topSphereDiameter,
        morseCode,
        blinkUnit,
        separationTime,
        conicity,
        glowIntensity // Get glow intensity from options
    } = { ...defaults, ...options };

    /***************************************************************
     * 2) Create the cylindrical tower with alternating colors and conicity
     ***************************************************************/
     const towerParent = new BABYLON.TransformNode(`morseTowerParent_${basePosition.x}_${basePosition.z}`, scene);

    for (let i = 0; i < towerHeightInSegments; i++) {
        const segmentRadius = towerRadius * (1 - (1 - conicity) * (i / (towerHeightInSegments - 1 || 1))); // Avoid division by zero if only 1 segment

        const cylinder = BABYLON.MeshBuilder.CreateCylinder(
            `towerSegment_${i}`,
            {
                height: segmentHeight,
                diameter: segmentRadius * 2,
                tessellation: 6,
                subdivisions: 1
            },
            scene
        );

        cylinder.position = new BABYLON.Vector3(
            0, // Relative to parent
            i * segmentHeight + segmentHeight / 2,
            0  // Relative to parent
        );

        const colorRed = new BABYLON.Color3(1, 0, 0);
        const colorWhite = new BABYLON.Color3(1, 1, 1);
        const chosenColor = i % 2 === 0 ? colorWhite : colorRed;

        const segMaterial = new BABYLON.StandardMaterial(`towerMat_${i}`, scene);
        segMaterial.diffuseColor = chosenColor;
        segMaterial.fogEnabled = true;
        cylinder.material = segMaterial;
        cylinder.parent = towerParent; // Parent segment to the tower node

        if (shadowGenerator) {
            shadowGenerator.addShadowCaster(cylinder);
        }
    }
    // Position the entire tower
    towerParent.position = new BABYLON.Vector3(basePosition.x, basePosition.y - 3, basePosition.z); // Apply the original offset here

    /***************************************************************
     * 3) Create the blinking sphere at the top
     ***************************************************************/
    const topYPos = towerHeightInSegments * segmentHeight + (topSphereDiameter / 2); // Relative to towerParent base

    const sphere = BABYLON.MeshBuilder.CreateSphere("morseBlinkSphere", {
        diameter: topSphereDiameter,
        segments: 8 // Reduced segments
    }, scene);
    // Position relative to the towerParent
    sphere.position = new BABYLON.Vector3(0, topYPos, 0);
    sphere.parent = towerParent; // Parent sphere to the tower node

    const sphereMaterial = new BABYLON.StandardMaterial("morseSphereMaterial", scene);
    const yellowColor = new BABYLON.Color3(1, 1, 0);
    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0); // Start off
    sphereMaterial.diffuseColor = new BABYLON.Color3(0,0,0);
    sphereMaterial.specularColor = new BABYLON.Color3(0,0,0);
    sphereMaterial.fogEnabled = true;
    sphere.material = sphereMaterial;

    const light = new BABYLON.PointLight("morseSphereLight", sphere.getAbsolutePosition(), scene);
    light.setEnabled(false); // <<< MODIFICATION: Disable the point light illumination
    light.intensity = 0;
    light.diffuse = yellowColor;
    light.range = towerHeightInSegments * segmentHeight * 1.5; // Adjust range based on height

    // --- Optional Glow Layer ---
    let glowLayer = null; // Initialize as null
    // Check the global setting
    if (typeof enable_glow_effect !== 'undefined' && enable_glow_effect === true) {
        glowLayer = scene.getGlowLayerByName("sharedGlowLayer"); // Use shared layer
        if (!glowLayer) {
            glowLayer = new BABYLON.GlowLayer("sharedGlowLayer", scene, { mainTextureRatio: 0.5 });
            glowLayer.intensity = glowIntensity; // Use intensity from options/defaults
            console.log("Created shared GlowLayer from MorseTower with intensity:", glowLayer.intensity);
        }
    }
    // --- END Optional Glow Layer ---

    if (shadowGenerator) {
        shadowGenerator.addShadowCaster(sphere);
    }

    /***************************************************************
     * 4) Define the Morse code blinking pattern (Unchanged)
     ***************************************************************/
    const patternIntervals = [];
    for (let i = 0; i < morseCode.length; i++) {
        const symbol = morseCode[i];
        if (symbol === '.') {
            patternIntervals.push({ duration: blinkUnit, isOn: true });
            patternIntervals.push({ duration: blinkUnit, isOn: false });
        } else if (symbol === '-') {
            patternIntervals.push({ duration: blinkUnit * 3, isOn: true });
            patternIntervals.push({ duration: blinkUnit, isOn: false });
        } else if (symbol === ' ') {
             // Add gap between words (e.g., 3 units off, total 4 including char gap)
            patternIntervals.push({ duration: blinkUnit * 4, isOn: false });
        }
    }
    patternIntervals.push({ duration: separationTime, isOn: false });
    const totalPatternTime = patternIntervals.reduce((acc, x) => acc + x.duration, 0);

    /***************************************************************
     * 5) Animate the blinking based on current time
     ***************************************************************/
    let isOn = false;
    let animationStartTime = Date.now(); // Use a separate start time for each tower

    const observer = scene.onBeforeRenderObservable.add(() => {
        const timeNow = Date.now();
        const cycleTime = (timeNow - animationStartTime) % totalPatternTime;

        let elapsed = 0;
        let shouldBeOn = false; // Default to off
        for (let i = 0; i < patternIntervals.length; i++) {
            const interval = patternIntervals[i];
            if (cycleTime >= elapsed && cycleTime < elapsed + interval.duration) {
                shouldBeOn = interval.isOn;
                break;
            }
            elapsed += interval.duration;
        }

        // --- Update Visual State ---
        if (isOn !== shouldBeOn) {
            sphereMaterial.emissiveColor = shouldBeOn ? yellowColor : BABYLON.Color3.Black();
            // light.intensity = shouldBeOn ? 1 : 0; // PointLight intensity is now irrelevant as it's disabled

            // ** Interact with glowLayer only if it exists **
            if (glowLayer) {
                if (shouldBeOn) {
                    glowLayer.addIncludedOnlyMesh(sphere);
                } else {
                    glowLayer.removeIncludedOnlyMesh(sphere);
                }
            }
            // ** End GlowLayer Interaction **
            isOn = shouldBeOn;
        }
    });

    /***************************************************************
     * 6) Return references in case the user needs them
     ***************************************************************/
    return {
        towerParent, // Return the parent node
        sphere,
        light, // Still return the light object, even though it's disabled
        // glowLayer, // No need to return shared layer
        dispose: () => {
            scene.onBeforeRenderObservable.remove(observer);
            // ** Dispose Logic - Only interact if glowLayer exists **
            if (glowLayer) {
                glowLayer.removeIncludedOnlyMesh(sphere);
            }
            // ** End Dispose Logic **
            if (light) { // Check if light was created before disposing
                light.dispose();
            }
            sphere.dispose();
            // Dispose all tower segments and parent
            towerParent.dispose(false, true); // Dispose children too
        }
    };
}


// --- create_lighthouses function (unchanged, but now createMorseTower respects the setting) ---

function create_lighthouses(scene, shadowGenerator) {

    // Create the Morse tower at position (10,0,5) with 8 segments,
    const morseTower1 = createMorseTower(scene, shadowGenerator, {
        // => x: 1959.8547327640256, y: 248.25910073079265, z: 955.0814661695462
        basePosition: new BABYLON.Vector3(1971, 249, 955),
        towerHeightInSegments: 8,
        segmentHeight: 2.5,
        towerRadius: 2,
        topSphereDiameter: 3,
        morseCode: "-.-- --- ..-     .- .-. .     - --- ---     ... -- .- .-. -", // Added spaces for word gaps
        blinkUnit: 300,        // ms for a dot
        separationTime: 2000,    // Increased pause after pattern
        conicity: .2,
        glowIntensity: 1.5 // Example specific intensity
    });

    const morseTower2 = createMorseTower(scene, shadowGenerator, {
        basePosition: new BABYLON.Vector3(-1986, 25, -1380),
        towerHeightInSegments: 8,
        segmentHeight: 2.5,
        towerRadius: 2,
        topSphereDiameter: 3,
        morseCode: "-.-. ..- .-. .. --- ... .. - -.--     -.- .. .-.. .-.. . -..     - .... .     -.-. .- -", // Added spaces
        blinkUnit: 300,        // ms for a dot
        separationTime: 2000,    // Increased pause after pattern
        glowIntensity: 1.2 // Example specific intensity
    });

}