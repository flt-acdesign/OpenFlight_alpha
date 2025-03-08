


/***************************************************************
 * calculateVertexColor
 *
 * Computes the color for a single vertex based on its height, location,
 * terrain derivatives, and special region conditions.
 *
 1. Underwater Regions:

Deep Underwater (yVal < –16):

Use a deep blue color (approximately RGB (0.020, 0.0, 0.08)).
Occasionally (10% chance) add a small random amount of white to brighten it slightly.
Shallow Underwater (–16 ≤ yVal < 0):

Blend between deep blue and a tropical blue (approximately RGB (0.0, 0.4, 0.6)).
The blending factor is computed as (yVal + 16) / 16.
Also, randomize the result slightly and occasionally add extra white based on the blend factor.
2. Near Sea-Level (0 ≤ yVal < 4):

Assign a sand-like color (approximately RGB (0.76, 0.70, 0.50)) with slight random variation.
3. Land Regions (yVal ≥ 4):

A. If the vertex is inside the crops region:

Low Hills (yVal < threshold):
Use a consistent patch color (determined by the getPatchColor(worldX, worldZ) function) with slight randomization.
Higher Regions within Crops (yVal ≥ threshold):
Apply a gradient based on height:
If yVal < 0.3 * amplitude: use an orange-like color (approximately RGB (0.90, 0.3, 0.0)).
If 0.3 * amplitude ≤ yVal < 0.5 * amplitude: use a lighter tone (approximately RGB (0.4, 0.4, 0.2)).
If 0.5 * amplitude ≤ yVal < 0.8 * amplitude: use a dark brown (approximately RGB (0.3, 0.12, 0.01)).
Otherwise: use white (approximately RGB (1.0, 1.0, 1.0)), then randomize slightly.
B. If the vertex is outside the crops region:

Low Altitudes (yVal < 44):

Use a dark green color (approximately RGB (0.0, 0.5, 0.0)) with slight random variation.
Mid-Range Altitudes (44 ≤ yVal < 194):

Blend from dark green to dark brown:
Compute the blend factor as (yVal – 44) / (194 – 44).
Interpolate between dark green (RGB (0.0, 0.5, 0.0)) and dark brown (RGB (0.3, 0.2, 0.1)).
Occasionally (based on a probability) spawn a barren tree and darken the vertex (by scaling the color by 0.5).
High Altitudes (yVal ≥ 194):

If yVal is between 194 and 374:
Blend from dark brown to light gray:
Compute the blend factor as (yVal – 194) / (374 – 194).
Interpolate between dark brown (RGB (0.3, 0.2, 0.1)) and light gray (RGB (0.8, 0.8, 0.8)).
If yVal is 374 or higher:
Use a top color (in the current code, this is produced by randomizing a preset color; note that the code uses new BABYLON.Color3(0.9, 0.0, 0.0) here, which appears different from the light gray of the gradient—this may be subject to later revision).
4. Snow Patch Adjustment (applies only for land regions outside crops, with yVal ≥ 150):

Snow Blend Factor:
The blend factor increases linearly from 0 at 180 m to 1 at 270 m.
If the vertex is in shadow (determined by the dot product of the vertex’s normal with the light direction being negative), the blend factor is boosted by 50% (and then clamped so it does not exceed 1).
Application:
If a random test (based on the computed probability) succeeds, blend the current vertex color toward white.
The blending uses a random “snow amount” (in the code, a factor between about 1.0 and 1.5) to determine how much the vertex color is shifted toward white.
5. Shading Adjustments (for land regions, yVal ≥ 4):

Normal-Based Darkening:

Compute the surface normal (using terrain derivatives) and its dot product with a predefined light direction (dVec).
If the dot product is positive (i.e. the surface is facing the light), darken the vertex by scaling its color by (1 – dot).
Curvature-Based Tinting:

For vertices with gentle curvature (when yVal is between 1 and 180):
If the Laplacian is less than a near-zero threshold (–0.003), blend the vertex color toward a brownish tint (approximately RGB (0.678, 0.412, 0.031)) using a factor proportional to –20×(laplacian).
Additionally, for gently curved surfaces that are in shadow (dot < 0), not in crops, and with yVal between 10 and 200, there is a chance to spawn a fertile tree and darken the vertex color (by scaling by 0.5).
6. Region-Specific Overrides:

Runway Margins:

If the vertex is inside runway margins, override its color with a distinct shade (approximately RGB (0.133, 0.412, 0.075)) with slight randomization.
Platform Areas:

If the vertex is inside a platform region, override its color with a gray tone (approximately RGB (0.5, 0.5, 0.5)) with slight randomization.
 *
 * @param {Object} params - An object containing all required parameters:
 *   - yVal: Number. The computed terrain height at the vertex.
 *   - worldX, worldZ: Number. The world coordinates of the vertex.
 *   - threshold: Number. Height threshold used in crop regions.
 *   - amplitude: Number. Overall vertical scale.
 *   - inside_crops: Boolean. True if the vertex is in a designated crops region.
 *   - inside_platform: Boolean. True if the vertex is in the platform area.
 *   - inside_runway_margins: Boolean. True if the vertex is near the runway.
 *   - freqX, freqZ: Numbers. Frequencies for the terrain function.
 *   - dVec: BABYLON.Vector3. A predefined light direction for shading.
 *   - treePositions: Array. An array to which new tree positions may be added.
 *   - probability_of_spawning_a_tree_fertile: Number. Chance to spawn a fertile tree.
 *   - probability_of_spawning_a_tree_barren: Number. Chance to spawn a barren tree.
 *   - getPatchColor: Function. A function to retrieve a patch color based on worldX and worldZ.
 *
 * @returns {BABYLON.Color3} The final computed vertex color.
 ***************************************************************/
