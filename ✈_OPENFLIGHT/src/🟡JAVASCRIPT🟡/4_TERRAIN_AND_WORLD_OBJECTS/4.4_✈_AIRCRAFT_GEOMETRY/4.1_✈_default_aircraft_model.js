
// ========================================================
// Aircraft Creation Function
// ========================================================
/**
 * Creates a simple aircraft with a two-blade propeller.
 *
 * @param {BABYLON.ShadowGenerator} shadowGenerator - The shadow generator.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {number} [propeller_diameter] - Optional propeller tip-to-tip diameter (in meters). Default is 1.5 m.
 */
async function createAircraft(shadowGenerator, scene, propeller_diameter) {
    // Dispose of an existing aircraft if it exists.
    if (aircraft) {
        aircraft.dispose();
    }
    // Dispose of existing GLB model if it exists
    if (glbNode) {
        glbNode.dispose(false, true); // Dispose hierarchy and materials
        glbNode = null;
    }

    // Create the main aircraft sphere (invisible physics body).
    aircraft = BABYLON.MeshBuilder.CreateSphere("aircraft", { diameter: 0.1 }, scene);
    aircraft.position.y = initial_altitude || 100; // Use initial altitude or default
    aircraft.position.x = -250; // Use initial altitude or default


    aircraft.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
    aircraft.isVisible = false; // Make the physics sphere invisible

    // Create a transform node to hold the simple aircraft geometry.
    planeNode = new BABYLON.TransformNode("simpleAircraft", scene);
    planeNode.parent = aircraft; // Parent the visual node to the physics sphere

    // --- Create Aircraft Components ---
    // Wing
    const wing = BABYLON.MeshBuilder.CreatePlane("wing", {
        width: 1.2,
        height: 8,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    wing.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
    wing.position = new BABYLON.Vector3(0, 0, 0); // Relative to planeNode

    // Horizontal stabilizer
    const horizontalStabilizer = BABYLON.MeshBuilder.CreatePlane("horizontalStabilizer", {
        width: 0.75,
        height: 3,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    horizontalStabilizer.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
    horizontalStabilizer.position = new BABYLON.Vector3(-2.5, 0, 0); // Relative to planeNode

    // Vertical stabilizer
    const verticalStabilizer = BABYLON.MeshBuilder.CreatePlane("verticalStabilizer", {
        width: 1.2,
        height: 0.7,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    verticalStabilizer.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
    verticalStabilizer.position = new BABYLON.Vector3(-2.5, 0.65, 0); // Relative to planeNode

    // Fuselage (a cylinder rotated so its long axis lies along the X‑axis)
    const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", {
        diameter: 0.5,
        height: 5,
        tessellation: 16
    }, scene);
    fuselage.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
    fuselage.position = new BABYLON.Vector3(0, 0, 0); // Relative to planeNode

    // Parent components to the transform node.
    wing.parent = planeNode;
    horizontalStabilizer.parent = planeNode;
    verticalStabilizer.parent = planeNode;
    fuselage.parent = planeNode;

    // --- Material Assignment ---
    const aircraftMaterial = new BABYLON.StandardMaterial("aircraftMaterial", scene);
    aircraftMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.2);
    wing.material = aircraftMaterial;
    horizontalStabilizer.material = aircraftMaterial;
    verticalStabilizer.material = aircraftMaterial;
    fuselage.material = aircraftMaterial;

    // --- Propeller ---
    // Create a pivot node for the propeller and parent it directly to the planeNode.
    // This ensures the propeller rotates with the visual aircraft model.
    const propellerPivot = new BABYLON.TransformNode("propellerPivot", scene);
    propellerPivot.parent = planeNode; // Parent to the visual node
    // Position the hub at the nose of the fuselage (adjust as needed).
    propellerPivot.position = new BABYLON.Vector3(2.5, 0, 0); // Relative to planeNode

    // Set the default tip-to-tip diameter to 1.5 m.
    const defaultDiameter = 1.5;
    // The blade length is half the tip-to-tip diameter.
    const bladeLength = defaultDiameter / 2; // 0.75 m by default.
    // If a new diameter is provided, compute the scale factor accordingly; otherwise, use 1.
    const scaleFactor = (propeller_diameter) ? (propeller_diameter / defaultDiameter) : 1;
    propellerPivot.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

    // Define the trapezoidal shape for a blade using two simple paths.
    const bottomEdge = [
        new BABYLON.Vector3(-0.05, 0, 0),
        new BABYLON.Vector3(0.05, 0, 0)
    ];
    const topEdge = [
        new BABYLON.Vector3(-0.025, bladeLength, 0),
        new BABYLON.Vector3(0.025, bladeLength, 0)
    ];
    const bladePaths = [bottomEdge, topEdge];

    // Create the first blade using CreateRibbon.
    const blade1 = BABYLON.MeshBuilder.CreateRibbon("blade1", {
        pathArray: bladePaths,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    }, scene);
    blade1.rotation.y = BABYLON.Tools.ToRadians(90);
    blade1.parent = propellerPivot;

    // Create the second blade by cloning the first.
    const blade2 = blade1.clone("blade2");
    blade2.rotation.x += Math.PI; // 180° in radians

    // Create a metallic PBR material for the blades.
    const propellerMaterial = new BABYLON.PBRMetallicRoughnessMaterial("propellerMetal", scene);
    propellerMaterial.metallic = 1.0;
    propellerMaterial.roughness = 0.2;
    propellerMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    // propellerMaterial.alpha = 0.5; // Optional transparency

    blade1.material = propellerMaterial;
    blade2.material = propellerMaterial;

    // Animate the propeller pivot to rotate about the X axis.
    const rpm = 310;
    const rps = rpm / 60;
    const angularSpeed = rps * 2 * Math.PI; // radians per second
    scene.onBeforeRenderObservable.add(() => {
        if (propellerPivot && propellerPivot.isEnabled()) { // Only rotate if enabled
            const deltaTimeInSeconds = scene.getEngine().getDeltaTime() / 1000;
            propellerPivot.rotation.x += angularSpeed * deltaTimeInSeconds;
        }
    });

    // --- Add components to shadow generator ---
    planeNode.getChildMeshes().forEach(mesh => {
        shadowGenerator.addShadowCaster(mesh);
    });
    shadowGenerator.addShadowCaster(blade1);
    shadowGenerator.addShadowCaster(blade2);

    // --- Lights ---
    // Parent lights to planeNode so they move with the visual model
    const rightWingLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(0, 1, 0), // Green
        diameter: 0.1, lightRange: 2, blinkInterval: -1000,
        lightIntensity: 3, glowIntensity: 2, name: "starboard_light",
        createPointLight: false 
    });
    rightWingLightSphere.sphere.parent = planeNode;
    rightWingLightSphere.sphere.position = new BABYLON.Vector3(0, 0, -4); // Relative to planeNode

    const leftWingLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 0, 0), // Red
        diameter: 0.1, lightRange: 2, blinkInterval: -1000,
        lightIntensity: 3, glowIntensity: 2, name: "port_light",
        createPointLight: false 
    });
    leftWingLightSphere.sphere.parent = planeNode;
    leftWingLightSphere.sphere.position = new BABYLON.Vector3(0, 0, 4); // Relative to planeNode

    const tailconeLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 1, 1),
        diameter: 0.1, lightRange: 2, blinkInterval: -1000,
        lightIntensity: 1, glowIntensity: 1, name: "tailcone_light",
        createPointLight: false 
    });
    tailconeLightSphere.sphere.parent = planeNode;
    tailconeLightSphere.sphere.position = new BABYLON.Vector3(-2.9, 0, 0); // Relative to planeNode

    const strobeLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 1, 1),
        diameter: 0.1, lightRange: 2, blinkInterval: 40,
        lightIntensity: 5, glowIntensity: 2, waitingInterval: 800,
        number_of_blinks: 3, name: "strobe_light",
        createPointLight: false 
    });
    strobeLightSphere.sphere.parent = planeNode;
    strobeLightSphere.sphere.position = new BABYLON.Vector3(-2.5, 1.25, 0); // Relative to planeNode

    // Initial update for cameras to target the new aircraft physics body
    if (scene.updateCamerasForAircraft) {
        scene.updateCamerasForAircraft(aircraft);
    }

    // Initially enable the default plane node
    planeNode.setEnabled(true);
}


