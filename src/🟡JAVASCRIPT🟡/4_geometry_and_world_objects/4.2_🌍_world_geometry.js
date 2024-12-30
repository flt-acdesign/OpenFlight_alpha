/***************************************************************
 * Creates the main world scenery, applying fog settings and
 * delegating sub-elements (sky, ground, trees, runway, reference
 * cube) to specialized functions.
 *
 * Note: We treat the coordinate system such that:
 *   - x and z are the "ground plane" (horizontal).
 *   - y is the vertical axis (height).
 **************************************************************/
function createWorldScenery(scene, shadowGenerator, camera) {
    // Wavelengths along the x and z axes:
    // Larger wavelengths => broader "hills" in that direction.
    const xWavelength = 833;   // "Valley size" in X
    const zWavelength = 500;   // "Valley size" in Z

    // Store config parameters for ground undulation in the scene.
    // freqX and freqZ determine how "quickly" the ground waves repeat.
    // amplitude controls the overall height variation.
    scene.groundConfig = {
        freqX: 1 / xWavelength,
        freqZ: 1 / zWavelength,
        amplitude: 320
    };

    // Create the sky sphere behind/around everything
    createSkySphere(scene, camera);

    // Create the segmented ground based on our ground config
    createSegmentedGround(scene, scene.groundConfig);

    // Create a reference cube tower (for orientation near origin)
    createReferenceCube(scene, shadowGenerator);

    // Scatter some random trees around the terrain
    createRandomTrees(scene, shadowGenerator, scene.groundConfig);

    // Create a runway that follows the terrain waves
    createRunway(scene, scene.groundConfig);

    // Configure linear fog for atmospheric depth
    scene.fogMode   = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart  = 1500.0;
    scene.fogEnd    = 3800.0;
    scene.fogColor  = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);
    scene.fogDensity = 0.00058;
}

/***************************************************************
 * Creates a large sky sphere with a vertical gradient texture.
 * Automatically positions it based on the camera target.
 **************************************************************/
function createSkySphere(scene, camera) {
    // Create a sphere (facing inwards) as the sky dome
    const skySphere = BABYLON.MeshBuilder.CreateSphere(
        "skySphere",
        { diameter: 7000, sideOrientation: BABYLON.Mesh.BACKSIDE },
        scene
    );

    // We'll paint a gradient onto a dynamic texture
    const textureSize = 1024;
    const skyTexture = new BABYLON.DynamicTexture(
        "skyTexture",
        { width: textureSize, height: textureSize },
        scene
    );

    // Get the 2D canvas context for drawing
    const ctx = skyTexture.getContext();

    // Create a vertical gradient that goes from a warm color (top)
    // to a lighter color (bottom). Adjust to your liking.
    const gradient = ctx.createLinearGradient(0, 0, 0, textureSize);
    gradient.addColorStop(0, "rgb(246, 97, 42)");   // near top
    gradient.addColorStop(1, "rgb(229, 229, 240)"); // near bottom

    // Paint the gradient onto the texture
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    skyTexture.update();

    // Standard material to hold our gradient texture
    const skyMaterial = new BABYLON.StandardMaterial("skyMaterial", scene);
    skyMaterial.backFaceCulling = false;  // Render inside faces
    skyMaterial.diffuseTexture = skyTexture;
    skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

    // Attach the material to the sky sphere
    skySphere.material = skyMaterial;
    skySphere.isAlwaysActive = true; // Always rendered, even if out of frustum

    // Align skySphere with the camera target
    skySphere.rotation.z = Math.PI / 2; // Rotated 90 deg if desired
    skySphere.position.copyFrom(camera.target);
}

/***************************************************************
 * Updates the sky sphere position so that it always follows
 * the active camera in the scene. This prevents the sky from
 * getting clipped in large worlds.
 **************************************************************/
function updateSkySpherePosition(scene) {
    const skySphere = scene.getMeshByName("skySphere");
    if (skySphere && scene.activeCamera) {
        skySphere.position.x = scene.activeCamera.position.x;
        skySphere.position.z = scene.activeCamera.position.z;
        // We typically leave y alone if the sky is large enough,
        // but you could also track y if desired:
        // skySphere.position.y = scene.activeCamera.position.y;
    }
}

/***************************************************************
 * Creates a segmented ground out of multiple "tiles."
 * Each tile is subdivided so we can raise/lower its vertices
 * to create rolling hills. Uses a simple checker pattern as the texture.
 *
 * groundConfig = {
 *   freqX: number,
 *   freqZ: number,
 *   amplitude: number
 * }
 **************************************************************/
