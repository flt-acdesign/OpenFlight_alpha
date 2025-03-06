/********************************************
 * FILE: ui-logic.js
 ********************************************/

//////////////////////
// 1) Global Setup  //
//////////////////////

var liftingSurfaceColors = [
  new BABYLON.Color3(0.8, 1.0, 0.8),
  new BABYLON.Color3(0.9, 0.8, 1.0),
  new BABYLON.Color3(0.7, 0.9, 0.7),
  new BABYLON.Color3(0.8, 0.7, 0.9)
];

// Main JSON data structure
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

window.editingType = "";
window.editingObject = null;
window.selectedComponent = null;
window.currentGLBModel = null; // will store the root mesh of any imported GLB

// Track the last loaded GLB filename
window.lastLoadedGLBName = "";


(function setupGLBControls() {
  // Rotation buttons
  document.getElementById("rotateXBtn").addEventListener("click", function() {
    if (window.glbRoot) {
      window.glbRoot.rotation.x += Math.PI / 2;
      updateGLBTransformSnippet();
    }
  });
  document.getElementById("rotateYBtn").addEventListener("click", function() {
    if (window.glbRoot) {
      window.glbRoot.rotation.y += Math.PI / 2;
      updateGLBTransformSnippet();
    }
  });
  document.getElementById("rotateZBtn").addEventListener("click", function() {
    if (window.glbRoot) {
      window.glbRoot.rotation.z += Math.PI / 2;
      updateGLBTransformSnippet();
    }
  });

  // Scale input/button
  document.getElementById("applyGlbScaleBtn").addEventListener("click", function() {
    if (!window.glbRoot) return;
    const scaleValue = parseFloat(document.getElementById("glbScaleInput").value);
    if (!isNaN(scaleValue)) {
      window.glbRoot.scaling = new BABYLON.Vector3(scaleValue, scaleValue, scaleValue);
      updateGLBTransformSnippet();
    }
  });

  // Toggle translucency
  window.isTranslucent = false;
  document.getElementById("toggleTranslucencyBtn").addEventListener("click", function() {
    window.isTranslucent = !window.isTranslucent;
    setTranslucencyMode(window.isTranslucent);
  });
})();

///////////////////////////////
// 2) Modal Fill & Show Fns  //
///////////////////////////////

function fillLiftingSurfaceModal(data) {
  document.getElementById("ls_name").value = data.name || "";
  document.getElementById("ls_mass_kg").value = data.mass_kg ?? 600;
  document.getElementById("ls_root_LE").value = (data.root_LE || [0,0,0]).join(",");
  document.getElementById("ls_AR").value = data.AR ?? 8.33;
  document.getElementById("ls_TR").value = data.TR ?? 0.6;
  document.getElementById("ls_mirror").checked = !!data.mirror;
  document.getElementById("ls_symmetric").checked = !!data.symmetric;
  document.getElementById("ls_dihedral_DEG").value = data.dihedral_DEG ?? 3;
  document.getElementById("ls_vertical").checked = !!data.vertical;
  document.getElementById("ls_sweep_quarter_chord_DEG").value = data.sweep_quarter_chord_DEG ?? 15;
  document.getElementById("ls_surface_area_m2").value = data.surface_area_m2 ?? 48;
  document.getElementById("ls_Oswald_factor").value = data.Oswald_factor ?? 0.7;
  document.getElementById("ls_mean_aerodynamic_chord_m").value = data.mean_aerodynamic_chord_m ?? 1.35;
  document.getElementById("ls_stations_eta").value = (data.stations_eta || [0,0.5,1]).join(",");
  document.getElementById("ls_radius_of_giration_pitch_m").value = data.radius_of_giration_pitch_m ?? 3.5;
  document.getElementById("ls_radius_of_giration_yaw_m").value = data.radius_of_giration_yaw_m ?? 4.0;
  document.getElementById("ls_radius_of_giration_roll_m").value = data.radius_of_giration_roll_m ?? 4.0;
  document.getElementById("ls_principal_axis_pitch_up_DEG").value = data.principal_axis_pitch_up_DEG ?? -2;
  document.getElementById("ls_CoG_pos_xyz_m").value = (data.CoG_pos_xyz_m || [0,0,0]).join(",");
  document.getElementById("ls_aerodynamic_center_pos_xyz_m").value = (data.aerodynamic_center_pos_xyz_m || [2.9,0,0]).join(",");

  document.getElementById("liftingSurfaceModal").style.display = "block";
}

