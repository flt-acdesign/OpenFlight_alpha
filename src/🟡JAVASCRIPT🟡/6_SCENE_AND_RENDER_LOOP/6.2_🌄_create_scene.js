function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);

      // Configure linear fog for atmospheric depth
      scene.fogMode   = BABYLON.Scene.FOGMODE_LINEAR;
      scene.fogStart  = 600.0;
      scene.fogEnd    = 2800.0;
      scene.fogColor  = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);
      scene.fogDensity = 0.0058;

  const {lights, shadowGenerator} = setupLights_and_shadows(scene);
  createAircraft(shadowGenerator, scene);

  const {camera, pilotCamera, cockpitCamera} = setupCameras(scene, canvas);
  createWorldScenery(scene, shadowGenerator, camera);



  createVelocityLine();
  createForceLine();
  createGUI();



  // Set up event listeners (transformations, double-click, etc.)
  setupEventListeners(scene, shadowGenerator);

  // NEW: Set up picking event to log coordinates
  setupPickingCoordinates(scene);

  setupAnimations(scene);
  return scene;
}

function setupEventListeners(scene, shadowGenerator) {
  setup_GLB_model_transformations(scene, shadowGenerator);
  //setupDoubleClickHandler(scene);
}




function setupAnimations(scene) {
  scene.onBeforeRenderObservable.add(() => {
    updateSkySphereDiameter(scene)
  });
}



/***************************************************************
 * NEW FUNCTION:
 *  setupPickingCoordinates(scene):
 *    Allows the user to click anywhere on the screen and log
 *    the intersection point with any mesh to the browser console.
 ***************************************************************/
function setupPickingCoordinates(scene) {
  scene.onPointerObservable.add((pointerInfo) => {
    // Listen for left clicks (POINTERDOWN), or you could use POINTERUP.
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
      const pickResult = scene.pick(
        pointerInfo.event.clientX,
        pointerInfo.event.clientY
      );
      if (pickResult.hit) {
        // Log the picked point’s X, Y, Z to the console
        const point = pickResult.pickedPoint;
        console.log(`Picked coordinates => x: ${point.x}, y: ${point.y}, z: ${point.z}`);
      }
    }
  });
}