function createSegmentedGround(scene, groundConfig) {
    // Number of tiles (segments) in each dimension
    const segmentCount = 20;

    // Physical size of each tile in world units
    const segmentSize = 300;

    // Dynamic texture size (checkerboard)
    const textureSize = 128;

    // Prepare a checkerboard dynamic texture for the ground
    const groundTexture = new BABYLON.DynamicTexture(
        "groundTexture",
        { width: textureSize, height: textureSize },
        scene
    );
    const ctx = groundTexture.getContext();

    // Colors for the checker pattern
    const halfSize = textureSize / 2;
    const color1 = "#228B22"; // ForestGreen
    const color2 = "#006400"; // DarkGreen

    // Draw top-left square
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, halfSize, halfSize);

    // Draw top-right square
    ctx.fillStyle = color2;
    ctx.fillRect(halfSize, 0, halfSize, halfSize);

    // Draw bottom-left square
    ctx.fillStyle = color2;
    ctx.fillRect(0, halfSize, halfSize, halfSize);

    // Draw bottom-right square
    ctx.fillStyle = color1;
    ctx.fillRect(halfSize, halfSize, halfSize, halfSize);

    // Commit the texture changes
    groundTexture.update();

    // Material for the ground
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = groundTexture;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.fogEnabled = true;

    // Set texture wrapping so it repeats across each tile
    groundTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    groundTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    // Extract relevant config
    const { freqX, freqZ, amplitude } = groundConfig;

    // Generate multiple ground segments
    for (let i = 0; i < segmentCount; i++) {
        for (let j = 0; j < segmentCount; j++) {
            // Compute the center X and Z positions for each tile
            const centerX = (i - segmentCount / 2) * segmentSize + segmentSize / 2;
            const centerZ = (j - segmentCount / 2) * segmentSize + segmentSize / 2;

            // Build a ground mesh with subdivisions, so we can "bend" it
            const groundSegment = BABYLON.MeshBuilder.CreateGround(
                `groundSegment_${i}_${j}`,
                {
                    width: segmentSize,
                    height: segmentSize,
                    subdivisions: 50,
                    updatable: true
                },
                scene
            );

            // Position this tile so it lines up in the grid
            groundSegment.position.x = centerX;
            groundSegment.position.z = centerZ;

            // Assign our checker material
            groundSegment.material = groundMaterial;
            groundSegment.receiveShadows = true;
            groundSegment.isAlwaysActive = true;

            // Retrieve the vertex data so we can displace it
            const positions = groundSegment.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const indices = groundSegment.getIndices();

            // Adjust each vertex's y (height) based on a wave function
            for (let v = 0; v < positions.length; v += 3) {
                const localX = positions[v];
                const localZ = positions[v + 2];

                // Convert local coordinates to world coordinates
                const worldX = localX + centerX;
                const worldZ = localZ + centerZ;

                // Compute the new height in y
                const newHeight = undulationMap(worldX, worldZ, freqX, freqZ, amplitude);

                // If you want a "floor" effect, clamp negative heights
                positions[v + 1] = Math.max(newHeight, 0);
            }

            // Push the updated positions back into the mesh
            groundSegment.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);

            // Recompute normals for correct lighting/shading
            const normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);
            groundSegment.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
        }
    }
}

/***************************************************************
 * Custom function to calculate a "wave height" (undulation) at
 * any (x, z) coordinate. Uses multiple sine wave octaves to
 * create more interesting terrain.
 *
 * freqX, freqZ: wave frequencies along X and Z
 * amplitude:    overall vertical scale
 *
 * Returns the height y at coordinate (x, z).
 **************************************************************/
function undulationMap(x, z, freqX, freqZ, amplitude) {
    // baseWave introduces a wave that depends on x and z
    let baseWave =
        (Math.sin(freqX * x * 1.1)) ** 1 *
        (Math.sin(freqZ * z * x / 1000)) ** 1 *
        2;

    // octave1, octave2, octave3 are additional wave layers
    let octave1 =
        (Math.sin(freqX * 2 * x)) ** 2 *
        (Math.cos(freqZ * 2 * z)) ** 2 *
        1;

    let octave2 =
        (Math.sin(freqX * 5 * x)) ** 4 *
        (Math.sin(freqZ * 5 * z)) ** 6 *
        0.3

    let octave3 =
        (Math.sin(freqX * 8 * x)) ** 8 *
        (Math.sin(freqZ * 8 * z)) ** 8 *
        0.06

    // Combine them and scale by amplitude
    let heightY = amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1000);

    // Flatten region near the origin if desired (e.g., runway area).
    // Example: if (|x| < 100 and |z| < 300), we force height=0
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }

    return heightY;
}

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
        const treeHeight = Math.random() * 15 + 3;  // between 3 and 18
        const treeBaseRadius = Math.random() * 4 + 2; // between 2 and 6

        // Random position in the x-z plane
        // (Adjust range to whatever region you want the trees scattered)
        const xCoord = Math.random() * 580 + 90;   // e.g., 90 -> 670
        const zCoord = Math.random() * 580 - 90;   // e.g., -90 -> 490

        // Find the terrain height at (xCoord, zCoord)
        const groundY = undulationMap(xCoord, zCoord, freqX, freqZ, amplitude);

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

