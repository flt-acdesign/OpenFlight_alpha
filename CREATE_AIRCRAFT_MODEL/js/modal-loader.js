// js/modal-loader.js

// Helper to load an external HTML file (for a modal)
function loadModal(url) {
    return fetch(url).then(response => response.text());
  }
  
  Promise.all([
    loadModal("modals/ls-modal.html"),
    loadModal("modals/fuselage-modal.html")
  ]).then(function(modals) {
    var modalsContainer = document.getElementById("modals");
    modalsContainer.innerHTML = modals.join("\n");
  
    // Once modals are loaded, attach event listeners for modal buttons.
    attachModalEventListeners();
  });
  
  function attachModalEventListeners() {
    // Lifting Surface Modal
    var lsModal = document.getElementById("liftingSurfaceModal");
    document.getElementById("ls_cancel").addEventListener("click", function() {
      lsModal.style.display = "none";
      window.editingType = "";
      window.editingObject = null;
    });
    document.getElementById("ls_submit").addEventListener("click", function() {
      var newData = {
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
        lsModal.style.display = "none";
        renderAircraft();
        if (window.selectedComponent) {
          revertColor(window.selectedComponent);
          gizmoManager.attachToMesh(null);
          window.selectedComponent = null;
          clearSelectedNameDisplay();
        }
      } else {
        aircraftData.lifting_surfaces.push(newData);
        addLiftingSurfaceToScene(newData, aircraftData, aircraftRoot, liftingSurfaceColors);
        lsModal.style.display = "none";
      }
    });
  
    // Fuselage Modal
    var fusModal = document.getElementById("fuselageModal");
    document.getElementById("fus_cancel").addEventListener("click", function() {
      fusModal.style.display = "none";
      window.editingType = "";
      window.editingObject = null;
    });
    document.getElementById("fus_submit").addEventListener("click", function() {
      var newData = {
        name: document.getElementById("fus_name").value,
        diameter: parseFloat(document.getElementById("fus_diameter").value),
        length: parseFloat(document.getElementById("fus_length").value),
        nose_position: document.getElementById("fus_nose_position").value.split(",").map(Number)
      };
      if (window.editingType === "fuselage" && window.editingObject) {
        Object.assign(window.editingObject, newData);
        window.editingObject = null;
        window.editingType = "";
        fusModal.style.display = "none";
        renderAircraft();
        if (window.selectedComponent) {
          revertColor(window.selectedComponent);
          gizmoManager.attachToMesh(null);
          window.selectedComponent = null;
          clearSelectedNameDisplay();
        }
      } else {
        if (!aircraftData.fuselages) { aircraftData.fuselages = []; }
        aircraftData.fuselages.push(newData);
        addFuselageToScene(newData, aircraftRoot);
        fusModal.style.display = "none";
      }
    });
  
    // Buttons to open modals for adding new components.
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
  }
  
  // These functions prefill the modal fields when editing an existing component.
  function fillLiftingSurfaceModal(data) {
    document.getElementById("ls_name").value = data.name;
    document.getElementById("ls_mass_kg").value = data.mass_kg;
    document.getElementById("ls_root_LE").value = data.root_LE.join(",");
    document.getElementById("ls_AR").value = data.AR;
    document.getElementById("ls_TR").value = data.TR;
    document.getElementById("ls_mirror").checked = data.mirror;
    document.getElementById("ls_symmetric").checked = data.symmetric;
    document.getElementById("ls_dihedral_DEG").value = data.dihedral_DEG;
    document.getElementById("ls_vertical").checked = data.vertical;
    if (data.vertical) {
      document.getElementById("ls_symmetric").checked = false;
      document.getElementById("ls_symmetric").disabled = true;
    } else {
      document.getElementById("ls_symmetric").disabled = false;
    }
    document.getElementById("ls_sweep_quarter_chord_DEG").value = data.sweep_quarter_chord_DEG;
    document.getElementById("ls_surface_area_m2").value = data.surface_area_m2;
    document.getElementById("ls_Oswald_factor").value = data.Oswald_factor;
    document.getElementById("ls_mean_aerodynamic_chord_m").value = data.mean_aerodynamic_chord_m;
    document.getElementById("ls_stations_eta").value = data.stations_eta.join(",");
    document.getElementById("ls_radius_of_giration_pitch_m").value = data.radius_of_giration_pitch_m;
    document.getElementById("ls_radius_of_giration_yaw_m").value = data.radius_of_giration_yaw_m;
    document.getElementById("ls_radius_of_giration_roll_m").value = data.radius_of_giration_roll_m;
    document.getElementById("ls_principal_axis_pitch_up_DEG").value = data.principal_axis_pitch_up_DEG;
    document.getElementById("ls_CoG_pos_xyz_m").value = data.CoG_pos_xyz_m.join(",");
    document.getElementById("ls_aerodynamic_center_pos_xyz_m").value = data.aerodynamic_center_pos_xyz_m.join(",");
    document.getElementById("liftingSurfaceModal").style.display = "block";
  }
  
  function fillFuselageModal(data) {
    document.getElementById("fus_name").value = data.name;
    document.getElementById("fus_diameter").value = data.diameter;
    document.getElementById("fus_length").value = data.length;
    document.getElementById("fus_nose_position").value = data.nose_position.join(",");
    document.getElementById("fuselageModal").style.display = "block";
  }
  