/**
 * Creates and returns a wind turbine.
 * 
 * The turbine consists of:
 * 1. A tapered tower (cylinder) whose base diameter = 0.1×height and top diameter = 0.03×height.
 * 2. A nacelle assembly atop the tower consisting of a box and a cone.
 *    - The box has length = 0.1×height (along x) and a square cross–section (width = depth = 0.045×height).
 *    - The cone (height = 0.05×height, base diameter = 0.045×height) is attached flush to the
 *      small (right) face of the box.
 * 3. A three–bladed rotor (propeller) mounted at the cone’s wide base.
 *    - The rotor’s tip–to–tip diameter is 1.2×height.
 *    - Each blade is built as a trapezoidal ribbon whose geometry is defined directly in the rotor’s
 *      local coordinate system so that it lies in the yz–plane (with x = 0). In other words, its long axis
 *      (from the midpoint of its base edge to the midpoint of its tip edge) runs along z.
 *    - Then each blade is twisted by 87° about its long (z)–axis so that its flat (airfoil) face is correctly oriented.
 *      (Also, by defining the geometry so that the blade’s base edge has its midpoint at (0,0,0), that point
 *      coincides with the rotor pivot.)
 *    - Three such blades are arranged by rotating them about the rotor pivot’s x–axis by 0°, 120°, and 240°.
 * 
 * Additionally, the entire nacelle assembly is rotated about the y–axis by orientationAngle (degrees)
 * to align the turbine with the wind, and the rotor spins at rotationalSpeed (in rpm).
 * 
 * Each mesh is set to receive shadows and, if a shadowGenerator is provided, added as a shadow caster.
 * 
 * @param {object} params - The parameters object.
 * @param {number} [params.baseX=0] - X coordinate of the turbine’s base.
 * @param {number} [params.baseY=0] - Y coordinate of the turbine’s base.
 * @param {number} [params.baseZ=0] - Z coordinate of the turbine’s base.
 * @param {number} [params.height=100] - Overall height of the tower.
 * @param {BABYLON.Color3} [params.color=new BABYLON.Color3(0.7, 0.7, 0.7)] - Color for the tower, box, and cone.
 * @param {number} [params.rotationalSpeed=15] - Rotor speed in rpm.
 * @param {number} [params.orientationAngle=0] - Rotation (in degrees) of the nacelle assembly about y.
 * @param {BABYLON.Scene} params.scene - The Babylon.js scene.
 * @param {BABYLON.ShadowGenerator} [params.shadowGenerator=null] - (Optional) A shadow generator.
 * @returns {BABYLON.TransformNode} The parent node containing the complete wind turbine.
 */
