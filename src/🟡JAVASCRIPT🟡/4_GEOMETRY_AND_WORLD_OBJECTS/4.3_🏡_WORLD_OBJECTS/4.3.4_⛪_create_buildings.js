


function     create_buildings(scene, shadowGenerator) {
    
    const hangar =  createFlexibleHouse(scene, shadowGenerator, {
        short: 40,
        long: 40,
        height: 15,
        roofHeight: 20,
        boxColor: "#ffe5b4",
        roofColor: "#aa0000", // nice red roof
        position: new BABYLON.Vector3(0, 15, 0),
        rotationY: 0,
        roofOverhang: 10.3
      })


      const myHouse =  createFlexibleHouse(scene, shadowGenerator, {
        short: 40,
        long: 40,
        height: 15,
        roofHeight: 20,
        boxColor: new BABYLON.Color3(0.95, 0.95, 0.9),
        roofColor: new BABYLON.Color3(0.99, 0.1, 0.1),
        position: new BABYLON.Vector3(-435, 12, 572),
        bodyWidth: 15,
        rotationY: 0,
        roofOverhang: 0.3
      })


      const cottage =  createFlexibleHouse(scene, shadowGenerator, {
        short: 40,
        long: 90,
        height: 15,
        roofHeight: 20,
        boxColor: new BABYLON.Color3(0.95, 0.95, 0.9),
        roofColor: new BABYLON.Color3(0.99, 0.1, 0.1),
        position: new BABYLON.Vector3(-2231, 8.5, 336),
        bodyWidth: 15,
        rotationY: 0,
        roofOverhang: 0.3
      })

    }