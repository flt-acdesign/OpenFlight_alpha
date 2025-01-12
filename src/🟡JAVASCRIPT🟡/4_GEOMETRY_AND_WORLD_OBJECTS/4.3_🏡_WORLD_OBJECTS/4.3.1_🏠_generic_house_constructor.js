/**
 * Creates a Babylon.js DynamicTexture containing text, centered on a colored background.
 * 
 * @param {BABYLON.Scene} scene - The current Babylon.js scene.
 * @param {Object} options
 * @param {number} [options.width=512] - Width of the texture in pixels.
 * @param {number} [options.height=256] - Height of the texture in pixels.
 * @param {string} [options.text=""] - The text to be drawn at the center.
 * @param {string} [options.backgroundColor="#FFFFFF"] - The background color (CSS or hex).
 * @param {string} [options.textColor="#000000"] - The text color (CSS or hex).
 * @param {string} [options.font="bold 48px Arial"] - CSS-like font definition (size, family, weight).
 * @returns {BABYLON.DynamicTexture} The DynamicTexture ready to be used.
 */
function createCustomTextTexture(scene, {
  width = 512,
  height = 256,
  text = "",
  backgroundColor = "#FFFFFF",
  textColor = "#000000",
  font = "bold 48px Arial"
} = {}) {
  // 1) Create the dynamic texture
  const dynTexture = new BABYLON.DynamicTexture("dynamicTextTex", { width, height }, scene, false);
  
  // 2) Retrieve its 2D drawing context
  const ctx = dynTexture.getContext();
  
  // 3) Fill with background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // 4) Set text style
  ctx.font = font;
  ctx.fillStyle = textColor;
  
  // 5) Measure text width to center it
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;
  
  // Approx. baseline correction for vertical centering:
  //   - The font size can be extracted from the string (if we want to be precise).
  //   - Alternatively, a simpler approach is to store font size in a variable or do a rough guess.
  // For clarity, let's parse the font size out of the "font" string:
  let fontSize = 48; // default
  const matches = font.match(/(\d+)px/);
  if (matches && matches[1]) {
    fontSize = parseInt(matches[1]);
  }
  // Center coordinates
  const centerX = (width - textWidth) / 2;
  const centerY = (height + fontSize / 2) / 2; // approximate vertical center
  
  // 6) Draw the text
  ctx.fillText(text, centerX, centerY);
  
  // 7) Notify the texture it’s ready
  dynTexture.update();
  
  return dynTexture;
}






