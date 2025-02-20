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
  // When enabled, use ALPHABLEND; when disabled, use OPAQUE.
  const transparencyMode = enabled ? BABYLON.Material.MATERIAL_ALPHABLEND : BABYLON.Material.MATERIAL_OPAQUE;

  // Update materials for all child meshes under aircraftRoot.
  if (window.aircraftRoot) {
    window.aircraftRoot.getChildMeshes().forEach(mesh => {
      if (mesh.name.startsWith("label_")) return;  // Skip labels
      if (mesh.material) {
        mesh.material.alpha = alphaValue;
        mesh.material.transparencyMode = transparencyMode;
      }
    });
  }

  // Update materials for all child meshes under glbRoot.
  if (window.glbRoot) {
    window.glbRoot.getChildMeshes().forEach(mesh => {
      if (mesh.name.startsWith("label_")) return;  // Skip labels
      if (mesh.material) {
        mesh.material.alpha = alphaValue;
        mesh.material.transparencyMode = transparencyMode;
      }
    });
  }
}




/**
 * Smoothly transition camera.target to newTarget over 'durationInSeconds'.
 */
function smoothTransitionToTarget(newTarget, camera, scene, durationInSeconds) {
  const frameRate = 60;
  const totalFrames = durationInSeconds * frameRate;

  const animCamTarget = new BABYLON.Animation(
    "animCam",
    "target",
    frameRate,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [];
  keys.push({ frame: 0, value: camera.target });
  keys.push({ frame: totalFrames, value: newTarget });
  animCamTarget.setKeys(keys);

  scene.beginDirectAnimation(camera, [animCamTarget], 0, totalFrames, false);
}