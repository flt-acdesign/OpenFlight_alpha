/***************************************************************
 * Creates a runway that follows the terrain undulations, but
 * uses a single textured mesh rather than 3D dividers.
 *
 * The texture is generated via a DynamicTexture to look like
 * asphalt, including runway numbers and markers at opposite
 * ends, plus a transition to an earth color at the edges.
 * 
 * Parameters:
 *  - scene: The current Babylon.js scene where the runway is created.
 *  - groundConfig: An object containing the frequency (freqX, freqZ)
 *                  and amplitude properties used to compute terrain
 *                  height at any (x, z). 
 * 
 * Usage:
 *   createRunway(scene, { freqX: 0.01, freqZ: 0.01, amplitude: 2 });
 ***************************************************************/
function createRunway(scene, groundConfig) {
    // Extract frequency config from groundConfig
    const { freqX, freqZ, amplitude } = groundConfig;

    /***************************************************************
     * 1) Create the ground mesh (geometry of the runway)
     ***************************************************************/
    const runway = BABYLON.MeshBuilder.CreateGround(
        "runway",
        {
            // width: Realistic width of the runway (25 m)
            width: 25,
            // height: Realistic length of the runway (1000 m)
            height: 1000,
            // subdivisions: Number of segments for the ground mesh
            subdivisions: 50,
            // updatable: Ensures we can modify vertex data later
            updatable: true
        },
        scene
    );

    // Retrieve vertex positions and indices for the runway mesh
    const runwayPositions = runway.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    const runwayIndices = runway.getIndices();

    // Raise the runway to match terrain undulations + a small offset
    for (let v = 0; v < runwayPositions.length; v += 3) {
        // Each vertex has (x, y, z)
        const xCoord = runwayPositions[v];
        const zCoord = runwayPositions[v + 2];

        // Compute the height from your custom undulation map function
        const terrainHeight = compute_terrain_height_and_derivatives(xCoord, zCoord, freqX, freqZ, amplitude);

        // Slightly above terrain (offset of 0.2)
        runwayPositions[v + 1] = terrainHeight + 0.2;
    }

    // Commit updated positions to the runway mesh
    runway.setVerticesData(BABYLON.VertexBuffer.PositionKind, runwayPositions, true);

    // Recompute normals for correct lighting (since we modified vertex data)
    const runwayNormals = [];
    BABYLON.VertexData.ComputeNormals(runwayPositions, runwayIndices, runwayNormals);
    runway.setVerticesData(BABYLON.VertexBuffer.NormalKind, runwayNormals, true);

    // Enable shadows and optional physics for collisions
    runway.receiveShadows = true;
    runway.physicsImpostor = new BABYLON.PhysicsImpostor(
        runway,
        BABYLON.PhysicsImpostor.MeshImpostor,
        { mass: 0, friction: 0.5, restitution: 0.1 },
        scene
    );


    /***************************************************************
     * 2) Create a DynamicTexture to simulate an asphalt runway
     *    with earth-color edges.
     ***************************************************************/
    // Dimensions of the texture
    const texWidth = 256;   // px
    const texHeight = 4096; // px

    // Create the DynamicTexture
    const runwayTexture = new BABYLON.DynamicTexture(
        "runwayTexture",
        { width: texWidth, height: texHeight },
        scene,
        false  // don't generate mipmaps by default
    );
    const ctx = runwayTexture.getContext();

    // (a) Fill background with a mid-tone gray
    ctx.fillStyle = "#363632";
    ctx.fillRect(0, 0, texWidth, texHeight);

    // (a2) Add subtle color randomness for an "asphalt" look
    const imageData = ctx.getImageData(0, 0, texWidth, texHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        // Each pixel: RGBA
        // Slight random offset to create asphalt speckles
        const offset = Math.random() * 20;
        data[i]     += offset; // Red
        data[i + 1] += offset; // Green
        data[i + 2] += offset; // Blue
    }
    ctx.putImageData(imageData, 0, 0);

    // (a3) Blend earth color along the left/right edges
    //      We'll overlay a gradient from brown at the edges
    //      that transitions to transparent near center.
    ctx.save();

    const fadeWidth = 20; // px from each edge, adjust as you like

    // Left side gradient (0 -> fadeWidth)
    const leftGrad = ctx.createLinearGradient(0, 0, fadeWidth, 0);
    leftGrad.addColorStop(0, "#1c6128");           // earth brown
    leftGrad.addColorStop(1, "rgba(0,0,0,0)");     // fade to transparent
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, fadeWidth, texHeight);

    // Right side gradient (texWidth-fadeWidth -> texWidth)
    const rightGrad = ctx.createLinearGradient(texWidth - fadeWidth, 0, texWidth, 0);
    rightGrad.addColorStop(0, "rgba(0,0,0,0)");
    rightGrad.addColorStop(1, "#1c6128");
    ctx.fillStyle = rightGrad;
    ctx.fillRect(texWidth - fadeWidth, 0, fadeWidth, texHeight);

    ctx.restore();

    // (a4) Add thin white continuous lines at x = fadeWidth and x = texWidth-fadeWidth
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fadeWidth, 0);
    ctx.lineTo(fadeWidth, texHeight);
    ctx.moveTo(texWidth - fadeWidth, 0);
    ctx.lineTo(texWidth - fadeWidth, texHeight);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;  // thin line
    ctx.stroke();
    ctx.restore();


    /***************************************************************
     * 2b) Draw the runway centerline + markers
     ***************************************************************/

    // (b1) Center dashed line in white.
    ctx.strokeStyle = "white";

    // Convert 36.6 m & 24.4 m into *vertical* pixels:
    // runway length = 1000 m -> texHeight = 4096 px => ratio ~ 4.096 px/m
    const pxPerMeterY = texHeight / 1000; // ~4.096
    const dashLengthPx = 36.6 * pxPerMeterY; // 36.6 m => ~150 px
    const gapLengthPx  = 24.4 * pxPerMeterY; // 24.4 m => ~100 px

    // Convert 0.91 m width to *horizontal* pixels:
    // runway width = 25 m -> texWidth = 256 px => ratio ~ 10.24 px/m
    const pxPerMeterX = texWidth / 25;         // ~10.24
    const centerLineWidthPx = 0.91 * pxPerMeterX; // ~9-10 px

    // We'll define a dashed line helper
    function drawDashedLine(x1, y1, x2, y2, dashLength, gapLength) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const dashCount = Math.floor(dist / (dashLength + gapLength));
        const angle = Math.atan2(dy, dx);

        let x = x1;
        let y = y1;
        for (let i = 0; i < dashCount; i++) {
            // segment start
            const xEnd = x + Math.cos(angle) * dashLength;
            const yEnd = y + Math.sin(angle) * dashLength;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
            // move forward by gap
            x = xEnd + Math.cos(angle) * gapLength;
            y = yEnd + Math.sin(angle) * gapLength;
        }
    }

    ctx.lineWidth = centerLineWidthPx;
    const centerX = texWidth / 2;
    const margin = 150; // top/bottom margin in pixels
    drawDashedLine(centerX, margin, centerX, texHeight - margin, dashLengthPx, gapLengthPx);

    // (b2) Draw threshold markers (unchanged from original, but you can scale them if desired)
    ctx.fillStyle = "white";

    // Bottom threshold markers
    const yBottom = texHeight - 300; 
    const markerHeight = 70;
    const markerWidth = 10;
    const gapBetweenMarkers = 20;

    for (let i = 0; i < 3; i++) {
        // Left side
        const leftX = (texWidth / 2) - 40 - i * gapBetweenMarkers;
        ctx.fillRect(leftX, yBottom, markerWidth, markerHeight);

        // Right side
        const rightX = (texWidth / 2) + 40 + i * gapBetweenMarkers;
        ctx.fillRect(rightX, yBottom, markerWidth, markerHeight);
    }

    // Top threshold markers
    const yTop = 250;
    for (let i = 0; i < 3; i++) {
        // Left side
        const leftX = (texWidth / 2) - 40 - i * gapBetweenMarkers;
        ctx.fillRect(leftX, yTop, markerWidth, markerHeight);

        // Right side
        const rightX = (texWidth / 2) + 40 + i * gapBetweenMarkers;
        ctx.fillRect(rightX, yTop, markerWidth, markerHeight);
    }

    // (b3) Add runway numbers
    ctx.font = "120px Bahnschrift";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";

    // "18" at the bottom
    ctx.fillText("1 8", texWidth / 2, texHeight - 50);

    // "36" at the top, rotated 180°
    ctx.save();
    ctx.translate(texWidth / 2.2, 50);
    ctx.rotate(Math.PI);
    ctx.fillText("3 6", 0, 0);
    ctx.restore();

    // Commit everything to the dynamic texture
    runwayTexture.update();


    /***************************************************************
     * 3) Apply the DynamicTexture to a material and use on runway
     ***************************************************************/
    const runwayMaterial = new BABYLON.StandardMaterial("runwayMaterial", scene);
    runwayMaterial.diffuseTexture = runwayTexture;

    // Avoid repeating the texture; clamp to edges
    runwayMaterial.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    runwayMaterial.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    // Assign the material to the runway mesh
    runway.material = runwayMaterial;


    /***************************************************************
     * (Optional) Example: Create a blinking light at the far end
     ***************************************************************/
    const blinkingSphere_36 = createBlinkingSphere(scene, 0, 14.5, 585, {
      sphereColor: new BABYLON.Color3(1, 1, 1),
      diameter: 1,
      lightRange: 25,
      blinkInterval: 250,
      lightIntensity: 2,
      glowIntensity: 1.5
    });
    // blinkingSphere.dispose(); // if you need to remove it later



const blinkingSphere_18 = createBlinkingSphere(scene, 0, 14.5, -585, {
    sphereColor: new BABYLON.Color3(1, 1, 1),
    diameter: 1,
    lightRange: 25,
    blinkInterval: 250,
    lightIntensity: 2,
    glowIntensity: 1.5
  });
  // blinkingSphere.dispose(); // if you need to remove it later
}

