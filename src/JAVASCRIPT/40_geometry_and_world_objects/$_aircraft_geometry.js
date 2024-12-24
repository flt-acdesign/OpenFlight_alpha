

async function createAircraft(shadowGenerator, scene) {
  // Create the wing
  const wing = BABYLON.MeshBuilder.CreatePlane("wing", { width: 1.2, height: 8, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
  wing.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  wing.position = new BABYLON.Vector3(0, 0, -1.5);

  // Horizontal stabilizer
  const horizontalStabilizer = BABYLON.MeshBuilder.CreatePlane("horizontalStabilizer", { width: 0.75, height: 3, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
  horizontalStabilizer.rotation = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, Math.PI / 2);
  horizontalStabilizer.position = new BABYLON.Vector3(-2.5, 0, -1.5);

  // Vertical stabilizer
  const verticalStabilizer = BABYLON.MeshBuilder.CreatePlane("verticalStabilizer", { width: 1.2, height: 0.7, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
  verticalStabilizer.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
  verticalStabilizer.position = new BABYLON.Vector3(-2.5, 0.65, -1.5);

  // Fuselage
  const fuselage = BABYLON.MeshBuilder.CreateCylinder("fuselage", { diameter: 0.5, height: 5, tessellation: 16 }, scene);
  fuselage.rotation = new BABYLON.Vector3(0.0, 0, Math.PI / 2);
  fuselage.position = new BABYLON.Vector3(0, 0, -1.5);

  // Parent node
  aircraft = new BABYLON.TransformNode("aircraft");
  wing.parent = aircraft;
  horizontalStabilizer.parent = aircraft;
  verticalStabilizer.parent = aircraft;
  fuselage.parent = aircraft;

  const aircraftMaterial = new BABYLON.StandardMaterial("aircraftMaterial", scene);
  aircraftMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.2);

  wing.material = aircraftMaterial;
  horizontalStabilizer.material = aircraftMaterial;
  verticalStabilizer.material = aircraftMaterial;
  fuselage.material = aircraftMaterial;

  aircraft.position.y = 130;
  aircraft.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);

  // Add shadows for each mesh of the aircraft
  aircraft.getChildMeshes().forEach((mesh) => {
      mesh.position.z += 1.5;
      shadowGenerator.addShadowCaster(mesh);
  });

  // Update cameras for the new aircraft
  scene.updateCamerasForAircraft(aircraft);
}


function loadGlbFile(file, scaleFactor, rotationX, rotationY, rotationZ, translationX, translationY, translationZ, scene, shadowGenerator) {
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
              const transformNode = new BABYLON.TransformNode("rootNode", scene);

              if (typeof aircraft !== "undefined") {
                  aircraft.dispose();
              }

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

              aircraft = transformNode;

              // Update cameras for the new aircraft
              if (scene.updateCamerasForAircraft) {
                  scene.updateCamerasForAircraft(aircraft);
              }

              if (animationGroups.length > 0) {
                  animationGroups[0].play(true);
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

