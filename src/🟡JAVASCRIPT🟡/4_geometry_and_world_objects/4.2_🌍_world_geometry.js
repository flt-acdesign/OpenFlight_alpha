/***************************************************************
 * Creates the main world scenery, applying fog settings and
 * delegating sub-elements (sky, ground, trees, runway, reference
 * cube) to specialized functions.
 **************************************************************/
function create_world_scenery(scene, shadowGenerator, camera) {
  
  
  x_wavelength = 833  // Global "valley size" in X
  z_wavelength = 500   // Global "valley size" in Z

  
  // Store config parameters for ground undulation
  scene.groundConfig = {
      freqX: (1 / x_wavelength),     // Wave frequency along X
      freqZ:  (1 / x_wavelength),      // Wave frequency along Z
      amplitude: 320     // Overall height amplitude of terrain
  };

  // Create the sky sphere
  createSkySphere(scene, camera);

  // Create the segmented ground based on the stored config
  createSegmentedGround(scene, scene.groundConfig);

  // Create a reference cube tower (for orientation)
  createReferenceCube(scene, shadowGenerator);

  // Create random trees scattered around
  createRandomTrees(scene, shadowGenerator, scene.groundConfig);

  // Create a runway that follows the terrain
  createRunway(scene, scene.groundConfig);

  // Configure linear fog for atmospheric depth
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 1500.0; 
  scene.fogEnd = 3800.0;  
  scene.fogColor = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255); 
  scene.fogDensity = 0.00058;
}


/***************************************************************
* Creates a large sky sphere with a vertical gradient texture.
* Automatically positions it based on the camera target.
**************************************************************/
function createSkySphere(scene, camera) {
  const skySphere = BABYLON.MeshBuilder.CreateSphere(
      "skySphere",
      { diameter: 7000, sideOrientation: BABYLON.Mesh.BACKSIDE },
      scene
  );

  // Create a dynamic texture for the gradient
  const textureSize = 1024;
  const skyTexture = new BABYLON.DynamicTexture(
      "skyTexture", 
      { width: textureSize, height: textureSize },
      scene
  );
  const ctx = skyTexture.getContext();

  // Define the vertical gradient (sunset-like)
  const gradient = ctx.createLinearGradient(0, 0, 0, textureSize);
  gradient.addColorStop(0, "rgb(246, 97, 42)");   // near top
  gradient.addColorStop(1, "rgb(229, 229, 240)"); // near bottom
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, textureSize, textureSize);
  skyTexture.update();

  // Create a material for the sky sphere
  const skyMaterial = new BABYLON.StandardMaterial("skyMaterial", scene);
  skyMaterial.backFaceCulling = false;  // Render inside faces
  skyMaterial.diffuseTexture = skyTexture;
  skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);

  // Attach the material to the sky sphere
  skySphere.material = skyMaterial;
  skySphere.isAlwaysActive = true;

  // Align skySphere with the camera target
  skySphere.rotation.z = Math.PI / 2;
  skySphere.position.copyFrom(camera.target);
}


/***************************************************************
* Updates the sky sphere position so that it always follows
* the active camera in the scene (prevents clipping on large worlds).
**************************************************************/
function updateSkySpherePosition(scene) {
  const skySphere = scene.getMeshByName("skySphere");
  if (skySphere && scene.activeCamera) {
      skySphere.position.x = scene.activeCamera.position.x;
      skySphere.position.z = scene.activeCamera.position.z;
  }
}


