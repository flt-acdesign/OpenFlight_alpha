


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
                    (zIndex - (baseSize - 1) / 2) * 2
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
        0,                     // z coordinate (tower center)
        {
            sphereColor: new BABYLON.Color3(1, 0, 0),  // Red color
            diameter: 4,                               // 2x original size
            lightRange: 10,                           // 10 units light radius
            blinkInterval: 1000,                      // 1 second interval
            lightIntensity: 1,                        // Normal light intensity
            glowIntensity: 1                          // Normal glow intensity
        }
    );

    // Add shadow casting for the sphere
    shadowGenerator.addShadowCaster(blinkingSphere.sphere);
    blinkingSphere.sphere.isAlwaysActive = true;

    // Return the blinking sphere controller in case we need to dispose it later
    return blinkingSphere;
}


function createBlinkingSphere(scene, x, y, z, options = {}) {
    const defaults = {
        sphereColor: new BABYLON.Color3(1, 0, 0),
        diameter: 4,
        lightRange: 10,
        blinkInterval: 1000,
        lightIntensity: 1,
        glowIntensity: 1
    };

    const settings = { ...defaults, ...options };

    const sphere = BABYLON.MeshBuilder.CreateSphere("blinkingSphere", { 
        diameter: settings.diameter,
        segments: 4
    }, scene);


    sphere.position = new BABYLON.Vector3(x, y, z);

    const sphereMaterial = new BABYLON.StandardMaterial("sphereMaterial", scene);
    sphereMaterial.emissiveColor = settings.sphereColor;
    sphereMaterial.fogEnabled = true;
    sphere.material = sphereMaterial;

    const light = new BABYLON.PointLight("sphereLight", sphere.position, scene);
    light.intensity = 0;
    light.diffuse = settings.sphereColor;
    light.range = settings.lightRange;

    const glowLayer = new BABYLON.GlowLayer("glow", scene);
    glowLayer.intensity = settings.glowIntensity;
    glowLayer.addIncludedOnlyMesh(sphere);

    let isOn = false;
    const observer = scene.onBeforeRenderObservable.add(() => {
        const currentTime = Date.now();
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
    });

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
    } = { ...defaults, ...options };

    /***************************************************************
     * 2) Create the cylindrical tower with alternating colors
     ***************************************************************/
    for (let i = 0; i < towerHeightInSegments; i++) {
        // Create one cylinder segment
        const cylinder = BABYLON.MeshBuilder.CreateCylinder(
            `towerSegment_${i}`,
            {
                height: segmentHeight,
                diameter: towerRadius * 2,
                tessellation: 6,     // reduces the number of sides (default is 24)
                subdivisions: 1       // reduces the vertical segments (default is 1)
            },
            scene
        );



// Show only edges
//cylinder.enableEdgesRendering();
//cylinder.edgesWidth = 4.0;
//cylinder.edgesColor = new BABYLON.Color4(1, 1, 1, 1); // White edges



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
    const topYPos = basePosition.y + towerHeightInSegments * segmentHeight + (topSphereDiameter / 2) - 3

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






/***************************************************************
 * createHouse(scene, shadowGenerator, options = {})
 *
 * Creates a simple house made of:
 *   1) A box for the main body.
 *   2) Four triangular meshes forming a pitched roof on all sides.
 *
 * Parameters:
 *   - scene (BABYLON.Scene): The Babylon.js scene.
 *   - shadowGenerator (BABYLON.ShadowGenerator, optional):
 *       If provided, the house meshes will cast shadows.
 *   - options (Object):
 *       {
 *         basePosition: new BABYLON.Vector3(...)  // Where the house sits (X, Y, Z).
 *         bodyWidth: number                       // Width (X dimension) of the house body.
 *         bodyDepth: number                       // Depth (Z dimension) of the house body.
 *         bodyHeight: number                      // Height (Y dimension) of the house body.
 *         bodyColor: BABYLON.Color3               // Diffuse color for the house body.
 *         roofColor: BABYLON.Color3               // Diffuse color for the roof.
 *         roofHeight: number                      // Distance from top of body to apex.
 *       }
 *
 * Returns an object with:
 *    {
 *      bodyMesh,      // the box mesh
 *      roofMeshes[],  // an array of the 4 triangular roof meshes
 *      dispose()      // a helper to remove these meshes if needed
 *    }
 *
 * Example usage:
 *   const myHouse = createHouse(scene, shadowGenerator, {
 *       basePosition: new BABYLON.Vector3(10, 0, 5),
 *       bodyWidth: 6,
 *       bodyDepth: 4,
 *       bodyHeight: 3,
 *       bodyColor: new BABYLON.Color3(0.8, 0.7, 0.5),
 *       roofColor: new BABYLON.Color3(0.4, 0.1, 0.1),
 *       roofHeight: 2
 *   });
 ***************************************************************/
function createHouse(scene, shadowGenerator, options = {}) {
    /***************************************************************
     * 1) Define default parameters
     ***************************************************************/
    const defaults = {
        basePosition: new BABYLON.Vector3(0, 0, 0),
        bodyWidth: 4,
        bodyDepth: 4,
        bodyHeight_initial: 3,
        bodyColor: new BABYLON.Color3(0.8, 0.5, 0.4), // light brown
        roofColor: new BABYLON.Color3(0.5, 0.2, 0.2), // darker brown
        roofHeight: 2
    };

    const {
        basePosition,
        bodyWidth,
        bodyDepth,
        bodyHeight_initial,
        bodyColor,
        roofColor,
        roofHeight
    } = { ...defaults, ...options };


    bodyHeight =  bodyHeight_initial + 2  // correct height to dig the house in the ground

    /***************************************************************
     * 2) Create the house body (box)
     ***************************************************************/
    const bodyMesh = BABYLON.MeshBuilder.CreateBox(
        "houseBody",
        {
            width: bodyWidth,
            depth: bodyDepth,
            height: bodyHeight
        },
        scene
    );

    // Position the box so that its bottom is at basePosition.y
    // (by default, a box is centered around the origin, so we move it up half its height)
    bodyMesh.position.set(
        basePosition.x,
        basePosition.y + bodyHeight / 2 - 2,
        basePosition.z
    );

    // Create a material for the house body
    const bodyMaterial = new BABYLON.StandardMaterial("houseBodyMat", scene);
    bodyMaterial.diffuseColor = bodyColor;
    bodyMesh.material = bodyMaterial;

    // If we have a shadow generator, let the box cast shadows
    if (shadowGenerator) {
        shadowGenerator.addShadowCaster(bodyMesh);
    }


    /***************************************************************
     * 3) Create the four roof triangles
     ***************************************************************/
    function createTriangleMesh(name, p1, p2, p3, color) {
        const customMesh = new BABYLON.Mesh(name, scene);

        // Positions in [x1,y1,z1, x2,y2,z2, x3,y3,z3]
        const positions = [
            p1.x, p1.y, p1.z,
            p2.x, p2.y, p2.z,
            p3.x, p3.y, p3.z
        ];

        // A single triangle => indices [0,1,2]
        const indices = [0, 1, 2];

        // Compute normals
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);

        // Create a VertexData object and apply to the custom mesh
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.applyToMesh(customMesh);

        // Create a material
        const mat = new BABYLON.StandardMaterial(`${name}-mat`, scene);
        mat.diffuseColor = color;
        // Option 1: Turn off back-face culling for double-sided visibility.
        mat.backFaceCulling = false;
        customMesh.material = mat;

        // Option 2 (alternative): set the entire mesh to double-sided:
        // customMesh.sideOrientation = BABYLON.Mesh.DOUBLESIDE;

        return customMesh;
    }

    // The apex (peak) of the roof is at the center (x,z) but higher in y by 'roofHeight'
    const apex = new BABYLON.Vector3(
        basePosition.x,
        basePosition.y + bodyHeight + roofHeight - 2,
        basePosition.z
    );

    // Define the top corners of the box
    const frontLeft = new BABYLON.Vector3(
        basePosition.x - bodyWidth / 2,
        basePosition.y + bodyHeight - 2,
        basePosition.z - bodyDepth / 2
    );
    const frontRight = new BABYLON.Vector3(
        basePosition.x + bodyWidth / 2,
        basePosition.y + bodyHeight - 2,
        basePosition.z - bodyDepth / 2
    );
    const backRight = new BABYLON.Vector3(
        basePosition.x + bodyWidth / 2,
        basePosition.y + bodyHeight - 2,
        basePosition.z + bodyDepth / 2
    );
    const backLeft = new BABYLON.Vector3(
        basePosition.x - bodyWidth / 2,
        basePosition.y + bodyHeight - 2,
        basePosition.z + bodyDepth / 2
    );

    // Now build four triangles: front, right, back, left
    const frontRoof = createTriangleMesh(
        "frontRoof",
        apex,     // top (apex)
        frontRight,
        frontLeft,
        roofColor
    );
    const rightRoof = createTriangleMesh(
        "rightRoof",
        apex,
        backRight,
        frontRight,
        roofColor
    );
    const backRoof = createTriangleMesh(
        "backRoof",
        apex,
        backLeft,
        backRight,
        roofColor
    );
    const leftRoof = createTriangleMesh(
        "leftRoof",
        apex,
        frontLeft,
        backLeft,
        roofColor
    );

    // Collect roof meshes in an array
    const roofMeshes = [frontRoof, rightRoof, backRoof, leftRoof];

    // If we have a shadow generator, let each roof triangle cast shadows
    if (shadowGenerator) {
        roofMeshes.forEach(mesh => shadowGenerator.addShadowCaster(mesh));
    }


    /***************************************************************
     * 4) Return references for potential disposal or further use
     ***************************************************************/
    return {
        bodyMesh,
        roofMeshes,
        dispose: () => {
            bodyMesh.dispose();
            roofMeshes.forEach(mesh => mesh.dispose());
        }
    };
}

/***************************************************************
 * EXAMPLE USAGE:
 ***************************************************************/
/*
// Create a pitched-roof house at position (10,0,5)
const myHouse = createHouse(scene, shadowGenerator, {
    basePosition: new BABYLON.Vector3(10, 0, 5),
    bodyWidth: 6,
    bodyDepth: 4,
    bodyHeight: 3,
    bodyColor: new BABYLON.Color3(0.8, 0.7, 0.5),
    roofColor: new BABYLON.Color3(0.4, 0.1, 0.1),
    roofHeight: 2
});

// Later, to remove it from the scene:
myHouse.dispose();
*/
