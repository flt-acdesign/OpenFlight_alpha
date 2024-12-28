function createScene(engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);

  const {lights, shadowGenerator} = setupLights_and_shadows(scene);
  createAircraft(shadowGenerator, scene)
  const {camera, pilotCamera, cockpitCamera} = setupCameras(scene, canvas);
  create_world_scenery(scene, shadowGenerator, camera);
  createVelocityLine();
  createForceLine();
  createGUI();
  setupEventListeners(scene, shadowGenerator);
  setupAnimations(scene);
  return scene;
}




function setupEventListeners(scene, shadowGenerator) {
  setup_GLB_model_transformations(scene, shadowGenerator);
  setupDoubleClickHandler(scene);
}


function setupAnimations(scene) {
  scene.onBeforeRenderObservable.add(() => {
      updateSkySpherePosition(scene);
  });
}



function setupDoubleClickHandler(scene) {
  scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
          handleDoubleClick(pointerInfo, scene);
      }
  });
}

function handleDoubleClick(pointerInfo, scene) {
  const pickResult = scene.pick(
      pointerInfo.event.clientX,
      pointerInfo.event.clientY
  );
  if (pickResult.hit && 
      pickResult.pickedMesh && 
      pickResult.pickedMesh.name.includes("groundSegment")) {
      scene.activeCamera.setTarget(pickResult.pickedPoint);
      scene.activeCamera.radius = 200;
  }
}
