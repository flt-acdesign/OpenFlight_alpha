
// Layout and data for buildings




// Create a dynamic texture with a blue background and white text



function create_buildings(scene, shadowGenerator) {





  const UEM_AERO = createCustomTextTexture(scene, {
    width: 782,
    height: 54,
    text: "I ❤ UEM AEROSPACE !",
    backgroundColor: "#f5f2eb",
    textColor: "#d3e3f0",
    font: "bold 60px Arial"
  })
  
  
  const WC_text = createCustomTextTexture(scene, {
    width: 6,
    height: 3,
    text: "🚾",
    backgroundColor: "#f5f2eb",
    textColor: "#064b80",
    font: "bold 60px Arial"
  })
  





// Layout and data for buildings with texture applied to the first wall
const buildingsConfig = {


hangar: {
    short: 20,
    long: 48,
    height: 6,
    roofHeight: 3,
    boxColor: "#ffe5b4",
    roofColor: "#8395a3",
    position: new BABYLON.Vector3(70, 15, -60),
    rotationY: 3.14,
    roofOverhang: 0.5,

    // Apply the texture to the first wall (houseBody)
    proceduralTexture: UEM_AERO,
    meshesToTexture: ["houseBody"]
},


WC_house: {
    short: 4,
    long: 6,
    height: 2.5,
    roofHeight: 2,
    boxColor: "#ffe5b4",
    roofColor: "#c24e10",
    position: new BABYLON.Vector3(-550, 6.73, -718),
    rotationY: 3.14,
    roofOverhang: 0.0,

    // Apply the texture to the first wall (houseBody)
    proceduralTexture: WC_text,
    meshesToTexture: ["houseBody"]
},



cottage: {
  short: 40,
  long: 60,
  height: 25,
  roofHeight: 20,
  boxColor: "#ffe5b4",
  roofColor: "#c24e10",
  position: new BABYLON.Vector3(-2231, 8.5, 336),
  rotationY: 3.14,
  roofOverhang: 0.0,

  // Apply the texture to the first wall (houseBody)
  proceduralTexture: WC_text,
  meshesToTexture: ["houseBody"]
},






little_tower: {
  short: 4,
  long: 4,
  height: 15,
  roofHeight: 3,
  boxColor: "#ffe5b4",
  roofColor: "#c24e10",
  position: new BABYLON.Vector3(-858, 8.8, -2145),
  //position: new BABYLON.Vector3(-88, 18.8, -45),  rotationY: 3.14,
  roofOverhang: 0.0,

  // Apply the texture to the first wall (houseBody)
  proceduralTexture: null,
  meshesToTexture: ["houseBody"]
}, 

little_tower_house: {
  short: 8,
  long: 17,
  height: 5,
  roofHeight: 3,
  boxColor: "#ffe5b4",
  roofColor: "#c24e10",
  position: new BABYLON.Vector3(-858, 8.8, -2153),
  //position: new BABYLON.Vector3(-88, 18.8, -45),  rotationY: 3.14,
  roofOverhang: 0.0,

  // Apply the texture to the first wall (houseBody)
  proceduralTexture: null,
  meshesToTexture: ["houseBody"]
}







} // end of list of buildings









  // Validate required parameters
  if (!scene || !shadowGenerator) {
      throw new Error("Scene and shadowGenerator are required");
  }
  
  // Return empty object if no config provided
  if (!buildingsConfig) {
      console.warn("No building configurations provided");
      return {};
  }
  
  const buildings = {};
  
  // Create each building based on the provided configuration
  for (const [buildingName, params] of Object.entries(buildingsConfig)) {
      buildings[buildingName] = createFlexibleHouse(scene, shadowGenerator, params);
  }
  
  return buildings;
}


