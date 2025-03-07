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
        // Make sure the snippet is visible
        document.getElementById("glbTransformSnippet").style.display = "block";
      }
    }
    
    // Enforce ground-only vertical movement
    if (window.selectedComponent && window.selectedComponent.name === "ground") {
      const groundPos = window.selectedComponent.position;
      window.selectedComponent.position = new BABYLON.Vector3(0, groundPos.y, 0);
    }
    
    // Update JSON Editor if visible
    if (window.appState && window.appState.jsonEditorVisible && window.jsonEditor) {
      updateJsonEditor();
    }
  });
}

// Track the Ctrl key to decide when to attach or detach the gizmo.
window.addEventListener("keydown", function (evt) {
  if (evt.key === "Control") {
    window.ctrlIsPressed = true;

    // Only attach the gizmo if a valid component is selected
    if (window.selectedComponent) {
      gizmoManager.attachToMesh(window.selectedComponent);
      
      // Special handling for ground - restrict to Y-axis only
      if (window.selectedComponent.name === "ground" && gizmoManager.gizmos.positionGizmo) {
        const groundGizmo = gizmoManager.gizmos.positionGizmo;
        groundGizmo.xGizmo.isEnabled = false; // Disable X movement
        groundGizmo.zGizmo.isEnabled = false; // Disable Z movement
        groundGizmo.yGizmo.isEnabled = true;  // Enable only Y movement
      } else if (gizmoManager.gizmos.positionGizmo) {
        // Ensure all axes are enabled for non-ground objects
        const gizmo = gizmoManager.gizmos.positionGizmo;
        gizmo.xGizmo.isEnabled = true;
        gizmo.yGizmo.isEnabled = true;
        gizmo.zGizmo.isEnabled = true;
      }
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
        // Make sure the snippet is visible
        document.getElementById("glbTransformSnippet").style.display = "block";
      }
    }
    
    // Enforce ground-only vertical movement
    if (window.selectedComponent && window.selectedComponent.name === "ground") {
      const groundPos = window.selectedComponent.position;
      window.selectedComponent.position = new BABYLON.Vector3(0, groundPos.y, 0);
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
 * Helper function to ensure ground is restricted to vertical movement only
 */
function enforceGroundMovementRestrictions() {
  if (window.selectedComponent && window.selectedComponent.name === "ground") {
    // Configure the gizmo for ground to allow only Y-axis movement
    if (gizmoManager.gizmos.positionGizmo) {
      const groundGizmo = gizmoManager.gizmos.positionGizmo;
      groundGizmo.xGizmo.isEnabled = false; // Disable X movement
      groundGizmo.zGizmo.isEnabled = false; // Disable Z movement
      groundGizmo.yGizmo.isEnabled = true;  // Enable only Y movement
    }
    
    // Force ground position to stay at (0,y,0)
    const groundPos = window.selectedComponent.position;
    window.selectedComponent.position = new BABYLON.Vector3(0, groundPos.y, 0);
  }
}

/**
 * Main pointer logic for selecting a component or ground.
 */
scene.onPointerObservable.add(function (pointerInfo) {
  switch (pointerInfo.type) {
    case BABYLON.PointerEventTypes.POINTERDOWN:
      // Only track position for left-button events (button 0)
      if (pointerInfo.event.button === 0) {
        pointerDownPos = {
          x: pointerInfo.event.clientX,
          y: pointerInfo.event.clientY
        };
      }
      break;

    case BABYLON.PointerEventTypes.POINTERUP:
      // Only handle selection for left mouse button (button 0)
      if (pointerInfo.event.button !== 0) {
        // Not a left-click, ignore for selection purposes
        return;
      }

      if (!pointerDownPos) return;
      const dx = pointerInfo.event.clientX - pointerDownPos.x;
      const dy = pointerInfo.event.clientY - pointerDownPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isClick = dist < 5;
      pointerDownPos = null;

      // Middle-button is ignored for selection
      if (pointerInfo.event.button === 1) {
        return;
      }

      // Right-click is ignored for selection (previously handled for camera)
      if (pointerInfo.event.button === 2) {
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
          // Set the ground as "selected" specifically for vertical-only movement
          window.selectedComponent = pickInfo.pickedMesh;
          
          // Configure the gizmo for ground to allow only Y-axis movement
          enforceGroundMovementRestrictions();
        }
        
        // Hide GLB transform snippet when deselecting
        if (document.getElementById("glbTransformSnippet")) {
          document.getElementById("glbTransformSnippet").style.display = "none";
        }
        
        // Update JSON editor selection
        if (window.appState && window.appState.jsonEditorVisible && window.jsonEditor) {
          updateJsonEditorSelection(null);
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

        // Reset gizmo to full movement capabilities for non-ground objects
        if (gizmoManager.gizmos.positionGizmo) {
          // Always reset to full movement for non-ground objects
          gizmoManager.gizmos.positionGizmo.xGizmo.isEnabled = true;
          gizmoManager.gizmos.positionGizmo.yGizmo.isEnabled = true;
          gizmoManager.gizmos.positionGizmo.zGizmo.isEnabled = true;
        }

        const compName = info.metadata?.data?.name 
          || (info.metadata?.type === "glb" ? "GLB: " + window.lastLoadedGLBName : "Unnamed");
        updateSelectedNameDisplay(compName);
        
        // If it's a GLB model, make sure to update and show the transform snippet
        if (info.metadata?.type === "glb" && typeof updateGLBTransformSnippet === 'function') {
          updateGLBTransformSnippet();
          document.getElementById("glbTransformSnippet").style.display = "block";
        } else {
          // Hide GLB transform snippet when selecting non-GLB component
          if (document.getElementById("glbTransformSnippet")) {
            document.getElementById("glbTransformSnippet").style.display = "none";
          }
        }
        
        // Update JSON editor selection
        if (window.appState && window.appState.jsonEditorVisible && window.jsonEditor) {
          updateJsonEditorSelection(info);
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
          // Make sure snippet is visible
          document.getElementById("glbTransformSnippet").style.display = "block";
        }
      }
    }
    
    // Special handling for ground movement
    if (window.selectedComponent.name === "ground") {
      // Ensure ground only moves in Y axis
      let groundPos = window.selectedComponent.position;
      window.selectedComponent.position = new BABYLON.Vector3(0, groundPos.y, 0);
    }
    
    // Update JSON Editor if visible
    if (window.appState && window.appState.jsonEditorVisible && window.jsonEditor) {
      updateJsonEditor();
    }
  }
});

// Add double-click handler for editing components
window.canvas.addEventListener("dblclick", function (evt) {
  // Only handle double-click for left mouse button
  if (evt.button !== 0) return;
  
  const pickResult = scene.pick(scene.pointerX, scene.pointerY);
  if (pickResult.hit) {
    const info = getMetadata(pickResult.pickedMesh);
    if (info && info.metadata) {
      // Set as selected if not already
      if (window.selectedComponent !== info.mesh) {
        if (window.selectedComponent) {
          clearHighlight(window.selectedComponent);
        }
        window.selectedComponent = info.mesh;
        setColorLightPink(window.selectedComponent);
        
        // Reset gizmo to full movement capabilities for non-ground objects
        if (window.selectedComponent.name !== "ground" && gizmoManager.gizmos.positionGizmo) {
          gizmoManager.gizmos.positionGizmo.xGizmo.isEnabled = true;
          gizmoManager.gizmos.positionGizmo.yGizmo.isEnabled = true;
          gizmoManager.gizmos.positionGizmo.zGizmo.isEnabled = true;
        } else if (window.selectedComponent.name === "ground") {
          // Apply ground restrictions
          enforceGroundMovementRestrictions();
        }
        
        const compName = info.metadata?.data?.name 
          || (info.metadata?.type === "glb" ? "GLB: " + window.lastLoadedGLBName : "Unnamed");
        updateSelectedNameDisplay(compName);
        
        // Update JSON editor selection
        if (window.appState && window.appState.jsonEditorVisible && window.jsonEditor) {
          updateJsonEditorSelection(info);
        }
      }
      
      // Open edit modal based on component type
      if (info.metadata.type === "lifting_surface") {
        window.editingType = "lifting_surface";
        window.editingObject = info.metadata.data;
        fillLiftingSurfaceModal(window.editingObject);
      } else if (info.metadata.type === "fuselage") {
        window.editingType = "fuselage";
        window.editingObject = info.metadata.data;
        fillFuselageModal(window.editingObject);
      } else if (info.metadata.type === "glb") {
        window.editingType = "glb";
        window.editingObject = info.metadata.data;
        fillGLBModal();
        // Make sure snippet is visible
        document.getElementById("glbTransformSnippet").style.display = "block";
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
      // Make sure snippet is visible
      document.getElementById("glbTransformSnippet").style.display = "block";
    }
  }
  
  // If ground is selected and being dragged, ensure it only moves vertically
  if (window.isDraggingGizmo && 
      window.selectedComponent && 
      window.selectedComponent.name === "ground") {
    // Force ground position to stay at (0,y,0)
    let groundPos = window.selectedComponent.position;
    window.selectedComponent.position = new BABYLON.Vector3(0, groundPos.y, 0);
  }
});

/**
 * Helper function to update JSON editor with current aircraft data
 */
function updateJsonEditor() {
  if (window.jsonEditor) {
    window.jsonEditor.update(window.aircraftData);
  }
}

/**
 * Helper function to update JSON editor selection based on component
 */
function updateJsonEditorSelection(info) {
  if (!window.jsonEditor) return;
  
  if (!info) {
    // Deselection - reset to root
    window.jsonEditor.setSelection({});
    return;
  }
  
  if (info.metadata.type === "lifting_surface") {
    const idx = window.aircraftData.lifting_surfaces.indexOf(info.metadata.data);
    if (idx >= 0) {
      window.jsonEditor.setSelection({path: ['lifting_surfaces', idx]});
      window.jsonEditor.expandAll();
    }
  } else if (info.metadata.type === "fuselage") {
    const idx = window.aircraftData.fuselages.indexOf(info.metadata.data);
    if (idx >= 0) {
      window.jsonEditor.setSelection({path: ['fuselages', idx]});
      window.jsonEditor.expandAll();
    }
  } else if (info.metadata.type === "glb") {
    // GLB model doesn't have direct JSON representation
    window.jsonEditor.setSelection({});
  }
}