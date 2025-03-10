

/**
 * Compute the terrain height at (x,z).
 */
function compute_terrain_height(x, z, freqX, freqZ, amplitude, scenery_complexity) {
    
  
  if (scenery_complexity < 2) {

    return  14;

  } else {
  
  
  // --- your terrain logic as before ---
    let baseWave =
      (Math.sin(freqX * x * 1.1)) ** 3 *
      (Math.sin(freqZ * z * x / 1100)) ** 3 *
      2;
  
    let octave1 =
      (Math.sin(freqX * 2 * x)) ** 4 *
      (Math.cos(freqZ * 1.7 * z)) ** 4 *
      1;
  
    let octave2 =
      (Math.sin(freqX * 6 * x)) ** 5 *
      (Math.sin(freqZ * 4 * z)) ** 5 *
      0.3;
  
    let octave3 =
      (Math.sin(freqX * 7 * x + z / 100)) ** 8 *
      (Math.sin(freqZ * 6 * z)) ** 8 *
      0.06;
  
    // Combine them and scale
    const distance = Math.sqrt(x * x + z * z);
    const island_radius = 2500;
    const modulation = (distance < island_radius) 
        ? 0 
        : (distance - island_radius) / 1000;
  
    let heightY = amplitude * (
      ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300) - modulation
    );
  
    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
      heightY = 0;
    }
  
    return heightY + 14;
  }
}
  

/**
 * Computes height, first derivatives, second derivatives, laplacian,
 * and normal all at once, using finite differences. 
 * -> Minimizes calls to the expensive `compute_terrain_height`.
 */
function compute_terrain_derivatives(x, z, freqX, freqZ, amplitude, step = 10) {
    // 1) Sample the terrain at 5 points
    const fC = compute_terrain_height(x,        z,        freqX, freqZ, amplitude, scenery_complexity);  // center
    const fXp = compute_terrain_height(x + step, z,        freqX, freqZ, amplitude, scenery_complexity);  // x+
    const fXm = compute_terrain_height(x - step, z,        freqX, freqZ, amplitude, scenery_complexity);  // x-
    const fZp = compute_terrain_height(x,        z + step, freqX, freqZ, amplitude, scenery_complexity);  // z+
    const fZm = compute_terrain_height(x,        z - step, freqX, freqZ, amplitude, scenery_complexity);  // z-
  
    // 2) First partial derivatives (central difference)
    const fx = (fXp - fXm) / (2 * step);
    const fz = (fZp - fZm) / (2 * step);
  
    // 3) Second partial derivatives
    //    f_xx = (f(x+dx) - 2f(x) + f(x-dx)) / (dx^2)
    const fxx = (fXp - 2 * fC + fXm) / (step * step);
  
    //    f_zz = (f(z+dz) - 2f(z) + f(z-dz)) / (dz^2)
    const fzz = (fZp - 2 * fC + fZm) / (step * step);
  
    // 4) Laplacian
    const laplacian = fxx + fzz;
  
    // 5) Normal
    //    A common convention: (-f_x, 1, -f_z), then normalize
    let nx = -fx;
    let ny = 1.0;
    let nz = -fz;
    const length = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (length > 1e-8) {
      nx /= length;
      ny /= length;
      nz /= length;
    }
  
    return {
      height:     fC,
      fx:         fx,
      fz:         fz,
      fxx:        fxx,
      fzz:        fzz,
      laplacian:  laplacian,
      normal:     [nx, ny, nz],
    };
  }
  




/********************************************
 * START of createGround()
 ********************************************/
function create_checkered_ground() {
  window.ground = BABYLON.MeshBuilder.CreateGround(
    "ground", 
    { width: 15000, height: 15000 },
    window.scene
  );

  const groundMat = new BABYLON.StandardMaterial("groundMat", window.scene);

  // Create a dynamic texture for the checkerboard pattern.
  const textureSize = 2048;
  const dt = new BABYLON.DynamicTexture("groundDT", { width: textureSize, height: textureSize }, window.scene, false);
  const ctx = dt.getContext();

  const squaresCount = 10;
  const tileSize = textureSize / squaresCount;
  const midIndex = squaresCount / 2; // This divides the texture into 4 quadrants.

  // Loop through each tile on the texture.
  // Note: In canvas, j = 0 is the top row.
  for (let i = 0; i < squaresCount; i++) {
    for (let j = 0; j < squaresCount; j++) {
      let colorPair;
      let localI, localJ;

      // Determine quadrant based on tile indices:
      // - For horizontal (i): i < midIndex → left (x < 0), i >= midIndex → right (x > 0)
      // - For vertical (j): j < midIndex → top (z > 0), j >= midIndex → bottom (z < 0)
      if (i >= midIndex && j < midIndex) {
        // Quadrant I: Right half, Top half (x > 0, z > 0) – Green shades.
        colorPair = { even: "#c4e0af", odd: "#8ec269" };
        localI = i - midIndex;
        localJ = j;
      } else if (i < midIndex && j < midIndex) {
        // Quadrant II: Left half, Top half (x < 0, z > 0) – Yellow shades.
        colorPair = { even: "#ffffcc", odd: "#ffd700" };
        localI = i;
        localJ = j;
      } else if (i < midIndex && j >= midIndex) {
        // Quadrant III: Left half, Bottom half (x < 0, z < 0) – Orange shades.
        colorPair = { even: "#ffcc99", odd: "#ff9933" };
        localI = i;
        localJ = j - midIndex;
      } else if (i >= midIndex && j >= midIndex) {
        // Quadrant IV: Right half, Bottom half (x > 0, z < 0) – Pink shades.
        colorPair = { even: "#f6c1d6", odd: "#f299b9" };
        localI = i - midIndex;
        localJ = j - midIndex;
      }

      // Apply a checkerboard pattern within the quadrant.
      const fillColor = (localI + localJ) % 2 === 0 ? colorPair.even : colorPair.odd;
      ctx.fillStyle = fillColor;
      ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
  dt.update();

  // Set up the material using the dynamic texture.
  groundMat.diffuseTexture = dt;
  groundMat.diffuseTexture.uScale = squaresCount;
  groundMat.diffuseTexture.vScale = squaresCount;
  groundMat.diffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  groundMat.diffuseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  groundMat.diffuseTexture.anisotropicFilteringLevel = 16;
  groundMat.diffuseTexture.samplingMode = BABYLON.Texture.NEAREST_SAMPLINGMODE;

  window.ground.material = groundMat;
  window.ground.isPickable = true;
  window.ground.receiveShadows = true;

  // Store initial ground position for reference.
  window.groundY = 0;

  // Create a separate transform node for ground projections (remains even if ground is hidden).
  window.groundProjections = new BABYLON.TransformNode("groundProjections", window.scene);
}
/********************************************
 * END of createGround()
 ********************************************/
