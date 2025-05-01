

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
    if (Math.abs(x) < 80 && Math.abs(z) < 600) {
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
  // ---------- configuration -------------------------------------------------
  const boardSize     = 15_000;          // total width/height of the board (world units)
  const squaresCount  = 30;              // tiles per side (must be even for 4 equal quadrants)
  const tileSize      = boardSize / squaresCount;
  const midIndex      = squaresCount / 2;  // centre line index
  // --------------------------------------------------------------------------

  // A parent node keeps the board together and plays the role of `window.ground`.
  const boardRoot = new BABYLON.TransformNode("groundRoot", window.scene);
  window.ground   = boardRoot;           // preserve external references
  window.groundY  = 0;                   // compatibility with your old code

  // Container for coloured materials so we reuse (not recreate) identical ones.
  const matCache = {};
  const getMat = (hex) => {
    if (!matCache[hex]) {
      const m = new BABYLON.StandardMaterial(`mat_${hex}`, window.scene);
      m.diffuseColor  = BABYLON.Color3.FromHexString(hex);
      m.specularColor = BABYLON.Color3.Black();   // no shine
      matCache[hex] = m;
    }
    return matCache[hex];
  };

  // --------------------------------------------------------------------------
  // Build the tiled ground – a single CreateGround per square.
  // --------------------------------------------------------------------------
  for (let i = 0; i < squaresCount; ++i) {
    for (let j = 0; j < squaresCount; ++j) {
      // ----- quadrant logic (same colours as before) -------------------------
      let colorPair, localI, localJ;

      if (i >= midIndex && j <  midIndex) {          // Quadrant I (x>0, z>0) – greens
        colorPair = { even: "#c4e0af", odd: "#8ec269" };
        localI = i - midIndex;  localJ = j;
      } else if (i <  midIndex && j <  midIndex) {   // Quadrant II (x<0, z>0) – yellows
        colorPair = { even: "#ffffcc", odd: "#ffd700" };
        localI = i;            localJ = j;
      } else if (i <  midIndex && j >= midIndex) {   // Quadrant III (x<0, z<0) – oranges
        colorPair = { even: "#ffcc99", odd: "#ff9933" };
        localI = i;            localJ = j - midIndex;
      } else {                                       // Quadrant IV (x>0, z<0) – pinks
        colorPair = { even: "#f6c1d6", odd: "#f299b9" };
        localI = i - midIndex;  localJ = j - midIndex;
      }

      const hex    = (localI + localJ) % 2 === 0 ? colorPair.even : colorPair.odd;
      const mat    = getMat(hex);

      // ----- create the tile -------------------------------------------------
      const tile = BABYLON.MeshBuilder.CreateGround(
        `tile_${i}_${j}`,
        { width: tileSize, height: tileSize },
        window.scene
      );
      tile.material       = mat;
      tile.receiveShadows = true;
      tile.isPickable     = true;

      // Centre the board on (0,0) in world space.
      tile.position.x = (i + 0.5) * tileSize - boardSize / 2;
      tile.position.z = (j + 0.5) * tileSize - boardSize / 2;
      tile.parent     = boardRoot;   // keep hierarchy tidy
    }
  }

  // A separate node for projection helpers, as in the original version.
  window.groundProjections = new BABYLON.TransformNode("groundProjections", window.scene);
}





/********************************************
 * END of createGround()
 ********************************************/
