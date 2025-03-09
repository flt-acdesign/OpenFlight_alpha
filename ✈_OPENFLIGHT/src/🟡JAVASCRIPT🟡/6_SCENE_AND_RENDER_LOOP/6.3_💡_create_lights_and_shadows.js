/**
 * Sets up all lighting components including hemispheric lights, directional light,
 * and shadow generation for a Babylon.js scene.
 * @param {BABYLON.Scene} scene - The Babylon.js scene to add lighting to
 * @returns {{lights: {mainHemisphericLight: BABYLON.HemisphericLight, ambientHemisphericLight: BABYLON.HemisphericLight, sunDirectionalLight: BABYLON.DirectionalLight}, shadowGenerator: BABYLON.CascadedShadowGenerator}}
 */
function setupLights_and_shadows(scene) {
  // Hemispheric Lighting Setup
  // Main light simulating sunlight from above
  const mainHemisphericLight = new BABYLON.HemisphericLight(
      "mainHemisphericLight", 
      new BABYLON.Vector3(0, 1, 0), // Direction vector (positive Y-axis)
      scene
  );
  mainHemisphericLight.intensity = 0.3;
  mainHemisphericLight.diffuse = new BABYLON.Color3(1, 0.98, 0.8); // Warm white light

  // Secondary ambient light for fill-in illumination from below
  const ambientHemisphericLight = new BABYLON.HemisphericLight(
      "ambientHemisphericLight", 
      new BABYLON.Vector3(0, -1, 0), // Direction vector (negative Y-axis)
      scene
  );
  ambientHemisphericLight.intensity = 0.4;
  ambientHemisphericLight.diffuse = new BABYLON.Color3(1, 0.98, 0.8); // Same color for consistency

  // Directional Light (Sun) Setup
  const sunDirectionalLight = new BABYLON.DirectionalLight(
      "sunDirectionalLight", 
      new BABYLON.Vector3(-1, -2, -1), // Light direction vector (-X, -Y, -Z)
      scene
  );
  sunDirectionalLight.position = new BABYLON.Vector3(5, 10, 5); // Position relative to scene origin
  sunDirectionalLight.intensity = 0.9; // Brightness level

  // Shadow Generation Setup
  const shadowGenerator = new BABYLON.CascadedShadowGenerator(2048, sunDirectionalLight);
  
  // Configure shadow cascades (adjust for optimal performance/balance)
  shadowGenerator.numCascades = 4; // Number of shadow cascade levels
  
  // Configure shadow properties
  shadowGenerator.lambda = 0.5; // Balance between linear and logarithmic distribution
  shadowGenerator.shadowMaxZ = 1000; // Maximum distance for shadows (increase if needed)
  shadowGenerator.stabilizeCascades = true; // Prevent shadow "shimmering" artifacts

  shadowGenerator.bias = 0.001; // adjust this value as needed


  
  // Configure directional light's shadow settings
  sunDirectionalLight.shadowMinZ = 1; // Minimum distance for shadows
  sunDirectionalLight.shadowMaxZ = 100; // Maximum shadow casting range
  sunDirectionalLight.autoCalcShadowZBounds = true; // Enable automatic shadow bounds calculation

  return {
      lights: {mainHemisphericLight, ambientHemisphericLight, sunDirectionalLight},
      shadowGenerator
  };
}
