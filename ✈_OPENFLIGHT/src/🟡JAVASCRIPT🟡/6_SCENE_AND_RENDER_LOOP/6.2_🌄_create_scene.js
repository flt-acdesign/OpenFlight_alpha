/**
 * Creates and initializes a complete 3D scene
 * @param {BABYLON.Engine} engine - The Babylon.js engine instance
 * @param {HTMLCanvasElement} canvas - The canvas element for rendering
 * @returns {BABYLON.Scene} The initialized scene
 */
function createScene(engine, canvas) {
    // Initialize basic scene properties, including matching background color
    const scene = initializeBaseScene(engine);

    // Enable physics FIRST, using Cannon.js plugin
    scene.enablePhysics(
        new BABYLON.Vector3(0, -9.81, 0), // Standard gravity
        new BABYLON.CannonJSPlugin()      // Use Cannon.js physics engine
    );

    // Setup lights, shadows, cameras, and main world/aircraft elements
    const sceneElements = setupSceneElements(scene, canvas);

    // Setup interactive elements like GLB loading and coordinate picking
    setupInteractions(scene, sceneElements.shadowGenerator);

    // Setup tasks that run continuously in the render loop (like sky sphere updates)
    setupRenderLoop(scene);

    return scene;
}


/**
 * Initializes the base scene with basic properties like clear color.
 * @param {BABYLON.Engine} engine - The Babylon.js engine instance
 * @returns {BABYLON.Scene} The basic initialized scene
 */
function initializeBaseScene(engine) {
    const scene = new BABYLON.Scene(engine);
    // *** MODIFIED HERE: Set clearColor to the user-specified hex color #b4ceff ***
    // RGB: (180, 206, 255)
    scene.clearColor = new BABYLON.Color3(180 / 255, 206 / 255, 255 / 255);
    // *** END MODIFICATION ***
    return scene;
}


/**
 * Sets up all core scene elements including lights, cameras, and models.
 * @param {BABYLON.Scene} scene - The scene to setup
 * @param {HTMLCanvasElement} canvas - The canvas element for rendering
 * @returns {Object} Object containing created scene elements (lights, shadowGenerator, cameras)
 */
function setupSceneElements(scene, canvas) {
    // Setup lights (hemispheric, directional) and shadow generator
    const { lights, shadowGenerator } = setupLights_and_shadows(scene);

    // Setup cameras (orbital, follow, cockpit, wing)
    const cameras = setupCameras(scene, canvas); // Pass canvas for controls

    // Create the default aircraft model (can be replaced by GLB later)
    createAircraft(shadowGenerator, scene); // Pass shadow generator

    // Create the world scenery (terrain, sky, objects)
    createWorldScenery(scene, shadowGenerator, cameras.arcRotateCamera); // Pass shadow generator and a camera reference

    // Setup visualization elements (trajectory, force/velocity lines, GUI)
    setupVisualizationElements(scene); // Pass scene for GUI texture

    return {
        lights,
        shadowGenerator,
        cameras
    };
}

/**
 * Sets up all visualization elements for the scene (trajectory, vectors, GUI).
 * @param {BABYLON.Scene} scene - The scene context.
 */
function setupVisualizationElements(scene) {
    // Initialize the system for drawing the aircraft's trajectory path
    initializeTrajectorySystem(scene); // Pass scene if needed by base sphere/material

    // Create the lines used to visualize velocity and force vectors
    createVelocityLine(scene); // Pass scene if needed
    createForceLine(scene);    // Pass scene if needed

    // Create the Graphical User Interface (GUI) elements
    createGUI(scene); // Pass scene for AdvancedDynamicTexture
}

/**
 * Sets up all interactive elements and event handlers (GLB loading, picking).
 * @param {BABYLON.Scene} scene - The scene to setup interactions for
 * @param {BABYLON.ShadowGenerator} shadowGenerator - Shadow generator for the scene
 */
function setupInteractions(scene, shadowGenerator) {
    // Setup the handler for loading GLB models based on file input
    setup_GLB_model_transformations(scene, shadowGenerator);

    // Setup the system for detecting clicks/taps and getting world coordinates
    setupPickingCoordinates(scene);
}

/**
 * Sets up model transformation handlers (specifically GLB loading via file input).
 * @param {BABYLON.Scene} scene - The scene containing the models
 * @param {BABYLON.ShadowGenerator} shadowGenerator - Shadow generator for the scene
 */
function setupModelTransformations(scene, shadowGenerator) {
    // This function (defined in 4.3_🔼...) attaches the event listener to the file input
    setup_GLB_model_transformations(scene, shadowGenerator);
}

/**
 * Sets up coordinate picking system for click/tap interactions.
 * @param {BABYLON.Scene} scene - The scene to setup picking for
 */
function setupPickingCoordinates(scene) {
    // Add an observer to the scene's pointer events
    scene.onPointerObservable.add((pointerInfo) => {
        // Pass the event information to the handler function
        handlePickingEvent(scene, pointerInfo);
    });
}

/**
 * Handles individual picking events (mouse clicks or taps).
 * @param {BABYLON.Scene} scene - The scene context
 * @param {BABYLON.PointerInfo} pointerInfo - Information about the pointer event
 */
function handlePickingEvent(scene, pointerInfo) {
    // Only process pointer down events (clicks/taps)
    if (pointerInfo.type !== BABYLON.PointerEventTypes.POINTERDOWN) {
        return;
    }

    // Perform a pick operation at the pointer's screen coordinates
    const pickResult = scene.pick(
        pointerInfo.event.clientX,
        pointerInfo.event.clientY
    );

    // If the pick hit something, log the coordinates
    if (pickResult.hit && pickResult.pickedPoint) {
        logPickedCoordinates(pickResult.pickedPoint);
    }
}

/**
 * Logs the picked world coordinates to the console.
 * @param {BABYLON.Vector3} point - The picked point coordinates in world space.
 */
function logPickedCoordinates(point) {
    console.log(`Picked coordinates => x: ${point.x.toFixed(3)}, y: ${point.y.toFixed(3)}, z: ${point.z.toFixed(3)}`);
}

/**
 * Sets up the render loop observers for continuous updates (like sky sphere scaling).
 * @param {BABYLON.Scene} scene - The scene to setup the render loop for.
 */
function setupRenderLoop(scene) {
    // Add an observer that runs just before each frame is rendered
    scene.onBeforeRenderObservable.add(() => {
        // Call the function to update the sky sphere diameter based on camera/aircraft position
        // (This function is defined in 4.2.4_🌖_create_sky_sphere_and_fog.js)
        updateSkySphereDiameter(scene, scene.activeCamera);

        // Optional: Add other per-frame updates here if needed.
    });
}
