/***************************************************************
 * Creates a runway that follows the terrain undulations, but
 * uses a single textured mesh rather than 3D dividers.
 *
 * The texture is generated via a DynamicTexture to look like
 * asphalt, including runway numbers and markers at opposite
 * ends. 
 * 
 * Parameters:
 *  - scene: The current Babylon.js scene where the runway is created.
 *  - groundConfig: An object containing the frequency (freqX, freqZ)
 *                  and amplitude properties used to compute terrain
 *                  height at any (x, z). 
 * 
 * Usage:
 *   createRunway(scene, { freqX: 0.01, freqZ: 0.01, amplitude: 2 });
 * 
 * Note: This version includes slight color randomness to the black 
 *       texture for a more realistic asphalt look.
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
            // width: Realistic width of the runway
            width: 25,
            // height: Realistic length of the runway
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
        const terrainHeight = undulationMap(xCoord, zCoord, freqX, freqZ, amplitude);

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
     ***************************************************************/
    // Dimensions of the texture. Use a tall ratio (to match runway length).
    // Example: 256 wide × 4096 tall. 
    const texWidth = 256;
    const texHeight = 4096;

    // Create the DynamicTexture
    const runwayTexture = new BABYLON.DynamicTexture(
        "runwayTexture",
        { width: texWidth, height: texHeight },
        scene,
        false  // don't generate mipmaps by default
    );
    const ctx = runwayTexture.getContext();

    // (a) Fill background with black
    ctx.fillStyle =  "#363632"
    ctx.fillRect(0, 0, texWidth, texHeight);

    // (a2) Add subtle color randomness for an "asphalt" look
    //      We slightly vary each pixel so it isn't uniformly black.
    const imageData = ctx.getImageData(0, 0, texWidth, texHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        // Original background is (0, 0, 0) for R,G,B
        // We'll add a random offset to each color channel 
        // to get a dark gray range (e.g. 0 to 10).
        const offset = Math.random() * 20; 
        data[i]     += offset; // Red
        data[i + 1] += offset; // Green
        data[i + 2] += offset; // Blue
        // data[i + 3] is alpha (255), kept as-is
    }
    ctx.putImageData(imageData, 0, 0);

    // Helper function: draw a dashed line on the canvas
    function drawDashedLine(x1, y1, x2, y2, dashLength, gapLength) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
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
            // shift for the next segment
            x = xEnd + Math.cos(angle) * gapLength;
            y = yEnd + Math.sin(angle) * gapLength;
        }
    }

    // (b) Draw the center dashed line in white
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5; // thickness of the dashed line

    // Coordinates for the center vertical dashed line
    const centerX = texWidth / 2; 
    const margin = 150; 
    drawDashedLine(centerX, margin, centerX, texHeight - margin, 120, 80);

    // (c) Draw threshold markers (the white rectangles near top and bottom)
    ctx.fillStyle = "white";

    // Bottom threshold markers
    const yBottom = texHeight - 300; 
    const markerHeight = 70;
    const markerWidth = 10;
    const gapBetweenMarkers = 20;

    // Draw 3 markers on each side of the center line
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

    // (d) Write runway numbers (e.g., 18 and 36)
    ctx.font = "bold 120px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";

    // "18" at the bottom
    ctx.fillText("1 8", texWidth / 2, texHeight - 50);

    // "36" at the top, rotated 180° to be seen from the other end
    ctx.save();
    ctx.translate(texWidth / 2.2, 50);
    ctx.rotate(Math.PI);
    ctx.fillText("3 6", 0, 0);
    ctx.restore();

    // (e) Commit everything to the dynamic texture
    runwayTexture.update();


    /***************************************************************
     * 3) Apply the DynamicTexture to a material and use on runway
     ***************************************************************/
    const runwayMaterial = new BABYLON.StandardMaterial("runwayMaterial", scene);
    runwayMaterial.diffuseTexture = runwayTexture;

    // Avoid repeating the texture; clamp to edges
    runwayMaterial.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    runwayMaterial.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    // If the runway appears squished or stretched, adjust the texture scaling:
    // runwayMaterial.diffuseTexture.uScale = 1; // across runway width
    // runwayMaterial.diffuseTexture.vScale = 1; // along runway length

    // Assign the material to the runway mesh
    runway.material = runwayMaterial;


      // create glide path lights
  const blinkingSphere = createBlinkingSphere(scene, 0, 14.5, 636, {
    sphereColor: new BABYLON.Color3(1, 1, 1),  // White color
    diameter: 1,
    lightRange: 25,
    blinkInterval: 250,
    lightIntensity: 2,
    glowIntensity: 1.5
  });
  // blinkingSphere.dispose(); // if you need to remove it later
}
