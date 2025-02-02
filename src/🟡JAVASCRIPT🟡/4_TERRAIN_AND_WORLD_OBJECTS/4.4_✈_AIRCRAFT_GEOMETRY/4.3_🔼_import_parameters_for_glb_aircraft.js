


function setup_GLB_model_transformations(scene, shadowGenerator) {
    document.getElementById("fileInput").addEventListener("change", (event) => {
      const file = event.target.files[0];
      const fileName = file ? file.name : '';
      
      //alert(fileName);
  
      if (file && file.name.toLowerCase().endsWith(".glb")) {
        let scaleFactor, rotationX, rotationY, rotationZ, translationX, translationY, translationZ;
  


        // x positive towards the tail from the CoG
        // y positive upwards from the CoG 
        // z towards the right wing from the CoG

        let propeller_pos = null
        wing_lights_pos = null
        tailcone_light_pos = null;
        strobe_light_pos = null;
        propeller_diameter = null

        switch(fileName.toLowerCase()) {
          case "mig21.glb":
              scaleFactor = 1;
              rotationX = 90;
              rotationY = 90;
              rotationZ = 0;
              translationX = -4;
              translationY = -5;
              translationZ = 2;
              break;
          case "piper_pa18.glb":
              scaleFactor = 1;
              rotationX = 90;
              rotationY = 90;
              rotationZ = 0;
              translationX = -1.5;
              translationY = -1.2;
              translationZ = 0;
              wing_lights_pos = [.06, .79, 5.11]
              tailcone_light_pos = [-5.2, .4, 0]
              strobe_light_pos = [-1, .75, 0]
              propeller_pos = [1.67, 0.05, 0]
              propeller_diameter = 1.7
              break;
          case "su57.glb":
              scaleFactor = 1.;
              rotationX = 0;
              rotationY = 90;
              rotationZ = 0;
              translationX = 2;
              translationY = 0;
              translationZ = 0;
              wing_lights_pos = [-2.2, 0.05, 6.11]
              tailcone_light_pos = [-7.2, 0, 0]
              strobe_light_pos = [-1, .4, 0]
              break;
          case "bucker.glb":
              scaleFactor = 1;
              rotationX = 90;
              rotationY = 90;
              rotationZ = 0;
              translationX = 1;
              translationY = -2.5;
              translationZ = 0;

              break;
              case "bucker_no_reg.glb":
                scaleFactor = 1;
                rotationX = 90;
                rotationY = 90;
                rotationZ = 0;
                translationX = 1;
                translationY = -2.5;
                translationZ = 0;
                propeller_pos = [3.3, 1, 0]
                propeller_diameter = 1.9
                break;
          case "airliner.glb":
              scaleFactor = .01;
              rotationX = 0;
              rotationY = 0;
              rotationZ = 0;
              translationX = 0;
              translationY = 0;
              translationZ = 0;
              break;
          case "bizjet.glb":
              scaleFactor = .01;
              rotationX = 0;
              rotationY = -90;
              rotationZ = 0;
              translationX = 0;
              translationY = -1.5;
              translationZ = 0;
              break;
          default:
              scaleFactor = 1;
              rotationX = 0;
              rotationY = 0;
              rotationZ = 0;
              translationX = 0;
              translationY = 0;
              translationZ = 0;

      }
        
      loadGlbFile(
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
});
}


