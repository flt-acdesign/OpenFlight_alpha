

// js/ui-logic.js

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

///////////////////////////////
// 2) GLB Loading Functions  //
///////////////////////////////

async function loadGLBFile(file) {
  const loadingText = document.getElementById("loadingText");
  loadingText.style.display = "block";
  loadingText.textContent = "Loading 3D Model...";

  if (window.currentGLBModel) {
    window.currentGLBModel.dispose();
    window.currentGLBModel = null;
  }

  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",    // import all
      "",    // no root URL
      file,  // File object
      scene,
      (evt) => {
        if (evt.lengthComputable) {
          const progress = ((evt.loaded * 100) / evt.total).toFixed();
          loadingText.textContent = `Loading: ${progress}%`;
        }
      }
    );

    // Get first mesh for bounding-box calc
    const model = result.meshes[0];
    window.currentGLBModel = model;

    // Create or reuse glbRoot
    if (!window.glbRoot) {
      window.glbRoot = new BABYLON.TransformNode("glbRoot", scene);
      window.glbRoot.metadata = { type: "glb", data: {} };
      window.glbRoot.isPickable = false;
    }

    // Parent imported meshes under glbRoot & make pickable
    result.meshes.forEach(mesh => {
      mesh.setParent(window.glbRoot);
      mesh.isPickable = true;
    });

    // Optional center & scale
    const boundingBox = model.getHierarchyBoundingVectors();
    const modelSize = boundingBox.max.subtract(boundingBox.min);
    const modelCenter = boundingBox.min.add(modelSize.scale(0.5));
    const scaleFactor = 5 / Math.max(modelSize.x, modelSize.y, modelSize.z);
    model.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
    model.position = new BABYLON.Vector3(
      -modelCenter.x * scaleFactor,
      -modelCenter.y * scaleFactor,
      -modelCenter.z * scaleFactor
    );

    // (Removed camera reset code)

    // Force materials if you like
    scene.meshes.forEach(mesh => {
      if (mesh.material) {
        mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
        mesh.material.backFaceCulling = false;
      }
    });

  } catch (error) {
    console.error("Error loading GLB file:", error);
    alert("Error loading 3D model. Please try another file.");
  }
  loadingText.style.display = "none";
}

(function setupGLBControls() {
  document.getElementById("rotateXBtn").addEventListener("click", function() {
    window.glbRoot.rotation.x += Math.PI / 2;
  });
  document.getElementById("rotateYBtn").addEventListener("click", function() {
    window.glbRoot.rotation.y += Math.PI / 2;
  });
  document.getElementById("rotateZBtn").addEventListener("click", function() {
    window.glbRoot.rotation.z += Math.PI / 2;
  });
  document.getElementById("applyGlbScaleBtn").addEventListener("click", function() {
    const scaleValue = parseFloat(document.getElementById("glbScaleInput").value);
    if (!isNaN(scaleValue)) {
      window.glbRoot.scaling = new BABYLON.Vector3(scaleValue, scaleValue, scaleValue);
    }
  });
// 1) A global or local flag to track current translucency mode
window.isTranslucent = false;

document.getElementById("toggleTranslucencyBtn").addEventListener("click", function() {
  // Toggle the global flag
  window.isTranslucent = !window.isTranslucent;
  // Apply new mode
  setTranslucencyMode(window.isTranslucent);
});

})();

///////////////////////////////
// 4) Modal Fill & Show Fns  //
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
// 5) Rendering    //
/////////////////////

function isDescendantOf(child, parent) {
  let curr = child.parent;
  while (curr) {
    if (curr === parent) return true;
    curr = curr.parent;
  }
  return false;
}