function calculateVertexColor(params) {
    // Destructure parameters for clarity.
    const {
      yVal,
      worldX,
      worldZ,
      threshold,
      amplitude,
      inside_crops,
      inside_platform,
      inside_runway_margins,
      freqX,
      freqZ,
      dVec,
      treePositions,
      probability_of_spawning_a_tree_fertile,
      probability_of_spawning_a_tree_barren,
      getPatchColor,
    } = params;
  
    let vertColor; // This will hold the computed color.
  
    // --- (B) Base Color Calculation Based on Height (yVal) ---
    if (yVal < -16) {
      // Very low terrain (deep underwater): use a deep blue with slight randomization.
      const deepestBlue = randomizeColor(new BABYLON.Color3(0.020, 0.0, 0.08), 0.02);
      if (Math.random() < 0.1) {
        const whiteAmount = Math.random() * 0.15;
        deepestBlue.r += whiteAmount;
        deepestBlue.g += whiteAmount;
        deepestBlue.b += whiteAmount;
      }
      vertColor = deepestBlue;
    } else if (yVal < 0) {
      // Shallow underwater: blend between deep blue and a tropical blue.
      const t = (yVal + 16) / 16;
      const deepBlue = new BABYLON.Color3(0.020, 0.0, 0.08);
      const tropicalBlue = new BABYLON.Color3(0.0, 0.4, 0.6);
      let finalColor = lerpColor(deepBlue, tropicalBlue, t);
      finalColor = randomizeColor(finalColor, 0.03);
      if (Math.random() < 0.1 + t * 0.15) {
        const whiteAmount = Math.random() * 0.15;
        finalColor.r += whiteAmount;
        finalColor.g += whiteAmount;
        finalColor.b += whiteAmount;
      }
      vertColor = finalColor;
    } else if (yVal < 4) {
      // Near sea-level: assign a sand-like color.
      vertColor = randomizeColor(new BABYLON.Color3(0.76, 0.70, 0.50), 0.02);
    } else {
      // --- Land region (yVal >= 4) ---
      if (inside_crops) {
        // In crops regions, use per-patch colors or a gradient.
        if (yVal < threshold) {
          // For low hills, pick a patch color (consistent within a patch).
          const patchColor = getPatchColor(worldX, worldZ);
          vertColor = randomizeColor(patchColor, 0.05);
        } else {
          // For higher regions within crops, choose a gradient based on height.
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
        // Outside crops region: assign colors based on a gradient.
        if (yVal < 44) {
          // Lower altitudes: use a dark green.
          vertColor = randomizeColor(new BABYLON.Color3(0.0, 0.5, 0.0), 0.05);
        } else if (yVal < 194) {
          // Mid-range: blend from dark green to dark brown.
          const t = (yVal - 44) / (194 - 44);
          vertColor = lerpColor(new BABYLON.Color3(0.0, 0.5, 0.0), new BABYLON.Color3(0.3, 0.2, 0.1), t);
          vertColor = randomizeColor(vertColor, 0.05);
          // Occasionally spawn a barren tree.
          if (Math.random() < probability_of_spawning_a_tree_barren) {
            treePositions.push([worldX, yVal, worldZ]);
            vertColor = vertColor.scale(0.5);
          }
        } else {
          // High altitudes: blend from dark brown to a light gray (instead of almost white).
          if (yVal < 374) {
            const t = (yVal - 194) / (374 - 194);
            vertColor = lerpColor(new BABYLON.Color3(0.3, 0.2, 0.1), new BABYLON.Color3(0.8, 0.8, 0.8), t);
            vertColor = randomizeColor(vertColor, 0.05);
          } else {
            // For very high terrain, use the top color (light gray).
            vertColor = randomizeColor(new BABYLON.Color3(0.9, 0.0, 0.0), 0.05);
          }
        }
      }
    }
  
    // --- (D) Compute Terrain Derivatives and Adjust Shading & Snow ---
    // Only for land regions.
    if (yVal >= 4) {
      const deriv = compute_terrain_derivatives(worldX, worldZ, freqX, freqZ, amplitude, 1.0);
      const nVec = new BABYLON.Vector3(deriv.normal[0], deriv.normal[1], deriv.normal[2]);
      const dot = BABYLON.Vector3.Dot(nVec, dVec);
  
      // For vertices outside crops, apply snow patch logic if the altitude is high enough.
      // Snow probability increases linearly from 0 at 150 m to 1 at 220 m.
      if (!inside_crops && yVal >= 180) {
        let baseSnowProb = ((yVal - 180) / (270 - 180))
        // Boost probability by 50% in zones of shadow (dot < 0).
        if (dot < 0) {
          baseSnowProb = Math.min(1, baseSnowProb * 1.5);
        }
        if (Math.random() < baseSnowProb) {
          const snowAmount = Math.random() * 0.5 + 1.;
          vertColor = lerpColor(vertColor, new BABYLON.Color3(1, 1, 1), snowAmount);
        }
      }
  
      // Standard shading adjustments:
      // 1) Darken the vertex if the surface normal aligns with the light direction.
      if (dot > 0.0) {
        vertColor = vertColor.scale(1 - dot);
      }
      // 2) For vertices with gentle curvature, blend toward a brownish tint.
      const brownish = new BABYLON.Color3(0.678, 0.412, 0.031);
      if (yVal > 1 && yVal < 180) {
        const nearZeroThreshold = -0.003;
        if (deriv.laplacian < nearZeroThreshold) {
          vertColor = lerpColor(vertColor, brownish, -20 * deriv.laplacian);
        }
        if (
          deriv.laplacian > nearZeroThreshold &&
          dot < 0 &&
          yVal > 10 &&
          !inside_crops &&
          yVal < 200
        ) {
          if (Math.random() < probability_of_spawning_a_tree_fertile) {
            treePositions.push([worldX, yVal, worldZ]);
            vertColor = vertColor.scale(0.5);
          }
        }
      }
    }
  
    // --- (E) Region-Specific Overrides ---
    if (inside_runway_margins) {
      vertColor = randomizeColor(new BABYLON.Color3(0.133, 0.412, 0.075), 0.02);
    }
    if (inside_platform) {
      vertColor = randomizeColor(new BABYLON.Color3(0.5, 0.5, 0.5), 0.025);
    }
  
    // Return the final vertex color.
    return vertColor;
  }
  





  
  /**
   * create_procedural_ground_texture
   *
   * Creates the ground by splitting it into segments, deforming it using a
   * procedural terrain function, and applying per-vertex colors.
   */
  function create_procedural_ground_texture(scene, groundConfig, shadowGenerator, graphic_settings) {
    // Array to store positions where trees will be spawned.
    let treePositions = [];
  
    // Determine tree spawning probabilities based on the provided graphic settings.
    const probability_of_spawning_a_tree_fertile = {
      none: 0,
      few: 0.05,
      many: 0.2,
    }[graphic_settings.trees];
  
    // Barren trees spawn less frequently.
    let probability_of_spawning_a_tree_barren = probability_of_spawning_a_tree_fertile / 10;
  
    // Basic parameters for segmenting the ground.
    const segmentCount = 28;
    const segmentSize = 200;
    // Threshold used in crop regions to decide color transitions.
    const threshold = 0.1 * groundConfig.amplitude;
  
    // Create a material that supports per-vertex coloring.
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.useVertexColors = true;
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    groundMaterial.fogEnabled = true;
  
    // A map to store consistent patch colors for regions (used in crop areas).
    const patchColorMap = {};
  
    /**
     * getPatchColor
     *
     * Returns a consistent patch color for a given world position. If a patch
     * color hasn’t been assigned yet, it randomly selects one from a predefined array.
     *
     * @param {Number} worldX - The X-coordinate in world space.
     * @param {Number} worldZ - The Z-coordinate in world space.
     * @returns {BABYLON.Color3} The patch color.
     */
    function getPatchColor(worldX, worldZ) {
      const patchSize = 200;
      const patchX = Math.floor(worldX / patchSize);
      const patchZ = Math.floor(worldZ / patchSize);
      const patchKey = `${patchX}_${patchZ}`;
  
      if (!patchColorMap[patchKey]) {
        // Assume "greenColors" is a predefined array of BABYLON.Color3.
        const randomIndex = Math.floor(Math.random() * greenColors.length);
        patchColorMap[patchKey] = greenColors[randomIndex];
      }
      return patchColorMap[patchKey];
    }
  
    // Define a light direction for shading effects and normalize it.
    const dVec = new BABYLON.Vector3(-1, -2, -1);
    dVec.normalize();
  
    // Destructure terrain configuration parameters.
    const { freqX, freqZ, amplitude } = groundConfig;
  
    // Loop over the grid to create each ground segment.
    for (let i = 0; i < segmentCount; i++) {
      for (let j = 0; j < segmentCount; j++) {
        // Calculate the center position for the current segment.
        const centerX = (i - segmentCount / 2) * segmentSize + segmentSize / 2;
        const centerZ = (j - segmentCount / 2) * segmentSize + segmentSize / 2;
  
        // Create a ground mesh with subdivisions (for finer vertex control).
        const groundSegment = BABYLON.MeshBuilder.CreateGround(
          `groundSegment_${i}_${j}`,
          {
            width: segmentSize,
            height: segmentSize,
            subdivisions: 40, // Detail level for vertex manipulation.
            updatable: true,
          },
          scene
        );
  
        // Position the segment and assign the material.
        groundSegment.position.set(centerX, 0, centerZ);
        groundSegment.material = groundMaterial;
        groundSegment.receiveShadows = true;
        groundSegment.isAlwaysActive = true;
  
        // Retrieve vertex data from the mesh.
        const positions = groundSegment.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        const indices = groundSegment.getIndices();
        const colors = [];
  
        // Iterate over each vertex (each vertex has 3 values: x, y, z).
        for (let v = 0; v < positions.length; v += 3) {
          // Local vertex coordinates within the segment.
          const localX = positions[v];
          const localZ = positions[v + 2];
          // Convert local coordinates to world coordinates.
          const worldX = localX + centerX;
          const worldZ = localZ + centerZ;
  
          // --- (A) Compute Terrain Height ---
          let yVal = compute_terrain_height(worldX, worldZ, freqX, freqZ, amplitude);
  
          // Determine if the vertex is within special regions.
          const inside_crops = worldX > -400 && worldX < 200 && worldZ > -3000 && worldZ < 3000;
          const inside_platform = worldX > 0 && worldX < 80 && worldZ > -120 && worldZ < 30;
          const inside_runway_margins = worldX > -50 && worldX < 80 && worldZ > -600 && worldZ < 600;
  
          // --- (B) Calculate Vertex Color ---
          // Pass the local getPatchColor function into calculateVertexColor.
          const vertColor = calculateVertexColor({
            yVal: yVal,
            worldX: worldX,
            worldZ: worldZ,
            threshold: threshold,
            amplitude: amplitude,
            inside_crops: inside_crops,
            inside_platform: inside_platform,
            inside_runway_margins: inside_runway_margins,
            freqX: freqX,
            freqZ: freqZ,
            dVec: dVec,
            treePositions: treePositions,
            probability_of_spawning_a_tree_fertile: probability_of_spawning_a_tree_fertile,
            probability_of_spawning_a_tree_barren: probability_of_spawning_a_tree_barren,
            getPatchColor: getPatchColor // passing the function as a parameter
          });
  
          // --- (C) Adjust Vertex Height ---
          // Flatten the sea surface: if the vertex is below sea level, set its y-coordinate to 0.
          positions[v + 1] = yVal < 0 ? 0 : yVal;
  
          // --- (E) Append the Vertex Color ---
          // Push the RGBA values for this vertex into the colors array.
          colors.push(vertColor.r, vertColor.g, vertColor.b, 1.0);
        }
  
        // Update the mesh with the new vertex positions and colors.
        groundSegment.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        groundSegment.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);
  
        // Recompute normals for correct lighting after vertex manipulation.
        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        groundSegment.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
      }
    }
  
    // After creating the ground, create trees at the recorded positions.
    createRandomTrees(scene, shadowGenerator, treePositions);
  }
  




