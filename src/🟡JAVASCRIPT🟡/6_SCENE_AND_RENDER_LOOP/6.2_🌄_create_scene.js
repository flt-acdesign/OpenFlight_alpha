/**
 * Creates and initializes a complete 3D scene
 * @param {BABYLON.Engine} engine - The Babylon.js engine instance
 * @param {HTMLCanvasElement} canvas - The canvas element for rendering
 * @returns {BABYLON.Scene} The initialized scene
 */
function createScene(engine, canvas) {
    const scene = initializeBaseScene(engine);
    const sceneElements = setupSceneElements(scene, canvas);
    setupInteractions(scene, sceneElements.shadowGenerator);
    setupRenderLoop(scene);
    
  // Enable physics FIRST
  scene.enablePhysics(
    new BABYLON.Vector3(0, -9.81, 0),
    new BABYLON.CannonJSPlugin() 
  );

    return scene;
}




/**
 * Initializes the base scene with basic properties
 * @param {BABYLON.Engine} engine - The Babylon.js engine instance
 * @returns {BABYLON.Scene} The basic initialized scene
 */
function initializeBaseScene(engine) {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);
    
    return scene;
}



/**
 * Sets up all core scene elements including lights, cameras, and models
 * @param {BABYLON.Scene} scene - The scene to setup
 * @param {HTMLCanvasElement} canvas - The canvas element for rendering
 * @returns {Object} Object containing created scene elements
 */
function setupSceneElements(scene, canvas) {
    // Setup lights and shadows
    const { lights, shadowGenerator } = setupLights_and_shadows(scene);

    // Setup cameras
    const cameras = setupCameras(scene, canvas);

    // Create main scene elements
    createAircraft(shadowGenerator, scene);
    createWorldScenery(scene, shadowGenerator, cameras.camera);

    // Setup visualization elements
    setupVisualizationElements();

    return { 
        lights, 
        shadowGenerator, 
        cameras 
    };
}

/**
 * Sets up all visualization elements for the scene
 */
function setupVisualizationElements() {

    initializeTrajectorySystem();
    createVelocityLine();
    createForceLine();
    createGUI();
}

/**
 * Sets up all interactive elements and event handlers
 * @param {BABYLON.Scene} scene - The scene to setup interactions for
 * @param {BABYLON.ShadowGenerator} shadowGenerator - Shadow generator for the scene
 */
function setupInteractions(scene, shadowGenerator) {
    setupModelTransformations(scene, shadowGenerator);
    setupPickingCoordinates(scene);
}

/**
 * Sets up model transformation handlers
 * @param {BABYLON.Scene} scene - The scene containing the models
 * @param {BABYLON.ShadowGenerator} shadowGenerator - Shadow generator for the scene
 */
function setupModelTransformations(scene, shadowGenerator) {
    setup_GLB_model_transformations(scene, shadowGenerator);
}

/**
 * Sets up coordinate picking system for click interactions
 * @param {BABYLON.Scene} scene - The scene to setup picking for
 */
function setupPickingCoordinates(scene) {
    scene.onPointerObservable.add((pointerInfo) => {
        handlePickingEvent(scene, pointerInfo);
    });
}

/**
 * Handles individual picking events
 * @param {BABYLON.Scene} scene - The scene context
 * @param {BABYLON.PointerInfo} pointerInfo - Information about the pointer event
 */
function handlePickingEvent(scene, pointerInfo) {
    // Only process left-click events
    if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOWN) {
        return;
    }

    const pickResult = scene.pick(
        pointerInfo.event.clientX,
        pointerInfo.event.clientY
    );

    if (pickResult.hit) {
        logPickedCoordinates(pickResult.pickedPoint);
    }
}

/**
 * Logs the picked coordinates to the console
 * @param {BABYLON.Vector3} point - The picked point coordinates
 */
function logPickedCoordinates(point) {
    console.log(`Picked coordinates => x: ${point.x}, y: ${point.y}, z: ${point.z}`);
}

/**
 * Sets up the render loop for continuous updates
 * @param {BABYLON.Scene} scene - The scene to setup the render loop for
 */
function setupRenderLoop(scene) {
    scene.onBeforeRenderObservable.add(() => {
        updateSkySphereDiameter(scene);
    });
}
