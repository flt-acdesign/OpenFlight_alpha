// js/ui-logic.js

// Global aircraft data and editing variables
window.aircraftData = {
    general: {
      aircraft_reference_surface_m2: 10.0,
      aircraft_reference_mean_aerodynamic_chord_m: 3.0,
      aircraft_CoG_coords_xyz_m: [2, 1, 0]
    },
    lifting_surfaces: [],
    fuselages: [],
    engines: []
  };
  
  window.editingType = ""; // "lifting_surface" or "fuselage"
  window.editingObject = null;
  window.selectedComponent = null;
  
  var liftingSurfaceColors = [
    new BABYLON.Color3(0.8, 1.0, 0.8),
    new BABYLON.Color3(0.9, 0.8, 1.0),
    new BABYLON.Color3(0.7, 0.9, 0.7),
    new BABYLON.Color3(0.8, 0.7, 0.9)
  ];
  
  function renderAircraft() {
    // Dispose of meshes and transform nodes that are not part of the new aircraft
    scene.meshes.slice().forEach(function(mesh) {
      if (
        mesh !== camera && mesh !== light && mesh !== ground &&
        mesh.name.indexOf("axis") === -1 && mesh.name !== "aircraftRoot"
      ) {
        mesh.dispose();
      }
    });
    scene.transformNodes.slice().forEach(function(tn) {
      if (tn.name !== "aircraftRoot" && tn !== camera && tn !== light) {
        tn.dispose();
      }
    });
    createAircraftRoot();
    aircraftData.lifting_surfaces.forEach(function(surface) {
      addLiftingSurfaceToScene(surface, aircraftData, aircraftRoot, liftingSurfaceColors);
    });
    aircraftData.fuselages.forEach(function(fus) {
      addFuselageToScene(fus, aircraftRoot);
    });
  }
  
  function parseAircraft(data) {
    aircraftData = JSON.parse(data);
    renderAircraft();
  }
  
  // Prevent pointer events on the Edit button from reaching the scene.
  document.getElementById("editComponentBtn").addEventListener("pointerdown", function(e) {
    e.stopPropagation();
  });
  document.getElementById("editComponentBtn").addEventListener("click", function() {
    if (!window.selectedComponent) return;
    var info = getMetadata(window.selectedComponent);
    if (info && info.metadata && info.metadata.data) {
      if (info.metadata.type === "lifting_surface") {
        window.editingType = "lifting_surface";
        window.editingObject = info.metadata.data;
        // Fill the modal fields via the modal loader (see modal-loader.js)
        fillLiftingSurfaceModal(window.editingObject);
      } else if (info.metadata.type === "fuselage") {
        window.editingType = "fuselage";
        window.editingObject = info.metadata.data;
        fillFuselageModal(window.editingObject);
      }
    }
  });
  
  // File input to load a JSON file
  document.getElementById("fileInput").addEventListener("change", function(event) {
    var file = event.target.files[0];
    if (file && file.name.endsWith(".json")) {
      var reader = new FileReader();
      reader.onload = function(e) { parseAircraft(e.target.result); };
      reader.readAsText(file);
    } else {
      alert("Please select a valid '.json' file.");
    }
  });
  
  // Download the aircraft JSON
  document.getElementById("downloadJsonBtn").addEventListener("click", function() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(aircraftData, null, 2));
    var dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "aircraft.json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    document.body.removeChild(dlAnchorElem);
  });
  
  // Clear the aircraft
  document.getElementById("clearAircraft").addEventListener("click", function() {
    aircraftData.lifting_surfaces = [];
    aircraftData.fuselages = [];
    renderAircraft();
    if (window.selectedComponent) {
      revertColor(window.selectedComponent);
      gizmoManager.attachToMesh(null);
      window.selectedComponent = null;
    }
    clearSelectedNameDisplay();
  });
  
  // Toggle ground visibility
  document.getElementById("toggleGround").addEventListener("click", function() {
    ground.isVisible = !ground.isVisible;
  });
  