// Configuration for dynamic sea generation
const SEA_PATCH_SIZE = 4000         // Size of each sea patch
const SEA_CHECK_RADIUS = 3;         // Number of patches to generate around the camera
const SEA_PATCH_RESOLUTION = 10;    // Low resolution for performance

let activeSeaPatches = {};          // Track active sea patches

/**
 * Initializes dynamic sea generation by continuously checking the active camera's position.
 */
function enableDynamicSeaGeneration(scene) {
    scene.onBeforeRenderObservable.add(() => {
        updateSeaPatches(scene);
    });
}

/**
 * Updates sea patches based on the active camera's current position.
 */

function updateSeaPatches(scene) {
  const camera = scene.activeCamera;

  if (!camera) {
      console.warn("No active camera found in the scene.");
      return;
  }

  // Get the camera's current patch coordinates
  const camX = Math.floor(camera.position.x / SEA_PATCH_SIZE);
  const camZ = Math.floor(camera.position.z / SEA_PATCH_SIZE);

  const newActivePatches = {};

  // Generate patches around the camera
  for (let dx = -SEA_CHECK_RADIUS; dx <= SEA_CHECK_RADIUS; dx++) {
      for (let dz = -SEA_CHECK_RADIUS; dz <= SEA_CHECK_RADIUS; dz++) {
          const patchX = camX + dx;
          const patchZ = camZ + dz;
          const patchKey = `${patchX}_${patchZ}`;

          // Create patch if it doesn't exist
          if (!activeSeaPatches[patchKey]) {
              const seaPatch = createSeaPatch(scene, patchX, patchZ, 2800); // 2800 is the main patch side length

              // Only store the patch if it was successfully created
              if (seaPatch) {
                  activeSeaPatches[patchKey] = seaPatch;
              }
          }

          // Mark this patch to be retained
          newActivePatches[patchKey] = activeSeaPatches[patchKey];
      }
  }

  // Remove patches that are no longer near the camera
  for (const patchKey in activeSeaPatches) {
      // Check if the patch is valid and not in the new active list
      const patch = activeSeaPatches[patchKey];
      if (patch && !newActivePatches[patchKey]) {
          patch.dispose();  // Safely dispose only existing patches
          delete activeSeaPatches[patchKey];
      }
  }

  // Update the active patches
  activeSeaPatches = newActivePatches;
}





