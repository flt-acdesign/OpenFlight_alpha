/***************************************************************
 * 4.1_🌍_create_world_scenery.js
 * 
 * Creates the main world scenery, using 'current_graphic_settings'
 * to adjust ground style, sky, and tree density:
 *   - sky: "flat" | "medium" | "full"
 *   - ground: "none" | "flat" | "island"
 *   - trees: "none" | "few"  | "many"
 * 
 * If scenery_complexity = "high", we expect:
 *   ground = "island", trees = "many", sky = "full"
 * If "medium", we get "flat", "few", "medium sky."
 * If "low",   we get "none", "none", "flat sky," etc.
 ***************************************************************/


function createWorldScenery(scene, shadowGenerator, camera) {
    console.log("Creating world scenery with graphics settings:", current_graphic_settings);

    // Setup freq/amplitude for 'island' terrain (if used)
    const xWavelength = 833;   
    const zWavelength = 500;
    scene.groundConfig = {
        freqX: 1 / xWavelength,
        freqZ: 1 / zWavelength,
        amplitude: 500
    };

    // 1) Sky - Based on complexity
    if (current_graphic_settings.sky !== 'flat') {
        // Create sphere + gradient
        createSkySphere(scene, camera);
        // Also enable some fog if not 'flat'
        create_fog(scene);
    } else {
        // For 'flat' sky
        scene.clearColor = new BABYLON.Color3(0.5, 0.6, 0.9);
    }

    // 2) Ground based on complexity
    if (current_graphic_settings.ground !== 'none') {
        create_procedural_ground_texture(
            scene,
            scene.groundConfig,
            shadowGenerator,
            current_graphic_settings
        );
    }

    // 3) Always create the control tower as a reference point
    create_control_tower(scene, shadowGenerator);

    // 4) Create trees based on complexity
    if (current_graphic_settings.trees !== 'none') {
        // Trees will be created in create_procedural_ground_texture 
        // based on the complexity setting
    }

    // 5) Create additional objects based on complexity
    if (current_graphic_settings.trees === 'many') {
        // These are higher-complexity objects that should only appear
        // on the 'high' setting
        create_buildings(scene, shadowGenerator);
        create_lighthouses(scene, shadowGenerator);
        create_wind_turbines(scene, shadowGenerator);
    } else if (current_graphic_settings.trees === 'few') {
        // Medium complexity - add only buildings but fewer
        create_buildings(scene, shadowGenerator, true); // Pass true to indicate medium complexity
    }

    // Create runway regardless of complexity
    document.fonts.load('120px "ICAORWYID"').then(() => {
        createRunway(scene, scene.groundConfig);
    });

    console.log("World scenery creation complete; complexity =", current_graphic_settings);
}