function createWindTurbine({
  baseX = 0,
  baseY = 0,
  baseZ = 0,
  height = 100,
  color = new BABYLON.Color3(0.9, 0.9, 0.9),
  rotationalSpeed = 15,
  orientationAngle = 0,
  scene,
  shadowGenerator = null
} = {}) {
  if (!scene) {
    throw new Error("A valid Babylon.js scene must be provided to createWindTurbine.");
  }

  // Create the parent node for the turbine at the base coordinates.
  const turbine = new BABYLON.TransformNode("windTurbine", scene);
  turbine.position = new BABYLON.Vector3(baseX, baseY, baseZ);

  // --- 1. Tower ---
  const tower = BABYLON.MeshBuilder.CreateCylinder("tower", {
    height: height,
    diameterBottom: 0.1 * height,
    diameterTop: 0.03 * height,
    tessellation: 6
  }, scene);
  tower.position = new BABYLON.Vector3(0, height / 2, 0);
  tower.receiveShadows = false;
  if (shadowGenerator) {
    shadowGenerator.addShadowCaster(tower);
  }
  const towerMat = new BABYLON.StandardMaterial("towerMat", scene);
  towerMat.diffuseColor = color;
  tower.material = towerMat;
  tower.parent = turbine;

  // --- 2. Nacelle Assembly (Box + Cone + Rotor) ---
  const nacelleAssembly = new BABYLON.TransformNode("nacelleAssembly", scene);
  nacelleAssembly.position = new BABYLON.Vector3(0, height, 0);
  nacelleAssembly.rotation.y = BABYLON.Tools.ToRadians(orientationAngle);
  nacelleAssembly.parent = turbine;

  // 2a. Nacelle Box
  const boxLength = 0.1 * height;
  const boxSize = 0.045 * height;
  const nacelleBox = BABYLON.MeshBuilder.CreateBox("nacelleBox", {
    width: boxLength,
    height: boxSize,
    depth: boxSize
  }, scene);
  nacelleBox.position = new BABYLON.Vector3(0, boxSize / 2, 0);
  nacelleBox.receiveShadows = false;
  if (shadowGenerator) {
    shadowGenerator.addShadowCaster(nacelleBox);
  }
  const boxMat = new BABYLON.StandardMaterial("boxMat", scene);
  boxMat.diffuseColor = color;
  nacelleBox.material = boxMat;
  nacelleBox.parent = nacelleAssembly;

  // 2b. Nacelle Cone (attached to the "small" face of the box)
  const coneHeight = 0.05 * height;
  const coneDiameter = boxSize;
  const nacelleCone = BABYLON.MeshBuilder.CreateCylinder("nacelleCone", {
    height: coneHeight,
    diameterBottom: coneDiameter,
    diameterTop: 0,
    tessellation: 6
  }, scene);
  nacelleCone.rotation.z = BABYLON.Tools.ToRadians(-90);
  nacelleCone.position = new BABYLON.Vector3(boxLength / 2 + coneHeight / 2, boxSize / 2, 0);
  nacelleCone.receiveShadows = false;
  if (shadowGenerator) {
    shadowGenerator.addShadowCaster(nacelleCone);
  }
  const coneMat = new BABYLON.StandardMaterial("coneMat", scene);
  coneMat.diffuseColor = color;
  nacelleCone.material = coneMat;
  nacelleCone.parent = nacelleAssembly;

  // --- 3. Rotor (Three-Blade Propeller) ---
  const rotorDiameter = 1.2 * height;
  const rotorBladeLength = rotorDiameter / 2;
  const bottomWidth = 0.1 * rotorBladeLength;
  const topWidth = 0.04 * rotorBladeLength;

  // Place the rotor pivot at the center of the cone’s wide base (i.e. the center of the box’s right face).
  const rotorPivot = new BABYLON.TransformNode("rotorPivot", scene);
  rotorPivot.position = new BABYLON.Vector3(boxLength / 2, boxSize / 2, 0);
  rotorPivot.parent = nacelleAssembly;

  // --- Create one blade ---
  // Define the blade geometry in the yz–plane (x = 0) so its long mid–axis is along z.
  const L = rotorBladeLength;
  const bladeBottomPath = [
    new BABYLON.Vector3(0, -bottomWidth / 2, 0),
    new BABYLON.Vector3(0, bottomWidth / 2, 0)
  ];
  const bladeTopPath = [
    new BABYLON.Vector3(0, -topWidth / 2, L),
    new BABYLON.Vector3(0, topWidth / 2, L)
  ];
  const bladePaths = [bladeBottomPath, bladeTopPath];
  let blade1 = BABYLON.MeshBuilder.CreateRibbon("blade1", {
    pathArray: bladePaths,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE
  }, scene);
  
  // Set the blade to receive shadows and add it as a shadow caster.
  blade1.receiveShadows = false;
  if (shadowGenerator) {
    shadowGenerator.addShadowCaster(blade1);
  }
  
  // Twist the blade by 87° about its long (z)–axis.
  blade1.rotation.z = BABYLON.Tools.ToRadians(4);
  
  // Parent the blade to the rotor pivot and ensure its base (midpoint of its bottom edge) is at the pivot.
  blade1.parent = rotorPivot;
  blade1.position = BABYLON.Vector3.Zero();
  
  // Create a white material for the blades.
  const bladeMat = new BABYLON.StandardMaterial("bladeMat", scene);
  bladeMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  blade1.material = bladeMat;
  
  // Clone the blade for the other two blades and rotate them about the rotor pivot's x–axis.
  const blade2 = blade1.clone("blade2");
  blade2.rotation.x = BABYLON.Tools.ToRadians(120);
  blade2.receiveShadows = false;
  if (shadowGenerator) {
    shadowGenerator.addShadowCaster(blade2);
  }
  blade2.material = bladeMat;
  
  const blade3 = blade1.clone("blade3");
  blade3.rotation.x = BABYLON.Tools.ToRadians(240);
  blade3.receiveShadows = false;
  if (shadowGenerator) {
    shadowGenerator.addShadowCaster(blade3);
  }
  blade3.material = bladeMat;
  
  // --- Animate the Rotor ---
  const rotorRps = rotationalSpeed / 60;
  const rotorAngularSpeed = rotorRps * 2 * Math.PI;
  if (scene.onBeforeRenderObservable) {
    scene.onBeforeRenderObservable.add(() => {
      const deltaTime = scene.getEngine().getDeltaTime() / 1000;
      rotorPivot.rotation.x += rotorAngularSpeed * deltaTime;
    });
  } else {
    console.warn("scene.onBeforeRenderObservable is undefined; rotor animation will not run.");
  }
  
  return turbine;
}



function create_wind_turbines(scene, shadowGenerator) {

// Create a wind turbine with base at (0,0,0), tower height 120,
// light gray color, rotor speed 12 rpm, and nacelle oriented 45° from north.
const turbine1 = createWindTurbine({
  baseX: 1152,
  baseY: 234,
  baseZ: 785,
  height: 30,
  color: new BABYLON.Color3(0.8, 0.8, 0.8),
  rotationalSpeed: 12,
  orientationAngle: 93,
  scene: scene,
  shadowGenerator: shadowGenerator  // Pass your valid shadow generator here.
});


const turbine2 = createWindTurbine({
  baseX: 1222,
  baseY: 249,
  baseZ: 708,
  height: 30,
  color: new BABYLON.Color3(0.8, 0.8, 0.8),
  rotationalSpeed: 10,
  orientationAngle: 95,
  scene: scene,
  shadowGenerator: shadowGenerator  // Pass your valid shadow generator here.
});

const turbine3 = createWindTurbine({
  baseX: 1307,
  baseY: 261,
  baseZ: 639,
  height: 30,
  color: new BABYLON.Color3(0.8, 0.8, 0.8),
  rotationalSpeed: 13,
  orientationAngle: 92,
  scene: scene,
  shadowGenerator: shadowGenerator  // Pass your valid shadow generator here.
});


const turbine4 = createWindTurbine({
  baseX: 1473,
  baseY: 271,
  baseZ: 590,
  height: 30,
  color: new BABYLON.Color3(0.8, 0.8, 0.8),
  rotationalSpeed: 12,
  orientationAngle: 95,
  scene: scene,
  shadowGenerator: shadowGenerator  // Pass your valid shadow generator here.
});




}


  