/***************************************************************
 * calculateVertexColor
 *
 * Computes the color for a single vertex based on its height,
 * location, terrain derivatives, and special region conditions.
 *
 * 1. Underwater Regions:
 *    - Deep Underwater (yVal < –16):
 *        * Use a deep blue (RGB (0.020, 0.0, 0.08)) with slight randomization.
 *        * Occasionally (10% chance) add a small random white tint.
 *    - Shallow Underwater (–16 ≤ yVal < 0):
 *        * Blend between deep blue and tropical blue (RGB (0.0, 0.4, 0.6)).
 *        * Blend factor: (yVal + 16) / 16.
 *        * Apply random variations and extra white tint based on probability.
 *
 * 2. Near Sea-Level (0 ≤ yVal < 4):
 *    - Use a sand-like color (RGB (0.76, 0.70, 0.50)) with slight variation.
 *
 * 3. Land Regions (yVal ≥ 4):
 *    A. Inside Crops Region:
 *       - For low hills (yVal < threshold): use a consistent patch color via getPatchColor().
 *       - For higher regions (yVal ≥ threshold): apply a gradient based on height:
 *         * yVal < 0.3 * amplitude: orange-like (RGB (0.90, 0.3, 0.0)).
 *         * 0.3 * amplitude ≤ yVal < 0.5 * amplitude: lighter tone (RGB (0.4, 0.4, 0.2)).
 *         * 0.5 * amplitude ≤ yVal < 0.8 * amplitude: dark brown (RGB (0.3, 0.12, 0.01)).
 *         * Otherwise: white (RGB (1.0, 1.0, 1.0)) with slight randomization.
 *
 *    B. Outside Crops Region:
 *       - Low Altitudes (yVal < 44): dark green (RGB (0.0, 0.5, 0.0)) with variation.
 *       - Mid-Range Altitudes (44 ≤ yVal < 194):
 *         * Blend from dark green to dark brown (RGB (0.3, 0.2, 0.1)).
 *         * Occasionally spawn a barren tree and darken the color.
 *       - High Altitudes (yVal ≥ 194):
 *         * For yVal < 374: blend from dark brown to light gray (RGB (0.8, 0.8, 0.8)).
 *         * For yVal ≥ 374: use a top color (preset as a randomized color).
 *
 * 4. Snow Patch Adjustment (for land regions outside crops, yVal ≥ 150):
 *    - Compute a snow blend factor from 0 at 180 m to 1 at 270 m.
 *    - If in shadow (negative dot product with light), boost blend factor by 50%.
 *    - Based on a probability test, blend the vertex color toward white.
 *
 * 5. Shading Adjustments (for land regions, yVal ≥ 4):
 *    - Normal-Based Darkening: Darken the vertex based on the dot product of the surface normal and light direction.
 *    - Curvature-Based Tinting: For gently curved surfaces (yVal between 1 and 180), blend toward a brownish tint.
 *      * Also, if in shadow and not in crops, sometimes spawn a fertile tree and darken the color.
 *
 * 6. Region-Specific Overrides:
 *    - Runway Margins: Override with a distinct greenish shade (RGB (0.133, 0.412, 0.075)).
 *    - Platform Areas: Override with a gray tone (RGB (0.5, 0.5, 0.5)).
 *
 * @param {Object} params - Contains the following properties:
 *   - yVal: Number (terrain height at the vertex)
 *   - worldX, worldZ: Number (world coordinates of the vertex)
 *   - threshold: Number (height threshold used in crop regions)
 *   - amplitude: Number (overall vertical scale)
 *   - inside_crops: Boolean (true if vertex is in a designated crops region)
 *   - inside_platform: Boolean (true if vertex is in the platform area)
 *   - inside_runway_margins: Boolean (true if vertex is near the runway)
 *   - freqX, freqZ: Numbers (frequencies for the terrain function)
 *   - dVec: BABYLON.Vector3 (predefined light direction for shading)
 *   - treePositions: Array (array to which new tree positions may be added)
 *   - probability_of_spawning_a_tree_fertile: Number (chance to spawn a fertile tree)
 *   - probability_of_spawning_a_tree_barren: Number (chance to spawn a barren tree)
 *   - getPatchColor: Function (retrieves a patch color based on worldX and worldZ)
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

  let vertColor;

  // --- Base Color Calculation Based on Height (yVal) ---
  if (yVal < -16) {
    // Deep underwater: use deep blue with slight randomization.
    const deepestBlue = randomizeColor(new BABYLON.Color3(0.020, 0.0, 0.08), 0.02);
    if (Math.random() < 0.1) {
      const whiteAmount = Math.random() * 0.15;
      deepestBlue.r += whiteAmount;
      deepestBlue.g += whiteAmount;
      deepestBlue.b += whiteAmount;
    }
    vertColor = deepestBlue;
  } else if (yVal < 0) {
    // Shallow underwater: blend between deep blue and tropical blue.
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
    // Near sea-level: use a sand-like color.
    vertColor = randomizeColor(new BABYLON.Color3(0.76, 0.70, 0.50), 0.02);
  } else {
    // --- Land Regions (yVal >= 4) ---
    if (inside_crops) {
      // Inside crops: use patch color or height-based gradient.
      if (yVal < threshold) {
        // Low hills: use a consistent patch color.
        const patchColor = getPatchColor(worldX, worldZ);
        vertColor = randomizeColor(patchColor, 0.05);
      } else {
        // Higher regions: choose a color based on height gradient.
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
      // Outside crops region: use altitude-based gradient.
      if (yVal < 44) {
        // Low altitudes: dark green.
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
        // High altitudes: blend from dark brown to light gray.
        if (yVal < 374) {
          const t = (yVal - 194) / (374 - 194);
          vertColor = lerpColor(new BABYLON.Color3(0.3, 0.2, 0.1), new BABYLON.Color3(0.8, 0.8, 0.8), t);
          vertColor = randomizeColor(vertColor, 0.05);
        } else {
          // For very high terrain, use a preset top color with randomization.
          vertColor = randomizeColor(new BABYLON.Color3(0.9, 0.0, 0.0), 0.05);
        }
      }
    }
  }

  // --- Compute Terrain Derivatives and Adjust Shading & Snow ---
  // Apply these adjustments only for land regions.
  if (yVal >= 4) {
    const deriv = compute_terrain_derivatives(worldX, worldZ, freqX, freqZ, amplitude, 1.0);
    const nVec = new BABYLON.Vector3(deriv.normal[0], deriv.normal[1], deriv.normal[2]);
    const dot = BABYLON.Vector3.Dot(nVec, dVec);

    // Snow patch logic (for vertices outside crops at high altitudes).
    if (!inside_crops && yVal >= 180) {
      let baseSnowProb = (yVal - 180) / (270 - 180);
      if (dot < 0) {
        baseSnowProb = Math.min(1, baseSnowProb * 1.5);
      }
      if (Math.random() < baseSnowProb) {
        const snowAmount = Math.random() * 0.5 + 1.0;
        vertColor = lerpColor(vertColor, new BABYLON.Color3(1, 1, 1), snowAmount);
      }
    }

    // Standard shading adjustments.
    if (dot > 0.0) {
      // Darken the vertex based on light facing.
      vertColor = vertColor.scale(1 - dot);
    }

    // Curvature-based tinting for gentle slopes.
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

  // --- Region-Specific Overrides ---
  if (inside_runway_margins) {
    vertColor = randomizeColor(new BABYLON.Color3(0.133, 0.412, 0.075), 0.02);
  }
  if (inside_platform) {
    vertColor = randomizeColor(new BABYLON.Color3(0.5, 0.5, 0.5), 0.025);
  }

  return vertColor;
}

/***************************************************************
 * create_procedural_ground_texture
 *
 * Creates the ground by dividing it into segments, deforming it
 * with a procedural terrain function, and applying per-vertex colors.
 ***************************************************************/
