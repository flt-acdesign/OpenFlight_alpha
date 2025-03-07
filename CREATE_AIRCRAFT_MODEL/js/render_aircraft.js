// js/render_aircraft.js

function renderAircraft() {
  // 1) Dispose old geometry but keep ground, axis lines, camera, etc.
  scene.meshes.slice().forEach(function(mesh) {
      if (
        mesh === camera ||
        mesh.name.startsWith("axis") ||
        mesh === ground ||
        mesh.name === CAMERA_SPHERE_NAME ||
        (window.glbRoot && isDescendantOf(mesh, window.glbRoot)) ||
        mesh === aircraftRoot ||
        mesh.name === "originBox" ||
        mesh.name === "originMarker" ||
        mesh.name === "axisProjX" ||
        mesh.name === "axisProjZ" ||
        mesh.name === "originToGround" ||
        mesh.name.startsWith("axisProj")  // Prevent disposal of projection elements
      ) {
        return; // don't dispose
      }
      mesh.dispose();
    });

  // Also dispose old transform nodes that are children of the old aircraftRoot
  scene.transformNodes.slice().forEach(function(tn) {
    // Skip if it's the new or old glbRoot,
    // or is (or will be) the new aircraftRoot
    // or the ground projections node
    if (
      tn === aircraftRoot ||
      tn === window.glbRoot ||
      tn === window.groundProjections ||
      (window.glbRoot && isDescendantOf(tn, window.glbRoot))
    ) {
      return; // don't dispose
    }
    tn.dispose();
  });

  // 2) Recreate the aircraftRoot
  createAircraftRoot();

  // 3) Add from aircraftData (lifting surfaces and fuselages)
  aircraftData.lifting_surfaces.forEach(function(surface) {
    addLiftingSurfaceToScene(surface, aircraftData, aircraftRoot, liftingSurfaceColors);
  });
  aircraftData.fuselages.forEach(function(fus) {
    addFuselageToScene(fus, aircraftRoot);
  });

  // 4) Force shadow casting on all relevant meshes (skip ground, sphere, axis)
  scene.meshes.forEach((mesh) => {
    if (
      mesh.name !== "ground" &&
      mesh.name !== CAMERA_SPHERE_NAME &&
      !mesh.name.startsWith("axis")
    ) {
      shadowGenerator.addShadowCaster(mesh, true);
    }
  });
  
  // 5) Ensure ground projections and reference lines are always preserved
  if (!window.groundProjections) {
    window.groundProjections = new BABYLON.TransformNode("groundProjections", window.scene);
  }
  
  // Recreate projection elements if they were accidentally disposed
  recreateAxisProjectionsIfNeeded();
}

// Helper function to recreate axis projections if they were lost during file loading
function recreateAxisProjectionsIfNeeded() {
  // Check if any of our projection elements are missing and recreate them
  if (!scene.getMeshByName("axisProjX")) {
    const axisProjX = BABYLON.MeshBuilder.CreateLines("axisProjX", {
      points: [ new BABYLON.Vector3(-40, 0.02, 0), new BABYLON.Vector3(40, 0.02, 0) ]
    }, window.scene);
    axisProjX.color = new BABYLON.Color3(1, 0, 0);
    axisProjX.parent = window.groundProjections;
  }
  
  if (!scene.getMeshByName("axisProjZ")) {
    const axisProjZ = BABYLON.MeshBuilder.CreateLines("axisProjZ", {
      points: [ new BABYLON.Vector3(0, 0.02, -40), new BABYLON.Vector3(0, 0.02, 40) ]
    }, window.scene);
    axisProjZ.color = new BABYLON.Color3(0, 0, 1);
    axisProjZ.parent = window.groundProjections;
  }
  
  if (!scene.getMeshByName("originMarker")) {
    const originMarker = BABYLON.MeshBuilder.CreateDisc("originMarker", {
      radius: 0.5,
      tessellation: 32
    }, window.scene);
    originMarker.rotation.x = Math.PI / 2;
    originMarker.position.y = 0.02;
    originMarker.parent = window.groundProjections;
    
    const originMarkerMaterial = new BABYLON.StandardMaterial("originMarkerMat", window.scene);
    originMarkerMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.8, 0.2);
    originMarkerMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.1);
    originMarkerMaterial.alpha = 0.7;
    originMarker.material = originMarkerMaterial;
  }
  
  if (!scene.getMeshByName("originToGround")) {
    // Get ground position or default to 0
    const groundY = window.ground ? window.ground.position.y : 0;
    
    const originToGround = BABYLON.MeshBuilder.CreateLines("originToGround", {
      points: [ new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, groundY, 0) ]
    }, window.scene);
    originToGround.color = new BABYLON.Color3(0, 1, 0);
    window.originGroundLine = originToGround;
  }
}