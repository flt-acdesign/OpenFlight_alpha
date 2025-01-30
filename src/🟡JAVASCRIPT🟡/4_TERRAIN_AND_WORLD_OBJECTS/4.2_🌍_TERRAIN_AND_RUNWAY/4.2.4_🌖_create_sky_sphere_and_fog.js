


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
    const textureSize = 512
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






function updateSkySphereDiameter(scene) {
  
    // Calculate distance from origin
    distanceFromCenter = Math.sqrt(
      Math.pow(aircraft.position.x, 2) + 
      Math.pow(aircraft.position.y, 2) + 
      Math.pow(aircraft.position.z, 2)
  )
  
  //console.log(distanceFromCenter)
    
    // Get the sky sphere (assuming it's named 'skySphere' in the scene)
    const skySphere = scene.getMeshByName("skySphere");
    
    if (skySphere) {
        // Base diameter is 8000 (radius 4000)
        let newDiameter = 7000
        
  
        // If distance is greater than 3000, increase the diameter
        if (distanceFromCenter > 2000) {
            newDiameter += (distanceFromCenter - 2000) * 2
      
        // Update sphere scaling uniformly
        const scale = newDiameter / 7000 
        skySphere.scaling = new BABYLON.Vector3(scale, scale, scale)
  
          }
        
  
    }
  }
  


  function create_fog(scene) {


        // Configure linear fog for atmospheric depth
        scene.fogMode   = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogStart  = 360.0;
        scene.fogEnd    = 2800.0;
        scene.fogColor  = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);
        scene.fogDensity = 0.0058;
        //scene.fogNearPlane = 10.0;
        //scene.fogFarPlane = 10000.0;

//        scene.fogEnabled = false
  }