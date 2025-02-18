// js/interaction.js

var pointerDownPos = null;

scene.onPointerObservable.add(function(pointerInfo) {
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
    pointerDownPos = { x: pointerInfo.event.clientX, y: pointerInfo.event.clientY };
  } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
    const dx = pointerInfo.event.clientX - pointerDownPos.x;
    const dy = pointerInfo.event.clientY - pointerDownPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isClick = dist < 5;
    pointerDownPos = null;
    
    if (pointerInfo.event.button === 2) { // right-click
      if (pointerInfo.pickInfo.hit) {
        camera.target = pointerInfo.pickInfo.pickedPoint;
        if (pointerInfo.pickInfo.pickedMesh && pointerInfo.pickInfo.pickedMesh.name === "ground") {
          clearSelectedNameDisplay();
          updateSelectedNameDisplay("Ground");
        }
      }
      return;
    }
    
    if (!isClick) return;
    
    const pickInfo = pointerInfo.pickInfo;
    if (!pickInfo.hit || (pickInfo.hit && pickInfo.pickedMesh.name === "ground")) {
      if (window.selectedComponent) {
        revertColor(window.selectedComponent);
        gizmoManager.attachToMesh(null);
        window.selectedComponent = null;
      }
      clearSelectedNameDisplay();
      if (pickInfo.hit && pickInfo.pickedMesh.name === "ground") {
        updateSelectedNameDisplay("Ground");
      }
      return;
    }
    
    const info = getMetadata(pickInfo.pickedMesh);
    if (info) {
      if (window.selectedComponent && window.selectedComponent === info.mesh) return;
      if (window.selectedComponent && window.selectedComponent !== info.mesh) {
        revertColor(window.selectedComponent);
      }
      window.selectedComponent = info.mesh;
      setColorLightPink(window.selectedComponent);
      gizmoManager.attachToMesh(window.selectedComponent);
      updateSelectedNameDisplay(info.metadata.data.name || "Unnamed");
    }
  }
});

// When pointer is released, update the component’s data based on its new position.
scene.onPointerObservable.add(function(pointerInfo) {
  if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERUP) {
    if (!window.selectedComponent) return;
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
    }
  }
});