function fillFuselageModal(data) {
  document.getElementById("fus_name").value = data.name || "fus1";
  document.getElementById("fus_diameter").value = data.diameter ?? 2.5;
  document.getElementById("fus_length").value = data.length ?? 15.0;
  document.getElementById("fus_nose_position").value = (data.nose_position || [0,0,0]).join(",");
  document.getElementById("fuselageModal").style.display = "block";
}

/////////////////////
// 3) Rendering    //
/////////////////////

function parseAircraft(jsonText) {
  aircraftData = JSON.parse(jsonText);
  renderAircraft();
}

/////////////////////////////
// 4) Event Listener Setup //
/////////////////////////////

(function setupUI() {
  // Lifting Surface Modal
  const lsModal = document.getElementById("liftingSurfaceModal");
  document.getElementById("ls_submit").addEventListener("click", function() {
    const newData = {
      name: document.getElementById("ls_name").value,
      mass_kg: parseFloat(document.getElementById("ls_mass_kg").value),
      root_LE: document.getElementById("ls_root_LE").value.split(",").map(Number),
      AR: parseFloat(document.getElementById("ls_AR").value),
      TR: parseFloat(document.getElementById("ls_TR").value),
      mirror: document.getElementById("ls_mirror").checked,
      symmetric: document.getElementById("ls_symmetric").checked,
      dihedral_DEG: parseFloat(document.getElementById("ls_dihedral_DEG").value),
      vertical: document.getElementById("ls_vertical").checked,
      sweep_quarter_chord_DEG: parseFloat(document.getElementById("ls_sweep_quarter_chord_DEG").value),
      surface_area_m2: parseFloat(document.getElementById("ls_surface_area_m2").value),
      Oswald_factor: parseFloat(document.getElementById("ls_Oswald_factor").value),
      mean_aerodynamic_chord_m: parseFloat(document.getElementById("ls_mean_aerodynamic_chord_m").value),
      stations_eta: document.getElementById("ls_stations_eta").value.split(",").map(Number),
      radius_of_giration_pitch_m: parseFloat(document.getElementById("ls_radius_of_giration_pitch_m").value),
      radius_of_giration_yaw_m: parseFloat(document.getElementById("ls_radius_of_giration_yaw_m").value),
      radius_of_giration_roll_m: parseFloat(document.getElementById("ls_radius_of_giration_roll_m").value),
      principal_axis_pitch_up_DEG: parseFloat(document.getElementById("ls_principal_axis_pitch_up_DEG").value),
      CoG_pos_xyz_m: document.getElementById("ls_CoG_pos_xyz_m").value.split(",").map(Number),
      aerodynamic_center_pos_xyz_m: document.getElementById("ls_aerodynamic_center_pos_xyz_m").value.split(",").map(Number)
    };

    if (window.editingType === "lifting_surface" && window.editingObject) {
      Object.assign(window.editingObject, newData);
      window.editingObject = null;
      window.editingType = "";
    } else {
      aircraftData.lifting_surfaces.push(newData);
    }

    lsModal.style.display = "none";
    renderAircraft();
    if (window.selectedComponent) {
      clearHighlight(window.selectedComponent);
      gizmoManager.attachToMesh(null);
      window.selectedComponent = null;
    }
    clearSelectedNameDisplay();
  });
  document.getElementById("ls_cancel").addEventListener("click", function() {
    lsModal.style.display = "none";
    window.editingType = "";
    window.editingObject = null;
  });

  // Fuselage Modal
  const fusModal = document.getElementById("fuselageModal");
  document.getElementById("fus_submit").addEventListener("click", function() {
    const newData = {
      name: document.getElementById("fus_name").value,
      diameter: parseFloat(document.getElementById("fus_diameter").value),
      length: parseFloat(document.getElementById("fus_length").value),
      nose_position: document.getElementById("fus_nose_position").value.split(",").map(Number)
    };

    if (window.editingType === "fuselage" && window.editingObject) {
      Object.assign(window.editingObject, newData);
      window.editingObject = null;
      window.editingType = "";
    } else {
      if (!aircraftData.fuselages) {
        aircraftData.fuselages = [];
      }
      aircraftData.fuselages.push(newData);
    }

    fusModal.style.display = "none";
    renderAircraft();
    if (window.selectedComponent) {
      clearHighlight(window.selectedComponent);
      gizmoManager.attachToMesh(null);
      window.selectedComponent = null;
    }
    clearSelectedNameDisplay();
  });
  document.getElementById("fus_cancel").addEventListener("click", function() {
    fusModal.style.display = "none";
    window.editingType = "";
    window.editingObject = null;
  });

  // "Add" buttons
  document.getElementById("addLiftingSurfaceBtn").addEventListener("click", function() {
    window.editingType = "";
    window.editingObject = null;
    lsModal.style.display = "block";
  });
  document.getElementById("addFuselageBtn").addEventListener("click", function() {
    window.editingType = "";
    window.editingObject = null;
    fusModal.style.display = "block";
  });

  // Edit Selected
  document.getElementById("editComponentBtn").addEventListener("click", function() {
    if (!window.selectedComponent) return;
    const info = getMetadata(window.selectedComponent);
    if (info && info.metadata) {
      if (info.metadata.type === "lifting_surface") {
        window.editingType = "lifting_surface";
        window.editingObject = info.metadata.data;
        fillLiftingSurfaceModal(window.editingObject);
      } else if (info.metadata.type === "fuselage") {
        window.editingType = "fuselage";
        window.editingObject = info.metadata.data;
        fillFuselageModal(window.editingObject);
      } else if (info.metadata.type === "glb") {
        window.editingType = "glb";
        window.editingObject = info.metadata.data;
        fillGLBModal();
      }
    }
  });

  // Delete Selected
  document.getElementById("deleteComponentBtn").addEventListener("click", function() {
    if (!window.selectedComponent) return;
    const info = getMetadata(window.selectedComponent);
    if (!info || !info.metadata) return;

    const type = info.metadata.type;
    const dataRef = info.metadata.data;

    // Remove from JSON & Scene
    if (type === "lifting_surface") {
      const idx = aircraftData.lifting_surfaces.indexOf(dataRef);
      if (idx >= 0) {
        aircraftData.lifting_surfaces.splice(idx, 1);
      }
      renderAircraft();
    }
    else if (type === "fuselage") {
      const idx = aircraftData.fuselages.indexOf(dataRef);
      if (idx >= 0) {
        aircraftData.fuselages.splice(idx, 1);
      }
      renderAircraft();
    }
    else if (type === "glb") {
      // Dispose the GLB mesh and root
      if (window.currentGLBModel) {
        window.currentGLBModel.dispose();
        window.currentGLBModel = null;
      }
      if (window.glbRoot) {
        window.glbRoot.dispose();
        window.glbRoot = null;
      }
      document.getElementById("glbTransformSnippet").style.display = "none";
    }

    // Clear selection
    clearHighlight(window.selectedComponent);
    gizmoManager.attachToMesh(null);
    window.selectedComponent = null;
    clearSelectedNameDisplay();
  });

  // JSON file input (hidden)
  const jsonFileInput = document.getElementById("jsonFileInput");
  document.getElementById("selectJsonBtn").addEventListener("click", function() {
    jsonFileInput.click();
  });
  jsonFileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json")) {
      alert("Please select a valid '.json' file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      parseAircraft(e.target.result);
    };
    reader.readAsText(file);
  });

  // Download JSON
  document.getElementById("downloadJsonBtn").addEventListener("click", function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify(aircraftData, null, 2)
    );
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "aircraft.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
  });

  // Clear Aircraft
  document.getElementById("clearAircraft").addEventListener("click", function() {
    aircraftData.lifting_surfaces = [];
    aircraftData.fuselages = [];
    renderAircraft();
    if (window.selectedComponent) {
      clearHighlight(window.selectedComponent);
      gizmoManager.attachToMesh(null);
      window.selectedComponent = null;
    }
    clearSelectedNameDisplay();
  });

  // Toggle Ground
  document.getElementById("toggleGround").addEventListener("click", function() {
    if (window.ground) {
      ground.isVisible = !ground.isVisible;
    }
  });

  // GLB file input (hidden)
  const glbRealInput = document.getElementById("glbFileInput");
  document.getElementById("selectGlbBtn").addEventListener("click", function() {
    glbRealInput.click();
  });
  glbRealInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".glb")) {
      alert("Please select a valid '.glb' file.");
      return;
    }
    window.lastLoadedGLBName = file.name;
    loadGLBFile(file);
  });
  
  // GLB Modal event handlers
  const glbModal = document.getElementById("glbModal");
  if (document.getElementById("glb_submit")) {
    document.getElementById("glb_submit").addEventListener("click", function() {
      if (typeof applyGLBChanges === 'function') {
        applyGLBChanges();
      }
    });
  }
  
  if (document.getElementById("glb_generate_snippet")) {
    document.getElementById("glb_generate_snippet").addEventListener("click", function() {
      if (typeof generateGLBSnippet === 'function') {
        generateGLBSnippet();
      }
    });
  }
  
  if (document.getElementById("glb_cancel")) {
    document.getElementById("glb_cancel").addEventListener("click", function() {
      glbModal.style.display = "none";
      window.editingType = "";
      window.editingObject = null;
    });
  }
})();