/***************************************************************
* Creates a segmented ground made of multiple tiles. Each tile
* is subdivided and its vertices are adjusted to create a wavy
* terrain. Uses a simple checker pattern for illustration.
**************************************************************/
function createSegmentedGround(scene, groundConfig) {
  const segmentCount = 20;     // Number of tiles in X and Z directions
  const segmentSize = 300;     // Physical size of each tile
  const textureSize = 128;     // Size for the dynamic checker texture

  // Create a checkerboard dynamic texture
  const groundTexture = new BABYLON.DynamicTexture(
      "groundTexture",
      { width: textureSize, height: textureSize },
      scene
  );
  const ctx = groundTexture.getContext();

  // Basic checker pattern
  const halfSize = textureSize / 2;
  const color1 = "#228B22"; // ForestGreen
  const color2 = "#006400"; // DarkGreen

  // Top-left square
  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, halfSize, halfSize);
  // Top-right square
  ctx.fillStyle = color2;
  ctx.fillRect(halfSize, 0, halfSize, halfSize);
  // Bottom-left square
  ctx.fillRect(0, halfSize, halfSize, halfSize);
  // Bottom-right square
  ctx.fillStyle = color1;
  ctx.fillRect(halfSize, halfSize, halfSize, halfSize);

  groundTexture.update();

  // Create the ground material and apply the checker texture
  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  groundMaterial.diffuseTexture = groundTexture;
  groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  groundMaterial.fogEnabled = true;
  groundTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
  groundTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

  // Destructure configuration
  const { freqX, freqZ, amplitude } = groundConfig;

  // Generate the ground in segments
  for (let i = 0; i < segmentCount; i++) {
      for (let j = 0; j < segmentCount; j++) {
          // Calculate center positions for each segment
          const centerX = (i - segmentCount / 2) * segmentSize + segmentSize / 2;
          const centerZ = (j - segmentCount / 2) * segmentSize + segmentSize / 2;

          // Create a ground mesh with subdivisions (for smooth waves)
          const groundSegment = BABYLON.MeshBuilder.CreateGround(
              `groundSegment_${i}_${j}`,
              {
                  width: segmentSize,
                  height: segmentSize,
                  subdivisions: 50,
                  updatable: true
              },
              scene
          );

          groundSegment.position.x = centerX;
          groundSegment.position.z = centerZ;
          groundSegment.material = groundMaterial;
          groundSegment.receiveShadows = true;
          groundSegment.isAlwaysActive = true;

          // Retrieve mesh vertex data
          const positions = groundSegment.getVerticesData(BABYLON.VertexBuffer.PositionKind);
          const indices = groundSegment.getIndices();

          // Adjust vertex positions to create waves (using our custom undulationMap)
          for (let v = 0; v < positions.length; v += 3) {
              // local X/Z in the segment
              const localX = positions[v];     
              const localZ = positions[v + 2];
              // absolute world positions
              const xPos = localX + centerX;
              const yPos = localZ + centerZ;

              // Compute new Y via the wavy function
              const newY = undulationMap(xPos, yPos, freqX, freqZ, amplitude);
              // Optionally clamp negative to 0 if you want a "floor"
              positions[v + 1] = Math.max(newY, 0);
          }

          // Overwrite the mesh data with new positions
          groundSegment.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);

          // Recompute normals for correct lighting
          const normals = [];
          BABYLON.VertexData.ComputeNormals(positions, indices, normals);
          groundSegment.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
      }
  }
}


/***************************************************************
* Custom function to calculate a "wave height" (undulation) at
* any (xPos, yPos) coordinate based on multiple sine wave octaves.
*  - freqX, freqZ: frequencies for each axis
*  - amplitude: scale factor for the final wave height
**************************************************************/
function undulationMap(xPos, yPos, freqX, freqZ, amplitude) {

  // Multi-octave wave structure
  let baseWave = (Math.sin(freqX * xPos * 1.1)) ** 1 
               * (Math.sin(freqZ * yPos * xPos / 1000)) ** 1 
               * 2;

  let octave1  = (Math.sin(freqX * 2 * xPos)) ** 2 
               * (Math.cos(freqZ * 2 * yPos)) ** 2 
               * 1;

  let octave2  = (Math.sin(freqX * 5 * xPos)) ** 4 
               * (Math.sin(freqZ * 5 * yPos)) ** 6 
               * 0.6;

  let octave3  = (Math.sin(freqX * 8 * xPos)) ** 8 
               * (Math.sin(freqZ * 8 * yPos)) ** 8 
               * 0.12;

  // Combine wave components, scale by amplitude
  let heightZ = amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (xPos / 1000);

  // Flatten region near the origin if desired (e.g., runway area)
  if ((Math.abs(xPos) < 100) && (Math.abs(yPos) < 300)) {
      heightZ = 0;
  }

  return heightZ;
}


/***************************************************************
* Creates a number of random trees across the terrain.
* Each tree is a simple tapered cylinder placed at the local
* terrain height.
**************************************************************/
function createRandomTrees(scene, shadowGenerator, groundConfig) {
  const treeCount = 150;
  const { freqX, freqZ, amplitude } = groundConfig;

  for (let i = 0; i < treeCount; i++) {
      // Random tree dimension and location
      const treeHeight = Math.random() * 15 + 3; 
      const treeBaseRadius = Math.random() * 4 + 2; 

      // For clarity, rename zPos → yPos
      const xPos = Math.random() * 580 + 90;
      const yPos = Math.random() * 580 - 90;

      // Calculate ground height at that position
      const groundY = undulationMap(xPos, yPos, freqX, freqZ, amplitude);
      const treeY = groundY + (treeHeight / 2);

      // Create a simple cylinder as the tree
      const tree = BABYLON.MeshBuilder.CreateCylinder(
          "tree",
          {
              diameterTop: 0,
              diameterBottom: treeBaseRadius,
              height: treeHeight,
              tessellation: 6
          },
          scene
      );
      tree.position = new BABYLON.Vector3(xPos, treeY, yPos);

      // Simple green material
      const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
      treeMaterial.diffuseColor = new BABYLON.Color3(0.13, 0.55, 0.13);
      treeMaterial.fogEnabled = true;
      tree.material = treeMaterial;

      // Cast shadows for a more realistic scene
      shadowGenerator.addShadowCaster(tree);
      tree.isAlwaysActive = true;
  }
}


