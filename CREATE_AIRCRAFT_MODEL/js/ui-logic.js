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

window.editingType = "";       // "lifting_surface" or "fuselage"
window.editingObject = null;   // reference to the object being edited
window.selectedComponent = null;

// Colors for newly added surfaces
var liftingSurfaceColors = [
  new BABYLON.Color3(0.8, 1.0, 0.8),
  new BABYLON.Color3(0.9, 0.8, 1.0),
  new BABYLON.Color3(0.7, 0.9, 0.7),
  new BABYLON.Color3(0.8, 0.7, 0.9)
];

// Fill the Lifting Surface modal fields with existing data (for editing)
function fillLiftingSurfaceModal(data) {
  document.getElementById("ls_name").value = data.name || "";
  document.getElementById("ls_mass_kg").value = data.mass_kg ?? 0;
  document.getElementById("ls_root_LE").value = data.root_LE?.join(",") || "0,0,0";
  document.getElementById("ls_AR").value = data.AR ?? 8;
  document.getElementById("ls_TR").value = data.TR ?? 0.6;
  document.getElementById("ls_mirror").checked = !!data.mirror;
  document.getElementById("ls_symmetric").checked = !!data.symmetric;
  document.getElementById("ls_dihedral_DEG").value = data.dihedral_DEG ?? 3;
  document.getElementById("ls_vertical").checked = !!data.vertical;
  document.getElementById("ls_sweep_quarter_chord_DEG").value = data.sweep_quarter_chord_DEG ?? 15;
  document.getElementById("ls_surface_area_m2").value = data.surface_area_m2 ?? 20;
  document.getElementById("ls_Oswald_factor").value = data.Oswald_factor ?? 0.7;
  document.getElementById("ls_mean_aerodynamic_chord_m").value = data.mean_aerodynamic_chord_m ?? 1.0;
  document.getElementById("ls_stations_eta").value = data.stations_eta?.join(",") || "0,0.5,1";
  document.getElementById("ls_radius_of_giration_pitch_m").value = data.radius_of_giration_pitch_m ?? 3.5;
  document.getElementById("ls_radius_of_giration_yaw_m").value = data.radius_of_giration_yaw_m ?? 4.0;
  document.getElementById("ls_radius_of_giration_roll_m").value = data.radius_of_giration_roll_m ?? 4.0;
  document.getElementById("ls_principal_axis_pitch_up_DEG").value = data.principal_axis_pitch_up_DEG ?? 0;
  document.getElementById("ls_CoG_pos_xyz_m").value = data.CoG_pos_xyz_m?.join(",") || "0,0,0";
  document.getElementById("ls_aerodynamic_center_pos_xyz_m").value = data.aerodynamic_center_pos_xyz_m?.join(",") || "2.9,0,0";

  // Show the modal
  document.getElementById("liftingSurfaceModal").style.display = "block";
}

// Fill the Fuselage modal fields with existing data (for editing)
function fillFuselageModal(data) {
  document.getElementById("fus_name").value = data.name || "";
  document.getElementById("fus_diameter").value = data.diameter ?? 2.5;
  document.getElementById("fus_length").value = data.length ?? 15.0;
  document.getElementById("fus_nose_position").value = data.nose_position?.join(",") || "0,0,0";

  // Show the modal
  document.getElementById("fuselageModal").style.display = "block";
}

/** Render or re-render the entire aircraft from aircraftData */
function renderAircraft() {
  // Dispose existing 3D objects (except camera/light/ground/aircraftRoot)
  scene.meshes.slice().forEach(function(mesh) {
    if (
      mesh !== camera && mesh !== light && mesh !== ground &&
      !mesh.name.startsWith("axis") &&
      mesh.name !== "aircraftRoot"
    ) {
      mesh.dispose();
    }
  });
  scene.transformNodes.slice().forEach(function(tn) {
    if (tn.name !== "aircraftRoot" && tn !== camera && tn !== light) {
      tn.dispose();
    }
  });

  // Re-create the root transform node
  createAircraftRoot();

  // Re-add all existing surfaces/fuselages from aircraftData
  aircraftData.lifting_surfaces.forEach(function(surface) {
    addLiftingSurfaceToScene(surface, aircraftData, aircraftRoot, liftingSurfaceColors);
  });
  aircraftData.fuselages.forEach(function(fus) {
    addFuselageToScene(fus, aircraftRoot);
  });
}

// Parse JSON text into aircraftData, then re-render
function parseAircraft(jsonText) {
  aircraftData = JSON.parse(jsonText);
  renderAircraft();
}

/** Set up the file input, add-lifting-surface, add-fuselage, download, clear, etc. */
(function setupUI() {
  // If you want to show the “Add Lifting Surface” modal:
  const lsModal = document.getElementById("liftingSurfaceModal");
  const lsSubmitBtn = document.getElementById("ls_submit");
  const lsCancelBtn = document.getElementById("ls_cancel");

  lsSubmitBtn.addEventListener("click", function() {
    // Gather new data from input fields
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

    // If editing an existing surface
    if (window.editingType === "lifting_surface" && window.editingObject) {
      Object.assign(window.editingObject, newData);
      window.editingObject = null;
      window.editingType = "";
    } else {
      // Otherwise adding a new surface
      aircraftData.lifting_surfaces.push(newData);
    }

    lsModal.style.display = "none";
    renderAircraft();

    // Clear any selection
    if (window.selectedComponent) {
      revertColor(window.selectedComponent);
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

  // Fuselage modal
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

    // If editing
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
      revertColor(window.selectedComponent);
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

  // Buttons in the #controls bar
  const addLSBtn = document.getElementById("addLiftingSurfaceBtn");
  addLSBtn.addEventListener("click", function() {
    // We are adding a new surface
    window.editingType = "";
    window.editingObject = null;
    // Clear fields or let defaults stand, then show the modal
    lsModal.style.display = "block";
  });

  const addFusBtn = document.getElementById("addFuselageBtn");
  addFusBtn.addEventListener("click", function() {
    window.editingType = "";
    window.editingObject = null;
    fusModal.style.display = "block";
  });

  // Edit selected button
  const editBtn = document.getElementById("editComponentBtn");
  editBtn.addEventListener("pointerdown", function(e) {
    e.stopPropagation(); // prevent camera from rotating
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
      }
    }
  });

  // File input: load JSON
  const fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".json")) {
      const reader = new FileReader();
      reader.onload = function(e) {
        parseAircraft(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert("Please select a valid '.json' file.");
    }
  });

  // Download the aircraft JSON
  const dlBtn = document.getElementById("downloadJsonBtn");
  dlBtn.addEventListener("click", function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(aircraftData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "aircraft.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    document.body.removeChild(dlAnchor);
  });

  // Clear everything
  const clearBtn = document.getElementById("clearAircraft");
  clearBtn.addEventListener("click", function() {
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

  // Toggle ground
  const groundBtn = document.getElementById("toggleGround");
  groundBtn.addEventListener("click", function() {
    ground.isVisible = !ground.isVisible;
  });
})();

/** END of UI-Logic.js */