function renderAircraft() {
  // Dispose old geometry but keep ground, axis lines, glbRoot, etc.
  scene.meshes.slice().forEach(function(mesh) {
    if (
      mesh === camera ||
      mesh.name.startsWith("axis") ||
      mesh === ground ||
      (window.glbRoot && isDescendantOf(mesh, window.glbRoot)) ||
      mesh === aircraftRoot
    ) {
      return;
    }
    mesh.dispose();
  });

  scene.transformNodes.slice().forEach(function(tn) {
    if (
      tn === aircraftRoot ||
      tn === window.glbRoot ||
      (window.glbRoot && isDescendantOf(tn, window.glbRoot))
    ) {
      return;
    }
    tn.dispose();
  });

  // Recreate aircraftRoot
  createAircraftRoot();

  // Add from aircraftData
  aircraftData.lifting_surfaces.forEach(function(surface) {
    addLiftingSurfaceToScene(surface, aircraftData, aircraftRoot, liftingSurfaceColors);
  });
  aircraftData.fuselages.forEach(function(fus) {
    addFuselageToScene(fus, aircraftRoot);
  });

  // (Removed camera reset code)
}

function parseAircraft(jsonText) {
  aircraftData = JSON.parse(jsonText);
  renderAircraft();
}

/////////////////////////////
// 6) Event Listener Setup //
/////////////////////////////

(function setupUI() {
  // Lifting Surface Modal
  const lsModal = document.getElementById("liftingSurfaceModal");
  const lsSubmitBtn = document.getElementById("ls_submit");
  const lsCancelBtn = document.getElementById("ls_cancel");

  lsSubmitBtn.addEventListener("click", function() {
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

  lsCancelBtn.addEventListener("click", function() {
    lsModal.style.display = "none";
    window.editingType = "";
    window.editingObject = null;
  });

  // Fuselage Modal
  const fusModal = document.getElementById("fuselageModal");
  const fusSubmitBtn = document.getElementById("fus_submit");
  const fusCancelBtn = document.getElementById("fus_cancel");

  fusSubmitBtn.addEventListener("click", function() {
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

  fusCancelBtn.addEventListener("click", function() {
    fusModal.style.display = "none";
    window.editingType = "";
    window.editingObject = null;
  });

  // "Add" Buttons
  document.getElementById("addLiftingSurfaceBtn").addEventListener("click", function() {
    window.editingType = "";
    window.editingObject = null;
    document.getElementById("liftingSurfaceModal").style.display = "block";
  });
  document.getElementById("addFuselageBtn").addEventListener("click", function() {
    window.editingType = "";
    window.editingObject = null;
    document.getElementById("fuselageModal").style.display = "block";
  });

  // "Edit Selected" Button
  const editBtn = document.getElementById("editComponentBtn");
  editBtn.addEventListener("pointerdown", function(e) {
    e.stopPropagation();
  });
  editBtn.addEventListener("click", function() {
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
        console.log("GLB model selected (no editing modal).");
      }
    }
  });

  // JSON File Input
  const fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", function(event) {
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
    // (Removed camera reset code)
  });

  // Toggle Ground
  document.getElementById("toggleGround").addEventListener("click", function() {
    ground.isVisible = !ground.isVisible;
  });

  // GLB File Input
  const glbFileInput = document.getElementById("glbFileInput");
  glbFileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".glb")) {
      alert("Please select a valid '.glb' file.");
      return;
    }
    loadGLBFile(file);
  });
})();

/////////////////////////
// 7) Helper Functions //
/////////////////////////

function clearSelectedNameDisplay() {
  const span = document.getElementById("selectedComponentName");
  span.innerText = "Selected: None";
  document.getElementById("editComponentBtn").disabled = true;
}

function updateSelectedNameDisplay(name) {
  const span = document.getElementById("selectedComponentName");
  span.innerText = "Selected: " + name;
  const isNoneOrGround = (name === "None" || name === "Ground");
  document.getElementById("editComponentBtn").disabled = isNoneOrGround;
}

// Optional: same openEditModalForSelected if you needed
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
      console.log("GLB model selected (no editing modal).");
    }
  }
}


