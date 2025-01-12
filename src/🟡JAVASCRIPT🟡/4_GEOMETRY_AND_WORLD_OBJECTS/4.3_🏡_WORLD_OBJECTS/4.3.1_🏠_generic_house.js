




/**
 * Creates a house mesh with either a pyramid roof (ratio < 2)
 * or a gable roof (ratio >= 2).
 *
 * @param {BABYLON.Scene} scene
 * @param {BABYLON.ShadowGenerator} [shadowGenerator] optional
 * @param {object} options
 *   - short: number  (width of house)
 *   - long: number   (depth of house)
 *   - height: number (height of the walls)
 *   - roofHeight: number
 *   - boxColor: BABYLON.Color3 or string ("#RRGGBB")
 *   - roofColor: BABYLON.Color3 or string ("#RRGGBB")
 *   - position: BABYLON.Vector3 (where to place the house)
 *   - rotationY: number (radians) or degrees if you prefer
 *   - roofOverhang: number (used for the gable style)
 */
function createFlexibleHouse(scene, shadowGenerator, options = {}) {
    // Default values
    const defaults = {
      short: 4,         // house body "width"
      long: 6,          // house body "depth"
      height: 3,        // walls height
      roofHeight: 2,
      boxColor: new BABYLON.Color3(0.95, 0.95, 0.9),
      roofColor: new BABYLON.Color3(0.2, 0.1, 0.1),
      position: new BABYLON.Vector3(0, 0, 0),
      rotationY: 0,     // radians
      roofOverhang: 0.3
    };
    
    const {
      short,
      long,
      height,
      roofHeight,
      boxColor,
      roofColor,
      position,
      rotationY,
      roofOverhang
    } = { ...defaults, ...options };
  
    //-------------------------------------
    // 1) Create a parent TransformNode
    //-------------------------------------
    const houseParent = new BABYLON.TransformNode("houseParent", scene);
    houseParent.position.copyFrom(position);
    houseParent.rotation.y = rotationY;
  
    //-------------------------------------
    // 2) Create the house body (box)
    //-------------------------------------
    const bodyMesh = BABYLON.MeshBuilder.CreateBox("houseBody", {
      width: short,
      depth: long,
      height: height
    }, scene);
    bodyMesh.parent = houseParent;
    bodyMesh.position.y = height / 2; // so bottom is at y=0 in local coords
  
    // Material for house walls
    const bodyMat = new BABYLON.StandardMaterial("bodyMat", scene);
    // Accept either a BABYLON.Color3 or a hex string
    bodyMat.diffuseColor = (typeof boxColor === "string")
      ? BABYLON.Color3.FromHexString(boxColor)
      : boxColor;
    bodyMesh.material = bodyMat;
  
    //-------------------------------------
    // 3) Prepare the roof material
    //-------------------------------------
    const roofMat = new BABYLON.StandardMaterial("roofMat", scene);
    roofMat.diffuseColor = (typeof roofColor === "string")
      ? BABYLON.Color3.FromHexString(roofColor)
      : roofColor;
    // We typically disable back-face culling so both sides can show
    roofMat.backFaceCulling = false;
    // If the underside appears black, also do roofMat.twoSidedLighting = true;
  
    //-------------------------------------
    // 4) Decide: pyramid roof vs gable roof
    //-------------------------------------
    const ratio = long / short;
    if (ratio < 2) {
      // A) Pyramid roof
      const positions = [
        // Front face
        -short / 2, height, -long / 2,    // 0
         0,         height + roofHeight, 0,    // 1 (apex)
         short / 2, height, -long / 2,    // 2
  
        // Right face
         short / 2, height, -long / 2,    // 3
         0,         height + roofHeight, 0,    // 4 (apex)
         short / 2, height,  long / 2,    // 5
  
        // Back face
         short / 2, height,  long / 2,    // 6
         0,         height + roofHeight, 0,    // 7 (apex)
        -short / 2, height,  long / 2,    // 8
  
        // Left face
        -short / 2, height,  long / 2,    // 9
         0,         height + roofHeight, 0,    // 10 (apex)
        -short / 2, height, -long / 2     // 11
      ];
  
      // Indices (including reversed for double-sided geometry)
      const indices = [
        // Front face
        0, 1, 2,
        // Right face
        3, 4, 5,
        // Back face
        6, 7, 8,
        // Left face
        9, 10, 11,
        // Reverse
        2, 1, 0,
        5, 4, 3,
        8, 7, 6,
        11, 10, 9
      ];
  
      const vertexData = new BABYLON.VertexData();
      vertexData.positions = positions;
      vertexData.indices = indices;
  
      // Compute normals so lighting works
      const normals = [];
      BABYLON.VertexData.ComputeNormals(positions, indices, normals);
      vertexData.normals = normals;
  
      const pyramidRoof = new BABYLON.Mesh("pyramidRoof", scene);
      vertexData.applyToMesh(pyramidRoof);
  
      pyramidRoof.material = roofMat;
      pyramidRoof.parent = houseParent;
  
      // Optionally add to shadow
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
  
    // Return references if needed
    return {
      houseParent,
      bodyMesh
    };
  }