// js/load_glb_file.js

///////////////////////////////
//  GLB Loading Functions    //
///////////////////////////////

async function loadGLBFile(file) {
  // 1) Show "Loading 3D Model..." overlay
  const loadingText = document.getElementById("loadingText");
  loadingText.style.display = "block";
  loadingText.textContent = "Loading 3D Model...";

  // 2) If there's a previously loaded GLB model, dispose it first
  if (window.currentGLBModel) {
    window.currentGLBModel.dispose();
    window.currentGLBModel = null;
  }

  try {
    // 3) Import the .glb file
    const result = await BABYLON.SceneLoader.ImportMeshAsync(
      "",    // (rootUrl) - empty since we're passing a File object
      "",    // (sceneFilename) - again empty for local files
      file,  // (files) - actual File object from the <input> element
      scene,
      // Callback for progress
      (evt) => {
        if (evt.lengthComputable) {
          const progress = ((evt.loaded * 100) / evt.total).toFixed();
          loadingText.textContent = `Loading: ${progress}%`;
        }
      }
    );

    // 4) The result.meshes array contains all imported meshes
    //    Let's just pick the first to do a bounding‐box calc
    const model = result.meshes[0];
    window.currentGLBModel = model;

    // 5) Create or reuse a glbRoot TransformNode to hold them
    if (!window.glbRoot) {
      window.glbRoot = new BABYLON.TransformNode("glbRoot", scene);
      window.glbRoot.metadata = { type: "glb", data: {} };
      window.glbRoot.isPickable = false;
    }

    // 6) Parent all imported meshes under glbRoot & make pickable
    result.meshes.forEach(mesh => {
      mesh.setParent(window.glbRoot);
      mesh.isPickable = true;
    });

    // 7) [Optional] Auto-center & auto-scale the model
    const boundingBox = model.getHierarchyBoundingVectors();
    const modelSize = boundingBox.max.subtract(boundingBox.min);
    const modelCenter = boundingBox.min.add(modelSize.scale(0.5));
    const scaleFactor = 5 / Math.max(modelSize.x, modelSize.y, modelSize.z);
    model.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
    model.position = new BABYLON.Vector3(
      -modelCenter.x * scaleFactor,
      -modelCenter.y * scaleFactor,
      -modelCenter.z * scaleFactor
    );


    
// 8) [Optional] Adjust materials for imported GLB meshes,
//    but skip ground, sky sphere, origin box, and labels.
scene.meshes.forEach(mesh => {
  if (
    mesh.material &&
    mesh.name !== "ground" &&
    mesh.name !== CAMERA_SPHERE_NAME &&
    mesh.name !== "originBox" &&
    !mesh.name.startsWith("label_")  // Skip labels
  ) {
    mesh.material.transparencyMode = BABYLON.Material.MATERIAL_OPAQUE;
    mesh.material.backFaceCulling = false;
  }
});




    // 9) Force all new meshes (except ground, sky sphere, axis) to cast shadows
    scene.meshes.forEach((mesh) => {
      if (
        mesh.name !== "ground" &&
        mesh.name !== CAMERA_SPHERE_NAME &&
        !mesh.name.startsWith("axis")
      ) {
        shadowGenerator.addShadowCaster(mesh, true);
      }
    });

  } catch (error) {
    console.error("Error loading GLB file:", error);
    alert("Error loading 3D model. Please try another file.");
  }

  // 10) Hide loading overlay
  loadingText.style.display = "none";
}