/////////////////////////////
// 5) Helper Functions     //
/////////////////////////////

function clearSelectedNameDisplay() {
  const span = document.getElementById("selectedComponentName");
  span.innerText = "Selected: None";
  document.getElementById("editComponentBtn").disabled = true;
  document.getElementById("deleteComponentBtn").disabled = true;
}

function updateSelectedNameDisplay(name) {
  const span = document.getElementById("selectedComponentName");
  span.innerText = "Selected: " + name;
  const isNoneOrGround = (name === "None" || name === "Ground");
  document.getElementById("editComponentBtn").disabled = isNoneOrGround;
  document.getElementById("deleteComponentBtn").disabled = isNoneOrGround;
}

function openEditModalForSelected() {
  if (!window.selectedComponent) return;
  const info = getMetadata(window.selectedComponent);
  if (info && info.metadata && info.metadata.data) {
    if (info.metadata.type === "lifting_surface") {
      window.editingType = "lifting_surface";
      window.editingObject = info.metadata.data;
      fillLiftingSurfaceModal(window.editingObject);
    } else if (info.metadata.type === "fuselage") {
      window.editingType = "fuselage";
      window.editingObject = info.metadata.data;
      fillFuselageModal(window.editingObject);
    } else if (info.metadata.type === "glb") {
      window.editingType = "glb";
      window.editingObject = info.metadata.data;
      fillGLBModal();
    }
  }
}

// Update Origin Box Size
document.getElementById("updateBoxSizeBtn").addEventListener("click", function() {
  var newSize = parseFloat(document.getElementById("boxSizeInput").value);
  if (isNaN(newSize) || newSize <= 0) {
       alert("Please enter a positive number for box size.");
       return;
  }
  if(window.originBox) {
    window.originBox.scaling = new BABYLON.Vector3(newSize, newSize, newSize);
  }
});