// REMOVED/COMMENTED OUT: Original loadGlbFile function. It's replaced by the new loadGLB below.
/*
function loadGlbFile(
    file,
    scaleFactor,
    rotationX,
    rotationY,
    rotationZ,
    translationX,
    translationY,
    translationZ,
    scene,
    shadowGenerator,
    wing_lights_pos,
    tailcone_light_pos,
    strobe_light_pos,
    propeller_pos,
    propeller_diameter
) {
    // ... original implementation ...
}
*/


// ========================================================
// NEW GLB Loading Function (adapted from the example)
// ========================================================
/**
 * Loads a GLB file asynchronously, applies transformations, handles lights/propeller,
 * and replaces the default aircraft model.
 *
 * @param {File} file - The GLB file object from the input element.
 * @param {number} scaleFactor - Uniform scaling factor.
 * @param {number} rotationX - Rotation around X axis (degrees).
 * @param {number} rotationY - Rotation around Y axis (degrees).
 * @param {number} rotationZ - Rotation around Z axis (degrees).
 * @param {number} translationX - Translation along X axis.
 * @param {number} translationY - Translation along Y axis.
 * @param {number} translationZ - Translation along Z axis.
 * @param {BABYLON.Scene} scene - The Babylon.js scene.
 * @param {BABYLON.ShadowGenerator} shadowGenerator - The shadow generator.
 * @param {Array<number>|null} wing_lights_pos - [x, y, z] position for wing lights, or null.
 * @param {Array<number>|null} tailcone_light_pos - [x, y, z] position for tail light, or null.
 * @param {Array<number>|null} strobe_light_pos - [x, y, z] position for strobe light, or null.
 * @param {Array<number>|null} propeller_pos - [x, y, z] position for propeller pivot, or null.
 * @param {number|null} propeller_diameter - Diameter of the propeller, or null.
 */