/***************************************************************
* Creates a small reference "cube tower" so that players
* can orient themselves in the scene. It is a stack of boxes,
* alternately colored red and white.
**************************************************************/
function createReferenceCube(scene, shadowGenerator) {
  const baseSize = 3;  // NxN base
  const height = 10;   // Number of cubes stacked

  for (let y = 0; y < height; y++) {
      for (let x = 0; x < baseSize; x++) {
          for (let z = 0; z < baseSize; z++) {

              // Each cube is size=2
              const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 2 }, scene);
              cube.position = new BABYLON.Vector3(
                  40 + (x - (baseSize - 1) / 2) * 2,  // offset for centering
                  1 + y * 2,                         // stack height
                  (z - (baseSize - 1) / 2) * 2
              );

              // Alternate red and white
              const cubeMaterial = new BABYLON.StandardMaterial("cubeMaterial", scene);
              if ((x + y + z) % 2 === 0) {
                  cubeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);  // Red
              } else {
                  cubeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);  // White
              }
              cubeMaterial.fogEnabled = true;
              cube.material = cubeMaterial;

              // Cast shadows
              shadowGenerator.addShadowCaster(cube);
              cube.isAlwaysActive = true;
          }
      }
  }
}


/***************************************************************
* Creates a runway that follows the undulations of the terrain.
* Also adds small divider boxes to mark the runway center line.
**************************************************************/
function createRunway(scene, groundConfig) {
  const { freqX, freqZ, amplitude } = groundConfig;

  // Create a strip of ground for the runway
  const runwayMaterial = new BABYLON.StandardMaterial("runwayMaterial", scene);
  runwayMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // dark grey
  
  const runway = BABYLON.MeshBuilder.CreateGround(
      "runway",
      {
          width: 15,
          height: 400,
          subdivisions: 50,
          updatable: true
      },
      scene
  );
  runway.material = runwayMaterial;

  // Retrieve runway vertex data
  const runwayPositions = runway.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const runwayIndices = runway.getIndices();

  // Apply wavy formula to runway to match the terrain
  for (let v = 0; v < runwayPositions.length; v += 3) {
      const xPos = runwayPositions[v];
      const yPos = runwayPositions[v + 2];
      
      // Slightly raise runway above ground
      const terrainHeight = undulationMap(xPos, yPos, freqX, freqZ, amplitude);
      runwayPositions[v + 1] = terrainHeight + 0.15;
  }
  runway.setVerticesData(BABYLON.VertexBuffer.PositionKind, runwayPositions, true);

  // Recompute normals
  const runwayNormals = [];
  BABYLON.VertexData.ComputeNormals(runwayPositions, runwayIndices, runwayNormals);
  runway.setVerticesData(BABYLON.VertexBuffer.NormalKind, runwayNormals, true);

  // Enable collision or physics (optional)
  runway.receiveShadows = true;
  runway.physicsImpostor = new BABYLON.PhysicsImpostor(
      runway,
      BABYLON.PhysicsImpostor.MeshImpostor,
      { mass: 0, friction: 0.5, restitution: 0.1 },
      scene
  );

  // Add runway centerline dividers
  const dividerMaterial = new BABYLON.StandardMaterial("dividerMaterial", scene);
  dividerMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // white lines

  for (let i = -200; i < 200; i += 20) {
      const xPos = 0;  // keep runway dividers on X=0
      const yPos = i;

      const dividerHeight = undulationMap(xPos, yPos, freqX, freqZ, amplitude) + 0.3;

      const divider = BABYLON.MeshBuilder.CreateBox(
          "divider",
          { width: 0.3, height: 0.1, depth: 3 },
          scene
      );
      divider.position.set(xPos, dividerHeight, yPos);
      divider.material = dividerMaterial;
      divider.physicsImpostor = new BABYLON.PhysicsImpostor(
          divider,
          BABYLON.PhysicsImpostor.BoxImpostor,
          { mass: 0 },
          scene
      );
  }
}
