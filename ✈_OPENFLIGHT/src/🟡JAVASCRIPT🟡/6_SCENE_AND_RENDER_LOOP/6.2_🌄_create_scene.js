
/**
 * Creates and initializes the 3D scene
 * @param {BABYLON.Engine} engine
 * @param {HTMLCanvasElement} canvas
 */
function createScene(engine, canvas) {
    // 1) Create the base scene
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);

    // 2) Enable physics
    scene.enablePhysics(
        new BABYLON.Vector3(0, -9.81, 0),
        new BABYLON.CannonJSPlugin()
    );

    // 3) Lights, cameras
    const { lights, shadowGenerator } = setupLights_and_shadows(scene);
    const cameras = setupCameras(scene, canvas);

    // 4) Ensure we have a valid current_graphic_settings
    // If it's still null, use a low-quality default
    if (!current_graphic_settings) {
        console.log("No graphics settings detected, using 'low' as default");
        current_graphic_settings = getGraphicSettings('low');
    }

    // 5) Create world scenery with current settings
    console.log("Creating initial world scenery with:", current_graphic_settings);
    createWorldScenery(scene, shadowGenerator, cameras.arcRotateCamera);
    
    // 6) Create default aircraft
    createAircraft(shadowGenerator, scene);

    // 7) Additional visualization
    initializeTrajectorySystem(scene);
    createVelocityLine(scene);
    createForceLine(scene);
    
    createGUI();

    // 8) Setup interactions
    setupModelTransformations(scene, shadowGenerator);
    setupPickingCoordinates(scene);

    // 9) Keep a reference to update cameras
    setupRenderLoop(scene);

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

    // Setup cameras - Do this BEFORE creating the aircraft
    const cameras = setupCameras(scene, canvas);

    // Create main scene elements
    // First the world scenery
    createWorldScenery(scene, shadowGenerator, cameras.arcRotateCamera);
    
    // Then the aircraft - This will automatically update camera targets
    createAircraft(shadowGenerator, scene);

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

    initializeTrajectorySystem(scene);
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
