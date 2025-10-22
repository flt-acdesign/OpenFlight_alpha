/***************************************************************
 * calculateVertexColor
 *
 * Computes the color for a single vertex based on its height,
 * location, terrain derivatives, and special region conditions.
 *
 * 1. Underwater Regions:
 * - Deep Underwater (yVal < –16):
 * * Use a deep blue (RGB (0.020, 0.0, 0.08)) with slight randomization.
 * * Occasionally (10% chance) add a small random white tint.
 * - Shallow Underwater (–16 ≤ yVal < 0):
 * * Blend between deep blue and a deeper ocean blue (RGB (0.0, 0.1, 0.4)). (MODIFIED)
 * * Blend factor: (yVal + 16) / 16.
 * * Apply random variations and extra white tint based on probability.
 *
 * 2. Near Sea-Level (0 ≤ yVal < 4):
 * - Use a sand-like color (RGB (0.76, 0.70, 0.50)) with slight variation.
 *
 * 3. Land Regions (yVal ≥ 4):
 * A. Inside Crops Region:
 * - For low hills (yVal < threshold): use a consistent patch color via getPatchColor().
 * - For higher regions (yVal ≥ threshold): apply a gradient based on height:
 * * yVal < 0.3 * amplitude: orange-like (RGB (0.90, 0.3, 0.0)).
 * * 0.3 * amplitude ≤ yVal < 0.5 * amplitude: lighter tone (RGB (0.4, 0.4, 0.2)).
 * * 0.5 * amplitude ≤ yVal < 0.8 * amplitude: dark brown (RGB (0.3, 0.12, 0.01)).
 * * Otherwise: white (RGB (1.0, 1.0, 1.0)) with slight randomization.
 *
 * B. Outside Crops Region:
 * - Low Altitudes (yVal < 44): dark green (RGB (0.0, 0.5, 0.0)) with variation.
 * - Mid-Range Altitudes (44 ≤ yVal < 194):
 * * Blend from dark green to dark brown (RGB (0.3, 0.2, 0.1)).
 * * Occasionally spawn a barren tree and darken the color.
 * - High Altitudes (yVal ≥ 194):
 * * For yVal < 374: blend from dark brown to light gray (RGB (0.8, 0.8, 0.8)).
 * * For yVal ≥ 374: use a top color (preset as a randomized color).
 *
 * 4. Snow Patch Adjustment (for land regions outside crops, yVal ≥ 150):
 * - Compute a snow blend factor from 0 at 180 m to 1 at 270 m.
 * - If in shadow (negative dot product with light), boost blend factor by 50%.
 * - Based on a probability test, blend the vertex color toward white.
 *
 * 5. Shading Adjustments (for land regions, yVal ≥ 4):
 * - Normal-Based Darkening: Darken the vertex based on the dot product of the surface normal and light direction.
 * - Curvature-Based Tinting: For gently curved surfaces (yVal between 1 and 180), blend toward a brownish tint.
 * * Also, if in shadow and not in crops, sometimes spawn a fertile tree and darken the color.
 *
 * 6. Region-Specific Overrides:
 * - Runway Margins: Override with a distinct greenish shade (RGB (0.133, 0.412, 0.075)).
 * - Platform Areas: Override with a gray tone (RGB (0.5, 0.5, 0.5)).
 *
 * @param {Object} params - Contains the following properties:
 * - yVal: Number (terrain height at the vertex)
 * - worldX, worldZ: Number (world coordinates of the vertex)
 * - threshold: Number (height threshold used in crop regions)
 * - amplitude: Number (overall vertical scale)
 * - inside_crops: Boolean (true if vertex is in a designated crops region)
 * - inside_platform: Boolean (true if vertex is in the platform area)
 * - inside_runway_margins: Boolean (true if vertex is near the runway)
 * - freqX, freqZ: Numbers (frequencies for the terrain function)
 * - dVec: BABYLON.Vector3 (predefined light direction for shading)
 * - treePositions: Array (array to which new tree positions may be added)
 * - probability_of_spawning_a_tree_fertile: Number (chance to spawn a fertile tree)
 * - probability_of_spawning_a_tree_barren: Number (chance to spawn a barren tree)
 * - getPatchColor: Function (retrieves a patch color based on worldX and worldZ)
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
    // Shallow underwater: blend between deep blue and a deeper ocean blue.
    const t = (yVal + 16) / 16;
    const deepBlue = new BABYLON.Color3(0.020, 0.0, 0.08);
    // MODIFIED: Changed from (0.0, 0.2, 0.5) to an even deeper blue.
    const tropicalBlue = new BABYLON.Color3(0.0, 0.1, 0.4);
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
 * * MODIFICATION: Now works with terrain height that returns -100 for
 * underwater surfaces, keeping them separated from water surface layer.
 ***************************************************************/
