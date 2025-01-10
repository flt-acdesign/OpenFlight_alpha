


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
    const defaults = {
        basePosition: new BABYLON.Vector3(0, 0, 0),
        bodyWidth: 4,
        bodyDepth: 4,
        bodyHeight: 3,
        bodyColor: new BABYLON.Color3(0.95, 0.95, 0.9),
        roofColor: new BABYLON.Color3(0.2, 0.1, 0.1),
        roofHeight: 2,
        roofOverhang: 0.3,
        rotation: 0
    };

    const {
        basePosition,
        bodyWidth,
        bodyDepth,
        bodyHeight,
        bodyColor,
        roofColor,
        roofHeight,
        roofOverhang,
        rotation
    } = { ...defaults, ...options };

    //------------------------------------------------------
    // 1) Create a parent TransformNode at basePosition
    //------------------------------------------------------
    const houseParent = new BABYLON.TransformNode("houseParent", scene);
    houseParent.position.copyFrom(basePosition);
    houseParent.rotation.y = rotation;

    //------------------------------------------------------
    // 2) Create the house body (box) as a child
    //------------------------------------------------------
    const bodyMesh = BABYLON.MeshBuilder.CreateBox(
        "houseBody",
        {
            width: bodyWidth,
            depth: bodyDepth,
            height: bodyHeight
        },
        scene
    );
    bodyMesh.parent = houseParent;

    // Place the box so its bottom is at y=0 in local coords
    // (meaning the box’s center is at y=bodyHeight/2).
    bodyMesh.position.y = bodyHeight / 2;

    // Body material
    const bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
    bodyMat.diffuseColor = bodyColor;
    bodyMesh.material = bodyMat;

    //------------------------------------------------------
    // 3) Roof wedge (extruded triangle), also child
    //------------------------------------------------------
    // Cross-section in local X/Y:
    //   (-W/2 - over, 0) -> (0, roofHeight) -> (W/2 + over, 0)
    const roofShape = [
        new BABYLON.Vector3(-bodyWidth / 2 - roofOverhang, 0, 0),
        new BABYLON.Vector3(0, roofHeight, 0),
        new BABYLON.Vector3(bodyWidth / 2 + roofOverhang, 0, 0),
    ];
    // Extrude along local Z from -(... ) to +(... )
    const roofPath = [
        new BABYLON.Vector3(0, 0, -(bodyDepth / 2 + roofOverhang)),
        new BABYLON.Vector3(0, 0,  (bodyDepth / 2 + roofOverhang))
    ];

    const roofMesh = BABYLON.MeshBuilder.ExtrudeShape(
        "roof",
        {
            shape: roofShape,
            path: roofPath,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        },
        scene
    );
    roofMesh.parent = houseParent;

    // Place it so the bottom of the roof sits on top of the box
    roofMesh.position.y = bodyHeight;

    // Roof material
    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseColor = roofColor;
    roofMat.backFaceCulling = false; // so underside shows if needed
    roofMesh.material = roofMat;

    //------------------------------------------------------
    // 4) Front & back capping triangles, also children
    //------------------------------------------------------
    // We'll define them in local coordinates, exactly where
    // the gap is: at the front and back edges between the
    // box top and the roof apex.

    // Helper to build a single-triangle custom mesh
    function createSingleTriangle(name, positionsArray) {
        const indices = [0, 1, 2];
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positionsArray, indices, normals);

        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positionsArray;
        vertexData.indices = indices;
        vertexData.normals = normals;

        const mesh = new BABYLON.Mesh(name, scene);
        vertexData.applyToMesh(mesh);
        return mesh;
    }

    // front triangle corners:
    //  front-left corner of box top:   ( -W/2, bodyHeight, -D/2 )
    //  front-right corner of box top:  ( +W/2, bodyHeight, -D/2 )
    //  roof apex at front:            ( 0, bodyHeight + roofHeight, -(D/2+roofOverhang) )
    const frontPositions = [
        -bodyWidth / 2, bodyHeight, -bodyDepth / 2,
        +bodyWidth / 2, bodyHeight, -bodyDepth / 2,
        0, bodyHeight + roofHeight, -(bodyDepth / 2 + roofOverhang)
    ];
    const frontTriangleMesh = createSingleTriangle("frontTriangle", frontPositions);
    frontTriangleMesh.parent = houseParent;
    frontTriangleMesh.material = bodyMat; // same as house, or your choice

    // back triangle corners:
    //  back-left corner of box top:   ( -W/2, bodyHeight, +D/2 )
    //  back-right corner of box top:  ( +W/2, bodyHeight, +D/2 )
    //  roof apex at back:            ( 0, bodyHeight + roofHeight, +(D/2+roofOverhang) )
    const backPositions = [
        -bodyWidth / 2, bodyHeight, +bodyDepth / 2,
        +bodyWidth / 2, bodyHeight, +bodyDepth / 2,
        0, bodyHeight + roofHeight, (bodyDepth / 2 + roofOverhang)
    ];
    const backTriangleMesh = createSingleTriangle("backTriangle", backPositions);
    backTriangleMesh.parent = houseParent;
    backTriangleMesh.material = bodyMat;

    //------------------------------------------------------
    // 5) Shadows (optional)
    //------------------------------------------------------
    if (shadowGenerator) {
        [bodyMesh, roofMesh, frontTriangleMesh, backTriangleMesh]
            .forEach(mesh => shadowGenerator.addShadowCaster(mesh));
    }

    //------------------------------------------------------
    // 6) Return references
    //------------------------------------------------------
    return {
        houseParent,
        bodyMesh,
        roofMesh,
        frontTriangleMesh,
        backTriangleMesh,
        dispose: () => {
            bodyMesh.dispose();
            roofMesh.dispose();
            frontTriangleMesh.dispose();
            backTriangleMesh.dispose();
            houseParent.dispose();
        }
    };
}






