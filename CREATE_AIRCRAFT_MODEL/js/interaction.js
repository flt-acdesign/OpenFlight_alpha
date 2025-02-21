// js/interaction.js

var pointerDownPos = null;
window.ctrlIsPressed = false;

// Make sure the gizmo can actually show a position handle.
gizmoManager.positionGizmoEnabled = true;   // <<--- IMPORTANT
gizmoManager.rotationGizmoEnabled = false;  // (optional)
gizmoManager.scaleGizmoEnabled = false;     // (optional)

// Track the Ctrl key to decide when to attach or detach the gizmo.
window.addEventListener("keydown", function (evt) {
  if (evt.key === "Control") {
    window.ctrlIsPressed = true;
    // If a component is currently selected, attach the gizmo now.
    if (window.selectedComponent) {
      gizmoManager.attachToMesh(window.selectedComponent);
    }
  }
});

window.addEventListener("keyup", function (evt) {
  if (evt.key === "Control") {
    window.ctrlIsPressed = false;
    // Detach the gizmo so we don’t accidentally move further.
    gizmoManager.attachToMesh(null);
  }
});

/**
 * Main pointer logic for selection and camera pivot.
 */
scene.onPointerObservable.add(function (pointerInfo) {
  switch (pointerInfo.type) {
    case BABYLON.PointerEventTypes.POINTERDOWN:
      pointerDownPos = {
        x: pointerInfo.event.clientX,
        y: pointerInfo.event.clientY
      };
      break;

    case BABYLON.PointerEventTypes.POINTERUP:
      // Distinguish "click" vs. drag.
      if (!pointerDownPos) return;
      const dx = pointerInfo.event.clientX - pointerDownPos.x;
      const dy = pointerInfo.event.clientY - pointerDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isClick = dist < 5;
      pointerDownPos = null;

      // Right-click => pivot camera only.
      if (pointerInfo.event.button === 2) {
        if (pointerInfo.pickInfo.hit) {
          const pickedMesh = pointerInfo.pickInfo.pickedMesh;
          if (pickedMesh && pickedMesh.name !== "ground") {
            camera.target = pointerInfo.pickInfo.pickedPoint;
          } else {
            // If user right-clicked ground, just show "Ground" as selected name.
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
          // If we had a gizmo attached, detach it.
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
        // Unhighlight old selection
        if (window.selectedComponent && window.selectedComponent !== info.mesh) {
          clearHighlight(window.selectedComponent);
        }
        // Select the new component
        window.selectedComponent = info.mesh;
        setColorLightPink(window.selectedComponent);

        // NOTE: We do NOT attach the gizmo here.
        // The gizmo is attached only when Ctrl is pressed.

        const compName = info.metadata.data?.name 
          || (info.metadata.type === "glb" ? "GLB Model" : "Unnamed");
        updateSelectedNameDisplay(compName);
      }
      break;
  }
});

/**
 * After releasing the pointer, if we dragged something, update the position
 * in the metadata (the JSON data).
 */
scene.onPointerObservable.add(function (pointerInfo) {
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
    if (!window.selectedComponent) return;

    // If the component has metadata with 'type' and 'data'
    const md = window.selectedComponent.metadata;
    if (md && md.data) {
      if (md.type === "lifting_surface") {
        // Save new position into root_LE
        md.data.root_LE = [
          window.selectedComponent.position.x,
          window.selectedComponent.position.y,
          window.selectedComponent.position.z
        ];
      } else if (md.type === "fuselage") {
        // Save new position into nose_position
        md.data.nose_position = [
          window.selectedComponent.position.x,
          window.selectedComponent.position.y,
          window.selectedComponent.position.z
        ];
      }
      // If it's a GLB or something else, store the position if needed.
    }
  }
});