function create_procedural_ground_texture(scene, groundConfig, shadowGenerator, scenery_complexity) {
  // Store positions where trees will be spawned.
  let treePositions = [];

  // Determine tree spawning probabilities based on graphic settings.
  function getTreeSpawnProbability(scenery_complexity) {
    const complexityMapping = {
      0: 0,     // No trees
      1: 0.0,   // No trees
      2: 0.01,  // Some trees
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
        // MODIFICATION: No longer flatten underwater to 0, as compute_terrain_height 
        // now returns -100 for underwater surfaces to separate them from water layer.
        // Simply use the height value as-is.
        positions[v + 1] = yVal;

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

// --- OPTIMIZED Water Surface Configuration ---
// MODIFIED: Increased patch size
const WATER_PATCH_SIZE = 8000;        // Large patches for better performance
const WATER_CHECK_RADIUS = 2;         // Fewer patches around camera
const WATER_PATCH_RESOLUTION = 50;    // Moderate resolution for normal map detail

let activeWaterPatches = {};          // Track active water patches
let waterMaterial = null;             // Shared material for all water patches
let waterNormalTexture = null;        // Shared normal map texture

/**
 * createProceduralWaterNormalMap
 * * Creates a procedural normal map texture for water waves.
 * Uses multiple sine wave layers to create realistic wave normals.
 */
function createProceduralWaterNormalMap(scene) {
  const textureSize = 1024;
  const normalTexture = new BABYLON.DynamicTexture(
    "waterNormalMap",
    { width: textureSize, height: textureSize },
    scene,
    false
  );

  const ctx = normalTexture.getContext();
  const imageData = ctx.createImageData(textureSize, textureSize);
  const data = imageData.data;

  // Generate procedural normal map
  for (let y = 0; y < textureSize; y++) {
    for (let x = 0; x < textureSize; x++) {
      const idx = (y * textureSize + x) * 4;

      // Normalized coordinates (0 to 1)
      const u = x / textureSize;
      const v = y / textureSize;

      // Create multiple wave layers with different frequencies and directions
      // Higher frequencies for finer detail
      const wave1 = Math.sin(u * Math.PI * 20) * Math.cos(v * Math.PI * 15);
      const wave2 = Math.sin(u * Math.PI * 30 + v * Math.PI * 25) * 0.7;
      const wave3 = Math.sin((u + v) * Math.PI * 40) * 0.5;
      const wave4 = Math.sin((u - v) * Math.PI * 35) * 0.4;
      const wave5 = Math.sin(u * Math.PI * 50) * Math.cos(v * Math.PI * 45) * 0.3;

      const combinedWave = wave1 + wave2 + wave3 + wave4 + wave5;

      // Calculate gradients (derivatives)
      const dx = Math.cos(u * Math.PI * 20) * Math.PI * 20 * Math.cos(v * Math.PI * 15) +
               Math.cos(u * Math.PI * 30 + v * Math.PI * 25) * Math.PI * 30 * 0.7 +
               Math.cos((u + v) * Math.PI * 40) * Math.PI * 40 * 0.5 +
               Math.cos((u - v) * Math.PI * 35) * Math.PI * 35 * 0.4 +
               Math.cos(u * Math.PI * 50) * Math.PI * 50 * Math.cos(v * Math.PI * 45) * 0.3;

      const dy = Math.sin(u * Math.PI * 20) * (-Math.sin(v * Math.PI * 15)) * Math.PI * 15 +
               Math.cos(u * Math.PI * 30 + v * Math.PI * 25) * Math.PI * 25 * 0.7 +
               Math.cos((u + v) * Math.PI * 40) * Math.PI * 40 * 0.5 +
               -Math.cos((u - v) * Math.PI * 35) * Math.PI * 35 * 0.4 +
               Math.sin(u * Math.PI * 50) * (-Math.sin(v * Math.PI * 45)) * Math.PI * 45 * 0.3;

      // Normal vector calculation: (-dx, -dy, 1) then normalize
      const nx = -dx * 0.9;  // Scale down for subtle effect
      const ny = -dy * 0.9;
      const nz = 1.0;

      const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
      const normalizedX = nx / length;
      const normalizedY = ny / length;
      const normalizedZ = nz / length;

      // Convert from [-1, 1] to [0, 255] color space
      data[idx] = Math.floor((normalizedX * 0.5 + 0.5) * 255);      // R channel
      data[idx + 1] = Math.floor((normalizedY * 0.5 + 0.5) * 255);  // G channel
      data[idx + 2] = Math.floor((normalizedZ * 0.5 + 0.5) * 255);  // B channel
      data[idx + 3] = 55; // Alpha
    }
  }

  ctx.putImageData(imageData, 0, 0);
  normalTexture.update();

  // Set texture properties for tiling
  normalTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  normalTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  normalTexture.uScale = 11;  // Tile the normal map for higher frequency detail
  normalTexture.vScale = 24;

  return normalTexture;
}

/**
 * enableDynamicWaterGeneration
 *
 * Initializes dynamic water surface generation.
 * ENHANCED: Now includes reflections, normal maps, and high-frequency patterns.
 */
function enableDynamicWaterGeneration(scene) {
  // Create procedural normal map for waves
  waterNormalTexture = createProceduralWaterNormalMap(scene);

  // Create a single shared material for all water patches (performance optimization)
  waterMaterial = new BABYLON.StandardMaterial("sharedWaterMaterial", scene);
  
  // Use vertex colors for base color variation
  waterMaterial.useVertexColors = true;
  
  // Add reflection for water surface
  waterMaterial.reflectionTexture = new BABYLON.MirrorTexture(
    "waterReflection",
    512,  // Reflection texture size
    scene,
    true
  );
  waterMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0); // Reflect along Y=0 plane
  waterMaterial.reflectionTexture.level = 0.1;  // Reflection intensity
  
  // Apply normal map for wave detail
  waterMaterial.bumpTexture = waterNormalTexture;
  waterMaterial.bumpTexture.level = 150;  // Normal map strength
  
  // Specular highlights for sun reflections
  waterMaterial.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);
  // MODIFIED: Increased power from 128 to 256 for sharper highlights
  waterMaterial.specularPower = 256; // Very sharp highlights
  
  // Enable fog
  waterMaterial.fogEnabled = true;
  waterMaterial.backFaceCulling = false;

  scene.onBeforeRenderObservable.add(() => {
    updateWaterPatches(scene);
  });
}

/**
 * updateWaterPatches
 *
 * Updates water patches based on the active camera's current position.
 * OPTIMIZED: Uses much larger patches and fewer of them.
 */
function updateWaterPatches(scene) {
  const camera = scene.activeCamera;
  if (!camera) {
    console.warn("No active camera found in the scene.");
    return;
  }

  // Determine camera's patch coordinates.
  const camX = Math.floor(camera.position.x / WATER_PATCH_SIZE);
  const camZ = Math.floor(camera.position.z / WATER_PATCH_SIZE);
  const newActivePatches = {};

  // Generate patches around the camera (5x5 grid with radius 2)
  for (let dx = -WATER_CHECK_RADIUS; dx <= WATER_CHECK_RADIUS; dx++) {
    for (let dz = -WATER_CHECK_RADIUS; dz <= WATER_CHECK_RADIUS; dz++) {
      const patchX = camX + dx;
      const patchZ = camZ + dz;
      const patchKey = `${patchX}_${patchZ}`;

      // Create patch if not already active.
      if (!activeWaterPatches[patchKey]) {
        const waterPatch = createWaterPatch(scene, patchX, patchZ);
        if (waterPatch) {
          activeWaterPatches[patchKey] = waterPatch;
          
          // Add water patch to reflection render list
          if (waterMaterial.reflectionTexture && waterMaterial.reflectionTexture.renderList) {
            // Reflection should show sky and terrain
            // Don't add the water patches themselves to avoid infinite reflection
          }
        }
      }
      newActivePatches[patchKey] = activeWaterPatches[patchKey];
    }
  }

  // Dispose patches that are no longer near the camera.
  for (const patchKey in activeWaterPatches) {
    const patch = activeWaterPatches[patchKey];
    if (patch && !newActivePatches[patchKey]) {
      patch.dispose();
      delete activeWaterPatches[patchKey];
    }
  }

  activeWaterPatches = newActivePatches;
}

/**
 * createWaterPatch
 *
 * Creates a water surface patch with high-frequency wave patterns in vertex colors.
 * ENHANCED: Higher frequency patterns, normal mapping, and reflections.
 *
 * @param {BABYLON.Scene} scene - The scene object.
 * @param {Number} patchX - The patch grid X-coordinate.
 * @param {Number} patchZ - The patch grid Z-coordinate.
 * @returns {BABYLON.Mesh} The water patch mesh.
 */
function createWaterPatch(scene, patchX, patchZ) {
  const posX = patchX * WATER_PATCH_SIZE;
  const posZ = patchZ * WATER_PATCH_SIZE;

  // Create ground plane with moderate resolution for normal map detail
  const waterPatch = BABYLON.MeshBuilder.CreateGround(
    `waterPatch_${patchX}_${patchZ}`,
    {
      width: WATER_PATCH_SIZE,
      height: WATER_PATCH_SIZE,
      subdivisions: WATER_PATCH_RESOLUTION,
      updatable: false,
    },
    scene
  );

  // Position at sea level (y=0)
  waterPatch.position.set(posX, 0, posZ);

  // Use shared material with reflections and normal maps
  waterPatch.material = waterMaterial;

  // Get vertex data for coloring
  const positions = waterPatch.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const indices = waterPatch.getIndices();
  const colors = [];

  // Apply HIGH-FREQUENCY vertex colors for detailed wave appearance
  for (let v = 0; v < positions.length; v += 3) {
    const localX = positions[v];
    const localZ = positions[v + 2];
    const worldX = localX + posX;
    const worldZ = localZ + posZ;

    // HIGHER FREQUENCY wave patterns (increased from previous version)
    // Multiple overlapping sine waves at higher frequencies
    const spatialPattern1 = Math.sin(worldX * 0.15) * Math.cos(worldZ * 0.15);
    const spatialPattern2 = Math.sin(worldX * 0.25 + worldZ * 0.20) * 0.6;
    const spatialPattern3 = Math.sin((worldX + worldZ) * 0.18) * 0.5;
    const spatialPattern4 = Math.sin((worldX - worldZ) * 0.22) * 0.4;
    const spatialPattern5 = Math.sin(worldX * 0.30) * Math.cos(worldZ * 0.28) * 0.35;
    const spatialPattern6 = Math.sin(worldX * 0.35 + worldZ * 0.32) * 0.3;
    
    const combinedPattern = spatialPattern1 + spatialPattern2 + spatialPattern3 + 
                            spatialPattern4 + spatialPattern5 + spatialPattern6;

    // MODIFIED: Base deep blue color (changed from 0.0, 0.02, 0.10)
    let waterColor = new BABYLON.Color3(0.0, 0.01, 0.08);

    // Add variation based on spatial pattern to simulate waves/ripples
    // More dramatic variation for higher frequency appearance
    if (combinedPattern > 0.3) {
      const lightAmount = (combinedPattern - 0.3) * 0.5;
      // MODIFIED: Adapted to new, darker base color
      waterColor = new BABYLON.Color3(
        0.0 + lightAmount * 0.10,
        0.01 + lightAmount * 0.15,
        0.08 + lightAmount * 0.50
      );
    } else if (combinedPattern < -0.3) {
      // Darker for wave troughs
      const darkAmount = Math.abs(combinedPattern + 0.3) * 0.3;
      // MODIFIED: Adapted to new, darker base color
      waterColor = new BABYLON.Color3(
        0.0, // Clamp at 0
        0.01 - darkAmount * 0.01,
        0.08 - darkAmount * 0.04
      );
    }

    // HIGH FREQUENCY foam/wave crests with tighter pattern
    const foamPattern1 = Math.sin(worldX * 0.40) * Math.cos(worldZ * 0.38);
    const foamPattern2 = Math.sin((worldX + worldZ) * 0.45);
    const combinedFoam = foamPattern1 + foamPattern2;
    
    if (combinedFoam > 1.5) {
      const whiteAmount = (combinedFoam - 1.5) * 0.8;
      waterColor.r += whiteAmount * 0.25;
      waterColor.g += whiteAmount * 0.25;
      waterColor.b += whiteAmount * 0.25;
    }

    // Slight randomization for natural variation
    waterColor = randomizeColor(waterColor, 0.015);

    // Push RGBA values (fully opaque)
    colors.push(waterColor.r, waterColor.g, waterColor.b, 1.0);
  }

  // Apply colors to mesh
  waterPatch.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors, false);

  // Recompute normals (these will be perturbed by the normal map)
  const normals = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  waterPatch.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, false);

  activeWaterPatches[`${patchX}_${patchZ}`] = waterPatch;
  return waterPatch;
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