/**
 * Creates a low-resolution sea patch at the specified grid coordinates.
 */





function createSeaPatch(scene, patchX, patchZ, main_patch_side_length) {
  const posX = patchX * SEA_PATCH_SIZE;
  const posZ = patchZ * SEA_PATCH_SIZE;

  // Calculate the half-size of the main patch for easier boundary checks
  const halfMainPatchSize = main_patch_side_length / 2

  // Check if the new patch overlaps the main patch area
  const isOverlappingMainPatch = (
      posX + SEA_PATCH_SIZE / 2 > -halfMainPatchSize &&
      posX - SEA_PATCH_SIZE / 2 < halfMainPatchSize &&
      posZ + SEA_PATCH_SIZE / 2 > -halfMainPatchSize &&
      posZ - SEA_PATCH_SIZE / 2 < halfMainPatchSize
  );

  // If it overlaps, prevent creation
  if (isOverlappingMainPatch) {
      return null;
  }

  // Create a simple ground mesh for the sea patch
  const seaPatch = BABYLON.MeshBuilder.CreateGround(`seaPatch_${patchX}_${patchZ}`, {
      width: SEA_PATCH_SIZE,
      height: SEA_PATCH_SIZE,
      subdivisions: SEA_PATCH_RESOLUTION,
      updatable: false
  }, scene);

  // Position the patch at sea level (y = 0)
  seaPatch.position.set(posX, -2, posZ);

  // Apply the sea material
  const seaMaterial = new BABYLON.StandardMaterial(`seaMaterial_${patchX}_${patchZ}`, scene);
  seaMaterial.diffuseColor = new BABYLON.Color3(0.020, 0.0, 0.08); // Deep ocean blue
  seaMaterial.backFaceCulling = false; // Ensure visibility from all angles

  seaPatch.material = seaMaterial;

  // Add the patch to the active patches tracker
  activeSeaPatches[`${patchX}_${patchZ}`] = seaPatch;

  return seaPatch;
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

