

function create_world_scenary(scene, shadowGenerator, camera) {
    // Define global parameters for height calculation
      scene.simplex = new SimplexNoise();
    scene.groundConfig = {
       //Removed fx, fz and amplitude from here
        baseHeight: 0
    };
      
  
    createSkySphere(scene, camera);
    createSegmentedGround(scene, scene.groundConfig);
    create_reference_cube(scene, shadowGenerator);
    createRandomTrees(scene, shadowGenerator, scene.groundConfig);
  
    // Set linear fog for a smooth fade effect
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 2000.0;
    scene.fogEnd = 3800.0;
    scene.fogColor = new BABYLON.Color3(135 / 255, 206 / 255, 255 / 255);
    scene.fogDensity = 0.00058;
  }
  
  function createSkySphere(scene, camera) {
    const skySphere = BABYLON.MeshBuilder.CreateSphere("skySphere", {
      diameter: 7500,
      sideOrientation: BABYLON.Mesh.BACKSIDE
    }, scene);
  
    const textureSize = 1024;
    const skyTexture = new BABYLON.DynamicTexture("skyTexture", { width: textureSize, height: textureSize }, scene);
    const ctx = skyTexture.getContext();
  
    // Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, textureSize);
    gradient.addColorStop(0, "rgb(246, 97, 42)");
    gradient.addColorStop(1, "rgb(229, 229, 240)");
  
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, textureSize, textureSize);
    skyTexture.update();
  
    const skyMaterial = new BABYLON.StandardMaterial("skyMaterial", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.diffuseTexture = skyTexture;
    skyMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
    skySphere.material = skyMaterial;
    skySphere.isAlwaysActive = true;
  
    skySphere.rotation.z = Math.PI / 2;
    skySphere.position.copyFrom(camera.target);
  }
  
  
  function getMountainHeight(simplex, x, z, baseHeight = 0) {
      let height = baseHeight;
  
      // Layer 1: Large scale bumps
      let noise1 = simplex.noise2D(x / 3000, z / 2500);
      height += noise1 * 140 + 30
  
      // Layer 2: Mid scale  details
      let noise2 = simplex.noise2D(x / 500, z / 500);
      height += noise2 * 10;
  
      // Layer 3: Small scale  details
      let noise3 = simplex.noise2D(x / 180, z / 150);
      height += noise3 * 5;
  
      return Math.max(height, 0)
  }
  
  
  function createSegmentedGround(scene, groundConfig) {
      const segmentCount = 20;
      const segmentSize = 400;
      const textureSize = 256;
  
      const groundTexture = new BABYLON.DynamicTexture("groundTexture", { width: textureSize, height: textureSize }, scene);
      const ctx = groundTexture.getContext();
  
      // Checker pattern
      const halfSize = textureSize / 2;
      const color1 = "#228B22";
      const color2 = "#006400";
  
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, halfSize, halfSize);
      ctx.fillStyle = color2;
      ctx.fillRect(halfSize, 0, halfSize, halfSize);
      ctx.fillRect(0, halfSize, halfSize, halfSize);
      ctx.fillStyle = color1;
      ctx.fillRect(halfSize, halfSize, halfSize, halfSize);
  
      groundTexture.update();
  
      const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
      groundMaterial.diffuseTexture = groundTexture;
      groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      groundMaterial.fogEnabled = true;
      groundTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
      groundTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
  
      // Removed fx, fz and amplitude from here
      //const { fx, fz, amplitude } = groundConfig;
      const baseHeight = groundConfig.baseHeight
  
      for (let i = 0; i < segmentCount; i++) {
          for (let j = 0; j < segmentCount; j++) {
              const x = (i - segmentCount / 2) * segmentSize + segmentSize / 2;
              const z = (j - segmentCount / 2) * segmentSize + segmentSize / 2;
  
              // Create a subdivided, updatable ground segment
              const groundSegment = BABYLON.MeshBuilder.CreateGround(`groundSegment_${i}_${j}`, {
                  width: segmentSize,
                  height: segmentSize,
                  subdivisions: 50,
                  updatable: true
              }, scene);
  
              groundSegment.position.x = x;
              groundSegment.position.z = z;
              groundSegment.material = groundMaterial;
              groundSegment.receiveShadows = true;
              groundSegment.isAlwaysActive = true;
  
              // Get vertex data
              const positions = groundSegment.getVerticesData(BABYLON.VertexBuffer.PositionKind);
              const indices = groundSegment.getIndices();
  
              // Modify vertex positions to create waves
              for (let v = 0; v < positions.length; v += 3) {
                  const vx = positions[v];
                  const vz = positions[v + 2];
                  const globalX = vx + x;
                  const globalZ = vz + z;
                  const newY = getMountainHeight(scene.simplex, globalX, globalZ, baseHeight);
                  positions[v + 1] = newY
              }
  
              // Update vertex positions
              groundSegment.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
  
              // Recompute normals
              const normals = [];
              BABYLON.VertexData.ComputeNormals(positions, indices, normals);
              groundSegment.setVerticesData(BABYLON.VertexBuffer.NormalKind, normals, true);
          }
      }
  }
  
  function createRandomTrees(scene, shadowGenerator, groundConfig) {
    const treeCount = 50;
    const baseHeight = groundConfig.baseHeight;
  
    for (let i = 0; i < treeCount; i++) {
      const treeHeight = Math.random() * 4 + 2;
      const treeBaseRadius = Math.random() * 1 + 1;
  
      const xPos = Math.random() * 1800 - 900; //Increased size to test landscape
      const zPos = Math.random() * 1800 - 900;
  
      // Calculate height of ground at the given position
        const groundY = getMountainHeight(scene.simplex, xPos, zPos, baseHeight);
      const treeY = groundY + (treeHeight / 2);
  
      const tree = BABYLON.MeshBuilder.CreateCylinder("tree", {
        diameterTop: 0,
        diameterBottom: treeBaseRadius,
        height: treeHeight,
        tessellation: 8,
      }, scene);
  
      tree.position = new BABYLON.Vector3(xPos, treeY, zPos);
  
      const treeMaterial = new BABYLON.StandardMaterial("treeMaterial", scene);
      treeMaterial.diffuseColor = new BABYLON.Color3(0.13, 0.55, 0.13);
      treeMaterial.fogEnabled = true;
      tree.material = treeMaterial;
  
      shadowGenerator.addShadowCaster(tree);
      tree.isAlwaysActive = true;
    }
  }
  
  function create_reference_cube(scene, shadowGenerator) {
    const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 2 }, scene);
    cube.position = new BABYLON.Vector3(0, 1, 0);
    const cubeMaterial = new BABYLON.StandardMaterial("cubeMaterial", scene);
    cubeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
    cubeMaterial.fogEnabled = true;
    cube.material = cubeMaterial;
    shadowGenerator.addShadowCaster(cube);
    cube.isAlwaysActive = true;
  }