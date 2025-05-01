

function setup_GLB_model_transformations(scene, shadowGenerator) {
    const fileInput = document.getElementById("fileInput"); // Get reference outside listener

    if (!fileInput) {
        console.error("fileInput element not found. Cannot set up GLB loading.");
        return;
    }

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files ? event.target.files[0] : null; // Handle case where no file is selected
      if (!file) {
          console.log("No file selected.");
          // Reset file input value to allow selecting the same file again
          event.target.value = null;
          return;
      }

      const fileName = file.name;
      console.log("File selected:", fileName);

      if (fileName.toLowerCase().endsWith(".glb")) {
        let scaleFactor, rotationX, rotationY, rotationZ, translationX, translationY, translationZ;
        
        // Default values
        scaleFactor = 1;
        rotationX = 0; rotationY = 0; rotationZ = 0;
        translationX = 0; translationY = 0; translationZ = 0;
        let propeller_pos = null;
        let wing_lights_pos = null;
        let tailcone_light_pos = null;
        let strobe_light_pos = null;
        let propeller_diameter = null;

        // x positive towards the tail from the CoG
        // y positive upwards from the CoG 
        // z towards the right wing from the CoG

        // Apply specific transformations based on filename
        switch (fileName.toLowerCase()) {
          case "mig21.glb":
            scaleFactor = 1;
            rotationX = 0; rotationY = -90; rotationZ = 0;
            translationX = -4; translationY = -5; translationZ = -2;
            break;
          case "piper_pa18.glb":
            scaleFactor = 1;
            rotationX = 0; rotationY = -90; rotationZ = 0;
            translationX = -1.5; translationY = -1.2; translationZ = 0;
            wing_lights_pos = [0.06, 0.79, 5.11];
            tailcone_light_pos = [-5.2, 0.4, 0];
            strobe_light_pos = [-1, 0.75, 0];
            propeller_pos = [1.67, 0.05, 0];
            propeller_diameter = 1.7;
            break;
          case "su57.glb":
            scaleFactor = 1.0;
            rotationX = 0; rotationY = -90; rotationZ = 0;
            translationX = 2; translationY = 0; translationZ = 0;
            wing_lights_pos = [-2.2, 0.05, 6.11];
            tailcone_light_pos = [-7.2, 0, 0];
            strobe_light_pos = [-1, 0.4, 0];
            break;
          case "pc9.glb": // Treat both the same for transformations
            scaleFactor = 1;
            rotationX = 0; rotationY = 0; rotationZ = 0;
            translationX = 0; translationY = 0; translationZ = 0;
            // Add light/propeller info specifically for bucker_no_reg if needed, or keep common
    
                propeller_pos = [3.4, 0.22, 0]; // Example position, adjust as needed
                propeller_diameter = 1.9; // Example diameter
                wing_lights_pos = [-.07, 0.09, 5.07];
                tailcone_light_pos = [-5.8, -.13, 0];
                strobe_light_pos = [-4.7, 1.9, 0];
            
            break;
          case "bucker.glb":
            scaleFactor = 1;
            rotationX = 0; rotationY = -90; rotationZ = 0;
            translationX = 1; translationY = -2.5; translationZ = 0;
            // Add light/propeller info specifically for bucker_no_reg if needed, or keep common
            if (fileName.toLowerCase() === "bucker.glb") {
                propeller_pos = [3.3, 1, 0]; // Example position, adjust as needed
                propeller_diameter = 1.9; // Example diameter
                // wing_lights_pos = [...]; // Example
                // tailcone_light_pos = [...]; // Example
                // strobe_light_pos = [...]; // Example
            }
            break;
          case "bucker_no_reg.glb": // Treat both the same for transformations
            scaleFactor = 1;
            rotationX = 0; rotationY = -90; rotationZ = 0;
            translationX = 1; translationY = -2.5; translationZ = 0;
            // Add light/propeller info specifically for bucker_no_reg if needed, or keep common
            if (fileName.toLowerCase() === "bucker_no_reg.glb") {
                propeller_pos = [3.3, 1, 0]; // Example position, adjust as needed
                propeller_diameter = 1.9; // Example diameter
                // wing_lights_pos = [...]; // Example
                // tailcone_light_pos = [...]; // Example
                // strobe_light_pos = [...]; // Example
            }
            break;
          case "airliner.glb":
            scaleFactor = 1;
            rotationX = 0; rotationY = 0; rotationZ = 0;
            translationX = 0; translationY = 0; translationZ = 0;
            // Define light/propeller positions if applicable
            break;
          case "bizjet.glb":
            scaleFactor = 0.01;
            rotationX = 90; rotationY = 180; rotationZ = 90;
            translationX = 0; translationY = -1.5; translationZ = 0;
            // Define light/propeller positions if applicable
            break;
          default:
            // Use default transformations if filename doesn't match
            console.log(`No specific transformations found for ${fileName}. Using defaults.`);
        }

        // MODIFIED: Call the new loadGLB function
        loadGLB(
          file,
          scaleFactor,
          rotationX,
          rotationY,
          rotationZ,
          translationX,
          translationY,
          translationZ,
          scene,
          shadowGenerator,
          wing_lights_pos,
          tailcone_light_pos,
          strobe_light_pos,
          propeller_pos,
          propeller_diameter
        );
      } else {
        alert("Please select a valid .glb file");
      }
      // Reset file input value AFTER processing to allow selecting the same file again
       event.target.value = null;
    });
}