/***************************************************************
 * Creates a small reference "cube tower" near the origin so
 * players can see a "landmark" in the scene for orientation.
 * It stacks multiple colored cubes in a small 3x3 base.
 **************************************************************/
function createReferenceCube(scene, shadowGenerator) {
    const baseSize = 3;  // NxN cubes in each layer
    const height = 10;   // how many layers to stack

    for (let yLayer = 0; yLayer < height; yLayer++) {
        for (let xIndex = 0; xIndex < baseSize; xIndex++) {
            for (let zIndex = 0; zIndex < baseSize; zIndex++) {
                // Each cube has size=2
                const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 2 }, scene);

                // Position so the entire base is centered around x=40, z=0
                cube.position = new BABYLON.Vector3(
                    40 + (xIndex - (baseSize - 1) / 2) * 2, // shift to center
                    1 + yLayer * 2,                        // stack height
                    (zIndex - (baseSize - 1) / 2) * 2
                );

                // Alternate colors between red and white
                const cubeMaterial = new BABYLON.StandardMaterial("cubeMaterial", scene);
                if ((xIndex + yLayer + zIndex) % 2 === 0) {
                    cubeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red
                } else {
                    cubeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // White
                }
                cubeMaterial.fogEnabled = true;
                cube.material = cubeMaterial;

                // Cast shadows for realism
                shadowGenerator.addShadowCaster(cube);

                // Always keep it active
                cube.isAlwaysActive = true;
            }
        }
    }
}

/***************************************************************
 * Creates a runway that also follows the terrain undulations.
 * We slightly raise it so that it doesn't intersect with the ground.
 * Then we add small divider boxes as runway markers.
 **************************************************************/
function createRunway(scene, groundConfig) {
    // Extract frequency config
    const { freqX, freqZ, amplitude } = groundConfig;

    // Create a single ground strip for the runway
    const runwayMaterial = new BABYLON.StandardMaterial("runwayMaterial", scene);
    runwayMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // dark grey

    // Build a ground-like mesh for the runway
    const runway = BABYLON.MeshBuilder.CreateGround(
        "runway",
        {
            width: 15,       // runway width
            height: 400,     // runway length
            subdivisions: 50,
            updatable: true
        },
        scene
    );
    runway.material = runwayMaterial;

    // Retrieve runway vertex data for manipulation
    const runwayPositions = runway.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const runwayIndices = runway.getIndices();

    // Adjust the runway so it sits on top of the terrain shape
    for (let v = 0; v < runwayPositions.length; v += 3) {
        const xCoord = runwayPositions[v];
        const zCoord = runwayPositions[v + 2];

        // Terrain height at (xCoord, zCoord)
        const terrainHeight = undulationMap(xCoord, zCoord, freqX, freqZ, amplitude);

        // Raise the runway a bit above the terrain
        runwayPositions[v + 1] = terrainHeight + 0.15;
    }
    runway.setVerticesData(BABYLON.VertexBuffer.PositionKind, runwayPositions, true);

    // Recompute normals for proper lighting
    const runwayNormals = [];
    BABYLON.VertexData.ComputeNormals(runwayPositions, runwayIndices, runwayNormals);
    runway.setVerticesData(BABYLON.VertexBuffer.NormalKind, runwayNormals, true);

    // Enable receiving shadows or collisions if desired
    runway.receiveShadows = true;
    runway.physicsImpostor = new BABYLON.PhysicsImpostor(
        runway,
        BABYLON.PhysicsImpostor.MeshImpostor,
        { mass: 0, friction: 0.5, restitution: 0.1 },
        scene
    );

    // Add small divider boxes down the center of the runway
    const dividerMaterial = new BABYLON.StandardMaterial("dividerMaterial", scene);
    dividerMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // white lines

    // We'll place them every 20 units along the runway length
    for (let i = -200; i < 200; i += 20) {
        // Keep the divider in the center x=0 (relative to runway local coords),
        // but vary z from -200 to 200 in steps of 20.
        const xCoord = 0;
        const zCoord = i;

        // Compute the terrain height here
        const dividerHeight = undulationMap(xCoord, zCoord, freqX, freqZ, amplitude) + 0.3;

        // Create a small box as the runway marker
        const divider = BABYLON.MeshBuilder.CreateBox(
            "divider",
            { width: 0.3, height: 0.1, depth: 3 },
            scene
        );
        divider.position.set(xCoord, dividerHeight, zCoord);
        divider.material = dividerMaterial;

        // Optional: give each divider a physics impostor
        divider.physicsImpostor = new BABYLON.PhysicsImpostor(
            divider,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0 },
            scene
        );
    }
}
