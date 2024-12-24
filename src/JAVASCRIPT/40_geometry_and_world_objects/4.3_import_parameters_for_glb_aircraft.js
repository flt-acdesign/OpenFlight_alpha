


function setupFileInput(scene, shadowGenerator) {
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
            case "airliner.glb":
              scaleFactor = .01;
              rotationX = 0;
              rotationY = 0;
              rotationZ = 0;
              translationX = 0
              translationY = 0
              translationZ = 0;
              break;
              case "bizjet.glb":
                scaleFactor = .01;
                rotationX = 0;
                rotationY = 0;
                rotationZ = 0;
                translationX = 0
                translationY = 0
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
          shadowGenerator
        );
      } else {
        alert("Please select a valid .glb file");
      }
    });
  }