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
    // Wavelengths along the x and z axes (for the undulationMap)
    const xWavelength = 833;   
    const zWavelength = 500;   

    // Store config parameters for ground undulation in the scene
    scene.groundConfig = {
        freqX: 1 / xWavelength,
        freqZ: 1 / zWavelength,
        amplitude: 500
    };

    // Create the sky sphere behind/around everything
    createSkySphere(scene, camera);

    // Create the segmented ground with custom vertex colors
    createSegmentedGround(scene, scene.groundConfig);

    // (Optional) create reference objects, trees, runway, etc.
    createReferenceCube(scene, shadowGenerator);
    createRandomTrees(scene, shadowGenerator, scene.groundConfig);
    createRunway(scene, scene.groundConfig);

    // Configure linear fog for atmospheric depth
    scene.fogMode   = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart  = 600.0;
    scene.fogEnd    = 2800.0;
    scene.fogColor  = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);
    scene.fogDensity = 0.0058;
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
 * Creates a segmented ground out of multiple "tiles."
 * Each tile is subdivided so we can raise/lower its vertices
 * to create rolling hills. We'll use per-vertex coloring:
 *
 *  1) If yVal < -11  => clamp to -11, color deep blue.
 *  2) If -11 <= yVal < -10 => sand color.
 *  3) If yVal >= -10 and we're inside region (x in -300..300, z in -200..200):
 *     - if yVal < threshold => checkerboard
 *     - else => color gradient (dark green -> light brown -> dark brown -> white)
 *  4) Outside region:
 *     - A multi-stop gradient from dark green at y=30 to dark brown at y=70, to white at y=100+.
 *
 * groundConfig = {
 *   freqX: number,  // wave frequency in X
 *   freqZ: number,  // wave frequency in Z
 *   amplitude: number // overall vertical scale
 * }
 *
 * This function requires:
 *   - undulationMap(x, z, freqX, freqZ, amplitude)   // calculates terrain height
 *   - randomGreenColor() and randomBrownColor()      // generate random color3
 **************************************************************/
