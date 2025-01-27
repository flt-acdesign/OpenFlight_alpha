


/***************************************************************
 * Creates a cylindrical tower with alternating white/red segments.
 * On top is a blinking sphere whose pattern follows the specified
 * Morse code. 
 *
 * Parameters:
 *   - scene: The Babylon.js scene object.
 *   - shadowGenerator: (Optional) a ShadowGenerator to add the tower
 *                     and sphere as shadow casters.
 *   - options: An object with the following properties:
 *       basePosition: (BABYLON.Vector3) Base position of the tower.
 *       towerHeightInSegments: (number) number of cylindrical segments.
 *       segmentHeight: (number) height of each cylindrical segment.
 *       towerRadius: (number) radius for each cylinder.
 *       topSphereDiameter: (number) diameter of the blinking sphere.
 *       morseCode: (string) e.g. "...---..." (SOS).
 *       blinkUnit: (number) ms for a 'dot' duration.
 *       separationTime: (number) ms of quiet time after entire pattern repeats.
 *       conicity: (number) ratio of the diameter of the top of the tower to the diameter of the base (default: 1).
 *
 * Returns:
 *   An object with references to the blinking sphere, light, glowLayer, and a
 *   dispose() function if you need to remove them later.
 ***************************************************************/
function createMorseTower(scene, shadowGenerator, options = {}) {
    /***************************************************************
     * 1) Configure defaults and parse input options
     ***************************************************************/
    const defaults = {
        basePosition: new BABYLON.Vector3(0, 0, 0), // Base position for the tower
        towerHeightInSegments: 5,                  // How many cylindrical segments
        segmentHeight: 1,                          // Each cylinder's height
        towerRadius: 1,                            // Cylinder radius
        topSphereDiameter: 2,                      // Sphere diameter at top
        morseCode: "...---...",                    // Default code: SOS
        blinkUnit: 300,                            // ms for a dot
        separationTime: 1000,                      // ms after full pattern
        conicity: 1                                // Ratio of top diameter to base diameter (default: 1 for straight tower)
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
        conicity
    } = { ...defaults, ...options };

    /***************************************************************
     * 2) Create the cylindrical tower with alternating colors and conicity
     ***************************************************************/
    for (let i = 0; i < towerHeightInSegments; i++) {
        // Calculate the radius for this segment based on conicity
        const segmentRadius = towerRadius * (1 - (1 - conicity) * (i / (towerHeightInSegments - 1)));

        // Create one cylinder segment
        const cylinder = BABYLON.MeshBuilder.CreateCylinder(
            `towerSegment_${i}`,
            {
                height: segmentHeight,
                diameter: segmentRadius * 2,
                tessellation: 6,     // reduces the number of sides (default is 24)
                subdivisions: 1       // reduces the vertical segments (default is 1)
            },
            scene
        );

        // Position it so each segment stacks on the previous one
        cylinder.position = new BABYLON.Vector3(
            basePosition.x,
            basePosition.y + i * segmentHeight + segmentHeight / 2 - 3,
            basePosition.z
        );

        // Alternate between red (1,0,0) and white (1,1,1)
        const colorRed = new BABYLON.Color3(1, 0, 0);
        const colorWhite = new BABYLON.Color3(1, 1, 1);
        const chosenColor = i % 2 === 0 ? colorWhite : colorRed;

        // Material for this cylinder
        const segMaterial = new BABYLON.StandardMaterial(`towerMat_${i}`, scene);
        segMaterial.diffuseColor = chosenColor;
        segMaterial.fogEnabled = true;  // if fog is in the scene
        cylinder.material = segMaterial;

        // If a shadow generator is provided, add this cylinder as a shadow caster
        if (shadowGenerator) {
            shadowGenerator.addShadowCaster(cylinder);
        }
    }

    /***************************************************************
     * 3) Create the blinking sphere at the top
     ***************************************************************/
    // Calculate top Y position
    const topYPos = basePosition.y + towerHeightInSegments * segmentHeight + (topSphereDiameter / 2) - 3;

    // Create the sphere mesh
    const sphere = BABYLON.MeshBuilder.CreateSphere("morseBlinkSphere", {
        diameter: topSphereDiameter,
        segments: 4
    }, scene);
    sphere.position = new BABYLON.Vector3(basePosition.x, topYPos, basePosition.z);

    // Create a material with an emissive color (yellow)
    const sphereMaterial = new BABYLON.StandardMaterial("morseSphereMaterial", scene);
    const yellowColor = new BABYLON.Color3(1, 1, 0);
    sphereMaterial.emissiveColor = yellowColor;
    sphereMaterial.fogEnabled = true;
    sphere.material = sphereMaterial;

    // Create a point light at the sphere's position
    const light = new BABYLON.PointLight("morseSphereLight", sphere.position, scene);
    light.intensity = 0;                   // Start off
    light.diffuse = yellowColor;
    light.range = 10;                      // Adjust as needed

    // Optionally add glow
    const glowLayer = new BABYLON.GlowLayer("morseGlow", scene);
    glowLayer.intensity = 0;               // Start off
    glowLayer.addIncludedOnlyMesh(sphere);

    // If there's a shadow generator, add the sphere as a shadow caster
    if (shadowGenerator) {
        shadowGenerator.addShadowCaster(sphere);
    }

    /***************************************************************
     * 4) Define the Morse code blinking pattern
     *
     *  We'll interpret:
     *    '.' (dot) as ON for blinkUnit, then OFF for blinkUnit
     *    '-' (dash) as ON for 3 × blinkUnit, then OFF for blinkUnit
     *  Then after the entire code, OFF for separationTime.
     ***************************************************************/
    const patternIntervals = [];
    for (let i = 0; i < morseCode.length; i++) {
        const symbol = morseCode[i];

        if (symbol === '.') {
            // Dot: ON for blinkUnit, OFF for blinkUnit
            patternIntervals.push({ duration: blinkUnit, isOn: true });
            patternIntervals.push({ duration: blinkUnit, isOn: false });
        } else if (symbol === '-') {
            // Dash: ON for blinkUnit*3, OFF for blinkUnit
            patternIntervals.push({ duration: blinkUnit * 3, isOn: true });
            patternIntervals.push({ duration: blinkUnit, isOn: false });
        } else if (symbol === ' ') {
            // Dash: ON for blinkUnit*3, OFF for blinkUnit
            patternIntervals.push({ duration: blinkUnit * 4, isOn: false });
        }
        // If there's a space or another symbol, you could handle that here
    }
    // After the entire code, add the separation time
    patternIntervals.push({ duration: separationTime, isOn: false });

    // Total length in ms of one full Morse code cycle
    const totalPatternTime = patternIntervals.reduce((acc, x) => acc + x.duration, 0);

    /***************************************************************
     * 5) Animate the blinking based on current time
     ***************************************************************/
    let isOn = false; // keep track of whether we are "on" or "off"

    // We'll run this each frame to check the cycle time
    const observer = scene.onBeforeRenderObservable.add(() => {
        const timeNow = Date.now();
        // Where are we in the repeating pattern cycle?
        const cycleTime = timeNow % totalPatternTime;

        let elapsed = 0;
        for (let i = 0; i < patternIntervals.length; i++) {
            const interval = patternIntervals[i];
            if (cycleTime >= elapsed && cycleTime < elapsed + interval.duration) {
                // We are in this interval
                if (interval.isOn && !isOn) {
                    // Turn ON
                    sphereMaterial.emissiveColor = yellowColor;
                    sphereMaterial.diffuseColor = yellowColor;
                    light.intensity = 1;
                    glowLayer.intensity = 1;
                    isOn = true;
                } else if (!interval.isOn && isOn) {
                    // Turn OFF
                    sphereMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
                    sphereMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
                    light.intensity = 0;
                    glowLayer.intensity = 0;
                    isOn = false;
                }
                break; // no need to check further intervals
            }
            elapsed += interval.duration;
        }
    });

    /***************************************************************
     * 6) Return references in case the user needs them
     ***************************************************************/
    return {
        sphere,
        light,
        glowLayer,
        dispose: () => {
            scene.onBeforeRenderObservable.remove(observer);
            sphere.dispose();
            light.dispose();
            glowLayer.dispose();
        }
    };
}




















