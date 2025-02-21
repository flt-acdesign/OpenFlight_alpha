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
  
    // Origin box
    window.originBox = BABYLON.MeshBuilder.CreateBox("originBox", { size: 1 }, window.scene);
    const originBoxMat = new BABYLON.StandardMaterial("originBoxMat", window.scene);
    originBoxMat.diffuseColor = new BABYLON.Color3(1, 0.4, 0.7);
    originBoxMat.alpha = 0.4;
    originBoxMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    originBoxMat.needDepthPrePass = true;
    originBoxMat.backFaceCulling = false;
    window.originBox.material = originBoxMat;
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
  