
/**
 * Creates a Babylon.js DynamicTexture containing centered text on a background.
 * 
 * @param {BABYLON.Scene} scene
 * @param {Object} options
 * @param {number} [options.width=512]  - Texture width in pixels.
 * @param {number} [options.height=256] - Texture height in pixels.
 * @param {string} [options.text=""] - The text to draw.
 * @param {string} [options.backgroundColor="#FFFFFF"] - Background color.
 * @param {string} [options.textColor="#000000"] - Text color.
 * @param {string} [options.font="bold 48px Arial"] - Font definition.
 * @returns {BABYLON.DynamicTexture} The generated dynamic texture.
 */
function createCustomTextTexture(
  scene,
  {
    width = 512,
    height = 256,
    text = "",
    backgroundColor = "#FFFFFF",
    textColor = "#000000",
    font = "bold 48px Arial"
  } = {}
) {
  const dynTexture = new BABYLON.DynamicTexture("dynamicTextTex", { width, height }, scene, false);
  const ctx = dynTexture.getContext();

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Text style
  ctx.font = font;
  ctx.fillStyle = textColor;

  // Measure to center text horizontally
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;

  // Parse font size from "bold 48px Arial"
  let fontSize = 48; // fallback
  const matches = font.match(/(\d+)px/);
  if (matches && matches[1]) {
    fontSize = parseInt(matches[1]);
  }

  // Approx center (horizontal + vertical)
  const centerX = (width - textWidth) / 2;
  const centerY = (height + fontSize / 2) / 2;
  ctx.fillText(text, centerX, centerY);

  dynTexture.update();
  return dynTexture;
}


/**
 * Creates a "house" or "building" with a box body and optional pyramid/gable roof.
 * Allows applying a dynamic/procedural texture to one face.
 * 
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.ShadowGenerator} shadowGenerator
 * @param {Object} options
 * @returns {Object} Contains references to created meshes.
 */
