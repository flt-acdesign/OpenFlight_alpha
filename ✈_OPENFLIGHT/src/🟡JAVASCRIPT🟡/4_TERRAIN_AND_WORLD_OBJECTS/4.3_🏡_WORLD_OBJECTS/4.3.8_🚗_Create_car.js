/***************************************************************
 * Creates the player's car model, including body, roof, and wheels,
 * sets up materials, physics impostors, and adds shadows.
 * Returns the main car TransformNode.
 **************************************************************/
function createCar(scene, shadowGenerator) {
    // --- Materials ---
    const carMaterial = new BABYLON.StandardMaterial("carMaterial", scene);
    carMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red car

    const wheelMaterial = new BABYLON.StandardMaterial("wheelMaterial", scene);
    wheelMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black wheels

    // --- Meshes ---
    const carBody = BABYLON.MeshBuilder.CreateBox("carBody", { width: 2, height: 0.8, depth: 4.5 }, scene);
    carBody.material = carMaterial;
    carBody.position.y = 0.4; // Position relative to the car's transform node later

    const carRoof = BABYLON.MeshBuilder.CreateBox("carRoof", { width: 2, height: 0.6, depth: 2.5 }, scene);
    carRoof.material = carMaterial;
    carRoof.position.y = 0.7; // Position relative to the car body

    // --- Wheels ---
    const createWheel = (name, x, z) => {
        const wheel = BABYLON.MeshBuilder.CreateCylinder(name, { diameter: 0.7, height: 0.5 }, scene);
        wheel.material = wheelMaterial;
        wheel.rotation.z = Math.PI / 2; // Rotate to stand upright
        // Position relative to the car's transform node later
        // We set the y position slightly below the body's base for a realistic look
        wheel.position.set(x, 0.35, z);
        return wheel;
    };

    const frontLeftWheel = createWheel("frontLeftWheel", -0.9, 1.8);
    const frontRightWheel = createWheel("frontRightWheel", 0.9, 1.8);
    const rearLeftWheel = createWheel("rearLeftWheel", -0.9, -1.8);
    const rearRightWheel = createWheel("rearRightWheel", 0.9, -1.8);

    // --- Assembly ---
    // Create a parent TransformNode for the car
    const car = new BABYLON.TransformNode("car", scene);
    car.position.y = 0.35; // Initial height slightly above ground, corresponds to wheel radius

    // Parent all parts to the car node
    carBody.parent = car;
    carRoof.parent = carBody; // Roof attached to the body
    frontLeftWheel.parent = car;
    frontRightWheel.parent = car;
    rearLeftWheel.parent = car;
    rearRightWheel.parent = car;

    // --- Physics ---
    // Apply physics impostor ONLY to the main body for vehicle simulation
    // Note: More complex vehicle physics would use BABYLON.VehicleRaycast or joints.
    // This simplified approach uses a BoxImpostor for the body.
    carBody.physicsImpostor = new BABYLON.PhysicsImpostor(
        carBody,
        BABYLON.PhysicsImpostor.BoxImpostor,
        { mass: 1000, restitution: 0.1, friction: 0.5 },
        scene
    );

    // --- Shadows ---
    shadowGenerator.addShadowCaster(carBody);
    shadowGenerator.addShadowCaster(carRoof);
    shadowGenerator.addShadowCaster(frontLeftWheel);
    shadowGenerator.addShadowCaster(frontRightWheel);
    shadowGenerator.addShadowCaster(rearLeftWheel);
    shadowGenerator.addShadowCaster(rearRightWheel);

    return car; // Return the main car node
}