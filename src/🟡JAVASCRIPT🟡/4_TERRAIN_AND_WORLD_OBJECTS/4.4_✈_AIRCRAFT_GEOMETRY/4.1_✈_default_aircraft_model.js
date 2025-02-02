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

    // Create the main aircraft sphere.
    aircraft = BABYLON.MeshBuilder.CreateSphere("aircraft", { diameter: 0.1 }, scene);
    aircraft.position.y = 430;
    aircraft.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);

    // Create a transform node to hold the simple aircraft geometry.
    planeNode = new BABYLON.TransformNode("simpleAircraft", scene);

    // --- Create Aircraft Components ---
    // Wing
    const wing = BABYLON.MeshBuilder.CreatePlane("wing", {
        width: 1.2,
        height: 8,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    wing.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
    wing.position = new BABYLON.Vector3(0, 0, -1.5);

    // Horizontal stabilizer
    const horizontalStabilizer = BABYLON.MeshBuilder.CreatePlane("horizontalStabilizer", {
        width: 0.75,
        height: 3,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    horizontalStabilizer.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
    horizontalStabilizer.position = new BABYLON.Vector3(-2.5, 0, -1.5);

    // Vertical stabilizer
    const verticalStabilizer = BABYLON.MeshBuilder.CreatePlane("verticalStabilizer", {
        width: 1.2,
        height: 0.7,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    verticalStabilizer.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
    verticalStabilizer.position = new BABYLON.Vector3(-2.5, 0.65, -1.5);

    // Fuselage (a cylinder rotated so its long axis lies along the X‑axis)
    const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", {
        diameter: 0.5,
        height: 5,
        tessellation: 16
    }, scene);
    fuselage.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
    fuselage.position = new BABYLON.Vector3(0, 0, -1.5);

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
    // Create a pivot node for the propeller and parent it directly to the aircraft.
    // This ensures the propeller remains visible when an external model is loaded.
    const propellerPivot = new BABYLON.TransformNode("propellerPivot", scene);
    propellerPivot.parent = aircraft;
    // Position the hub at the nose of the fuselage (adjust as needed).
    propellerPivot.position = new BABYLON.Vector3(2.5, 0, 0);

    // Set the default tip-to-tip diameter to 1.5 m.
    const defaultDiameter = 1.5;
    // The blade length is half the tip-to-tip diameter.
    const bladeLength = defaultDiameter / 2; // 0.75 m by default.
    // If a new diameter is provided, compute the scale factor accordingly; otherwise, use 1.
    const scaleFactor = (propeller_diameter) ? (propeller_diameter / defaultDiameter) : 1;
    propellerPivot.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);

    // Define the trapezoidal shape for a blade using two simple paths.
    // The blade is designed to be 'bladeLength' m long:
    // - Bottom edge: 0.1 m wide (from -0.05 to 0.05)
    // - Top edge: 0.05 m wide (from -0.025 to 0.025)
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
    // Using a ribbon with two parallel paths avoids the need for polygon triangulation.
    const blade1 = BABYLON.MeshBuilder.CreateRibbon("blade1", {
        pathArray: bladePaths,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    }, scene);
    // Rotate the blade by 90° about Y so that it lies in the YZ plane,
    // ensuring the rotation axis (X) is perpendicular to the blade surface.
    blade1.rotation.y = BABYLON.Tools.ToRadians(90);
    blade1.parent = propellerPivot;

    // Create the second blade by cloning the first,
    // then rotate it 180° about X relative to the pivot.
    const blade2 = blade1.clone("blade2");
    blade2.rotation.x += Math.PI; // 180° in radians

    // Create a metallic PBR material so that the blades reflect sunlight.
    const propellerMaterial = new BABYLON.PBRMetallicRoughnessMaterial("propellerMetal", scene);
    propellerMaterial.metallic = 1.0;
    propellerMaterial.roughness = 0.2;
    propellerMaterial.baseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    // Make the propeller translucent.
    //propellerMaterial.alpha = 0.5;
    // Optionally, assign an environment texture for enhanced reflections:
    // propellerMaterial.reflectionTexture = scene.environmentTexture;
    // propellerMaterial.reflectivityColor = new BABYLON.Color3(1, 1, 1);

    blade1.material = propellerMaterial;
    blade2.material = propellerMaterial;

    // Animate the propeller pivot to rotate about the X axis.
    // 400 rpm is approximately 6.6667 rps or ~41.89 radians per second.
    const rpm = 310;
    const rps = rpm / 60;
    const angularSpeed = rps * 2 * Math.PI; // radians per second
    scene.onBeforeRenderObservable.add(() => {
        const deltaTimeInSeconds = scene.getEngine().getDeltaTime() / 1000;
        propellerPivot.rotation.x += angularSpeed * deltaTimeInSeconds;
    });

    // --- Parent the Aircraft Geometry ---
    // Make the planeNode a child of the aircraft sphere.
    planeNode.parent = aircraft;

    // Adjust positions of child meshes for shadows and add them as shadow casters.
    planeNode.getChildMeshes().forEach(mesh => {
        mesh.position.z += 1.5;
        shadowGenerator.addShadowCaster(mesh);
    });

    // --- Lights (as before) ---
    const rightWingLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(0, 1, 0), // Green
        diameter: 0.1,
        lightRange: 2,
        blinkInterval: -1000,
        lightIntensity: 3,
        glowIntensity: 2,
        name: "starboard_light"
    });
    rightWingLightSphere.sphere.parent = planeNode;
    rightWingLightSphere.sphere.position = new BABYLON.Vector3(0, 0, -4);

    const leftWingLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 0, 0), // Red
        diameter: 0.1,
        lightRange: 2,
        blinkInterval: -1000,
        lightIntensity: 3,
        glowIntensity: 2,
        name: "port_light"
    });
    leftWingLightSphere.sphere.parent = planeNode;
    leftWingLightSphere.sphere.position = new BABYLON.Vector3(0, 0, 4);

    const tailconeLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 1, 1),
        diameter: 0.1,
        lightRange: 2,
        blinkInterval: -1000,
        lightIntensity: 1,
        glowIntensity: 1,
        name: "tailcone_light"
    });
    tailconeLightSphere.sphere.parent = planeNode;
    tailconeLightSphere.sphere.position = new BABYLON.Vector3(-2.9, 0, 0);

    const strobeLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 1, 1),
        diameter: 0.1,
        lightRange: 2,
        blinkInterval: 40,
        lightIntensity: 5,
        glowIntensity: 2,
        waitingInterval: 800,
        number_of_blinks: 3,
        name: "strobe_light"
    });
    strobeLightSphere.sphere.parent = planeNode;
    strobeLightSphere.sphere.position = new BABYLON.Vector3(-2.5, 1.25, 0);

    if (scene.updateCamerasForAircraft) {
        scene.updateCamerasForAircraft(aircraft);
    }
}







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
    const reader = new FileReader();
    reader.onload = (event) => {
        const arrayBuffer = event.target.result;
        const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        BABYLON.SceneLoader.ImportMesh(
            "",
            url,
            "",
            scene,
            (meshes, particleSystems, skeletons, animationGroups) => {
                const rootNode = new BABYLON.TransformNode("rootNode", scene);

                meshes.forEach(mesh => {
                    mesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
                    mesh.rotation = new BABYLON.Vector3(
                        BABYLON.Tools.ToRadians(rotationX),
                        BABYLON.Tools.ToRadians(rotationY),
                        BABYLON.Tools.ToRadians(rotationZ)
                    );
                    mesh.position = new BABYLON.Vector3(translationX, translationY, translationZ);
                    mesh.parent = rootNode;
                    shadowGenerator.addShadowCaster(mesh);
                });

                if (planeNode) {
                    planeNode.getChildMeshes().forEach(mesh => {
                        const nameLC = mesh.name.toLowerCase();
                        if (!nameLC.includes("light") && nameLC !== "propellerpivot") {
                            mesh.setEnabled(false);
                        }
                    });

                    // Handle wing lights
                    const rightWingLight = scene.getMeshByName("starboard_light");
                    const leftWingLight = scene.getMeshByName("port_light");
                    if (rightWingLight && leftWingLight) {
                        if (wing_lights_pos) {
                            rightWingLight.position = new BABYLON.Vector3(
                                wing_lights_pos[0],
                                wing_lights_pos[1],
                                -wing_lights_pos[2]
                            );
                            leftWingLight.position = new BABYLON.Vector3(
                                wing_lights_pos[0],
                                wing_lights_pos[1],
                                wing_lights_pos[2]
                            );
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
                                tailcone_light_pos[0],
                                tailcone_light_pos[1],
                                tailcone_light_pos[2]
                            );
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
                                strobe_light_pos[0],
                                strobe_light_pos[1],
                                strobe_light_pos[2]
                            );
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
                                propeller_pos[0],
                                propeller_pos[1],
                                propeller_pos[2]
                            );
                            const defaultDiameter = 1.5;
                            const diameterScale = propeller_diameter / defaultDiameter;
                            propellerPivot.scaling = new BABYLON.Vector3(diameterScale, diameterScale, diameterScale);
                            propellerPivot.setEnabled(true);
                        } else {
                            propellerPivot.setEnabled(false);
                        }
                    }
                }

                glbNode = rootNode;
                if (aircraft) {
                    rootNode.parent = aircraft;
                }

                if (animationGroups && animationGroups.length > 0) {
                    animationGroups[0].play(true);
                }

                if (scene.updateCamerasForAircraft) {
                    scene.updateCamerasForAircraft(aircraft);
                }

                URL.revokeObjectURL(url);
            },
            null,
            null,
            ".glb"
        );
    };

    reader.readAsArrayBuffer(file);
}


