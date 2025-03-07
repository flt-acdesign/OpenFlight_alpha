// js/component-creation.js

// Add deg2rad helper function at the very top so it is available everywhere.
function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

function createQuadMesh(name, pts, color) {
  const customMesh = new BABYLON.Mesh(name, scene);
  const positions = pts.flatMap(p => [p[0], p[1], p[2]]);
  const pivot = BABYLON.Vector3.FromArray(pts[0]);
  // Adjust positions relative to pivot
  for (let i = 0; i < positions.length; i += 3) {
    positions[i]   -= pivot.x;
    positions[i+1] -= pivot.y;
    positions[i+2] -= pivot.z;
  }
  const indices = [0, 1, 2, 0, 2, 3];
  const normals = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(customMesh);
  const mat = new BABYLON.StandardMaterial(name + "Mat", scene);
  mat.diffuseColor = color;
  mat.backFaceCulling = false;
  // If you want them translucent by default, uncomment:
  // mat.alpha = 0.8;
  // mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  // mat.needDepthPrePass = true;
  
  customMesh.material = mat;
  customMesh.position = pivot;
  customMesh.isPickable = true;
  return customMesh;
}

function createFuselageNode(name, diameter, length, nosePosition) {
  const parent = new BABYLON.TransformNode(name + "_parent", scene);
  parent.name = name + "_transform";
  parent.position = new BABYLON.Vector3(...nosePosition);
  const color = new BABYLON.Color3(1.0, 0.7, 0.3);

  // Create the cylinder
  const cylinder = BABYLON.MeshBuilder.CreateCylinder(name, {
    height: length,
    diameter: diameter,
    tessellation: 32
  }, scene);

  cylinder.rotation.z = Math.PI / 2;
  cylinder.position = new BABYLON.Vector3(length / 2, 0, 0);
  cylinder.isPickable = true;
  cylinder.parent = parent;

  // Use a similar (opaque) material as lifting surfaces
  const mat = new BABYLON.StandardMaterial(name + "Mat", scene);
  mat.diffuseColor = color;
  mat.backFaceCulling = false;
  // Removed the forced alpha/translucency, so it behaves like lifting surfaces
  // (shadows will match as well).
  
  cylinder.material = mat;

  // Ensure fuselage casts shadows exactly like lifting surfaces
  window.shadowGenerator.addShadowCaster(cylinder, true);

  parent.metadata = {
    type: "fuselage",
    data: null,
    originalColor: color
  };
  parent.isPickable = false;

  return parent;
}

function addLiftingSurfaceToScene(surface, aircraftData, aircraftRoot, liftingSurfaceColors) {
  // Create a parent transform node for the lifting surface.
  const parent = new BABYLON.TransformNode(surface.name + "_parent", scene);
  parent.position = new BABYLON.Vector3(...surface.root_LE);
  const index = aircraftData.lifting_surfaces.indexOf(surface);
  const baseColor = liftingSurfaceColors[index % liftingSurfaceColors.length];
  parent.metadata = {
    type: "lifting_surface",
    data: surface,
    originalColor: baseColor
  };
  parent.parent = aircraftRoot;
  parent.isPickable = false;

  // Compute geometry parameters.
  const area = surface.surface_area_m2;
  const AR = surface.AR;
  const TR = surface.TR;
  const sweep = deg2rad(surface.sweep_quarter_chord_DEG);
  const dihedral = deg2rad(surface.dihedral_DEG);
  const span = Math.sqrt(area * AR);
  const semi_span = span / 2;
  const root_chord = (2 * area) / (span * (1 + TR));
  const tip_chord = root_chord * TR;
  const root_LE = [0, 0, 0];
  let tip_le, root_te, tip_te;
  
  if (surface.vertical) {
    tip_le = [
      root_LE[0] + semi_span * Math.tan(sweep),
      root_LE[1],
      root_LE[2] + semi_span
    ];
    root_te = [root_LE[0] + root_chord, root_LE[1], root_LE[2]];
    tip_te = [tip_le[0] + tip_chord, tip_le[1], tip_le[2]];
  } else {
    tip_le = [
      root_LE[0] + semi_span * Math.tan(sweep),
      root_LE[1] + semi_span * Math.cos(dihedral),
      root_LE[2] + semi_span * Math.sin(dihedral)
    ];
    root_te = [root_LE[0] + root_chord, root_LE[1], root_LE[2]];
    tip_te = [tip_le[0] + tip_chord, tip_le[1], tip_le[2]];
  }
  
  const points = [root_LE, root_te, tip_te, tip_le];
  
  // Create the quad mesh for the lifting surface.
  const mesh = createQuadMesh(surface.name, points, baseColor);
  mesh.parent = parent;
  
  // Create a label for the lifting surface.
  var label = createLabel(surface.name, 2, 0.5);
  label.parent = parent;
  label.position = new BABYLON.Vector3(0, 0, 0);
  
  // If the lifting surface is symmetric (and not vertical), create the mirror.
  if (surface.symmetric && !surface.vertical) {
    const mirrorMesh = mesh.clone(surface.name + "_mirror");
    mirrorMesh.scaling.y *= -1;
    mirrorMesh.parent = parent;
    mirrorMesh.material = mesh.material.clone(surface.name + "_mirrorMat");
    mirrorMesh.material.diffuseColor = baseColor;
    mirrorMesh.material.backFaceCulling = false;
    mirrorMesh.isPickable = false;
  }
}

function addFuselageToScene(fusData, aircraftRoot) {
  // Create the fuselage node using the existing helper function.
  const fusNode = createFuselageNode(fusData.name, fusData.diameter, fusData.length, fusData.nose_position);
  fusNode.metadata.data = fusData;
  fusNode.parent = aircraftRoot;
  
  // Create a label for the fuselage using the helper function.
  var label = createLabel(fusData.name, 2, 0.5);
  label.parent = fusNode;
  label.position = new BABYLON.Vector3(0, 0, 0);
}

// Helper function to create a billboard-style label with the given text.
function createLabel(text, width, height) {
  var plane = BABYLON.MeshBuilder.CreatePlane("label_" + text, { width: width, height: height }, scene);
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  var dt = new BABYLON.DynamicTexture("dt_" + text, { width: 256, height: 64 }, scene, false);
  dt.hasAlpha = true;
  dt.drawText(text, null, 40, "bold 36px Arial", "black", "transparent", true);

  var mat = new BABYLON.StandardMaterial("labelMat_" + text, scene);
  mat.diffuseTexture = dt;
  mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  mat.backFaceCulling = false;
  plane.material = mat;

  return plane;
}
