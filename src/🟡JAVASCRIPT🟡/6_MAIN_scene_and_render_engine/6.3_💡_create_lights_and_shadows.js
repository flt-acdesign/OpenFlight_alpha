

function setupLights_and_shadows(scene) {
    const lightDown = new BABYLON.HemisphericLight(
        "lightDown",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );
    lightDown.intensity = 0.3;
    lightDown.diffuse = new BABYLON.Color3(1, 0.98, 0.8); // Light sun 

  
    const lightUp = new BABYLON.HemisphericLight(
        "lightUp",
        new BABYLON.Vector3(0, -1, 1),
        scene
    );
    lightUp.intensity = 0.4;
    lightUp.diffuse = new BABYLON.Color3(1, 0.98, 0.8); // Light sun 
  
    const directionalLight = new BABYLON.DirectionalLight(
      "directionalLight",
      new BABYLON.Vector3(-1, -2, -1),
      scene
  );
  directionalLight.position = new BABYLON.Vector3(5, 10, 5);
  directionalLight.intensity = 0.9;
  directionalLight.autoCalcShadowZBounds = true;
  
  /*
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;
  */
  
  
  const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
  
  // Use Close Exponential Shadow Map for better self-shadowing
  shadowGenerator.useCloseExponentialShadowMap = true;
  
  // Set the shadow boundaries to improve precision
  directionalLight.shadowMinZ = 1;
  directionalLight.shadowMaxZ = 100;
  
  // Enable auto-calculation of shadow bounds
  directionalLight.autoCalcShadowZBounds = true;
  
  // Adjust bias to reduce shadow acne
  shadowGenerator.bias = 0.01;
  
  // For large scenes, consider using Cascaded Shadow Maps
  shadowGenerator.usePoissonSampling = true;
  
    return {
        lights: {lightDown, lightUp, directionalLight},
        shadowGenerator
    };
  }
  