function create_lighthouses(scene, shadowGenerator) {

// Create the Morse tower at position (10,0,5) with 8 segments,
    const morseTower = createMorseTower(scene, shadowGenerator, {

        // => x: 1959.8547327640256, y: 248.25910073079265, z: 955.0814661695462
        basePosition: new BABYLON.Vector3(1971, 249, 955),
        towerHeightInSegments: 8,
        segmentHeight: 2.5,
        towerRadius: 2,
        topSphereDiameter: 3,
        morseCode: "-.-- --- ..-    .- .-. .    - --- ---    ... -- .- .-. -", 
        blinkUnit: 300,         // ms for a dot
        separationTime: 1000,    // ms of pause after pattern
        conicity: .2 
    });
    
    const lighthouse = createMorseTower(scene, shadowGenerator, {
    
        // => x: 1959.8547327640256, y: 248.25910073079265, z: 955.0814661695462
        basePosition: new BABYLON.Vector3(-1986, 25, -1380),
        towerHeightInSegments: 8,
        segmentHeight: 2.5,
        towerRadius: 2,
        topSphereDiameter: 3,
        morseCode: "-.-. ..- .-. .. --- ... .. - -.--   -.- .. .-.. .-.. . -..   - .... .   -.-. .- -", 
        blinkUnit: 300,         // ms for a dot
        separationTime: 1000    // ms of pause after pattern
    });

}