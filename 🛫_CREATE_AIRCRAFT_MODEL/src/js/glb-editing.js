// js/glb-editing.js

/**
 * Fill the GLB model modal with current transform values
 */
function fillGLBModal() {
  if (!window.glbRoot) return;

  // Convert rotations to degrees for display
  const rotX = Math.round(BABYLON.Tools.ToDegrees(window.glbRoot.rotation.x));
  const rotY = Math.round(BABYLON.Tools.ToDegrees(window.glbRoot.rotation.y));
  const rotZ = Math.round(BABYLON.Tools.ToDegrees(window.glbRoot.rotation.z));
  
  // Get positions
  const posX = window.glbRoot.position.x;
  const posY = window.glbRoot.position.y;
  const posZ = window.glbRoot.position.z;
  
  // Get scale (assuming uniform scale)
  const scale = window.glbRoot.scaling.x;

  // Set values in the form
  document.getElementById("glb_scale").value = scale.toFixed(2);
  document.getElementById("glb_rotation_x").value = rotX;
  document.getElementById("glb_rotation_y").value = rotY;
  document.getElementById("glb_rotation_z").value = rotZ;
  document.getElementById("glb_position_x").value = posX.toFixed(2);
  document.getElementById("glb_position_y").value = posY.toFixed(2);
  document.getElementById("glb_position_z").value = posZ.toFixed(2);
  
  // Show the modal
  document.getElementById("glbModal").style.display = "block";
  
  // Update and show the transform snippet
  updateGLBTransformSnippet();
  document.getElementById("glbTransformSnippet").style.display = "block";
}

/**
 * Apply changes from the modal to the GLB model
 */
function applyGLBChanges() {
  if (!window.glbRoot) return;
  
  // Get values from form
  const scale = parseFloat(document.getElementById("glb_scale").value);
  const rotX = parseInt(document.getElementById("glb_rotation_x").value);
  const rotY = parseInt(document.getElementById("glb_rotation_y").value);
  const rotZ = parseInt(document.getElementById("glb_rotation_z").value);
  const posX = parseFloat(document.getElementById("glb_position_x").value);
  const posY = parseFloat(document.getElementById("glb_position_y").value);
  const posZ = parseFloat(document.getElementById("glb_position_z").value);
  
  // Apply to GLB model
  window.glbRoot.scaling = new BABYLON.Vector3(scale, scale, scale);
  window.glbRoot.rotation = new BABYLON.Vector3(
    BABYLON.Tools.ToRadians(rotX),
    BABYLON.Tools.ToRadians(rotY),
    BABYLON.Tools.ToRadians(rotZ)
  );
  window.glbRoot.position = new BABYLON.Vector3(posX, posY, posZ);
  
  // Save values to metadata for persistence
  if (!window.glbRoot.metadata) {
    window.glbRoot.metadata = { type: "glb", data: {} };
  }
  if (!window.glbRoot.metadata.data) {
    window.glbRoot.metadata.data = {};
  }
  window.glbRoot.metadata.data.scale = scale;
  window.glbRoot.metadata.data.rotationDeg = [rotX, rotY, rotZ];
  window.glbRoot.metadata.data.position = [posX, posY, posZ];
  
  // Hide the modal
  document.getElementById("glbModal").style.display = "none";
  
  // Update the transform snippet display
  updateGLBTransformSnippet();
  // Make sure the snippet is visible
  document.getElementById("glbTransformSnippet").style.display = "block";
}

/**
 * Generate a code snippet with the current GLB transform values
 * and make it selectable
 */
function generateGLBSnippet() {
  if (!window.glbRoot) return;
  
  // First make sure we have the latest values
  updateGLBTransformSnippet();
  
  // Show the snippet
  document.getElementById("glbTransformSnippet").style.display = "block";
  
  // Select the text
  const snippetDiv = document.getElementById("glbTransformSnippet");
  if (snippetDiv) {
    const range = document.createRange();
    range.selectNodeContents(snippetDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Inform the user
    alert("Snippet generated and selected. Press Ctrl+C to copy.");
  }
}

/**
 * Creates or updates the snippet in #glbTransformSnippet
 * to reflect the current position, rotation, scale of glbRoot.
 */
function updateGLBTransformSnippet() {
  const snippetDiv = document.getElementById("glbTransformSnippet");
  if (!window.glbRoot || !snippetDiv) {
    if (snippetDiv) snippetDiv.style.display = "none";
    return;
  }

  // Convert rotations to degrees
  const rotX = Math.round(BABYLON.Tools.ToDegrees(window.glbRoot.rotation.x));
  const rotY = Math.round(BABYLON.Tools.ToDegrees(window.glbRoot.rotation.y));
  const rotZ = Math.round(BABYLON.Tools.ToDegrees(window.glbRoot.rotation.z));

  // Positions
  const posX = window.glbRoot.position.x.toFixed(2);
  const posY = window.glbRoot.position.y.toFixed(2);
  const posZ = window.glbRoot.position.z.toFixed(2);

  // Scale (assuming uniform scale)
  const scaleFactor = window.glbRoot.scaling.x.toFixed(2);

  // If no filename is known yet, fallback
  const fileName = window.lastLoadedGLBName || "myModel.glb";

  const snippet = 
`case "${fileName}":
    scaleFactor = ${scaleFactor};
    rotationX   = ${rotX};
    rotationY   = ${rotY};
    rotationZ   = ${rotZ};
    translationX = ${posX};
    translationY = ${posY};
    translationZ = ${posZ};
    break;`;

  snippetDiv.textContent = snippet;
  snippetDiv.style.display = "block";
  
  // Update metadata when snippet is updated
  if (!window.glbRoot.metadata) {
    window.glbRoot.metadata = { type: "glb", data: {} };
  }
  if (!window.glbRoot.metadata.data) {
    window.glbRoot.metadata.data = {};
  }
  
  window.glbRoot.metadata.data.scale = parseFloat(scaleFactor);
  window.glbRoot.metadata.data.rotationDeg = [rotX, rotY, rotZ];
  window.glbRoot.metadata.data.position = [
    parseFloat(posX),
    parseFloat(posY),
    parseFloat(posZ)
  ];
}

// Add event listeners for GLB modal when the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  // GLB Modal event handlers
  const glbModal = document.getElementById("glbModal");
  if (!glbModal) return;
  
  const submitBtn = document.getElementById("glb_submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", function() {
      applyGLBChanges();
    });
  }
  
  const snippetBtn = document.getElementById("glb_generate_snippet");
  if (snippetBtn) {
    snippetBtn.addEventListener("click", function() {
      generateGLBSnippet();
    });
  }
  
  const cancelBtn = document.getElementById("glb_cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function() {
      if (glbModal) {
        glbModal.style.display = "none";
      }
      window.editingType = "";
      window.editingObject = null;
    });
  }
});

// Export functions to global scope
window.fillGLBModal = fillGLBModal;
window.applyGLBChanges = applyGLBChanges;
window.generateGLBSnippet = generateGLBSnippet;
window.updateGLBTransformSnippet = updateGLBTransformSnippet;