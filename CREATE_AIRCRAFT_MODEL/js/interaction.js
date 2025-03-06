// js/interaction.js

var pointerDownPos = null;
window.ctrlIsPressed = false;
window.isDraggingGizmo = false;

// IMPORTANT: Ensure the gizmo is actually enabled for positions.
gizmoManager.positionGizmoEnabled = true;   // so we can move objects
gizmoManager.rotationGizmoEnabled = false;  // optional
gizmoManager.scaleGizmoEnabled = false;     // optional

// Set up observers for gizmo events
if (gizmoManager.gizmos.positionGizmo) {
  // Track when gizmo drag starts
  gizmoManager.gizmos.positionGizmo.onDragStartObservable.add(function() {
    window.isDraggingGizmo = true;
  });
  
  // Track when gizmo drag ends
  gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(function() {
    window.isDraggingGizmo = false;
    
    // Update metadata and snippet at the end of drag
    if (window.selectedComponent && window.selectedComponent.metadata && 
        window.selectedComponent.metadata.type === "glb") {
      updateGLBMetadataFromTransform();
      if (typeof updateGLBTransformSnippet === 'function') {
        updateGLBTransformSnippet();
      }
    }
  });
}

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
    
    // Final update when control is released
    if (window.selectedComponent && window.selectedComponent.metadata && 
        window.selectedComponent.metadata.type === "glb") {
      updateGLBMetadataFromTransform();
      if (typeof updateGLBTransformSnippet === 'function') {
        updateGLBTransformSnippet();
      }
    }
  }
});

/**
 * Helper function to update GLB metadata from current transform
 */
function updateGLBMetadataFromTransform() {
  if (!window.selectedComponent || !window.selectedComponent.metadata) return;
  
  const md = window.selectedComponent.metadata;
  if (md.type === "glb") {
    if (!md.data) md.data = {};
    
    // Update position in metadata
    md.data.position = [
      window.selectedComponent.position.x,
      window.selectedComponent.position.y,
      window.selectedComponent.position.z
    ];
    
    // Update rotation (degrees) in metadata
    md.data.rotationDeg = [
      BABYLON.Tools.ToDegrees(window.selectedComponent.rotation.x),
      BABYLON.Tools.ToDegrees(window.selectedComponent.rotation.y),
      BABYLON.Tools.ToDegrees(window.selectedComponent.rotation.z)
    ];
    
    // Update scale in metadata
    md.data.scale = window.selectedComponent.scaling.x;
  }
}

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
          || (info.metadata?.type === "glb" ? "GLB: " + window.lastLoadedGLBName : "Unnamed");
        updateSelectedNameDisplay(compName);
        
        // If it's a GLB model, make sure to update the transform snippet
        if (info.metadata?.type === "glb" && typeof updateGLBTransformSnippet === 'function') {
          updateGLBTransformSnippet();
        }
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
      } else if (md.type === "glb") {
        // Update GLB metadata position
        updateGLBMetadataFromTransform();
        
        // Update the GLB transform snippet if it exists
        if (typeof updateGLBTransformSnippet === 'function') {
          updateGLBTransformSnippet();
        }
      }
    }
  }
});

// Add real-time updates during scene rendering
scene.onBeforeRenderObservable.add(() => {
  // Check if we're currently dragging a GLB model with the gizmo
  if (window.isDraggingGizmo && 
      window.selectedComponent && 
      window.selectedComponent.metadata && 
      window.selectedComponent.metadata.type === "glb") {
    
    // Update in real-time while dragging
    if (typeof updateGLBTransformSnippet === 'function') {
      updateGLBTransformSnippet();
    }
  }
});