function create_procedural_ground_texture(scene, groundConfig, shadowGenerator, scenery_complexity) {
  // Store positions where trees will be spawned.
  let treePositions = [];

  // Determine tree spawning probabilities based on graphic settings.
  function getTreeSpawnProbability(scenery_complexity) {
    const complexityMapping = {
      0: 0,      // No trees
      1: 0.0,    // No trees
      2: 0.01,   // Some trees
      3: 0.2    // Nominal number of trees
    };
    return complexityMapping[scenery_complexity] || 0;
  }
  const probability_of_spawning_a_tree_fertile = getTreeSpawnProbability(scenery_complexity);
  let probability_of_spawning_a_tree_barren = probability_of_spawning_a_tree_fertile / 10;

  // Basic parameters for ground segmentation.
  const segmentCount = 28;
  const segmentSize = 200;
  const threshold = 0.1 * groundConfig.amplitude; // Crop region threshold

  // Create a material that supports per-vertex coloring.
  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  groundMaterial.useVertexColors = true;
  groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  groundMaterial.fogEnabled = true;

  // Map to store consistent patch colors for crop areas.
  const patchColorMap = {};

  /**
   * getPatchColor
   *
   * Returns a consistent patch color for a given world position.
   * If not assigned, randomly selects one from a predefined array.
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
      // "greenColors" is a predefined array of BABYLON.Color3.
      const randomIndex = Math.floor(Math.random() * greenColors.length);
      patchColorMap[patchKey] = greenColors[randomIndex];
    }
    return patchColorMap[patchKey];
  }

  // Define a light direction for shading and normalize it.
  const dVec = new BABYLON.Vector3(-1, -2, -1);
  dVec.normalize();

  // Destructure terrain configuration parameters.
  const { freqX, freqZ, amplitude } = groundConfig;

  // Loop over grid segments to create the ground.
  for (let i = 0; i < segmentCount; i++) {
    for (let j = 0; j < segmentCount; j++) {
      // Calculate center position for the current segment.
      const centerX = (i - segmentCount / 2) * segmentSize + segmentSize / 2;
      const centerZ = (j - segmentCount / 2) * segmentSize + segmentSize / 2;

      // Create a ground mesh with subdivisions.
      const groundSegment = BABYLON.MeshBuilder.CreateGround(
        `groundSegment_${i}_${j}`,
        {
          width: segmentSize,
          height: segmentSize,
          subdivisions: 40,
          updatable: true,
        },
        scene
      );

      // Position the segment and assign material.
      groundSegment.position.set(centerX, 0, centerZ);
      groundSegment.material = groundMaterial;
      groundSegment.receiveShadows = true;
      groundSegment.isAlwaysActive = true;

      // Retrieve vertex data.
      const positions = groundSegment.getVerticesData(BABYLON.VertexBuffer.PositionKind);
      const indices = groundSegment.getIndices();
      const colors = [];

      // Process each vertex.
      for (let v = 0; v < positions.length; v += 3) {
        // Local coordinates.
        const localX = positions[v];
        const localZ = positions[v + 2];
        // Convert to world coordinates.
        const worldX = localX + centerX;
        const worldZ = localZ + centerZ;

        // --- Compute Terrain Height ---
        let yVal = compute_terrain_height(worldX, worldZ, freqX, freqZ, amplitude, scenery_complexity);

        // Determine special regions.
        const inside_crops = worldX > -400 && worldX < 200 && worldZ > -3000 && worldZ < 3000;
        const inside_platform = worldX > 0 && worldX < 80 && worldZ > -120 && worldZ < 30;
        const inside_runway_margins = worldX > -50 && worldX < 80 && worldZ > -600 && worldZ < 600;

        // --- Calculate Vertex Color ---
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
          getPatchColor: getPatchColor,
        });

        // --- Adjust Vertex Height ---
        // Flatten sea surface: set y-coordinate to 0 if below sea level.
        positions[v + 1] = yVal < 0 ? 0 : yVal;

        // --- Append the Vertex Color (RGBA) ---
        colors.push(vertColor.r, vertColor.g, vertColor.b, 1.0);
      }

      // Update mesh with new vertex positions and colors.
      groundSegment.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
      groundSegment.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, true);

      // Recompute normals for correct lighting.
      const normals = [];
      BABYLON.VertexData.ComputeNormals(positions, indices, normals);
      groundSegment.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
    }
  }

  // After ground creation, generate trees at recorded positions.
  createRandomTrees(scene, shadowGenerator, treePositions);
}

// --- Dynamic Sea Generation Configuration ---
const SEA_PATCH_SIZE = 4000;         // Size of each sea patch
const SEA_CHECK_RADIUS = 3;            // Number of patches to generate around the camera
const SEA_PATCH_RESOLUTION = 10;       // Low resolution for performance

let activeSeaPatches = {};             // Track active sea patches

/**
 * enableDynamicSeaGeneration
 *
 * Initializes dynamic sea generation by continuously checking the active
 * camera's position.
 */
function enableDynamicSeaGeneration(scene) {
  scene.onBeforeRenderObservable.add(() => {
    updateSeaPatches(scene);
  });
}

/**
 * updateSeaPatches
 *
 * Updates sea patches based on the active camera's current position.
 */
function updateSeaPatches(scene) {
  const camera = scene.activeCamera;
  if (!camera) {
    console.warn("No active camera found in the scene.");
    return;
  }

  // Determine camera's patch coordinates.
  const camX = Math.floor(camera.position.x / SEA_PATCH_SIZE);
  const camZ = Math.floor(camera.position.z / SEA_PATCH_SIZE);
  const newActivePatches = {};

  // Generate patches around the camera.
  for (let dx = -SEA_CHECK_RADIUS; dx <= SEA_CHECK_RADIUS; dx++) {
    for (let dz = -SEA_CHECK_RADIUS; dz <= SEA_CHECK_RADIUS; dz++) {
      const patchX = camX + dx;
      const patchZ = camZ + dz;
      const patchKey = `${patchX}_${patchZ}`;

      // Create patch if not already active.
      if (!activeSeaPatches[patchKey]) {
        const seaPatch = createSeaPatch(scene, patchX, patchZ, 2800);
        if (seaPatch) {
          activeSeaPatches[patchKey] = seaPatch;
        }
      }
      newActivePatches[patchKey] = activeSeaPatches[patchKey];
    }
  }

  // Dispose patches that are no longer near the camera.
  for (const patchKey in activeSeaPatches) {
    const patch = activeSeaPatches[patchKey];
    if (patch && !newActivePatches[patchKey]) {
      patch.dispose();
      delete activeSeaPatches[patchKey];
    }
  }

  activeSeaPatches = newActivePatches;
}

/**
 * createSeaPatch
 *
 * Creates a low-resolution sea patch at the specified grid coordinates.
 *
 * @param {BABYLON.Scene} scene - The scene object.
 * @param {Number} patchX - The patch grid X-coordinate.
 * @param {Number} patchZ - The patch grid Z-coordinate.
 * @param {Number} main_patch_side_length - The side length of the main patch.
 * @returns {BABYLON.Mesh|null} The sea patch mesh, or null if overlapping the main patch.
 */
function createSeaPatch(scene, patchX, patchZ, main_patch_side_length) {
  const posX = patchX * SEA_PATCH_SIZE;
  const posZ = patchZ * SEA_PATCH_SIZE;
  const halfMainPatchSize = main_patch_side_length / 2;

  // Prevent creation if overlapping the main patch area.
  const isOverlappingMainPatch =
    posX + SEA_PATCH_SIZE / 2 > -halfMainPatchSize &&
    posX - SEA_PATCH_SIZE / 2 < halfMainPatchSize &&
    posZ + SEA_PATCH_SIZE / 2 > -halfMainPatchSize &&
    posZ - SEA_PATCH_SIZE / 2 < halfMainPatchSize;

  if (isOverlappingMainPatch) {
    return null;
  }

  // Create the sea patch mesh.
  const seaPatch = BABYLON.MeshBuilder.CreateGround(`seaPatch_${patchX}_${patchZ}`, {
    width: SEA_PATCH_SIZE,
    height: SEA_PATCH_SIZE,
    subdivisions: SEA_PATCH_RESOLUTION,
    updatable: false,
  }, scene);

  seaPatch.position.set(posX, -2, posZ);

  // Create and apply the sea material.
  const seaMaterial = new BABYLON.StandardMaterial(`seaMaterial_${patchX}_${patchZ}`, scene);
  seaMaterial.diffuseColor = new BABYLON.Color3(0.020, 0.0, 0.08);
  seaMaterial.backFaceCulling = false;
  seaPatch.material = seaMaterial;

  activeSeaPatches[`${patchX}_${patchZ}`] = seaPatch;
  return seaPatch;
}

/**
 * lerpColor
 *
 * Linearly interpolates between two colors.
 *
 * @param {BABYLON.Color3} c1 - Start color.
 * @param {BABYLON.Color3} c2 - End color.
 * @param {Number} t - Interpolation factor (clamped between 0 and 1).
 * @returns {BABYLON.Color3} The interpolated color.
 */
function lerpColor(c1, c2, t) {
  t = Math.max(0, Math.min(1, t));
  return new BABYLON.Color3(
    c1.r * (1 - t) + c2.r * t,
    c1.g * (1 - t) + c2.g * t,
    c1.b * (1 - t) + c2.b * t
  );
}

/**
 * randomizeColor
 *
 * Adds slight random variation to a color within a specified range.
 *
 * @param {BABYLON.Color3} color - The base color.
 * @param {Number} range - Maximum variation (default is 0.05).
 * @returns {BABYLON.Color3} The randomized color.
 */
function randomizeColor(color, range = 0.05) {
  const newR = clamp01(color.r + (Math.random() - 0.5) * range);
  const newG = clamp01(color.g + (Math.random() - 0.5) * range);
  const newB = clamp01(color.b + (Math.random() - 0.5) * range);
  return new BABYLON.Color3(newR, newG, newB);
}

/**
 * clamp01
 *
 * Clamps a value between 0 and 1.
 *
 * @param {Number} value - The value to clamp.
 * @returns {Number} The clamped value.
 */
function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

// --- Define an array of green tones for patch colors ---
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
