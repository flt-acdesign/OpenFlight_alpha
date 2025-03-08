

/**
 * Compute the terrain height at (x,z).
 */
function compute_terrain_height(x, z, freqX, freqZ, amplitude) {
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
  

/**
 * Computes height, first derivatives, second derivatives, laplacian,
 * and normal all at once, using finite differences. 
 * -> Minimizes calls to the expensive `compute_terrain_height`.
 */
function compute_terrain_derivatives(x, z, freqX, freqZ, amplitude, step = 10) {
    // 1) Sample the terrain at 5 points
    const fC = compute_terrain_height(x,        z,        freqX, freqZ, amplitude);  // center
    const fXp = compute_terrain_height(x + step, z,        freqX, freqZ, amplitude);  // x+
    const fXm = compute_terrain_height(x - step, z,        freqX, freqZ, amplitude);  // x-
    const fZp = compute_terrain_height(x,        z + step, freqX, freqZ, amplitude);  // z+
    const fZm = compute_terrain_height(x,        z - step, freqX, freqZ, amplitude);  // z-
  
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
  



