function create_world_scenary(scene, shadowGenerator, camera) {
  
  
  // Define global parameters for height calculation
  scene.groundConfig = {
    fx: 0.001,     // frequency along X
    fz: 0.002,     // frequency along Z
    amplitude: 320 // increase amplitude to make the waves more visible
  };

  createSkySphere(scene, camera);
  createSegmentedGround(scene, scene.groundConfig);
  create_reference_cube(scene, shadowGenerator);
  createRandomTrees(scene, shadowGenerator, scene.groundConfig);
  createRunway(scene, scene.groundConfig)

  // Set linear fog for a smooth fade effect
  scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
  scene.fogStart = 1500.0; 
  scene.fogEnd = 3800.0;  
  scene.fogColor = new BABYLON.Color3(135/255, 206/255, 255/255); 
  scene.fogDensity = 0.00058;
}

function createSkySphere(scene, camera) {
  const skySphere = BABYLON.MeshBuilder.CreateSphere("skySphere", {
    diameter: 7000,
    diameter: 7000,
    sideOrientation: BABYLON.Mesh.BACKSIDE
  }, scene);

  const textureSize = 1024;
  const skyTexture = new BABYLON.DynamicTexture("skyTexture", {width: textureSize, height: textureSize}, scene);
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


function updateSkySpherePosition(scene) {
  const skySphere = scene.getMeshByName("skySphere");
  if (skySphere && scene.activeCamera) {
      skySphere.position.x = scene.activeCamera.position.x;
      skySphere.position.z = scene.activeCamera.position.z;
  }
}




function updateSkySpherePosition(scene) {
  const skySphere = scene.getMeshByName("skySphere");
  if (skySphere && scene.activeCamera) {
      skySphere.position.x = scene.activeCamera.position.x;
      skySphere.position.z = scene.activeCamera.position.z;
  }
}



function createSegmentedGround(scene, groundConfig) {
  const segmentCount = 20;  
  const segmentSize = 400;  
  const textureSize = 256;

  const groundTexture = new BABYLON.DynamicTexture("groundTexture", {width: textureSize, height: textureSize}, scene);
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

  const { fx, fz, amplitude } = groundConfig;

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

       // const newY = amplitude *  (Math.sin(fx * globalX*globalZ/100 + globalX/100) * Math.sin(fz * globalZ*(globalX^3)/100 + globalZ/100) + Math.sin(3*fx * globalX*globalX/100) * Math.sin(3*fz * globalZ*(globalX^1)/100) )

        const newY =  undulation_map(globalX, globalZ, fx, fz, amplitude)


        positions[v + 1] = (Math.max(newY, 0)) 

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



function undulation_map(x, y, fx, fy, amplitude) {


//  return  Math.sin(1*(fx*(Math.abs(x))**1.1+1*(Math.abs(y))**1.3)) * Math.sin(.1* (fy*(Math.abs(y))**1 / 100)) *100

  //return  Math.sin(0.6*(fx*(Math.abs(x/100))**1+0*(Math.abs(y))**2)) * Math.sin((0.2*fy*(Math.abs(y))**1)) *1 * (1-Math.sin((fx*(Math.abs(x/10))**1))) *1

  
  //return Math.sin(fx * (Math.abs(x)**2.3)/20000) * Math.sin(fy * y) / Math.log(  (x**2 + y**2 )**.5 + .01)*10



  base = (Math.sin(fx * x*1.1))**1 * (Math.sin(fy * y*x/1000))**1 * 2 

  octave_1 = (Math.sin(fx*2 * x))**2 * (Math.cos(fy*2 * y))**2 * 1

  octave_2 = (Math.sin(fx*5 * x))**4 * (Math.sin(fy*5 * y))**4  * .6

  octave_3 = (Math.sin(fx*8 * x))**6 * (Math.sin(fy*8 * y))**6  * .1


  z = amplitude *  ((base +  octave_1 + octave_2 + octave_3) / 4 - 0) *  x/1000         //Math.abs(x)  /1000 //* y/1000


  if ((Math.abs(x) < 100) && (Math.abs(y) < 300))  {
    z = 0
  }





  return z





}





function createRandomTrees(scene, shadowGenerator, groundConfig) {
  const treeCount = 150;
  const { fx, fz, amplitude } = groundConfig;

  for (let i = 0; i < treeCount; i++) {
    const treeHeight = Math.random() * 15 + 3; 
    const treeBaseRadius = Math.random() * 4 + 2; 

    const xPos = Math.random() * 580 + 90;
    const zPos = Math.random() * 580 - 90


    // Calculate height of ground at the given position
    //const groundY = amplitude *  Math.abs(undulation_map(xPos, zPos, fx, fz)) 

    const groundY  =  undulation_map(xPos, zPos, fx, fz, amplitude)

    const treeY = groundY + (treeHeight / 2);

    const tree = BABYLON.MeshBuilder.CreateCylinder("tree", {
      diameterTop: 0,
      diameterBottom: treeBaseRadius,
      height: treeHeight,
      tessellation: 6,
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
  const baseSize = 3;
  const height = 10;

  for (let y = 0; y < height; y++) {
      for (let x = 0; x < baseSize; x++) {
          for (let z = 0; z < baseSize; z++) {
              const cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 2 }, scene);
              cube.position = new BABYLON.Vector3(
                  40 + (x - (baseSize - 1) / 2) * 2,  // Center the tower
                  1 + y * 2,
                  (z - (baseSize - 1) / 2) * 2
              );

              const cubeMaterial = new BABYLON.StandardMaterial("cubeMaterial", scene);
              
              // Alternate red and white
              if ((x + y + z) % 2 === 0) {
                   cubeMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);  // Red
              } else {
                   cubeMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);  // White
              }

              cubeMaterial.fogEnabled = true;
              cube.material = cubeMaterial;
              shadowGenerator.addShadowCaster(cube);
              cube.isAlwaysActive = true;
          }
      }
  }
}





function createRunway(scene, groundConfig) {

 // Create a wavy road following the terrain, dark grey
 const roadMaterial = new BABYLON.StandardMaterial("roadMaterial", scene);
 roadMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
 const road = BABYLON.MeshBuilder.CreateGround("road", { width: 15, height: 400, subdivisions: 50, updatable: true }, scene);
 road.material = roadMaterial;
 const roadPositions = road.getVerticesData(BABYLON.VertexBuffer.PositionKind);
 const roadIndices = road.getIndices();

 // Apply wavy formula to road
 for (let v = 0; v < roadPositions.length; v += 3) {
     const x = roadPositions[v];
     const z = roadPositions[v+2];
     //const y = amplitude * Math.sin(fx * x) * Math.sin(fz * z);
             
     //const y = Math.max(amplitude * Math.sin(fx * x*z/300) * Math.sin(fz * z*x/400), 0)
     

     //const y = groundConfig.amplitude *  Math.abs(undulation_map(x, z, groundConfig.fx, groundConfig.fz)) 


     const y = undulation_map(x, z, groundConfig.fx, groundConfig.fz, groundConfig.amplitude) + .1


     roadPositions[v+1] = y + 0.15; 
 }
 road.setVerticesData(BABYLON.VertexBuffer.PositionKind, roadPositions, true);
 const roadNormals = [];
 BABYLON.VertexData.ComputeNormals(roadPositions, roadIndices, roadNormals);
 road.setVerticesData(BABYLON.VertexBuffer.NormalKind, roadNormals, true);

 road.receiveShadows = true;
 road.physicsImpostor = new BABYLON.PhysicsImpostor(
     road, 
     BABYLON.PhysicsImpostor.MeshImpostor, 
     { mass: 0, friction: 0.5, restitution: 0.1 }, 
     scene
 );

 const dividerMaterial = new BABYLON.StandardMaterial("dividerMaterial", scene);
 dividerMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
 for (let i = -200; i < 200; i += 20) {
     const divider = BABYLON.MeshBuilder.CreateBox("divider", { width: 0.3, height: 0.1, depth: 3 }, scene);
     // Compute Y based on terrain:
     const divX = 0; 
     const divZ = i;
     //const divY = Math.max(amplitude * (Math.sin(fx * divX*divZ/300) * Math.sin(fz * divZ*divX/400)) + 0.055, 0)

     //const divY = groundConfig.amplitude *  Math.abs(undulation_map(divX, divZ, groundConfig.fx, groundConfig.fz)) + 0.2

     const divY = undulation_map(divX, divZ, groundConfig.fx, groundConfig.fz, groundConfig.amplitude) + .3
           


     divider.position.set(divX, divY, divZ);
     divider.material = dividerMaterial;
     divider.physicsImpostor = new BABYLON.PhysicsImpostor(
         divider, 
         BABYLON.PhysicsImpostor.BoxImpostor, 
         { mass: 0 }, 
         scene
     );
 }

}
