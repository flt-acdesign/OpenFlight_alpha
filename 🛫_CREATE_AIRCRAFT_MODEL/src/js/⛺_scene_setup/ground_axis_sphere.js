/********************************************
 * FILE: ground_axis_sphere.js
 ********************************************/

/********************************************
 * START of createGround()
 ********************************************/
function createGround() {
  window.ground = BABYLON.MeshBuilder.CreateGround(
    "ground", 
    { width: 500, height: 500 },
    window.scene
  );

  const groundMat = new BABYLON.StandardMaterial("groundMat", window.scene);

  // Checkerboard dynamic texture
  const textureSize = 2048;
  const dt = new BABYLON.DynamicTexture("groundDT", { width: textureSize, height: textureSize }, window.scene, false);
  const ctx = dt.getContext();

  const squaresCount = 10; 
  const tileSize = textureSize / squaresCount;

  for (let i = 0; i < squaresCount; i++) {
    for (let j = 0; j < squaresCount; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? "#99ccff" : "#66b3ff";
      ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
    }
  }
  dt.update();

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
  
  // Store initial ground position for reference
  window.groundY = 0;
  
  // Create a separate transform node for ground projections that isn't a child of the ground
  // This way, the projections remain even if ground is hidden or removed
  window.groundProjections = new BABYLON.TransformNode("groundProjections", window.scene);
}
/********************************************
 * END of createGround()
 ********************************************/


/********************************************
 * START of addAxesAndOriginBox()
 ********************************************/
function addAxesAndOriginBox() {
  // X axis
  const axisX = BABYLON.MeshBuilder.CreateLines("axisX", {
    points: [ new BABYLON.Vector3(-40, 0, 0), new BABYLON.Vector3(40, 0, 0) ]
  }, window.scene);
  axisX.color = new BABYLON.Color3(1, 0, 0);

  // Y axis
  const axisY = BABYLON.MeshBuilder.CreateLines("axisY", {
    points: [ new BABYLON.Vector3(0, -40, 0), new BABYLON.Vector3(0, 40, 0) ]
  }, window.scene);
  axisY.color = new BABYLON.Color3(0, 1, 0);

  // Z axis
  const axisZ = BABYLON.MeshBuilder.CreateLines("axisZ", {
    points: [ new BABYLON.Vector3(0, 0, -40), new BABYLON.Vector3(0, 0, 40) ]
  }, window.scene);
  axisZ.color = new BABYLON.Color3(0, 0, 1);

  // Create projections of the X and Z axes onto the ground
  // These are independent from the ground and will always be visible
  
  // X-axis projection onto ground (line along ground in X direction)
  const axisProjX = BABYLON.MeshBuilder.CreateLines("axisProjX", {
    points: [ new BABYLON.Vector3(-40, 0.02, 0), new BABYLON.Vector3(40, 0.02, 0) ]
  }, window.scene);
  axisProjX.color = new BABYLON.Color3(1, 0, 0);
  axisProjX.parent = window.groundProjections; // Attach to ground projections node
  
  // Z-axis projection onto ground (line along ground in Z direction)
  const axisProjZ = BABYLON.MeshBuilder.CreateLines("axisProjZ", {
    points: [ new BABYLON.Vector3(0, 0.02, -40), new BABYLON.Vector3(0, 0.02, 40) ]
  }, window.scene);
  axisProjZ.color = new BABYLON.Color3(0, 0, 1);
  axisProjZ.parent = window.groundProjections; // Attach to ground projections node
  
  // Create a vertical line from origin to ground for better reference
  const originToGround = BABYLON.MeshBuilder.CreateLines("originToGround", {
    points: [ new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, -40, 0) ]
  }, window.scene);
  originToGround.color = new BABYLON.Color3(0, 1, 0);
  
  // Create a small circle on the ground marking the origin projection
  const originMarker = BABYLON.MeshBuilder.CreateDisc("originMarker", {
    radius: 0.5,
    tessellation: 32
  }, window.scene);
  originMarker.rotation.x = Math.PI / 2; // Rotate to be flat on the ground
  originMarker.position.y = 0.02; // Slightly above the ground plane
  originMarker.parent = window.groundProjections; // Attach to ground projections node
  
  // Create material for the origin marker
  const originMarkerMaterial = new BABYLON.StandardMaterial("originMarkerMat", window.scene);
  originMarkerMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
  originMarkerMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.1);
  originMarkerMaterial.alpha = 0.7;
  originMarker.material = originMarkerMaterial;

  // Origin box
  window.originBox = BABYLON.MeshBuilder.CreateBox("originBox", { size: 1 }, window.scene);
  const originBoxMat = new BABYLON.StandardMaterial("originBoxMat", window.scene);
  originBoxMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0.7);
  originBoxMat.alpha = 0.4;
  originBoxMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  originBoxMat.needDepthPrePass = true;
  originBoxMat.backFaceCulling = false;
  window.originBox.material = originBoxMat;
  
  // Add the vertical reference line to be updated when ground moves
  window.originGroundLine = originToGround;
  
  // Store these references to ensure they survive when loading new JSON files
  window.axisProjX = axisProjX;
  window.axisProjZ = axisProjZ;
  window.originMarker = originMarker;
  
  // Set up a scene render observer to update the vertical reference line and projection height
  window.scene.onBeforeRenderObservable.add(() => {
    // Get ground Y position or use 0 if ground doesn't exist
    const groundY = window.ground ? window.ground.position.y : 0;
    
    // Update ground projections transform node position to match ground height
    if (window.groundProjections) {
      window.groundProjections.position.y = groundY;
    }
    
    // Update the vertical line to connect origin to current ground position
    if (window.originGroundLine) {
      window.originGroundLine.dispose();
      window.originGroundLine = BABYLON.MeshBuilder.CreateLines("originToGround", {
        points: [ new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, groundY, 0) ]
      }, window.scene);
      window.originGroundLine.color = new BABYLON.Color3(0, 1, 0);
    }
  });
}
/********************************************
 * END of addAxesAndOriginBox()
 ********************************************/


/********************************************
 * START of createSkySphere()
 ********************************************/
function createSkySphere() {
  const sphere = BABYLON.MeshBuilder.CreateSphere(
    CAMERA_SPHERE_NAME, 
    { diameter: 600 }, 
    window.scene
  );
  sphere.receiveShadows = false;
  sphere.isPickable = false;

  // Dynamic texture for vertical gradient
  const skyDt = new BABYLON.DynamicTexture("skyTexture", { width: 512, height: 256 }, window.scene, false);
  const skyCtx = skyDt.getContext();
  const grd = skyCtx.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, "#003366");
  grd.addColorStop(0.5, "#ffffff");
  grd.addColorStop(1, "#ffff66");
  skyCtx.fillStyle = grd;
  skyCtx.fillRect(0, 0, 512, 256);
  skyDt.update();

  const sphereMat = new BABYLON.StandardMaterial("cameraSphereMat", window.scene);
  sphereMat.emissiveTexture = skyDt;
  sphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
  sphereMat.backFaceCulling = false;
  sphereMat.disableLighting = true;
  sphere.material = sphereMat;

  // Move sphere with camera each frame
  window.scene.onBeforeRenderObservable.add(() => {
    sphere.position.copyFrom(window.camera.position);
  });
}
/********************************************
 * END of createSkySphere()
 ********************************************/