function createSimpleHouse(scene, short, long, height, roof_height, boxColor, roofColor, x, y, z, rotationAngle) {
    // Create parent transform node for the whole house
    const house = new BABYLON.TransformNode("house", scene);
    house.position = new BABYLON.Vector3(x, y, z);
    house.rotation.y = BABYLON.Tools.ToRadians(rotationAngle);

    // Create the box for the house
    const houseBox = BABYLON.MeshBuilder.CreateBox("houseBox", {
        width: short,
        depth: long,
        height: height
    }, scene);
    houseBox.position.y = height / 2;
    houseBox.parent = house;

    // Apply color to the box
    const boxMaterial = new BABYLON.StandardMaterial("boxMaterial", scene);
    boxMaterial.diffuseColor = BABYLON.Color3.FromHexString(boxColor);
    boxMaterial.backFaceCulling = false; // Keep if you want double-sided for the box
    houseBox.material = boxMaterial;

    // Create roof material (with two-sided lighting)
    const roofMaterial = new BABYLON.StandardMaterial("roofMaterial", scene);
    roofMaterial.diffuseColor = BABYLON.Color3.FromHexString(roofColor);
    roofMaterial.backFaceCulling = false;
    roofMaterial.twoSidedLighting = true; // <-- IMPORTANT FIX

    // Decide if roof should be a 4-sided pyramid or a gabled roof
    if (long / short < 2) {
        // Create pyramid roof using custom vertices
        const positions = [
            // Front face
            -short/2, height,    -long/2,   // 0
             0,        height + roof_height, 0,   // 1
             short/2,  height,    -long/2,   // 2
            
            // Right face
             short/2,  height,    -long/2,   // 3
             0,        height + roof_height, 0,   // 4
             short/2,  height,    long/2,    // 5
            
            // Back face
             short/2,  height,    long/2,    // 6
             0,        height + roof_height, 0,   // 7
            -short/2,  height,    long/2,    // 8
            
            // Left face
            -short/2,  height,    long/2,    // 9
             0,        height + roof_height, 0,   // 10
            -short/2,  height,    -long/2    // 11
        ];

        const indices = [
            // Front face
            0, 1, 2,
            // Right face
            3, 4, 5,
            // Back face
            6, 7, 8,
            // Left face
            9, 10, 11,
            // Reverse faces for double-sided viewing
            2, 1, 0,
            5, 4, 3,
            8, 7, 6,
            11, 10, 9
        ];

        const roof = new BABYLON.Mesh("roof", scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;

        // Calculate normals
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;

        vertexData.applyToMesh(roof);
        roof.material = roofMaterial;
        roof.parent = house;

    } else {
        // Create gable roof
        const roofHeight = height + roof_height;
        
        const positions = [
            // Left side
            -short/2, height, -long/2,    // 0
             0,        roofHeight, -long/2, // 1
             0,        roofHeight,  long/2, // 2
            -short/2, height,  long/2,    // 3
            
            // Right side
             short/2,  height, -long/2,   // 4
             0,        roofHeight, -long/2, // 5
             0,        roofHeight,  long/2, // 6
             short/2,  height,  long/2,   // 7
            
            // Front triangle
            -short/2,  height, -long/2,   // 8
             short/2,  height, -long/2,   // 9
             0,        roofHeight, -long/2, // 10
            
            // Back triangle
            -short/2,  height,  long/2,   // 11
             short/2,  height,  long/2,   // 12
             0,        roofHeight, long/2 // 13
        ];

        const indices = [
            // Left side
            0, 1, 2,
            0, 2, 3,
            // Right side
            4, 6, 5,
            4, 7, 6,
            // Front triangle
            8, 9, 10,
            // Back triangle
            11, 13, 12,
            // Reverse faces
            2, 1, 0,
            3, 2, 0,
            5, 6, 4,
            6, 7, 4,
            10, 9, 8,
            12, 13, 11
        ];

        const roof = new BABYLON.Mesh("roof", scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;

        // Calculate normals
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;

        vertexData.applyToMesh(roof);
        roof.material = roofMaterial;
        roof.parent = house;
    }

    return house;
}








function createHouseFlexible(
    scene,
    shortDimension,
    longDimension,
    bodyHeight,
    roofHeight,
    boxColorHex,    // e.g. "#aaffcc"
    roofColorHex,   // e.g. "#ff0000"
    x, y, z,
    rotationAngleDeg
) {
    // Create a parent TransformNode to hold everything
    const house = new BABYLON.TransformNode("houseParent", scene);
    house.position.set(x, y, z);
    house.rotation.y = BABYLON.Tools.ToRadians(rotationAngleDeg);

    //-----------------------------------------
    // 1) Create the box (house body)
    //-----------------------------------------
    const houseBox = BABYLON.MeshBuilder.CreateBox("houseBox", {
        width: shortDimension,
        depth: longDimension,
        height: bodyHeight
    }, scene);
    houseBox.parent = house;
    houseBox.position.y = bodyHeight / 2;

    // Material for the box
    const boxMat = new BABYLON.StandardMaterial("boxMat", scene);
    boxMat.diffuseColor = BABYLON.Color3.FromHexString(boxColorHex);
    boxMat.backFaceCulling = true;   // usually okay to cull
    houseBox.material = boxMat;

    //-----------------------------------------
    // 2) Prepare a roof Material
    //-----------------------------------------
    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseColor = BABYLON.Color3.FromHexString(roofColorHex);
    roofMat.backFaceCulling = false; // draw both sides
    roofMat.twoSidedLighting = true; // light both sides

    //-----------------------------------------
    // 3) Decide: pyramid roof vs. gable roof
    //-----------------------------------------
    const ratio = longDimension / shortDimension;
    if (ratio < 2) {
        //---------------------------------------------------------
        // A) Pyramid roof (custom mesh, 4 triangular faces)
        //---------------------------------------------------------
        // We define custom vertex positions for 4 triangular sides.
        const positions = [
            // Front face
            -shortDimension / 2, bodyHeight, -longDimension / 2,  // 0
             0,                bodyHeight + roofHeight, 0,         // 1
             shortDimension / 2,  bodyHeight, -longDimension / 2, // 2

            // Right face
             shortDimension / 2,  bodyHeight, -longDimension / 2, // 3
             0,                bodyHeight + roofHeight, 0,         // 4
             shortDimension / 2,  bodyHeight,  longDimension / 2, // 5

            // Back face
             shortDimension / 2,  bodyHeight,  longDimension / 2, // 6
             0,                bodyHeight + roofHeight, 0,         // 7
            -shortDimension / 2, bodyHeight,  longDimension / 2,  // 8

            // Left face
            -shortDimension / 2, bodyHeight,  longDimension / 2,  // 9
             0,                bodyHeight + roofHeight, 0,         // 10
            -shortDimension / 2, bodyHeight, -longDimension / 2   // 11
        ];

        // Indices, including reversed for double-sided
        const indices = [
            // Front face
            0, 1, 2,
            // Right face
            3, 4, 5,
            // Back face
            6, 7, 8,
            // Left face
            9, 10, 11,
            // Reversed to ensure double-sided geometry
            2, 1, 0,
            5, 4, 3,
            8, 7, 6,
            11, 10, 9
        ];

        const roof = new BABYLON.Mesh("pyramidRoof", scene);
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;
        vertexData.applyToMesh(roof);

        roof.material = roofMat;
        roof.parent = house;

    } else {
        //---------------------------------------------------------
        // B) Gabled roof (extruded wedge + front/back triangles)
        //---------------------------------------------------------
        // We'll replicate the “ExtrudeShape” approach from your second code.
        const overhang = 0.3;  // or tweak as desired

        // 1) The wedge shape in local x-y plane (triangular cross-section):
        const roofShape = [
            new BABYLON.Vector3(-shortDimension/2 - overhang, 0, 0),
            new BABYLON.Vector3(0, roofHeight, 0),
            new BABYLON.Vector3(shortDimension/2 + overhang, 0, 0),
        ];
        // 2) Extrude that shape along Z from front to back
        const roofPath = [
            new BABYLON.Vector3(0, 0, -(longDimension/2 + overhang)),
            new BABYLON.Vector3(0, 0,  (longDimension/2 + overhang))
        ];
        const wedge = BABYLON.MeshBuilder.ExtrudeShape("gableRoofWedge", {
            shape: roofShape,
            path: roofPath,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        wedge.material = roofMat;
        wedge.parent = house;
        // Raise it so it sits on top of the box
        wedge.position.y = bodyHeight;

        // 3) Add front & back capping triangles
        const frontPositions = [
            // front-left corner of box top
            -shortDimension / 2, bodyHeight, -longDimension / 2,
            // front-right corner of box top
             shortDimension / 2, bodyHeight, -longDimension / 2,
            // roof apex at front
             0, bodyHeight + roofHeight, -(longDimension / 2 + overhang)
        ];
        const backPositions = [
            // back-left corner of box top
            -shortDimension / 2, bodyHeight,  longDimension / 2,
            // back-right corner of box top
             shortDimension / 2, bodyHeight,  longDimension / 2,
            // roof apex at back
             0, bodyHeight + roofHeight,  (longDimension / 2 + overhang)
        ];

        function createSingleTriangle(name, posArray) {
            const tri = new BABYLON.Mesh(name, scene);
            const indices = [0, 1, 2];
            const normals = [];
            BABYLON.VertexData.ComputeNormals(posArray, indices, normals);

            const vertexData = new BABYLON.VertexData();
            vertexData.positions = posArray;
            vertexData.indices = indices;
            vertexData.normals = normals;
            vertexData.applyToMesh(tri);
            return tri;
        }

        const frontTri = createSingleTriangle("frontGableCap", frontPositions);
        frontTri.material = roofMat;
        frontTri.parent = house;

        const backTri = createSingleTriangle("backGableCap", backPositions);
        backTri.material = roofMat;
        backTri.parent = house;
    }

    return house;
}







/**
 * Creates a house mesh with either a pyramid roof (ratio < 2)
 * or a gable roof (ratio >= 2).
 *
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.ShadowGenerator} [shadowGenerator] optional
 * @param {object} options
 *   - short: number  (width of house)
 *   - long: number   (depth of house)
 *   - height: number (height of the walls)
 *   - roofHeight: number
 *   - boxColor: BABYLON.Color3 or string ("#RRGGBB")
 *   - roofColor: BABYLON.Color3 or string ("#RRGGBB")
 *   - position: BABYLON.Vector3 (where to place the house)
 *   - rotationY: number (radians) or degrees if you prefer
 *   - roofOverhang: number (used for the gable style)
 */
function createFlexibleHouse(scene, shadowGenerator, options = {}) {
    // Default values
    const defaults = {
      short: 4,         // house body "width"
      long: 6,          // house body "depth"
      height: 3,        // walls height
      roofHeight: 2,
      boxColor: new BABYLON.Color3(0.95, 0.95, 0.9),
      roofColor: new BABYLON.Color3(0.2, 0.1, 0.1),
      position: new BABYLON.Vector3(0, 0, 0),
      rotationY: 0,     // radians
      roofOverhang: 0.3
    };
    
    const {
      short,
      long,
      height,
      roofHeight,
      boxColor,
      roofColor,
      position,
      rotationY,
      roofOverhang
    } = { ...defaults, ...options };
  
    //-------------------------------------
    // 1) Create a parent TransformNode
    //-------------------------------------
    const houseParent = new BABYLON.TransformNode("houseParent", scene);
    houseParent.position.copyFrom(position);
    houseParent.rotation.y = rotationY;
  
    //-------------------------------------
    // 2) Create the house body (box)
    //-------------------------------------
    const bodyMesh = BABYLON.MeshBuilder.CreateBox("houseBody", {
      width: short,
      depth: long,
      height: height
    }, scene);
    bodyMesh.parent = houseParent;
    bodyMesh.position.y = height / 2; // so bottom is at y=0 in local coords
  
    // Material for house walls
    const bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
    // Accept either a BABYLON.Color3 or a hex string
    bodyMat.diffuseColor = (typeof boxColor === "string")
      ? BABYLON.Color3.FromHexString(boxColor)
      : boxColor;
    bodyMesh.material = bodyMat;
  
    //-------------------------------------
    // 3) Prepare the roof material
    //-------------------------------------
    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseColor = (typeof roofColor === "string")
      ? BABYLON.Color3.FromHexString(roofColor)
      : roofColor;
    // We typically disable back-face culling so both sides can show
    roofMat.backFaceCulling = false;
    // If the underside appears black, also do roofMat.twoSidedLighting = true;
  
    //-------------------------------------
    // 4) Decide: pyramid roof vs gable roof
    //-------------------------------------
    const ratio = long / short;
    if (ratio < 2) {
      // A) Pyramid roof
      const positions = [
        // Front face
        -short / 2, height, -long / 2,    // 0
         0,         height + roofHeight, 0,    // 1 (apex)
         short / 2, height, -long / 2,    // 2
  
        // Right face
         short / 2, height, -long / 2,    // 3
         0,         height + roofHeight, 0,    // 4 (apex)
         short / 2, height,  long / 2,    // 5
  
        // Back face
         short / 2, height,  long / 2,    // 6
         0,         height + roofHeight, 0,    // 7 (apex)
        -short / 2, height,  long / 2,    // 8
  
        // Left face
        -short / 2, height,  long / 2,    // 9
         0,         height + roofHeight, 0,    // 10 (apex)
        -short / 2, height, -long / 2     // 11
      ];
  
      // Indices (including reversed for double-sided geometry)
      const indices = [
        // Front face
        0, 1, 2,
        // Right face
        3, 4, 5,
        // Back face
        6, 7, 8,
        // Left face
        9, 10, 11,
        // Reverse
        2, 1, 0,
        5, 4, 3,
        8, 7, 6,
        11, 10, 9
      ];
  
      const vertexData = new BABYLON.VertexData();
      vertexData.positions = positions;
      vertexData.indices = indices;
  
      // Compute normals so lighting works
      const normals = [];
      BABYLON.VertexData.ComputeNormals(positions, indices, normals);
      vertexData.normals = normals;
  
      const pyramidRoof = new BABYLON.Mesh("pyramidRoof", scene);
      vertexData.applyToMesh(pyramidRoof);
  
      pyramidRoof.material = roofMat;
      pyramidRoof.parent = houseParent;
  
      // Optionally add to shadow
      if (shadowGenerator) {
        shadowGenerator.addShadowCaster(pyramidRoof);
      }
  
    } else {
      // B) Gable roof: extruded wedge + front/back capping triangles
      // 1) The wedge shape in X/Y plane
      const roofShape = [
        new BABYLON.Vector3(-short / 2 - roofOverhang, 0, 0),
        new BABYLON.Vector3(0, roofHeight, 0),
        new BABYLON.Vector3(short / 2 + roofOverhang, 0, 0),
      ];
      // 2) Extrude along Z from front to back
      const roofPath = [
        new BABYLON.Vector3(0, 0, -(long / 2 + roofOverhang)),
        new BABYLON.Vector3(0, 0,  (long / 2 + roofOverhang))
      ];
      const wedge = BABYLON.MeshBuilder.ExtrudeShape("gableWedge", {
        shape: roofShape,
        path: roofPath,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
      }, scene);
      wedge.material = roofMat;
      wedge.parent = houseParent;
      wedge.position.y = height; // place on top of box
  
      // 3) Add front & back capping triangles
      function createSingleTriangle(name, positionsArray) {
        const tri = new BABYLON.Mesh(name, scene);
        const indices = [0, 1, 2];
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positionsArray, indices, normals);
  
        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positionsArray;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.applyToMesh(tri);
        return tri;
      }
  
      // front corners
      const frontPositions = [
        -short / 2, height, -long / 2,
         short / 2, height, -long / 2,
         0,         height + roofHeight, -(long / 2 + roofOverhang)
      ];
      const frontTriangleMesh = createSingleTriangle("frontGableTri", frontPositions);
      frontTriangleMesh.material = roofMat;
      frontTriangleMesh.parent = houseParent;
  
      // back corners
      const backPositions = [
        -short / 2, height,  long / 2,
         short / 2, height,  long / 2,
         0,         height + roofHeight, (long / 2 + roofOverhang)
      ];
      const backTriangleMesh = createSingleTriangle("backGableTri", backPositions);
      backTriangleMesh.material = roofMat;
      backTriangleMesh.parent = houseParent;
  
      // Optionally add them all to shadow
      if (shadowGenerator) {
        shadowGenerator.addShadowCaster(wedge);
        shadowGenerator.addShadowCaster(frontTriangleMesh);
        shadowGenerator.addShadowCaster(backTriangleMesh);
      }
    }
  
    // Add bodyMesh to shadow as well
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(bodyMesh);
    }
  
    // Return references if needed
    return {
      houseParent,
      bodyMesh
    };
  }