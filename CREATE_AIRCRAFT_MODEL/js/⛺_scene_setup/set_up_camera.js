/********************************************
 * FILE: set_up_camera.js
 ********************************************/

function setupCamera() {
    // Create ArcRotateCamera
    window.camera = new BABYLON.ArcRotateCamera(
      "Camera",
      -2.0,  // alpha
      1.2,   // beta
      40,    // radius
      new BABYLON.Vector3(7, 0, 0), // target
      window.scene
    );
  
    camera.fov = 0.647;
    camera.rotation.z = Math.PI / 2;
    camera.attachControl(window.canvas, true);
    camera.upperBetaLimit = Math.PI;
    camera.lowerBetaLimit = 0;
    camera.inertia = 0.9;
    camera.lowerRadiusLimit = 0.2;
    camera.upperRadiusLimit = 1500;
  
    // Dynamically adjust wheel & panning with distance
    camera.onViewMatrixChangedObservable.add(() => {
      const distance = BABYLON.Vector3.Distance(camera.position, camera.target);
      camera.wheelPrecision = 200 / distance;
      camera.panningSensibility = 5000 / distance;
    });
  
    // Middle-click => pivot camera to clicked point
    let originalTarget = camera.target.clone();
    let lastTarget = camera.target.clone();
  
    window.canvas.addEventListener("pointerdown", function (evt) {
      if (evt.button === 1) {
        evt.preventDefault();
        const pickResult = window.scene.pick(window.scene.pointerX, window.scene.pointerY);
        if (pickResult.hit) {
          lastTarget = camera.target.clone();
          smoothTransitionToTarget(pickResult.pickedPoint, camera, window.scene, 0.3);
        }
      }
    });
  
    // Double-click => open edit or revert
    window.canvas.addEventListener("dblclick", function () {
      const pickResult = window.scene.pick(window.scene.pointerX, window.scene.pointerY);
      if (pickResult.hit) {
        const info = getMetadata(pickResult.pickedMesh);
        if (info && window.selectedComponent === info.mesh) {
          openEditModalForSelected();
          return;
        }
      }
      if (!pickResult.hit) {
        smoothTransitionToTarget(lastTarget, camera, window.scene, 0.3);
      }
    });
  
    // Keyboard shortcuts
    window.addEventListener("keydown", function (evt) {
      if (evt.key === "h" || evt.key === "H") {
        smoothTransitionToTarget(lastTarget, camera, window.scene, 0.3);
      } else if (evt.key === "o" || evt.key === "O") {
        smoothTransitionToTarget(originalTarget, camera, window.scene, 0.3);
      }
    });
  }
  