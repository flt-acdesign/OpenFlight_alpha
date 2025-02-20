// js/interaction.js

var pointerDownPos = null;
window.ctrlIsPressed = false;

// Here we track Ctrl so that we only allow dragging while it’s pressed
window.addEventListener("keydown", function (evt) {
  if (evt.key === "Control") {
    window.ctrlIsPressed = true;
    // If we already have something selected, attach the gizmo
    if (window.selectedComponent) {
      gizmoManager.attachToMesh(window.selectedComponent);
    }
  }
});

window.addEventListener("keyup", function (evt) {
  if (evt.key === "Control") {
    window.ctrlIsPressed = false;
    // If we had a gizmo, detach it now
    gizmoManager.attachToMesh(null);
  }
});

scene.onPointerObservable.add(function (pointerInfo) {
  switch (pointerInfo.type) {
    case BABYLON.PointerEventTypes.POINTERDOWN:
      pointerDownPos = {
        x: pointerInfo.event.clientX,
        y: pointerInfo.event.clientY
      };
      break;

    case BABYLON.PointerEventTypes.POINTERUP:
      // Distinguish "click" vs. "drag"
      if (!pointerDownPos) return;
      const dx = pointerInfo.event.clientX - pointerDownPos.x;
      const dy = pointerInfo.event.clientY - pointerDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isClick = dist < 5;
      pointerDownPos = null;

    
// Right-click => pivot camera only
if (pointerInfo.event.button === 2) {
  if (pointerInfo.pickInfo.hit) {
    const pickedMesh = pointerInfo.pickInfo.pickedMesh;
    // Only re-center if it's not the ground
   if (pickedMesh && pickedMesh.name !== "ground") {
     camera.target = pointerInfo.pickInfo.pickedPoint;
   } else {
     // If user right-clicked ground, do nothing
     clearSelectedNameDisplay();
     updateSelectedNameDisplay("Ground");
   }
  }
  return;
}

      if (!isClick) return;

      const pickInfo = pointerInfo.pickInfo;
      // If click missed or clicked ground => unselect
      if (!pickInfo.hit || pickInfo.pickedMesh.name === "ground") {
        if (window.selectedComponent) {
          clearHighlight(window.selectedComponent);
          gizmoManager.attachToMesh(null);
          window.selectedComponent = null;
        }
        clearSelectedNameDisplay();
        if (pickInfo.hit && pickInfo.pickedMesh.name === "ground") {
          updateSelectedNameDisplay("Ground");
        }
        return;
      }

      // Otherwise, we clicked a mesh
      const info = getMetadata(pickInfo.pickedMesh);
      if (info) {
        // If something else was selected, revert highlight
        if (window.selectedComponent && window.selectedComponent !== info.mesh) {
          clearHighlight(window.selectedComponent);
        }
        window.selectedComponent = info.mesh;
        setColorLightPink(window.selectedComponent);

        // Only attach gizmo if Ctrl is pressed
        if (window.ctrlIsPressed) {
          gizmoManager.attachToMesh(window.selectedComponent);
        } else {
          gizmoManager.attachToMesh(null);
        }

        const compName = info.metadata.data.name ||
                         (info.metadata.type === "glb" ? "GLB Model" : "Unnamed");
        updateSelectedNameDisplay(compName);
      }
      break;
  }
});

// If pointer is released, we may update JSON data
scene.onPointerObservable.add(function (pointerInfo) {
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
    if (!window.selectedComponent) return;
    const md = window.selectedComponent.metadata;
    if (md && md.data) {
      // Store new position
      if (md.type === "lifting_surface") {
        md.data.root_LE = [
          window.selectedComponent.position.x,
          window.selectedComponent.position.y,
          window.selectedComponent.position.z
        ];
      } else if (md.type === "fuselage") {
        md.data.nose_position = [
          window.selectedComponent.position.x,
          window.selectedComponent.position.y,
          window.selectedComponent.position.z
        ];
      }
      // if glb => store position in md.data if needed
    }
  }
});
