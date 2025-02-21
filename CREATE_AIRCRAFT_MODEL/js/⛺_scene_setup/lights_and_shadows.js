/********************************************
 * FILE: lights_and_shadows.js
 ********************************************/

function setupLightsAndShadows() {
    // 1) Hemispheric Light from above
    const hemiLightAbove = new BABYLON.HemisphericLight(
      "hemiLight_above",
      new BABYLON.Vector3(0, 1, 0),
      window.scene
    );
    hemiLightAbove.intensity = 0.5;
  
    // 2) Hemispheric Light from below
    const hemiLightBelow = new BABYLON.HemisphericLight(
      "hemiLight_below",
      new BABYLON.Vector3(0, -1, 0),
      window.scene
    );
    hemiLightBelow.intensity = 0.4;
    hemiLightBelow.groundColor = new BABYLON.Color3(0, 0, 1);
  
    // 3) Directional Light
    const dlight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(0, -1, 0),
      window.scene
    );
    dlight.position = new BABYLON.Vector3(0, 50, 0);
    dlight.intensity = 1.0;
  
    // 4) Shadow generator
    window.shadowGenerator = new BABYLON.ShadowGenerator(2048, dlight);
    shadowGenerator.useTransparentShadow = true;
  
    // Large ortho bounds
    dlight.autoCalcShadowZBounds = false;
    dlight.shadowMinZ = -100;
    dlight.shadowMaxZ = 1000;
    dlight.orthoTop = 200;
    dlight.orthoBottom = -200;
    dlight.orthoLeft = -200;
    dlight.orthoRight = 200;
  }
  