function loadGLB(
    file,
    scaleFactor,
    rotationX,
    rotationY,
    rotationZ,
    translationX,
    translationY,
    translationZ,
    scene,
    shadowGenerator,
    wing_lights_pos,
    tailcone_light_pos,
    strobe_light_pos,
    propeller_pos,
    propeller_diameter
) {
    if (!file || !scene) {
        console.error("File or scene not provided to loadGLB");
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const arrayBuffer = event.target.result;
            if (!arrayBuffer) {
                throw new Error("FileReader did not return an ArrayBuffer.");
            }

            const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);

            console.log("Attempting to load GLB from URL:", url);

            // --- Clear previous model ---
            if (glbNode) {
                console.log("Disposing previous GLB model:", glbNode.name);
                glbNode.dispose(false, true); // Dispose hierarchy and materials
                glbNode = null;
            }

            // --- Ensure loaders are ready ---
            if (!BABYLON.SceneLoader) {
                console.error("SceneLoader not available. Make sure loaders library is included.");
                alert("Error: Babylon.js loaders are missing.");
                URL.revokeObjectURL(url);
                return;
            }

            // --- Load the GLB file using ImportMeshAsync ---
            BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene, null, ".glb")
                .then((result) => {
                    if (result.meshes && result.meshes.length > 0) {
                        // --- Find Root Node ---
                        // Prefer __root__, otherwise create a new TransformNode to group meshes.
                        let rootNode = result.meshes.find(m => m.name === "__root__");
                        if (!rootNode) {
                            console.warn("GLB has no __root__ node. Creating a parent TransformNode.");
                            rootNode = new BABYLON.TransformNode("glbRoot_" + file.name, scene);
                            result.meshes.forEach(mesh => {
                                // Only parent top-level meshes to avoid double parenting
                                if (!mesh.parent) {
                                    mesh.parent = rootNode;
                                }
                            });
                        }
                        glbNode = rootNode; // Store reference to the new root
                        console.log("GLB loaded successfully. Root node:", glbNode.name);

                        // --- Apply Transformations to the Root Node ---
                        // Apply scaling first
                        glbNode.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
                        // Apply rotation (convert degrees to radians)
                        glbNode.rotationQuaternion = null; // Ensure we use Euler angles
                        glbNode.rotation = new BABYLON.Vector3(
                            BABYLON.Tools.ToRadians(rotationX),
                            BABYLON.Tools.ToRadians(rotationY),
                            BABYLON.Tools.ToRadians(rotationZ)
                        );
                        // Apply translation
                        glbNode.position = new BABYLON.Vector3(translationX, translationY, translationZ);

                        // <<< --- FIX: Apply corrective scaling for Z-axis flip --- >>>
                        glbNode.scaling.z *= -1;
                        // <<< --- END FIX --- >>>

                        // Parent the loaded GLB node to the main aircraft physics sphere
                        if (aircraft) {
                            glbNode.parent = aircraft;
                        } else {
                            console.warn("Aircraft physics body not found, GLB model might not move correctly.");
                        }

                        // Add all meshes in the hierarchy to the shadow generator
                        glbNode.getChildMeshes(true).forEach(mesh => { // true = include children of children
                             if (shadowGenerator) {
                                 shadowGenerator.addShadowCaster(mesh);
                             }
                             mesh.receiveShadows = false; // Models usually don't receive shadows on themselves
                         });
                         // Check if rootNode itself is a mesh and add it
                         if (glbNode instanceof BABYLON.AbstractMesh && shadowGenerator) {
                             shadowGenerator.addShadowCaster(glbNode);
                             glbNode.receiveShadows = false;
                         }


                        // --- Disable Default Model & Handle Lights/Propeller ---
                        if (planeNode) {
                            // Disable the simple default aircraft visuals
                            planeNode.setEnabled(false);

                            // Handle wing lights
                            const rightWingLight = scene.getMeshByName("starboard_light");
                            const leftWingLight = scene.getMeshByName("port_light");
                            if (rightWingLight && leftWingLight) {
                                if (wing_lights_pos) {
                                    // Position relative to the *aircraft* (parent of glbNode)
                                    rightWingLight.position = new BABYLON.Vector3(
                                        wing_lights_pos[0], wing_lights_pos[1], -wing_lights_pos[2]
                                    );
                                    leftWingLight.position = new BABYLON.Vector3(
                                        wing_lights_pos[0], wing_lights_pos[1], wing_lights_pos[2]
                                    );
                                    // Ensure lights are parented correctly to move with aircraft
                                    rightWingLight.parent = aircraft;
                                    leftWingLight.parent = aircraft;
                                    rightWingLight.setEnabled(true);
                                    leftWingLight.setEnabled(true);
                                } else {
                                    rightWingLight.setEnabled(false);
                                    leftWingLight.setEnabled(false);
                                }
                            }

                            // Handle tail light
                            const tailconeLight = scene.getMeshByName("tailcone_light");
                            if (tailconeLight) {
                                if (tailcone_light_pos) {
                                    tailconeLight.position = new BABYLON.Vector3(
                                        tailcone_light_pos[0], tailcone_light_pos[1], tailcone_light_pos[2]
                                    );
                                    tailconeLight.parent = aircraft;
                                    tailconeLight.setEnabled(true);
                                } else {
                                    tailconeLight.setEnabled(false);
                                }
                            }

                            // Handle strobe light
                            const strobeLight = scene.getMeshByName("strobe_light");
                            if (strobeLight) {
                                if (strobe_light_pos) {
                                    strobeLight.position = new BABYLON.Vector3(
                                        strobe_light_pos[0], strobe_light_pos[1], strobe_light_pos[2]
                                    );
                                    strobeLight.parent = aircraft;
                                    strobeLight.setEnabled(true);
                                } else {
                                    strobeLight.setEnabled(false);
                                }
                            }

                            // Handle propeller
                            const propellerPivot = scene.getTransformNodeByName("propellerPivot");
                            if (propellerPivot) {
                                if (propeller_pos && propeller_diameter) {
                                    propellerPivot.position = new BABYLON.Vector3(
                                        propeller_pos[0], propeller_pos[1], propeller_pos[2]
                                    );
                                    const defaultDiameter = 1.5; // Must match the value in createAircraft
                                    const diameterScale = propeller_diameter / defaultDiameter;
                                    propellerPivot.scaling = new BABYLON.Vector3(diameterScale, diameterScale, diameterScale);
                                    propellerPivot.parent = aircraft; // Ensure propeller is parented to main aircraft node
                                    propellerPivot.setEnabled(true);
                                    // Make sure propeller blades are visible and parented
                                    let blade1 = scene.getMeshByName("blade1");
                                    let blade2 = scene.getMeshByName("blade2");
                                    if(blade1) blade1.parent = propellerPivot;
                                    if(blade2) blade2.parent = propellerPivot;

                                } else {
                                    propellerPivot.setEnabled(false);
                                }
                            }
                        } else {
                            console.warn("planeNode (default aircraft) not found. Cannot disable it or reposition lights/propeller.");
                        }


                        // --- Frame Camera ---
                        const camera = scene.activeCamera;
                        if (camera && camera.zoomOn && glbNode) {
                            try {
                                // Delay zoomOn slightly to ensure bounding box is calculated
                                setTimeout(() => {
                                    camera.zoomOnFactor = 1.5; // Add padding
                                    camera.zoomOn([glbNode], true);
                                    console.log("Camera framed on loaded GLB model.");
                                }, 100); // 100ms delay
                            } catch (zoomError) {
                                console.error("Error during camera.zoomOn:", zoomError);
                                // Fallback: Manually set target
                                const centerPoint = glbNode.getAbsolutePosition();
                                camera.setTarget(centerPoint);
                                camera.radius = (glbNode.getBoundingInfo()?.boundingSphere.radiusWorld * 2) || 10; // Adjust radius based on model size, added optional chaining
                                console.warn("zoomOn failed, attempting manual camera target.");
                            }
                        } else {
                             console.warn("Could not get active camera or GLB root reference to frame.");
                        }

                        // --- Handle Animations ---
                        if (result.animationGroups && result.animationGroups.length > 0) {
                             console.log(`Starting ${result.animationGroups.length} animation groups.`);
                             result.animationGroups.forEach(ag => ag.play(true)); // Play all animations looping
                        }


                    } else {
                        console.warn("GLB loaded, but no meshes found in the result.");
                    }
                    URL.revokeObjectURL(url); // Clean up the object URL
                })
                .catch((error) => {
                    console.error("Error loading GLB using ImportMeshAsync:", error);
                    alert(`Error loading GLB file: ${error.message || error}`);
                    URL.revokeObjectURL(url); // Clean up URL even on error
                    // Re-enable default plane if GLB fails to load?
                    if(planeNode) planeNode.setEnabled(true);

                });

        } catch (loadError) {
            console.error("Error processing file for loading:", loadError);
            alert(`Error processing file: ${loadError.message}`);
            // Re-enable default plane if file processing fails?
             if(planeNode) planeNode.setEnabled(true);
        }
    };

    reader.onerror = (error) => {
        console.error("FileReader error:", error);
        alert("Error reading file.");
         // Re-enable default plane if file reading fails?
         if(planeNode) planeNode.setEnabled(true);
    };

    reader.readAsArrayBuffer(file); // Read the file as binary data
}