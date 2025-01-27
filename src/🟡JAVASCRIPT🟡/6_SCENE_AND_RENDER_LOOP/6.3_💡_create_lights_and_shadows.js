

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



const shadowGenerator = new BABYLON.CascadedShadowGenerator(2048, directionalLight);

// Set the number of cascades (typical values: 2, 3, or 4)
shadowGenerator.numCascades = 4;

// Adjust various properties
shadowGenerator.lambda = 0.5; // How the split distances are distributed (0 = linear, 1 = logarithmic)
shadowGenerator.shadowMaxZ = 2000; // Increase if your scene is extremely large/far
shadowGenerator.stabilizeCascades = true; // Prevents "shimmering" when moving the camera
shadowGenerator.autoCalcShadowZBounds = true; // Let Ba
//shadowGenerator.debug = true;

  
  
  // Set the shadow boundaries to improve precision
  directionalLight.shadowMinZ = 1;
  directionalLight.shadowMaxZ = 100;
  
  // Enable auto-calculation of shadow bounds
  directionalLight.autoCalcShadowZBounds = true;
    
    return {
        lights: {lightDown, lightUp, directionalLight},
        shadowGenerator
    };
  }
  