function createFlexibleHouse(scene, shadowGenerator, options = {}) {
  // Default parameters
  const defaults = {
    short: 4, 
    long: 6, 
    height: 3,
    roofHeight: 2,
    roofOverhang: 0.3,
    boxColor: new BABYLON.Color3(0.95, 0.95, 0.9),
    roofColor: new BABYLON.Color3(0.2, 0.1, 0.1),
    position: new BABYLON.Vector3(0, 0, 0),
    rotationY_DEG: 0,             // degrees
    force_gable: false,
    // Dynamic texture:
    proceduralTexture: null,
    faceToTexture: 2          // which face index gets the texture (0..5)
  };
  const {
    short,
    long,
    height,
    roofHeight,
    roofOverhang,
    boxColor,
    roofColor,
    position,
    rotationY_DEG,
    force_gable,
    proceduralTexture,
    faceToTexture
  } = { ...defaults, ...options };

  // Parent node
  const houseParent = new BABYLON.TransformNode("houseParent", scene);
  houseParent.position.copyFrom(position);
  houseParent.rotation.y = rotationY_DEG; // if user passes radians or use: (rotationY_DEG * Math.PI / 180)

  // Face UV setup
  const faceUV = [];
  for (let i = 0; i < 6; i++) {
    if (proceduralTexture && i === faceToTexture) {
      faceUV.push(new BABYLON.Vector4(0, 0, 1, 1)); // full texture
    } else {
      faceUV.push(new BABYLON.Vector4(0, 0, 0, 0)); // no texture
    }
  }

  // Body mesh
  const bodyMesh = BABYLON.MeshBuilder.CreateBox("houseBody", {
    width: short,
    depth: long,
    height: height,
    faceUV: faceUV,
    wrap: true
  }, scene);
  bodyMesh.position.y = height / 2;
  bodyMesh.parent = houseParent;

  // Body material
  const bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
  bodyMat.diffuseColor = (typeof boxColor === "string")
    ? BABYLON.Color3.FromHexString(boxColor)
    : boxColor;
  
  if (proceduralTexture) {
    bodyMat.diffuseTexture = proceduralTexture;
  }
  bodyMesh.material = bodyMat;

  // Roof material
  const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
  roofMat.diffuseColor = (typeof roofColor === "string")
    ? BABYLON.Color3.FromHexString(roofColor)
    : roofColor;
  roofMat.backFaceCulling = false;
  roofMat.twoSidedLighting = true;

  // Decide which roof shape to create: pyramid vs. gable
  let pyramidRoof = null;
  let wedge = null;
  let frontTriangleMesh = null;
  let backTriangleMesh = null;

  const ratio = long / short;
  const usePyramid = (ratio < 2) && !force_gable;

  if (usePyramid) {
    //------------------------------
    //  A) Pyramid Roof
    //------------------------------
    const positions = [
      // side 1
      -short / 2, height, -long / 2,
      0,          height + roofHeight, 0,
      short / 2,  height, -long / 2,
      // side 2
      short / 2,  height, -long / 2,
      0,          height + roofHeight, 0,
      short / 2,  height,  long / 2,
      // side 3
      short / 2,  height,  long / 2,
      0,          height + roofHeight, 0,
      -short / 2, height,  long / 2,
      // side 4
      -short / 2, height,  long / 2,
      0,          height + roofHeight, 0,
      -short / 2, height, -long / 2
    ];

    const indices = [
      0,1,2,  3,4,5,  6,7,8,  9,10,11
    ];

    const vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    const normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    vertexData.normals = normals;

    pyramidRoof = new BABYLON.Mesh("pyramidRoof", scene);
    vertexData.applyToMesh(pyramidRoof);
    pyramidRoof.material = roofMat;
    pyramidRoof.parent = houseParent;

    // Shadow
    shadowGenerator.addShadowCaster(pyramidRoof);

  } else {
    //------------------------------
    //  B) Gable Roof
    //------------------------------
    // Create wedge via extrude
    const roofShape = [
      new BABYLON.Vector3(-short / 2 - roofOverhang, 0, 0),
      new BABYLON.Vector3(0, roofHeight, 0),
      new BABYLON.Vector3(short / 2 + roofOverhang, 0, 0)
    ];
    const roofPath = [
      new BABYLON.Vector3(0, 0, -(long / 2 + roofOverhang)),
      new BABYLON.Vector3(0, 0,  (long / 2 + roofOverhang))
    ];
    wedge = BABYLON.MeshBuilder.ExtrudeShape("gableWedge", {
      shape: roofShape,
      path: roofPath,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    wedge.material = roofMat;
    wedge.parent = houseParent;
    wedge.position.y = height;

    // Helper: single triangle
    const createSingleTriangle = (name, posArray) => {
      const triMesh = new BABYLON.Mesh(name, scene);
      const indices = [0, 1, 2];
      const normals = [];
      BABYLON.VertexData.ComputeNormals(posArray, indices, normals);

      const vertexData = new BABYLON.VertexData();
      vertexData.positions = posArray;
      vertexData.indices = indices;
      vertexData.normals = normals;
      vertexData.applyToMesh(triMesh);

      triMesh.material = roofMat;
      triMesh.parent = houseParent;
      return triMesh;
    };

    // Front capping
    frontTriangleMesh = createSingleTriangle("frontGableTri", [
      -short / 2, height, -long / 2,
       short / 2, height, -long / 2,
       0,         height + roofHeight, -(long / 2 + roofOverhang)
    ]);

    // Back capping
    backTriangleMesh = createSingleTriangle("backGableTri", [
      -short / 2, height,  long / 2,
       short / 2, height,  long / 2,
       0,         height + roofHeight,  (long / 2 + roofOverhang)
    ]);

    // Shadow
    shadowGenerator.addShadowCaster(wedge);
    shadowGenerator.addShadowCaster(frontTriangleMesh);
    shadowGenerator.addShadowCaster(backTriangleMesh);
  }

  // Shadows for the house body
  shadowGenerator.addShadowCaster(bodyMesh);

  // Return references if needed
  return {
    houseParent,
    bodyMesh,
    pyramidRoof,
    wedge,
    frontTriangleMesh,
    backTriangleMesh
  };
}
