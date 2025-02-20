// js/render_aircraft.js

function renderAircraft() {
    // 1) Dispose old geometry but keep ground, axis lines, camera, etc.
    scene.meshes.slice().forEach(function(mesh) {
      // Skip if it's the main camera, or ground, or the camera sphere,
      // or belongs to glbRoot, or is the aircraftRoot itself
      if (
        mesh === camera ||
        mesh.name.startsWith("axis") ||
        mesh === ground ||
        mesh.name === CAMERA_SPHERE_NAME ||
        (window.glbRoot && isDescendantOf(mesh, window.glbRoot)) ||
        mesh === aircraftRoot
      ) {
        return; // don't dispose
      }
      mesh.dispose();
    });
  
    // Also dispose old transform nodes that are children of the old aircraftRoot
    scene.transformNodes.slice().forEach(function(tn) {
      // Skip if it's the new or old glbRoot,
      // or is (or will be) the new aircraftRoot
      if (
        tn === aircraftRoot ||
        tn === window.glbRoot ||
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
  }
  