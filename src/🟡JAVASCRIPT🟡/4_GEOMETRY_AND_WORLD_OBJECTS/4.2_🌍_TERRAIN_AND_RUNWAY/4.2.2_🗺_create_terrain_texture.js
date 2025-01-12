

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
 *   - compute_terrain_height_and_derivatives(x, z, freqX, freqZ, amplitude)   // calculates terrain height
 *   - randomGreenColor() and randomBrownColor()      // generate random color3
 **************************************************************/



function create_procedural_ground_texture(scene, groundConfig, shadowGenerator) {

    let treePositions = []

    let probability_of_spawning_a_tree_fertile = .3
    let probability_of_spawning_a_tree_barren = .05

    // Basic parameters
    const segmentCount = 30;
    const segmentSize = 200;
    const threshold = 0.1 * groundConfig.amplitude;

    // Create material with vertex colors
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.useVertexColors = true;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.fogEnabled = true;



    const patchColorMap = {};

    function getPatchColor(worldX, worldZ) {
        const patchSize = 200;
        const patchX = Math.floor(worldX / patchSize);
        const patchZ = Math.floor(worldZ / patchSize);
        const patchKey = `${patchX}_${patchZ}`;
        
        if (!patchColorMap[patchKey]) {
            const randomIndex = Math.floor(Math.random() * greenColors.length);
            patchColorMap[patchKey] = greenColors[randomIndex];
        }
        return patchColorMap[patchKey];
    }



    // For shading with normal direction
    // We'll define a direction d = (-1, -1, -1), normalized:
    const dVec = new BABYLON.Vector3(-1, -.2, -1)
    dVec.normalize()

    const { freqX, freqZ, amplitude } = groundConfig;

    for (let i = 0; i < segmentCount; i++) {
        for (let j = 0; j < segmentCount; j++) {
            const centerX = (i - segmentCount / 2) * segmentSize + segmentSize / 2;
            const centerZ = (j - segmentCount / 2) * segmentSize + segmentSize / 2;

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

            const positions = groundSegment.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            const indices = groundSegment.getIndices();
            const colors = [];

            for (let v = 0; v < positions.length; v += 3) {
                const localX = positions[v];
                const localZ = positions[v + 2];
                const worldX = localX + centerX;
                const worldZ = localZ + centerZ;

                // (A) Compute height from your terrain function
                let yVal = compute_terrain_height_and_derivatives(worldX, worldZ, freqX, freqZ, amplitude);
                

                const inside_crops = (worldX > -400 && worldX < 200 && worldZ > -3000 && worldZ < 3000)

                const inside_platform = (worldX > 0 && worldX < 80 && worldZ > -30 && worldZ < 30)

                // Define green patch around runway
                const inside_runway_margins = (worldX > -50 && worldX < 80 && worldZ > -600 && worldZ < 600);


                // (B) Get color based on yVal (existing logic)
                let vertColor;
                if (yVal < -16) {
                    const deepestBlue = randomizeColor(new BABYLON.Color3(0.020, 0.0, 0.08), 0.02);
                    if (Math.random() < 0.1) {
                        const whiteAmount = Math.random() * 0.15;
                        deepestBlue.r += whiteAmount;
                        deepestBlue.g += whiteAmount;
                        deepestBlue.b += whiteAmount;
                    }
                    vertColor = deepestBlue;
                } else if (yVal < 0) {
                    const t = (yVal + 16) / 16;
                    const deepBlue = new BABYLON.Color3(0.020, 0.0, 0.08);
                    const tropicalBlue = new BABYLON.Color3(0.0, 0.4, 0.6);
                    let finalColor = lerpColor(deepBlue, tropicalBlue, t);
                    finalColor = randomizeColor(finalColor, 0.03);
                    if (Math.random() < 0.1 + (t * 0.15)) {
                        const whiteAmount = Math.random() * 0.15;
                        finalColor.r += whiteAmount;
                        finalColor.g += whiteAmount;
                        finalColor.b += whiteAmount;
                    }
                    vertColor = finalColor;
                } else if (yVal < 4) {
                    const sand = randomizeColor(new BABYLON.Color3(0.76, 0.70, 0.50), 0.02);
                    vertColor = sand;
                } else {


                    if (inside_crops) {
                        if (yVal < threshold) {
                            const patchColor = getPatchColor(worldX, worldZ);
                            const patchColorRandom = randomizeColor(patchColor, 0.05);
                            vertColor = patchColorRandom;
                        } else {
                            let finalColor;
                            if (yVal < 0.3 * amplitude) {
                                finalColor = new BABYLON.Color3(0.90, 0.3, 0.0);
                            } else if (yVal < 0.5 * amplitude) {
                                finalColor = new BABYLON.Color3(0.4, 0.4, 0.2);
                            } else if (yVal < 0.8 * amplitude) {
                                finalColor = new BABYLON.Color3(0.3, 0.12, 0.01);
                            } else {
                                finalColor = new BABYLON.Color3(1.0, 1.0, 1.0);
                            }
                            finalColor = randomizeColor(finalColor, 0.05);
                            vertColor = finalColor;



                        }
                    } else {
                        if (yVal < 44) {
                            let finalColor = randomizeColor(new BABYLON.Color3(0.0, 0.5, 0.0), 0.05);
                            vertColor = finalColor;

                        } else if (yVal < 194) {
                            const t = (yVal - 44) / (194 - 44);
                            const grad1 = new BABYLON.Color3(0.0, 0.5, 0.0);
                            const grad2 = new BABYLON.Color3(0.3, 0.2, 0.1);
                            let finalColor = lerpColor(grad1, grad2, t);
                            finalColor = randomizeColor(finalColor, 0.05);
                            vertColor = finalColor;

                            if ( Math.random()  < probability_of_spawning_a_tree_barren     ) {
                                treePositions.push([  worldX, yVal,  worldZ ])
                            }



                        } else if (yVal < 234) {
                            const t = (yVal - 214) / (234 - 214);
                            const grad1 = new BABYLON.Color3(0.3, 0.2, 0.1);
                            const grad2 = new BABYLON.Color3(1.0, 1.0, 1.0);
                            let finalColor = lerpColor(grad1, grad2, t);
                            finalColor = randomizeColor(finalColor, 0.05);
                            vertColor = finalColor;
                        } else {
                            let finalColor = randomizeColor(new BABYLON.Color3(.95, .95, .95), 0.05);
                            vertColor = finalColor;
                        }
                    }
                }

                // (C) Optionally "flatten" the sea surface to 0
                positions[v + 1] = (yVal < 0) ? 0 : yVal;

                // (D) Compute derivatives => normal & laplacian at this vertex
                const { normal, laplacian } = computeDerivatives(worldX, worldZ, freqX, freqZ, amplitude, 1.0);
                // normal is [nx, ny, nz]

                // 1) Darken if normal is close to dVec = (-1, -1, -1)
                //    We can measure dot product with dVec
                const nVec = new BABYLON.Vector3(normal[0], normal[1], normal[2])
                const dot = BABYLON.Vector3.Dot(nVec, dVec)

                const brownish = new BABYLON.Color3(0.678, .412, 0.031);

                // If dot is large => they're pointing similarly (since both are unit vectors).
                // Choose your threshold, e.g. 0.8
                if (dot > 0.0) {
                    // scale color down
                    vertColor = vertColor.scale(1 - dot) // darkness proportional to the dot product

                    //vertColor = new BABYLON.Color3(dot, 0, 0); // e.g. 40% darker

                }

                // 2) If Laplacian ~ 0 => lighten with a "yellowish" tint,
                //    except if color is white

                if  ((yVal > 1) && (yVal < 230)) {
                const nearZeroThreshold = -0.003;
//console.log(laplacian)
                if (laplacian < nearZeroThreshold) {
                    // e.g. blend 30% toward yellow
                    //const brownish = new BABYLON.Color3(0.678, .412, 0.031);
                    vertColor = lerpColor(vertColor, brownish, -20 * laplacian) // blend the curvature effect with the vertex color
                }


                if ((laplacian > nearZeroThreshold) && (dot < 0) && (yVal > 10) & (!inside_crops) && (yVal < 200)) {  // don't place trees on top of hills


                    if ( Math.random()  < probability_of_spawning_a_tree_fertile) {
                        treePositions.push([  worldX, yVal,  worldZ ])
                        vertColor = vertColor.scale(.5) // darkness 
                    }
                }

                } // if yVal

            
            // Draw green patch around runway
            if (inside_runway_margins) {   vertColor =   randomizeColor(new BABYLON.Color3(0.133, 0.412, 0.075), 0.02);     }

            if (inside_platform) {   vertColor =   randomizeColor(new BABYLON.Color3(.5, 0.5, 0.5), 0.05)     }
            



                // (E) Finally push RGBA to the color array
                colors.push(vertColor.r, vertColor.g, vertColor.b, 1.0);
            }

            // Update mesh geometry
            groundSegment.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
            groundSegment.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);

            const normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);
            groundSegment.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);






            
        }
    }



    createRandomTrees(scene, shadowGenerator, treePositions)


}




function lerpColor(c1, c2, t) {
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return new BABYLON.Color3(
        c1.r * (1 - t) + c2.r * t,
        c1.g * (1 - t) + c2.g * t,
        c1.b * (1 - t) + c2.b * t
    );
}

function randomizeColor(color, range = 0.05) {
    const newR = clamp01(color.r + (Math.random() - 0.5) * range);
    const newG = clamp01(color.g + (Math.random() - 0.5) * range);
    const newB = clamp01(color.b + (Math.random() - 0.5) * range);
    return new BABYLON.Color3(newR, newG, newB);
}

function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}


    // Define green tones array
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