function createSegmentedGround(scene, groundConfig) {
    // 1) Basic parameters
    const segmentCount = 30;     // how many segments in each dimension
    const segmentSize = 200     // size of each segment
    const threshold = 0.1 * groundConfig.amplitude;

    // 2) Create one material that uses vertex colors
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.useVertexColors = true;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.fogEnabled = true;

    // 3) Define an array of green tones (for patches below threshold)
    const greenColors = [
        new BABYLON.Color3(67/255, 122/255, 27/255),
        new BABYLON.Color3(10/255, 79/255, 10/255),
        new BABYLON.Color3(19/255, 89/255, 20/255),
        new BABYLON.Color3(57/255, 132/255, 27/255),
        new BABYLON.Color3(10/255, 99/255, 10/255),
        new BABYLON.Color3(29/255, 89/255, 30/255),
        new BABYLON.Color3(245/255, 163/255, 18/255),
        new BABYLON.Color3(171/255, 110/255, 4/255)
    ];

    // We'll store a random color for each patch so it's consistent
    const patchColorMap = {};

    /**
     * Assign a random color from greenColors to the patch
     * determined by (patchX, patchZ). Then reuse that color
     * for all vertices in the same patch.
     */
    function getPatchColor(worldX, worldZ) {
        const patchSize = 200;  // each square is 200×200
        const patchX = Math.floor(worldX / patchSize);
        const patchZ = Math.floor(worldZ / patchSize);

        // Unique key to identify each patch
        const patchKey = `${patchX}_${patchZ}`;

        // If we haven't stored a color yet for this patch, pick one randomly
        if (!patchColorMap[patchKey]) {
            const randomIndex = Math.floor(Math.random() * greenColors.length);
            patchColorMap[patchKey] = greenColors[randomIndex];
        }

        return patchColorMap[patchKey];
    }

    // 4) Helper for smooth color transitions
    function lerpColor(c1, c2, t) {
        // clamp t into [0..1]
        if (t < 0) t = 0;
        if (t > 1) t = 1;
        return new BABYLON.Color3(
            c1.r * (1 - t) + c2.r * t,
            c1.g * (1 - t) + c2.g * t,
            c1.b * (1 - t) + c2.b * t
        );
    }

    /**
     * 5) Add randomness to a color to reduce uniform appearance.
     *    Range determines how large the random offset can be for each channel.
     *    Example: range=0.05 => ±5% random variation in each channel.
     */
    function randomizeColor(color, range = 0.05) {
        const newR = clamp01(color.r + (Math.random() - 0.5) * range);
        const newG = clamp01(color.g + (Math.random() - 0.5) * range);
        const newB = clamp01(color.b + (Math.random() - 0.5) * range);
        return new BABYLON.Color3(newR, newG, newB);
    }

    // Helper to clamp a value to [0..1]
    function clamp01(value) {
        return Math.max(0, Math.min(1, value));
    }

    // 6) Extract config
    const { freqX, freqZ, amplitude } = groundConfig;

    // 7) Build each ground segment
    for (let i = 0; i < segmentCount; i++) {
        for (let j = 0; j < segmentCount; j++) {
            // Center X, Z of this tile
            const centerX = (i - segmentCount / 2) * segmentSize + segmentSize / 2;
            const centerZ = (j - segmentCount / 2) * segmentSize + segmentSize / 2;

            // Create subdivided ground tile
            const groundSegment = BABYLON.MeshBuilder.CreateGround(
                `groundSegment_${i}_${j}`,
                {
                    width: segmentSize,
                    height: segmentSize,
                    subdivisions: 40,
                    updatable: true
                },
                scene
            );

            groundSegment.position.set(centerX, 0, centerZ);
            groundSegment.material = groundMaterial;
            groundSegment.receiveShadows = true;
            groundSegment.isAlwaysActive = true;

            // Pull out vertex data
            const positions = groundSegment.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const indices = groundSegment.getIndices();
            const colors = [];

            for (let v = 0; v < positions.length; v += 3) {
                const localX = positions[v];
                const localZ = positions[v + 2];

                // Convert to world coords
                const worldX = localX + centerX;
                const worldZ = localZ + centerZ;

                // Terrain height from undulation
                let yVal = undulationMap(worldX, worldZ, freqX, freqZ, amplitude);

                // 1) Very low => clamp to -14, deep blue
                if (yVal < -14) {
                    yVal = -14;
                    // Slight randomness in the blue color (range ~0.02)
                    const deepBlue = randomizeColor(new BABYLON.Color3(0.040, 0.0, 0.12), 0.02);
                    colors.push(deepBlue.r, deepBlue.g, deepBlue.b, 1.0);
                }
                // 2) Next band => -11..-10 => sand
                else if (yVal < -10) {
                    // Slight randomness in sand color
                    const sand = randomizeColor(new BABYLON.Color3(0.76, 0.70, 0.50), 0.02);
                    colors.push(sand.r, sand.g, sand.b, 1.0);
                }
                // 3) Above -10, check if we're inside the special region
                else {
                    const insideRegion =
                        worldX > -400 && worldX < 200 &&
                        worldZ > -3000 && worldZ < 3000;

                    if (insideRegion) {
                        // If yVal < threshold => checker patches, else 4-band gradient
                        if (yVal < threshold) {
                            // Each 200×200 patch picks one random color from greenColors
                            const patchColor = getPatchColor(worldX, worldZ);
                            // Add slight randomness
                            const patchColorRandom = randomizeColor(patchColor, 0.05);
                            colors.push(patchColorRandom.r, patchColorRandom.g, patchColorRandom.b, 1.0);
                        } else {
                            // 4-band gradient: dark green -> light brown -> dark brown -> white
                            let finalColor;
                            if (yVal < 0.3 * amplitude) {
                                // Dark Green
                                finalColor = new BABYLON.Color3(0.90, 0.3, 0.0);
                            } else if (yVal < 0.5 * amplitude) {
                                // Light Brown
                                finalColor = new BABYLON.Color3(0.4, 0.4, 0.2);
                            } else if (yVal < 0.8 * amplitude) {
                                // Dark Brown
                                finalColor = new BABYLON.Color3(0.3, 0.12, 0.01);
                            } else {
                                // White
                                finalColor = new BABYLON.Color3(1.0, 1.0, 1.0);
                            }
                            // Randomize each vertex’s final color slightly
                            finalColor = randomizeColor(finalColor, 0.05);
                            colors.push(finalColor.r, finalColor.g, finalColor.b, 1.0);
                        }
                    } else {
                        // Outside region => multi-stop gradient from y=30 to 220 to 250
                        if (yVal < 30) {
                            // Dark Green
                            let finalColor = randomizeColor(new BABYLON.Color3(0.0, 0.5, 0.0), 0.05);
                            colors.push(finalColor.r, finalColor.g, finalColor.b, 1.0);
                        } 
                        else if (yVal < 180) {
                            // Dark Green -> Dark Brown
                            const t = (yVal - 30) / (180 - 30);
                            const grad1 = new BABYLON.Color3(0.0, 0.5, 0.0); 
                            const grad2 = new BABYLON.Color3(0.3, 0.2, 0.1);
                            let finalColor = lerpColor(grad1, grad2, t);
                            // Add random offset
                            finalColor = randomizeColor(finalColor, 0.05);
                            colors.push(finalColor.r, finalColor.g, finalColor.b, 1.0);
                        } 
                        else if (yVal < 220) {
                            // Dark Brown -> White
                            const t = (yVal - 200) / (220 - 200);
                            const grad1 = new BABYLON.Color3(0.3, 0.2, 0.1);
                            const grad2 = new BABYLON.Color3(1.0, 1.0, 1.0);
                            let finalColor = lerpColor(grad1, grad2, t);
                            // Add random offset
                            finalColor = randomizeColor(finalColor, 0.05);
                            colors.push(finalColor.r, finalColor.g, finalColor.b, 1.0);
                        } 
                        else {
                            // yVal >= 250 => white
                            let finalColor = randomizeColor(new BABYLON.Color3(1.0, 1.0, 1.0), 0.05);
                            colors.push(finalColor.r, finalColor.g, finalColor.b, 1.0);
                        }
                    }
                }

                // Write final y back
                positions[v + 1] = yVal;
            }

            // Store updated geometry
            groundSegment.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            groundSegment.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);

            // Recompute normals for proper shading
            const normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);
            groundSegment.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
        }
    }
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
                     yLayer * 2,                        // stack height
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
