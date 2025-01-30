// Define possible options for each attribute
const GRAPHIC_OPTIONS = {
    ground: ['none', 'flat', 'island'],
    trees: ['none', 'few', 'many'],
    sky: ['flat', 'medium', 'full']
  };
  
  // Parent structure with complexity levels
  const graphic_settings = {
    low: {
      ground: GRAPHIC_OPTIONS.ground[0],
      trees: GRAPHIC_OPTIONS.trees[0],
      sky: GRAPHIC_OPTIONS.sky[0]
    },
    medium: {
      ground: GRAPHIC_OPTIONS.ground[1],
      trees: GRAPHIC_OPTIONS.trees[1],
      sky: GRAPHIC_OPTIONS.sky[1]
    },
    high: {
      ground: GRAPHIC_OPTIONS.ground[2],
      trees: GRAPHIC_OPTIONS.trees[2],
      sky: GRAPHIC_OPTIONS.sky[2]
    }
  };
  
  // Optional helper function to get settings
  function getGraphicSettings(complexity) {
    return graphic_settings[complexity.toLowerCase()] || graphic_settings.low;
  }
  



// Accessing medium complexity settings
//console.log(graphic_settings.medium); 
// Returns: { ground: 'flat', trees: 'few', sky: 'medium' }


// Using the helper function
const current_graphic_settings = getGraphicSettings('high');
// Returns high complexity configuration


