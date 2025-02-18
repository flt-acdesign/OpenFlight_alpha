// js/scene-utils.js

function getMetadata(mesh) {
    let current = mesh;
    while (current) {
      if (current.metadata && current.metadata.data) {
        return { mesh: current, metadata: current.metadata };
      }
      current = current.parent;
    }
    return null;
  }
  
  function updateSelectedNameDisplay(name) {
    const span = document.getElementById("selectedComponentName");
    span.innerText = "Selected: " + name;
    document.getElementById("editComponentBtn").disabled = (name === "None" || name === "Ground");
  }
  
  function clearSelectedNameDisplay() {
    document.getElementById("selectedComponentName").innerText = "Selected: None";
    document.getElementById("editComponentBtn").disabled = true;
  }
  
  function setColorLightPink(componentNode) {
    const glowColor = new BABYLON.Color3(1, 0.4, 0.7);
    componentNode.getChildMeshes().forEach(m => {
      if (m.material) {
        m.metadata = m.metadata || {};
        if (!m.metadata.originalEmissive) {
          m.metadata.originalEmissive = m.material.emissiveColor.clone();
        }
        m.material.emissiveColor = glowColor;
      }
    });
  }
  
  function revertColor(componentNode) {
    componentNode.getChildMeshes().forEach(m => {
      if (m.material && m.metadata && m.metadata.originalEmissive) {
        m.material.emissiveColor = m.metadata.originalEmissive;
      }
    });
  }
  