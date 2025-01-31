// Global variable to hold the sphere (the “main” aircraft).
// The simple plane or the GLB model will be children of this sphere.
//let aircraft = null;

// Create a simple plane-like aircraft but make it a child of the aircraft sphere.
async function createAircraft(shadowGenerator, scene) {
    // If a sphere 'aircraft' exists, dispose or check first
    if (aircraft) {
        aircraft.dispose();
    }
    // Create the main sphere named "aircraft"
    aircraft = BABYLON.MeshBuilder.CreateSphere("aircraft", { diameter: 0.1 }, scene);
    aircraft.position.y = 430;
    aircraft.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);

    // Create the transform node for the simple aircraft geometry
    planeNode = new BABYLON.TransformNode("simpleAircraft", scene);

    // Wing
    const wing = BABYLON.MeshBuilder.CreatePlane(
        "wing",
        { width: 1.2, height: 8, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
        scene
    );
    wing.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
    wing.position = new BABYLON.Vector3(0, 0, -1.5);

    // Horizontal stabilizer
    const horizontalStabilizer = BABYLON.MeshBuilder.CreatePlane(
        "horizontalStabilizer",
        { width: 0.75, height: 3, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
        scene
    );
    horizontalStabilizer.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
    horizontalStabilizer.position = new BABYLON.Vector3(-2.5, 0, -1.5);

    // Vertical stabilizer
    const verticalStabilizer = BABYLON.MeshBuilder.CreatePlane(
        "verticalStabilizer",
        { width: 1.2, height: 0.7, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
        scene
    );
    verticalStabilizer.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
    verticalStabilizer.position = new BABYLON.Vector3(-2.5, 0.65, -1.5);

    // Fuselage
    const fuselage = BABYLON.MeshBuilder.CreateCylinder(
        "fuselage",
        { diameter: 0.5, height: 5, tessellation: 16 },
        scene
    );
    fuselage.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
    fuselage.position = new BABYLON.Vector3(0, 0, -1.5);

    // Parent them all under planeNode
    wing.parent = planeNode;
    horizontalStabilizer.parent = planeNode;
    verticalStabilizer.parent = planeNode;
    fuselage.parent = planeNode;

    // Aircraft material
    const aircraftMaterial = new BABYLON.StandardMaterial("aircraftMaterial", scene);
    aircraftMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.2);

    wing.material = aircraftMaterial;
    horizontalStabilizer.material = aircraftMaterial;
    verticalStabilizer.material = aircraftMaterial;
    fuselage.material = aircraftMaterial;

    // Make planeNode a child of the sphere (the "aircraft")
    planeNode.parent = aircraft;

    // Adjust child-mesh positions for shadows
    planeNode.getChildMeshes().forEach((mesh) => {
        mesh.position.z += 1.5;
        shadowGenerator.addShadowCaster(mesh);
    });

    // -----------------------------------------------------
    // Add lights on the leading edges of the wings
    // -----------------------------------------------------

    // Right-wing (green) blinking light
    const rightWingLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(0, 1, 0),  // green
        diameter: 0.15,
        lightRange: 2,
        blinkInterval: -1000,
        lightIntensity: 3,
        glowIntensity: 2
    });
    // Parent to the wing so that it moves/rotates with it
    rightWingLightSphere.sphere.parent = planeNode;

    // Position near the front (leading edge) on the right side 
    // -- adjust these coordinates as needed to match your orientation
    rightWingLightSphere.sphere.position = new BABYLON.Vector3(0.5, -4, 0);

    // Left-wing (red) blinking light
    const leftWingLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 0, 0),  // red
        diameter: 0.15,
        lightRange: 2,
        blinkInterval: -1000,
        lightIntensity: 3,
        glowIntensity: 2
    });
    leftWingLightSphere.sphere.parent = planeNode;

    // Position near the front (leading edge) on the left side
    leftWingLightSphere.sphere.position = new BABYLON.Vector3(0.5, 4, 0);





    // Tail navigation light
    const tailconeLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 1, 1),  // red
        diameter: 0.2,
        lightRange: 2,
        blinkInterval: -1000,
        lightIntensity: 2,
        glowIntensity: 2
    });
    tailconeLightSphere.sphere.parent = planeNode;

    // Position near the front (leading edge) on the left side
    tailconeLightSphere.sphere.position = new BABYLON.Vector3(-3.0, 0, 0);



    // Strobe light
    const strobeLightSphere = createBlinkingSphere(scene, 0, 0, 0, {
        sphereColor: new BABYLON.Color3(1, 1, 1),  // red
        diameter: 0.2,
        lightRange: 2,
        blinkInterval: 50,
        lightIntensity: 5,
        glowIntensity: 2,
        waitingInterval: 1500 ,
        number_of_blinks: 2
    });
    strobeLightSphere.sphere.parent = planeNode;

    // Position near the front (leading edge) on the left side
    strobeLightSphere.sphere.position = new BABYLON.Vector3(-12.4, 0, -1.2);





    // If the scene has an update function for cameras:
    if (scene.updateCamerasForAircraft) {
        scene.updateCamerasForAircraft(aircraft);
    }
}


// Load a GLB file, and make it copy the same “aircraft” sphere position/orientation
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
    shadowGenerator
) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);

        BABYLON.SceneLoader.ImportMesh(
            "",
            url,
            "",
            scene,
            function (meshes, particleSystems, skeletons, animationGroups) {
                // Create a transform node for all imported meshes
                const transformNode = new BABYLON.TransformNode("rootNode", scene);

                // Scale/rotate/translate the meshes, then parent them under transformNode
                meshes.forEach(function (mesh) {
                    mesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
                    mesh.rotation = new BABYLON.Vector3(
                        BABYLON.Tools.ToRadians(rotationX),
                        BABYLON.Tools.ToRadians(rotationY),
                        BABYLON.Tools.ToRadians(rotationZ)
                    );
                    mesh.position = new BABYLON.Vector3(translationX, translationY, translationZ);
                    mesh.parent = transformNode;

                    shadowGenerator.addShadowCaster(mesh);
                });

// We have a new GLB, so hide the simple plane geometry but keep lights
if (planeNode) {
    // Get all child meshes except lights
    const childMeshes = planeNode.getChildMeshes();
    childMeshes.forEach(mesh => {
        // Check if the mesh is not a light sphere
        if (!mesh.name.toLowerCase().includes('blinking')) {
            mesh.setEnabled(false);
        }
    });
}

                // Store the GLB node so we can hide/show it later
                glbNode = transformNode;

                // Parent under the main aircraft sphere
                if (aircraft) {
                    transformNode.parent = aircraft;
                }

                // Play the first animation group, if any
                if (animationGroups.length > 0) {
                    animationGroups[0].play(true);
                }

                // Optionally update cameras to track the main sphere
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
