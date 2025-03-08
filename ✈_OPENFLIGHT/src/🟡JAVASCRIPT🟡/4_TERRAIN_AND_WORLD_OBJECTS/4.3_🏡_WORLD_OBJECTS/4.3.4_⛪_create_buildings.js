/**
 * Creates various buildings in the scene using the createFlexibleHouse function.
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.ShadowGenerator} shadowGenerator
 */
function create_buildings(scene, shadowGenerator) {
  // Pre-create dynamic text textures
  const UEM_AERO = createCustomTextTexture(scene, {
    width: 782,
    height: 154,
    text: "I ❤ UEM AEROSPACE ",
    backgroundColor: "#f5f2eb",
    textColor: "#d3e3f0",
    font: "bold 60px Arial"
  });
  
  const WC_text = createCustomTextTexture(scene, {
    width: 128,
    height: 128,
    text: "🚾",
    backgroundColor: "#f5f2eb",
    textColor: "#064b80",
    font: "bold 60px Arial"
  });

  // Configuration object for buildings
  const buildingsConfig = {
    hangar: {
      short: 20,
      long: 48,
      height: 9,
      roofHeight: 3,
      position: new BABYLON.Vector3(60, 12, -60),
      rotationY_DEG: 3.14,
      boxColor: "#ffe5b4",
      roofColor: "#d14e2a",
      roofOverhang: 0.5,
      proceduralTexture: UEM_AERO, // apply texture
      meshesToTexture: ["houseBody"]
    },
    WC_house: {
      short: 4,
      long: 6,
      height: 2.5,
      roofHeight: 2,
      position: new BABYLON.Vector3(-550, 6.73, -718),
      rotationY_DEG: 3.14,
      boxColor: "#ffe5b4",
      roofColor: "#c24e10",
      roofOverhang: 0.0,
      proceduralTexture: WC_text,
      meshesToTexture: ["houseBody"]
    },
    cottage1: {
      short: 8,
      long: 17,
      height: 4,
      roofHeight: 3,
      position: new BABYLON.Vector3(-2231, 7.5, 336),
      rotationY_DEG: 3.0,
      boxColor: "#ffe5b4",
      roofColor: "#c24e10"
    },
    cottage2: {
      short: 9,
      long: 17,
      height: 4,
      roofHeight: 3,
      position: new BABYLON.Vector3(-617, 7.8, 326),
      rotationY_DEG: 2.0,
      boxColor: "#ffe5b4",
      roofColor: "#c24e10"
    },
    cottage3: {
      short: 8,
      long: 15,
      height: 4,
      roofHeight: 4,
      position: new BABYLON.Vector3(-632, 6.4, 367),
      rotationY_DEG: 2.3,
      boxColor: "#ffe5b4",
      roofColor: "#c24e10"
    },
    bridge: {
      short: 6,
      long: 150,
      height: 3,
      roofHeight: -1,
      position: new BABYLON.Vector3(-2491, 0, 199),
      rotationY_DEG: 3.2,
      boxColor: "#853d10",
      roofColor: "#a39e93",
      roofOverhang: 2.0
    },
    little_tower: {
      short: 4,
      long: 4,
      height: 15,
      roofHeight: 3,
      position: new BABYLON.Vector3(-858, 8.8, -2145),
      boxColor: "#ffe5b4",
      roofColor: "#c24e10"
    },
    little_tower_house: {
      short: 8,
      long: 17,
      height: 5,
      roofHeight: 3,
      position: new BABYLON.Vector3(-858, 8.8, -2153),
      boxColor: "#ffe5b4",
      roofColor: "#c24e10"
    },
    central_body_reyes: {
      short: 6,
      long: 13,
      height: 4,
      roofHeight: 1.5,
      position: new BABYLON.Vector3(1234, 11.0, 1484),
      rotationY_DEG: 0,
      boxColor: "#ffffff",
      roofColor: "#c24e10"
    },
    aft_body_reyes: {
      short: 6,
      long: 7,
      height: 6,
      roofHeight: 1.5,
      position: new BABYLON.Vector3(1234, 11.0, 1474),
      rotationY_DEG: 0,
      boxColor: "#ffffff",
      roofColor: "#c24e10",
      force_gable: true
    },
    side_body_reyes: {
      short: 4,
      long: 6,
      height: 5,
      roofHeight: 1,
      position: new BABYLON.Vector3(1230, 11, 1475),
      rotationY_DEG: 90,
      boxColor: "#ffffff",
      roofColor: "#c24e10",
      force_gable: true
    },
    tower_reyes: {
      short: 1.5,
      long: 1.5,
      height: 6,
      roofHeight: 2,
      position: new BABYLON.Vector3(1231, 11, 1489.7),
      rotationY_DEG: 0,
      boxColor: "#ffffff",
      roofColor: "#ffffff",
      force_gable: false
    }
  };

  // Create each building
  for (const name in buildingsConfig) {
    createFlexibleHouse(scene, shadowGenerator, buildingsConfig[name]);
  }

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


