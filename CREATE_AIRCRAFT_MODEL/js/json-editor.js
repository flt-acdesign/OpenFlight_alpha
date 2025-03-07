// js/json-editor.js

// We'll store the JSONEditor instance globally so other code can access it.
window.jsonEditor = null;

// This flag helps us avoid re-rendering the aircraft when JSONEditor first initializes.
window.jsonEditorInitializing = false;

/**
 * Runs once the DOM is ready. Sets up the JSON Editor in 'tree' mode,
 * plus the necessary event listeners for toggling and applying changes.
 */
document.addEventListener('DOMContentLoaded', function() {
  // The container where the editor should be rendered
  const container = document.getElementById('jsonEditor');
  
  // Define the JSONEditor configuration:
  const options = {
    // Start in 'tree' mode, but also allow 'code', 'form', and 'text' modes:
    mode: 'tree',
    modes: ['tree', 'code', 'form', 'text'],

    // Whenever JSON data changes (user edits or adds a property), re-render the 3D model
    onChangeJSON: function(newJson) {
      // Only update if we're not in the initial setup phase
      if (window.jsonEditorInitializing) return;
      
      // Overwrite the existing global aircraftData with the new JSON from the editor
      window.aircraftData = newJson;
      
      // Re-render the aircraft geometry with the new parameters
      renderAircraft();

      // If your code includes ground-axis lines or special overlays,
      // ensure they're properly re-created after re-render:
      if (typeof recreateAxisProjectionsIfNeeded === 'function') {
        recreateAxisProjectionsIfNeeded();
      }
    },

    // onEditable decides whether a given node is editable or read-only
    // For maximum freedom (i.e., user can edit everything), just always return true:
    onEditable: function(node) {
      return true; 
    }
  };

  // Prevent triggering geometry updates during first set() call
  window.jsonEditorInitializing = true;

  // Create the editor and load current aircraft data
  window.jsonEditor = new JSONEditor(container, options);
  window.jsonEditor.set(window.aircraftData);

  // Done initializing
  window.jsonEditorInitializing = false;

  // Set up show/hide/toggle logic for the JSON Editor panel
  setupJsonEditorListeners();
});

/**
 * Set up event listeners for the JSON editor panel's open/close/apply buttons.
 */
function setupJsonEditorListeners() {
  const toggleBtn = document.getElementById('toggleJsonEditorBtn');
  const closeBtn  = document.getElementById('closeJsonEditorBtn');
  const applyBtn  = document.getElementById('applyJsonChangesBtn');

  // Toggle button: Show or hide the entire JSON editor panel
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      toggleJsonEditor();
    });
  }

  // Close button: Hide the JSON editor panel
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      hideJsonEditor();
    });
  }

  // Optional "Apply Changes" button:
  // Even though onChangeJSON fires automatically, 
  // you may want a final "Apply" step. It's up to you.
  if (applyBtn) {
    applyBtn.addEventListener('click', function() {
      applyJsonChanges();
    });
  }
}

/**
 * Toggle the JSON editor panel visibility by adding/removing
 * the 'show-json-editor' class on <body>.
 */
function toggleJsonEditor() {
  const body = document.body;
  if (body.classList.contains('show-json-editor')) {
    hideJsonEditor();
  } else {
    showJsonEditor();
  }
}

/**
 * Show the JSON editor panel (slide it in from the left).
 */
function showJsonEditor() {
  document.body.classList.add('show-json-editor');
  window.appState.jsonEditorVisible = true;

  // Refresh the editor to ensure we see the latest data
  if (window.jsonEditor) {
    window.jsonEditor.update(window.aircraftData);
  }
}

/**
 * Hide the JSON editor panel (slide it out to the left).
 */
function hideJsonEditor() {
  document.body.classList.remove('show-json-editor');
  window.appState.jsonEditorVisible = false;
}

/**
 * If you want an "Apply Changes" button to do a final confirm,
 * you can re-fetch the JSON from the editor and apply it again.
 * Typically onChangeJSON is enough, but here is the pattern:
 */
function applyJsonChanges() {
  try {
    // Get the current JSON from the editor
    const updatedJson = window.jsonEditor.get();

    // Update the global data and re-render
    window.aircraftData = updatedJson;
    renderAircraft();
    
    if (typeof recreateAxisProjectionsIfNeeded === 'function') {
      recreateAxisProjectionsIfNeeded();
    }

    alert('Changes applied successfully!');
  } catch (err) {
    alert('Error applying changes: ' + err.message);
    console.error(err);
  }
}

/**
 * Helper to force reloading the JSON Editor contents with the current window.aircraftData
 * (if the user might have changed data from outside the editor).
 */
function updateJsonEditor() {
  if (window.jsonEditor && window.appState.jsonEditorVisible) {
    window.jsonEditorInitializing = true;
    window.jsonEditor.update(window.aircraftData);
    window.jsonEditorInitializing = false;
  }
}
