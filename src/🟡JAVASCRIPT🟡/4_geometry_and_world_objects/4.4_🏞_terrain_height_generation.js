


/***************************************************************
 * Example terrain function for generating terrain heights
 ***************************************************************/



function undulationMap(x, z, freqX, freqZ, amplitude) {
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
        .3;

    let octave3 =
        (Math.sin(freqX * 7 * x + z / 100)) ** 8 *
        (Math.sin(freqZ * 6 * z)) ** 8 *
        0.06;

    // Combine them and scale
        
        distance = (x**2 + z**2) **.5 
        island_radius = 2500

        modulation  = (distance < island_radius) ? 0 : (distance - island_radius) / 1000

        //heightY = (distance < 2500) ? amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) : -15
        heightY = amplitude * (((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) -  modulation)


    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY +14
}


/**
 * Approximates first derivatives, normal, and laplacian at (x,z).
 * @param {number} x 
 * @param {number} z 
 * @param {number} freqX 
 * @param {number} freqZ 
 * @param {number} amplitude
 * @param {number} [step=1]  - finite difference step
 * @returns {object} { height, normal: [nx, ny, nz], laplacian }
 */
function computeDerivatives(x, z, freqX, freqZ, amplitude, step = 1) {
    // Height at (x,z)
    const h = undulationMap(x, z, freqX, freqZ, amplitude);

    // Sample slightly around (x,z) to approximate derivatives
    const hXp = undulationMap(x + step, z, freqX, freqZ, amplitude);
    const hXm = undulationMap(x - step, z, freqX, freqZ, amplitude);
    const hZp = undulationMap(x, z + step, freqX, freqZ, amplitude);
    const hZm = undulationMap(x, z - step, freqX, freqZ, amplitude);

    // f_x
    const fx = (hXp - hXm) / (2 * step);
    // f_z
    const fz = (hZp - hZm) / (2 * step);

    // f_xx
    const fxx = (hXp - 2 * h + hXm) / (step * step);
    // f_zz
    const fzz = (hZp - 2 * h + hZm) / (step * step);

    // Laplacian
    const laplacian = fxx + fzz;

    // Normal ~ normalize( -f_x, 1, -f_z )
    let nx = -fx;
    let ny = 1.0;
    let nz = -fz;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (len > 1e-8) {
        nx /= len; 
        ny /= len; 
        nz /= len;
    }

    return {
        height: h,
        normal: [nx, ny, nz],
        laplacian: laplacian
    };
}




/**
 * Compute the height, partial derivatives, Laplacian, and normal at (x,z).
 * @param {number} x - x coordinate
 * @param {number} z - z coordinate
 * @param {number} freqX - frequency scaling in x
 * @param {number} freqZ - frequency scaling in z
 * @param {number} amplitude - overall amplitude for terrain
 * @param {number} [step=1] - small step for finite differences
 * @returns {object} Object containing:
 *   {
 *     height: number,
 *     fx: number,
 *     fz: number,
 *     fxx: number,
 *     fzz: number,
 *     laplacian: number,
 *     normal: [nx, ny, nz]
 *   }
 */
function computeHeightDerivatives(x, z, freqX, freqZ, amplitude, step = 1) {
    // 1) The height at (x,z)
    const y = undulationMap(x, z, freqX, freqZ, amplitude);

    // 2) First partial derivatives using central differences
    //    f_x ~ (f(x+dx,z) - f(x-dx,z)) / (2*dx)
    const yPlusX  = undulationMap(x + step, z, freqX, freqZ, amplitude);
    const yMinusX = undulationMap(x - step, z, freqX, freqZ, amplitude);
    const fx = (yPlusX - yMinusX) / (2 * step);

    //    f_z ~ (f(x,z+dz) - f(x,z-dz)) / (2*dz)
    const yPlusZ  = undulationMap(x, z + step, freqX, freqZ, amplitude);
    const yMinusZ = undulationMap(x, z - step, freqX, freqZ, amplitude);
    const fz = (yPlusZ - yMinusZ) / (2 * step);

    // 3) Second partial derivatives
    //    f_xx ~ (f(x+dx,z) - 2*f(x,z) + f(x-dx,z)) / (dx^2)
    const fxx = (yPlusX - 2 * y + yMinusX) / (step * step);

    //    f_zz ~ (f(x,z+dz) - 2*f(x,z) + f(x,z-dz)) / (dz^2)
    const fzz = (yPlusZ - 2 * y + yMinusZ) / (step * step);

    // 4) Laplacian = f_xx + f_zz
    const laplacian = fxx + fzz;

    // 5) Normal vector
    //    Common approach: N = normalize( -f_x, 1, -f_z )
    //    -> So that the slope is accounted for in x,z directions.
    let nx = -fx;
    let ny = 1.0; 
    let nz = -fz;

    // Normalize
    const length = Math.sqrt(nx*nx + ny*ny + nz*nz);
    if (length > 0) {
        nx /= length;
        ny /= length;
        nz /= length;
    }

    return {
        height: y,
        fx: fx,
        fz: fz,
        fxx: fxx,
        fzz: fzz,
        laplacian: laplacian,
        normal: [nx, ny, nz]
    };
}








function undulationMap_2025_01_07(x, z, freqX, freqZ, amplitude) {

    distance = (x**2 + z**2) **.5 
    island_radius = 2500

    let baseWave =
        (Math.sin(freqX * x * 1.1)) ** 3 *
        (Math.sin(freqZ * z * x / 1100)) ** 3 *
        2;

    let octave1 =
        (Math.sin(freqX * 3 * x)) ** 4 *
        (Math.cos(freqZ * 1 * z)) ** 4 *
        1;

    let octave2 =
        (Math.sin(freqX * 6 * x)) ** 5 *
        (Math.sin(freqZ * 4 * z)) ** 5 *
        .3;

    let octave3 =
        (Math.sin(freqX * 7 * x + z / 100)) ** 8 *
        (Math.sin(freqZ * 6 * z)) ** 8 *
        0.06;

    // Combine them and scale
        
        modulation  = (distance < island_radius) ? 0 : (distance - island_radius) / 1000

        //heightY = (distance < 2500) ? amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) : -15
        heightY = amplitude * (((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) -  modulation)


    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY +14
}






function undulationMap2(x, z, freqX, freqZ, amplitude) {
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
        .3;

    let octave3 =
        (Math.sin(freqX * 7 * x + z / 100)) ** 8 *
        (Math.sin(freqZ * 6 * z)) ** 8 *
        0.06;

    // Combine them and scale
         heightY = amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) 


    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY;
}



function undulationMap_old(x, z, freqX, freqZ, amplitude) {
    let baseWave =
        (Math.sin(freqX * x * 1.1)) *
        (Math.sin(freqZ * z * x / 1000)) *
        2;

    let octave1 =
        (Math.sin(freqX * 2 * x)) ** 2 *
        (Math.cos(freqZ * 2 * z)) ** 2 *
        1;

    let octave2 =
        (Math.sin(freqX * 5 * x)) ** 4 *
        (Math.sin(freqZ * 5 * z)) ** 6 *
        0.3;

    let octave3 =
        (Math.sin(freqX * 8 * x)) ** 8 *
        (Math.sin(freqZ * 8 * z)) ** 8 *
        0.06;

    // Combine them and scale
    let heightY = amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1000);

    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY;
}
