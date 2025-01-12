
/***************************************************************
 * Example terrain function for generating terrain heights
 ***************************************************************/


function compute_terrain_height_and_derivatives(x, z, freqX, freqZ, amplitude) {
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
    const h = compute_terrain_height_and_derivatives(x, z, freqX, freqZ, amplitude);

    // Sample slightly around (x,z) to approximate derivatives
    const hXp = compute_terrain_height_and_derivatives(x + step, z, freqX, freqZ, amplitude);
    const hXm = compute_terrain_height_and_derivatives(x - step, z, freqX, freqZ, amplitude);
    const hZp = compute_terrain_height_and_derivatives(x, z + step, freqX, freqZ, amplitude);
    const hZm = compute_terrain_height_and_derivatives(x, z - step, freqX, freqZ, amplitude);

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
    const y = compute_terrain_height_and_derivatives(x, z, freqX, freqZ, amplitude);

    // 2) First partial derivatives using central differences
    //    f_x ~ (f(x+dx,z) - f(x-dx,z)) / (2*dx)
    const yPlusX  = compute_terrain_height_and_derivatives(x + step, z, freqX, freqZ, amplitude);
    const yMinusX = compute_terrain_height_and_derivatives(x - step, z, freqX, freqZ, amplitude);
    const fx = (yPlusX - yMinusX) / (2 * step);

    //    f_z ~ (f(x,z+dz) - f(x,z-dz)) / (2*dz)
    const yPlusZ  = compute_terrain_height_and_derivatives(x, z + step, freqX, freqZ, amplitude);
    const yMinusZ = compute_terrain_height_and_derivatives(x, z - step, freqX, freqZ, amplitude);
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

