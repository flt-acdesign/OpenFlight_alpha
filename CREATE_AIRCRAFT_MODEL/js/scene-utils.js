// js/scene-utils.js

function getMetadata(mesh) {
  let current = mesh;
  while (current) {
    if (current.metadata && current.metadata.data) {
      return { mesh: current, metadata: current.metadata };
    }
    current = current.parent;
  }
  // If none found, check if mesh is descendant of glbRoot
  if (window.glbRoot && isDescendantOf(mesh, window.glbRoot)) {
    return { mesh: window.glbRoot, metadata: window.glbRoot.metadata };
  }
  return null;
}

function isDescendantOf(child, parent) {
  let curr = child.parent;
  while (curr) {
    if (curr === parent) return true;
    curr = curr.parent;
  }
  return false;
}

// Add highlight
function setColorLightPink(componentNode) {
  componentNode.getChildMeshes().forEach(mesh => {
    window.hl.addMesh(mesh, new BABYLON.Color3(1.0, 0.4, 0.7));
  });
}

// Remove highlight
function clearHighlight(componentNode) {
  componentNode.getChildMeshes().forEach(mesh => {
    window.hl.removeMesh(mesh);
  });
}


function setTranslucencyMode(enabled) {
  const alphaValue = enabled ? 0.5 : 1.0;

  // 1) Set alpha on all child meshes under aircraftRoot
  if (window.aircraftRoot) {
    window.aircraftRoot.getChildMeshes().forEach(mesh => {
      if (mesh.material && typeof mesh.material.alpha === "number") {
        mesh.material.alpha = alphaValue;
      }
    });
  }

  // 2) Set alpha on all child meshes under glbRoot
  if (window.glbRoot) {
    window.glbRoot.getChildMeshes().forEach(mesh => {
      if (mesh.material && typeof mesh.material.alpha === "number") {
        mesh.material.alpha = alphaValue;
      }
    });
  }
}