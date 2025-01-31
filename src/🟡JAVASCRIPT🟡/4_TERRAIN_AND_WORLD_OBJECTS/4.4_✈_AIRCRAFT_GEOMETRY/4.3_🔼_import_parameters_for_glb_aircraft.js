


function setup_GLB_model_transformations(scene, shadowGenerator) {
    document.getElementById("fileInput").addEventListener("change", (event) => {
      const file = event.target.files[0];
      const fileName = file ? file.name : '';
      
      //alert(fileName);
  
      if (file && file.name.toLowerCase().endsWith(".glb")) {
        let scaleFactor, rotationX, rotationY, rotationZ, translationX, translationY, translationZ;
  
        switch(fileName.toLowerCase()) {
          case "mig21.glb":
              scaleFactor = 1;
              rotationX = 90;
              rotationY = 90;
              rotationZ = 0;
              translationX = -4;
              translationY = -5;
              translationZ = 2;
              wing_lights_pos = null;
              tailcone_light_pos = null;
              strobe_light_pos = null;
              break;
          case "piper_pa18.glb":
              scaleFactor = 1.5;
              rotationX = 90;
              rotationY = 90;
              rotationZ = 0;
              translationX = -1.5;
              translationY = -2;
              translationZ = 0;
              wing_lights_pos = [1, 2, 6]
              tailcone_light_pos = [-20, 0, 0]
              strobe_light_pos = [-30, 4, 0]
              break;
          case "su57.glb":
              scaleFactor = 1.;
              rotationX = 0;
              rotationY = 90;
              rotationZ = 0;
              translationX = 2;
              translationY = 0;
              translationZ = 0;
              wing_lights_pos = null;
              tailcone_light_pos = null;
              strobe_light_pos = null;
              break;
          case "bucker.glb":
              scaleFactor = 1;
              rotationX = 90;
              rotationY = 90;
              rotationZ = 0;
              translationX = 1;
              translationY = -2.5;
              translationZ = 0;
              wing_lights_pos = null;
              tailcone_light_pos = null;
              strobe_light_pos = null;
              break;
          case "airliner.glb":
              scaleFactor = .01;
              rotationX = 0;
              rotationY = 0;
              rotationZ = 0;
              translationX = 0;
              translationY = 0;
              translationZ = 0;
              wing_lights_pos = null;
              tailcone_light_pos = null;
              strobe_light_pos = null;
              break;
          case "bizjet.glb":
              scaleFactor = .01;
              rotationX = 0;
              rotationY = 0;
              rotationZ = 0;
              translationX = 0;
              translationY = 0;
              translationZ = 0;
              wing_lights_pos = null;
              tailcone_light_pos = null;
              strobe_light_pos = null;
              break;
          default:
              scaleFactor = 1;
              rotationX = 0;
              rotationY = 0;
              rotationZ = 0;
              translationX = 0;
              translationY = 0;
              translationZ = 0;
              wing_lights_pos = null;
              tailcone_light_pos = null;
              strobe_light_pos = null;
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
        strobe_light_pos
    );
} else {
    alert("Please select a valid .glb file");
}
});
}


