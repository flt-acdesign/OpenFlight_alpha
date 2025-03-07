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

// Add highlight using highlight layer with contour-only glow
function setColorLightPink(componentNode) {
  // Ensure the highlight layer exists
  if (!window.hl) {
    window.hl = new BABYLON.HighlightLayer("hl1", window.scene);
    window.hl.innerGlow = false;  // Disable inner glow for a more discrete highlight
    window.hl.outerGlow = true;   // Keep only outer glow (contour)
    
    // Adjust glow intensity and blur radius for a more subtle effect
    window.hl.blurHorizontalSize = 0.5;
    window.hl.blurVerticalSize = 0.5;
  }
  
  // Add all meshes to the highlight layer
  componentNode.getChildMeshes().forEach(mesh => {
    if (mesh.name !== "ground" && 
        mesh.name !== CAMERA_SPHERE_NAME && 
        !mesh.name.startsWith("axis") &&
        !mesh.name.startsWith("axisProj") &&
        !mesh.name.startsWith("label_")) {
      window.hl.addMesh(mesh, new BABYLON.Color3(1.0, 0.4, 0.7));
    }
  });
}

// Remove highlight
function clearHighlight(componentNode) {
  if (!window.hl) return;
  
  componentNode.getChildMeshes().forEach(mesh => {
    window.hl.removeMesh(mesh);
  });
}

function setTranslucencyMode(enabled) {
  const alphaValue = enabled ? 0.7 : 1.0;

  function updateMeshTransparency(mesh) {
    // Skip labels or anything special
    if (mesh.name.startsWith("label_")) return;

    if (mesh.material) {
      mesh.material.alpha = alphaValue;
      if (enabled) {
        // translucent mode
        mesh.material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        mesh.material.needDepthPrePass = true; // optional
      } else {
        // fully opaque
        mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
        mesh.material.needDepthPrePass = false;
      }
    }
  }

  // Update everything under aircraftRoot
  if (window.aircraftRoot) {
    window.aircraftRoot.getChildMeshes().forEach(updateMeshTransparency);
  }
  // Update everything under glbRoot
  if (window.glbRoot) {
    window.glbRoot.getChildMeshes().forEach(updateMeshTransparency);
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