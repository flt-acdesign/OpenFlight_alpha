// js/interaction.js

var pointerDownPos = null;
window.ctrlIsPressed = false;

// IMPORTANT: Ensure the gizmo is actually enabled for positions.
gizmoManager.positionGizmoEnabled = true;   // so we can move objects
gizmoManager.rotationGizmoEnabled = false;  // optional
gizmoManager.scaleGizmoEnabled = false;     // optional

// Track the Ctrl key to decide when to attach or detach the gizmo.
window.addEventListener("keydown", function (evt) {
  if (evt.key === "Control") {
    window.ctrlIsPressed = true;

    // Only attach the gizmo if a valid component is selected (not ground).
    if (window.selectedComponent && window.selectedComponent.name !== "ground") {
      gizmoManager.attachToMesh(window.selectedComponent);
    }
  }
});

window.addEventListener("keyup", function (evt) {
  if (evt.key === "Control") {
    window.ctrlIsPressed = false;
    // Detach the gizmo to avoid accidental moves.
    gizmoManager.attachToMesh(null);
  }
});

/**
 * Main pointer logic for selecting a component or ground.
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
            // If user right-clicked ground, just display "Ground."
            clearSelectedNameDisplay();
            updateSelectedNameDisplay("Ground");
          }
        }
        return;
      }

      if (!isClick) return;

      const pickInfo = pointerInfo.pickInfo;
      // If click missed or clicked ground => unselect any current component
      if (!pickInfo.hit || pickInfo.pickedMesh.name === "ground") {
        if (window.selectedComponent) {
          clearHighlight(window.selectedComponent);
          // Also detach any gizmo if it was attached
          gizmoManager.attachToMesh(null);
          window.selectedComponent = null;
        }
        clearSelectedNameDisplay();
        if (pickInfo.hit && pickInfo.pickedMesh.name === "ground") {
          updateSelectedNameDisplay("Ground");
          // Optionally set the ground as "selected" if you prefer
          // but it won't have a gizmo because it has name === "ground".
          window.selectedComponent = pickInfo.pickedMesh; 
        }
        return;
      }

      // Otherwise, we clicked on a valid mesh (component).
      const info = getMetadata(pickInfo.pickedMesh);
      if (info) {
        // Unhighlight old selection if needed
        if (window.selectedComponent && window.selectedComponent !== info.mesh) {
          clearHighlight(window.selectedComponent);
        }
        // Select the new component
        window.selectedComponent = info.mesh;
        setColorLightPink(window.selectedComponent);

        // NOTE: We do NOT attach the gizmo here!
        // It only attaches when Ctrl is pressed.

        const compName = info.metadata?.data?.name 
          || (info.metadata?.type === "glb" ? "GLB Model" : "Unnamed");
        updateSelectedNameDisplay(compName);
      }
      break;
  }
});

/**
 * After releasing the pointer, if the user dragged an object,
 * update the object's position in your JSON data structure.
 */
scene.onPointerObservable.add(function (pointerInfo) {
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
    if (!window.selectedComponent) return;

    // If the component has metadata, update the relevant position in the JSON.
    const md = window.selectedComponent.metadata;
    if (md && md.data) {
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
      // For GLB or others, if needed, store position similarly.
    }
  }
});