function createFlexibleHouse(scene, shadowGenerator, options = {}) {
  // Default values remain the same, plus new fields
  const defaults = {
    short: 4,
    long: 6,
    height: 3,
    roofHeight: 2,
    roofOverhang: 0.3,
    boxColor: new BABYLON.Color3(0.95, 0.95, 0.9),
    roofColor: new BABYLON.Color3(0.2, 0.1, 0.1),
    position: new BABYLON.Vector3(0, 0, 0),
    rotationY: 0,

    // New fields for optional procedural texture
    proceduralTexture: null,  // The dynamic/procedural texture to apply
    faceToTexture: 2          // Index of the face to apply the texture (0-5)
  };

  // Merge user options with defaults
  const {
    short,
    long,
    height,
    roofHeight,
    roofOverhang,
    boxColor,
    roofColor,
    position,
    rotationY,
    proceduralTexture,
    faceToTexture
  } = { ...defaults, ...options };

  // Create a house parent TransformNode
  const houseParent = new BABYLON.TransformNode("houseParent", scene);
  houseParent.position.copyFrom(position);
  houseParent.rotation.y = rotationY;

  // Create the house body with custom face UVs
  const faceUV = [];
  for (let i = 0; i < 6; i++) {
    if (proceduralTexture && i === faceToTexture) {
      // Apply full texture to the selected face
      faceUV.push(new BABYLON.Vector4(0, 0, 1, 1));
    } else {
      // Apply solid color (no texture) to other faces
      faceUV.push(new BABYLON.Vector4(0, 0, 0, 0));
    }
  }

  const bodyMesh = BABYLON.MeshBuilder.CreateBox("houseBody", {
    width: short,
    depth: long,
    height: height,
    faceUV: faceUV,
    wrap: true
  }, scene);
  bodyMesh.parent = houseParent;
  bodyMesh.position.y = height / 2;

  // Material for the walls
  const bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
  bodyMat.diffuseColor = (typeof boxColor === "string")
    ? BABYLON.Color3.FromHexString(boxColor)
    : boxColor;

  // Apply procedural texture if provided
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

  // Choose roof shape
  const ratio = long / short;
  let pyramidRoof = null;
  let wedge = null;
  let frontTriangleMesh = null;
  let backTriangleMesh = null;

  if (ratio < 2) {
    // Pyramid Roof
    const positions = [
      -short / 2, height, -long / 2,
       0,         height + roofHeight, 0,
       short / 2, height, -long / 2,
       short / 2, height, -long / 2,
       0,         height + roofHeight, 0,
       short / 2, height,  long / 2,
       short / 2, height,  long / 2,
       0,         height + roofHeight, 0,
      -short / 2, height,  long / 2,
      -short / 2, height,  long / 2,
       0,         height + roofHeight, 0,
      -short / 2, height, -long / 2
    ];

    const indices = [
      0, 1, 2, 3, 4, 5,
      6, 7, 8, 9, 10, 11
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

    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(pyramidRoof);
    }
  } else {
    // B) Gable roof: extruded wedge + front/back capping triangles
    // 1) The wedge shape in X/Y plane
    const roofShape = [
      new BABYLON.Vector3(-short / 2 - roofOverhang, 0, 0),
      new BABYLON.Vector3(0, roofHeight, 0),
      new BABYLON.Vector3(short / 2 + roofOverhang, 0, 0),
    ];
    // 2) Extrude along Z from front to back
    const roofPath = [
      new BABYLON.Vector3(0, 0, -(long / 2 + roofOverhang)),
      new BABYLON.Vector3(0, 0,  (long / 2 + roofOverhang))
    ];
    const wedge = BABYLON.MeshBuilder.ExtrudeShape("gableWedge", {
      shape: roofShape,
      path: roofPath,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE
    }, scene);
    wedge.material = roofMat;
    wedge.parent = houseParent;
    wedge.position.y = height; // place on top of box

    // 3) Add front & back capping triangles
    function createSingleTriangle(name, positionsArray) {
      const tri = new BABYLON.Mesh(name, scene);
      const indices = [0, 1, 2];
      const normals = [];
      BABYLON.VertexData.ComputeNormals(positionsArray, indices, normals);

      const vertexData = new BABYLON.VertexData();
      vertexData.positions = positionsArray;
      vertexData.indices = indices;
      vertexData.normals = normals;
      vertexData.applyToMesh(tri);
      return tri;
    }

    // front corners
    const frontPositions = [
      -short / 2, height, -long / 2,
       short / 2, height, -long / 2,
       0,         height + roofHeight, -(long / 2 + roofOverhang)
    ];
    const frontTriangleMesh = createSingleTriangle("frontGableTri", frontPositions);
    frontTriangleMesh.material = roofMat;
    frontTriangleMesh.parent = houseParent;

    // back corners
    const backPositions = [
      -short / 2, height,  long / 2,
       short / 2, height,  long / 2,
       0,         height + roofHeight, (long / 2 + roofOverhang)
    ];
    const backTriangleMesh = createSingleTriangle("backGableTri", backPositions);
    backTriangleMesh.material = roofMat;
    backTriangleMesh.parent = houseParent;

    // Optionally add them all to shadow
    if (shadowGenerator) {
      shadowGenerator.addShadowCaster(wedge);
      shadowGenerator.addShadowCaster(frontTriangleMesh);
      shadowGenerator.addShadowCaster(backTriangleMesh);
    }
  }

  // Add bodyMesh to shadow as well
  if (shadowGenerator) {
    shadowGenerator.addShadowCaster(bodyMesh);
  }



  return {
    houseParent,
    bodyMesh,
    pyramidRoof,
    wedge,
    frontTriangleMesh,
    backTriangleMesh
  };
}
