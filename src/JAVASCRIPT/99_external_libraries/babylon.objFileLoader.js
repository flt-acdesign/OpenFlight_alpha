(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("babylonjs"));
	else if(typeof define === 'function' && define.amd)
		define("babylonjs-loaders", ["babylonjs"], factory);
	else if(typeof exports === 'object')
		exports["babylonjs-loaders"] = factory(require("babylonjs"));
	else
		root["LOADERS"] = factory(root["BABYLON"]);
})((typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : this), (__WEBPACK_EXTERNAL_MODULE_babylonjs_Misc_tools__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../../dev/loaders/src/OBJ/index.ts":
/*!*********************************************!*\
  !*** ../../../dev/loaders/src/OBJ/index.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MTLFileLoader: () => (/* reexport safe */ _mtlFileLoader__WEBPACK_IMPORTED_MODULE_0__.MTLFileLoader),
/* harmony export */   OBJFileLoader: () => (/* reexport safe */ _objFileLoader__WEBPACK_IMPORTED_MODULE_3__.OBJFileLoader),
/* harmony export */   SolidParser: () => (/* reexport safe */ _solidParser__WEBPACK_IMPORTED_MODULE_2__.SolidParser)
/* harmony export */ });
/* harmony import */ var _mtlFileLoader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mtlFileLoader */ "../../../dev/loaders/src/OBJ/mtlFileLoader.ts");
/* harmony import */ var _objLoadingOptions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objLoadingOptions */ "../../../dev/loaders/src/OBJ/objLoadingOptions.ts");
/* harmony import */ var _solidParser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./solidParser */ "../../../dev/loaders/src/OBJ/solidParser.ts");
/* harmony import */ var _objFileLoader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./objFileLoader */ "../../../dev/loaders/src/OBJ/objFileLoader.ts");






/***/ }),

/***/ "../../../dev/loaders/src/OBJ/mtlFileLoader.ts":
/*!*****************************************************!*\
  !*** ../../../dev/loaders/src/OBJ/mtlFileLoader.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MTLFileLoader: () => (/* binding */ MTLFileLoader)
/* harmony export */ });
/* harmony import */ var babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs/Materials/standardMaterial */ "babylonjs/Misc/tools");
/* harmony import */ var babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__);



/**
 * Class reading and parsing the MTL file bundled with the obj file.
 */
var MTLFileLoader = /** @class */ (function () {
    function MTLFileLoader() {
        /**
         * All material loaded from the mtl will be set here
         */
        this.materials = [];
    }
    /**
     * This function will read the mtl file and create each material described inside
     * This function could be improve by adding :
     * -some component missing (Ni, Tf...)
     * -including the specific options available
     *
     * @param scene defines the scene the material will be created in
     * @param data defines the mtl data to parse
     * @param rootUrl defines the rooturl to use in order to load relative dependencies
     * @param assetContainer defines the asset container to store the material in (can be null)
     */
    MTLFileLoader.prototype.parseMTL = function (scene, data, rootUrl, assetContainer) {
        if (data instanceof ArrayBuffer) {
            return;
        }
        //Split the lines from the file
        var lines = data.split("\n");
        // whitespace char ie: [ \t\r\n\f]
        var delimiter_pattern = /\s+/;
        //Array with RGB colors
        var color;
        //New material
        var material = null;
        //Look at each line
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            // Blank line or comment
            if (line.length === 0 || line.charAt(0) === "#") {
                continue;
            }
            //Get the first parameter (keyword)
            var pos = line.indexOf(" ");
            var key = pos >= 0 ? line.substring(0, pos) : line;
            key = key.toLowerCase();
            //Get the data following the key
            var value = pos >= 0 ? line.substring(pos + 1).trim() : "";
            //This mtl keyword will create the new material
            if (key === "newmtl") {
                //Check if it is the first material.
                // Materials specifications are described after this keyword.
                if (material) {
                    //Add the previous material in the material array.
                    this.materials.push(material);
                }
                //Create a new material.
                // value is the name of the material read in the mtl file
                scene._blockEntityCollection = !!assetContainer;
                material = new babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__.StandardMaterial(value, scene);
                material._parentContainer = assetContainer;
                scene._blockEntityCollection = false;
            }
            else if (key === "kd" && material) {
                // Diffuse color (color under white light) using RGB values
                //value  = "r g b"
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                //color = [r,g,b]
                //Set tghe color into the material
                material.diffuseColor = babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__.Color3.FromArray(color);
            }
            else if (key === "ka" && material) {
                // Ambient color (color under shadow) using RGB values
                //value = "r g b"
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                //color = [r,g,b]
                //Set tghe color into the material
                material.ambientColor = babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__.Color3.FromArray(color);
            }
            else if (key === "ks" && material) {
                // Specular color (color when light is reflected from shiny surface) using RGB values
                //value = "r g b"
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                //color = [r,g,b]
                //Set the color into the material
                material.specularColor = babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__.Color3.FromArray(color);
            }
            else if (key === "ke" && material) {
                // Emissive color using RGB values
                color = value.split(delimiter_pattern, 3).map(parseFloat);
                material.emissiveColor = babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__.Color3.FromArray(color);
            }
            else if (key === "ns" && material) {
                //value = "Integer"
                material.specularPower = parseFloat(value);
            }
            else if (key === "d" && material) {
                //d is dissolve for current material. It mean alpha for BABYLON
                material.alpha = parseFloat(value);
                //Texture
                //This part can be improved by adding the possible options of texture
            }
            else if (key === "map_ka" && material) {
                // ambient texture map with a loaded image
                //We must first get the folder of the image
                material.ambientTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
            }
            else if (key === "map_kd" && material) {
                // Diffuse texture map with a loaded image
                material.diffuseTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
            }
            else if (key === "map_ks" && material) {
                // Specular texture map with a loaded image
                //We must first get the folder of the image
                material.specularTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
            }
            else if (key === "map_ns") {
                //Specular
                //Specular highlight component
                //We must first get the folder of the image
                //
                //Not supported by BABYLON
                //
                //    continue;
            }
            else if (key === "map_bump" && material) {
                //The bump texture
                var values = value.split(delimiter_pattern);
                var bumpMultiplierIndex = values.indexOf("-bm");
                var bumpMultiplier = null;
                if (bumpMultiplierIndex >= 0) {
                    bumpMultiplier = values[bumpMultiplierIndex + 1];
                    values.splice(bumpMultiplierIndex, 2); // remove
                }
                material.bumpTexture = MTLFileLoader._GetTexture(rootUrl, values.join(" "), scene);
                if (material.bumpTexture && bumpMultiplier !== null) {
                    material.bumpTexture.level = parseFloat(bumpMultiplier);
                }
            }
            else if (key === "map_d" && material) {
                // The dissolve of the material
                material.opacityTexture = MTLFileLoader._GetTexture(rootUrl, value, scene);
                //Options for illumination
            }
            else if (key === "illum") {
                //Illumination
                if (value === "0") {
                    //That mean Kd == Kd
                }
                else if (value === "1") {
                    //Color on and Ambient on
                }
                else if (value === "2") {
                    //Highlight on
                }
                else if (value === "3") {
                    //Reflection on and Ray trace on
                }
                else if (value === "4") {
                    //Transparency: Glass on, Reflection: Ray trace on
                }
                else if (value === "5") {
                    //Reflection: Fresnel on and Ray trace on
                }
                else if (value === "6") {
                    //Transparency: Refraction on, Reflection: Fresnel off and Ray trace on
                }
                else if (value === "7") {
                    //Transparency: Refraction on, Reflection: Fresnel on and Ray trace on
                }
                else if (value === "8") {
                    //Reflection on and Ray trace off
                }
                else if (value === "9") {
                    //Transparency: Glass on, Reflection: Ray trace off
                }
                else if (value === "10") {
                    //Casts shadows onto invisible surfaces
                }
            }
            else {
                // console.log("Unhandled expression at line : " + i +'\n' + "with value : " + line);
            }
        }
        //At the end of the file, add the last material
        if (material) {
            this.materials.push(material);
        }
    };
    /**
     * Gets the texture for the material.
     *
     * If the material is imported from input file,
     * We sanitize the url to ensure it takes the texture from aside the material.
     *
     * @param rootUrl The root url to load from
     * @param value The value stored in the mtl
     * @param scene
     * @returns The Texture
     */
    MTLFileLoader._GetTexture = function (rootUrl, value, scene) {
        if (!value) {
            return null;
        }
        var url = rootUrl;
        // Load from input file.
        if (rootUrl === "file:") {
            var lastDelimiter = value.lastIndexOf("\\");
            if (lastDelimiter === -1) {
                lastDelimiter = value.lastIndexOf("/");
            }
            if (lastDelimiter > -1) {
                url += value.substring(lastDelimiter + 1);
            }
            else {
                url += value;
            }
        }
        // Not from input file.
        else {
            url += value;
        }
        return new babylonjs_Maths_math_color__WEBPACK_IMPORTED_MODULE_0__.Texture(url, scene, false, MTLFileLoader.INVERT_TEXTURE_Y);
    };
    /**
     * Invert Y-Axis of referenced textures on load
     */
    MTLFileLoader.INVERT_TEXTURE_Y = true;
    return MTLFileLoader;
}());


/***/ }),

/***/ "../../../dev/loaders/src/OBJ/objFileLoader.metadata.ts":
/*!**************************************************************!*\
  !*** ../../../dev/loaders/src/OBJ/objFileLoader.metadata.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OBJFileLoaderMetadata: () => (/* binding */ OBJFileLoaderMetadata)
/* harmony export */ });
var OBJFileLoaderMetadata = {
    name: "obj",
    extensions: ".obj",
};


/***/ }),

/***/ "../../../dev/loaders/src/OBJ/objFileLoader.ts":
/*!*****************************************************!*\
  !*** ../../../dev/loaders/src/OBJ/objFileLoader.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OBJFileLoader: () => (/* binding */ OBJFileLoader)
/* harmony export */ });
/* harmony import */ var babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs/Materials/standardMaterial */ "babylonjs/Misc/tools");
/* harmony import */ var babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _objFileLoader_metadata__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objFileLoader.metadata */ "../../../dev/loaders/src/OBJ/objFileLoader.metadata.ts");
/* harmony import */ var _mtlFileLoader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mtlFileLoader */ "../../../dev/loaders/src/OBJ/mtlFileLoader.ts");
/* harmony import */ var _solidParser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./solidParser */ "../../../dev/loaders/src/OBJ/solidParser.ts");








/**
 * OBJ file type loader.
 * This is a babylon scene loader plugin.
 */
var OBJFileLoader = /** @class */ (function () {
    /**
     * Creates loader for .OBJ files
     *
     * @param loadingOptions options for loading and parsing OBJ/MTL files.
     */
    function OBJFileLoader(loadingOptions) {
        /**
         * Defines the name of the plugin.
         */
        this.name = _objFileLoader_metadata__WEBPACK_IMPORTED_MODULE_1__.OBJFileLoaderMetadata.name;
        /**
         * Defines the extension the plugin is able to load.
         */
        this.extensions = _objFileLoader_metadata__WEBPACK_IMPORTED_MODULE_1__.OBJFileLoaderMetadata.extensions;
        this._assetContainer = null;
        this._loadingOptions = loadingOptions || OBJFileLoader._DefaultLoadingOptions;
    }
    Object.defineProperty(OBJFileLoader, "INVERT_TEXTURE_Y", {
        /**
         * Invert Y-Axis of referenced textures on load
         */
        get: function () {
            return _mtlFileLoader__WEBPACK_IMPORTED_MODULE_2__.MTLFileLoader.INVERT_TEXTURE_Y;
        },
        set: function (value) {
            _mtlFileLoader__WEBPACK_IMPORTED_MODULE_2__.MTLFileLoader.INVERT_TEXTURE_Y = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OBJFileLoader, "_DefaultLoadingOptions", {
        get: function () {
            return {
                computeNormals: OBJFileLoader.COMPUTE_NORMALS,
                optimizeNormals: OBJFileLoader.OPTIMIZE_NORMALS,
                importVertexColors: OBJFileLoader.IMPORT_VERTEX_COLORS,
                invertY: OBJFileLoader.INVERT_Y,
                invertTextureY: OBJFileLoader.INVERT_TEXTURE_Y,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                UVScaling: OBJFileLoader.UV_SCALING,
                materialLoadingFailsSilently: OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY,
                optimizeWithUV: OBJFileLoader.OPTIMIZE_WITH_UV,
                skipMaterials: OBJFileLoader.SKIP_MATERIALS,
                useLegacyBehavior: OBJFileLoader.USE_LEGACY_BEHAVIOR,
            };
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Calls synchronously the MTL file attached to this obj.
     * Load function or importMesh function don't enable to load 2 files in the same time asynchronously.
     * Without this function materials are not displayed in the first frame (but displayed after).
     * In consequence it is impossible to get material information in your HTML file
     *
     * @param url The URL of the MTL file
     * @param rootUrl defines where to load data from
     * @param onSuccess Callback function to be called when the MTL file is loaded
     * @param onFailure
     */
    OBJFileLoader.prototype._loadMTL = function (url, rootUrl, onSuccess, onFailure) {
        //The complete path to the mtl file
        var pathOfFile = rootUrl + url;
        // Loads through the babylon tools to allow fileInput search.
        babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.Tools.LoadFile(pathOfFile, onSuccess, undefined, undefined, false, function (request, exception) {
            onFailure(pathOfFile, exception);
        });
    };
    /**
     * Instantiates a OBJ file loader plugin.
     * @returns the created plugin
     */
    OBJFileLoader.prototype.createPlugin = function () {
        return new OBJFileLoader(OBJFileLoader._DefaultLoadingOptions);
    };
    /**
     * If the data string can be loaded directly.
     * @returns if the data can be loaded directly
     */
    OBJFileLoader.prototype.canDirectLoad = function () {
        return false;
    };
    /**
     * Imports one or more meshes from the loaded OBJ data and adds them to the scene
     * @param meshesNames a string or array of strings of the mesh names that should be loaded from the file
     * @param scene the scene the meshes should be added to
     * @param data the OBJ data to load
     * @param rootUrl root url to load from
     * @returns a promise containing the loaded meshes, particles, skeletons and animations
     */
    OBJFileLoader.prototype.importMeshAsync = function (meshesNames, scene, data, rootUrl) {
        //get the meshes from OBJ file
        return this._parseSolid(meshesNames, scene, data, rootUrl).then(function (meshes) {
            return {
                meshes: meshes,
                particleSystems: [],
                skeletons: [],
                animationGroups: [],
                transformNodes: [],
                geometries: [],
                lights: [],
                spriteManagers: [],
            };
        });
    };
    /**
     * Imports all objects from the loaded OBJ data and adds them to the scene
     * @param scene the scene the objects should be added to
     * @param data the OBJ data to load
     * @param rootUrl root url to load from
     * @returns a promise which completes when objects have been loaded to the scene
     */
    OBJFileLoader.prototype.loadAsync = function (scene, data, rootUrl) {
        //Get the 3D model
        return this.importMeshAsync(null, scene, data, rootUrl).then(function () {
            // return void
        });
    };
    /**
     * Load into an asset container.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @returns The loaded asset container
     */
    OBJFileLoader.prototype.loadAssetContainerAsync = function (scene, data, rootUrl) {
        var _this = this;
        var container = new babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.AssetContainer(scene);
        this._assetContainer = container;
        return this.importMeshAsync(null, scene, data, rootUrl)
            .then(function (result) {
            result.meshes.forEach(function (mesh) { return container.meshes.push(mesh); });
            result.meshes.forEach(function (mesh) {
                var material = mesh.material;
                if (material) {
                    // Materials
                    if (container.materials.indexOf(material) == -1) {
                        container.materials.push(material);
                        // Textures
                        var textures = material.getActiveTextures();
                        textures.forEach(function (t) {
                            if (container.textures.indexOf(t) == -1) {
                                container.textures.push(t);
                            }
                        });
                    }
                }
            });
            _this._assetContainer = null;
            return container;
        })
            .catch(function (ex) {
            _this._assetContainer = null;
            throw ex;
        });
    };
    /**
     * Read the OBJ file and create an Array of meshes.
     * Each mesh contains all information given by the OBJ and the MTL file.
     * i.e. vertices positions and indices, optional normals values, optional UV values, optional material
     * @param meshesNames defines a string or array of strings of the mesh names that should be loaded from the file
     * @param scene defines the scene where are displayed the data
     * @param data defines the content of the obj file
     * @param rootUrl defines the path to the folder
     * @returns the list of loaded meshes
     */
    OBJFileLoader.prototype._parseSolid = function (meshesNames, scene, data, rootUrl) {
        var _this = this;
        var fileToLoad = ""; //The name of the mtlFile to load
        var materialsFromMTLFile = new _mtlFileLoader__WEBPACK_IMPORTED_MODULE_2__.MTLFileLoader();
        var materialToUse = [];
        var babylonMeshesArray = []; //The mesh for babylon
        // Sanitize data
        data = data.replace(/#.*$/gm, "").trim();
        // Main function
        var solidParser = new _solidParser__WEBPACK_IMPORTED_MODULE_3__.SolidParser(materialToUse, babylonMeshesArray, this._loadingOptions);
        solidParser.parse(meshesNames, data, scene, this._assetContainer, function (fileName) {
            fileToLoad = fileName;
        });
        // load the materials
        var mtlPromises = [];
        // Check if we have a file to load
        if (fileToLoad !== "" && !this._loadingOptions.skipMaterials) {
            //Load the file synchronously
            mtlPromises.push(new Promise(function (resolve, reject) {
                _this._loadMTL(fileToLoad, rootUrl, function (dataLoaded) {
                    try {
                        //Create materials thanks MTLLoader function
                        materialsFromMTLFile.parseMTL(scene, dataLoaded, rootUrl, _this._assetContainer);
                        //Look at each material loaded in the mtl file
                        for (var n = 0; n < materialsFromMTLFile.materials.length; n++) {
                            //Three variables to get all meshes with the same material
                            var startIndex = 0;
                            var _indices = [];
                            var _index = void 0;
                            //The material from MTL file is used in the meshes loaded
                            //Push the indice in an array
                            //Check if the material is not used for another mesh
                            while ((_index = materialToUse.indexOf(materialsFromMTLFile.materials[n].name, startIndex)) > -1) {
                                _indices.push(_index);
                                startIndex = _index + 1;
                            }
                            //If the material is not used dispose it
                            if (_index === -1 && _indices.length === 0) {
                                //If the material is not needed, remove it
                                materialsFromMTLFile.materials[n].dispose();
                            }
                            else {
                                for (var o = 0; o < _indices.length; o++) {
                                    //Apply the material to the Mesh for each mesh with the material
                                    var mesh = babylonMeshesArray[_indices[o]];
                                    var material = materialsFromMTLFile.materials[n];
                                    mesh.material = material;
                                    if (!mesh.getTotalIndices()) {
                                        // No indices, we need to turn on point cloud
                                        material.pointsCloud = true;
                                    }
                                }
                            }
                        }
                        resolve();
                    }
                    catch (e) {
                        babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.Tools.Warn("Error processing MTL file: '".concat(fileToLoad, "'"));
                        if (_this._loadingOptions.materialLoadingFailsSilently) {
                            resolve();
                        }
                        else {
                            reject(e);
                        }
                    }
                }, function (pathOfFile, exception) {
                    babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.Tools.Warn("Error downloading MTL file: '".concat(fileToLoad, "'"));
                    if (_this._loadingOptions.materialLoadingFailsSilently) {
                        resolve();
                    }
                    else {
                        reject(exception);
                    }
                });
            }));
        }
        //Return an array with all Mesh
        return Promise.all(mtlPromises).then(function () {
            var isLine = function (mesh) { var _a, _b; return Boolean((_b = (_a = mesh._internalMetadata) === null || _a === void 0 ? void 0 : _a["_isLine"]) !== null && _b !== void 0 ? _b : false); };
            // Iterate over the mesh, determine if it is a line mesh, clone or modify the material to line rendering.
            babylonMeshesArray.forEach(function (mesh) {
                var _a, _b;
                if (isLine(mesh)) {
                    var mat = (_a = mesh.material) !== null && _a !== void 0 ? _a : new babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.StandardMaterial(mesh.name + "_line", scene);
                    // If another mesh is using this material and it is not a line then we need to clone it.
                    var needClone = mat.getBindedMeshes().filter(function (e) { return !isLine(e); }).length > 0;
                    if (needClone) {
                        mat = (_b = mat.clone(mat.name + "_line")) !== null && _b !== void 0 ? _b : mat;
                    }
                    mat.wireframe = true;
                    mesh.material = mat;
                    if (mesh._internalMetadata) {
                        mesh._internalMetadata["_isLine"] = undefined;
                    }
                }
            });
            return babylonMeshesArray;
        });
    };
    /**
     * Defines if UVs are optimized by default during load.
     */
    OBJFileLoader.OPTIMIZE_WITH_UV = true;
    /**
     * Invert model on y-axis (does a model scaling inversion)
     */
    OBJFileLoader.INVERT_Y = false;
    /**
     * Include in meshes the vertex colors available in some OBJ files.  This is not part of OBJ standard.
     */
    OBJFileLoader.IMPORT_VERTEX_COLORS = false;
    /**
     * Compute the normals for the model, even if normals are present in the file.
     */
    OBJFileLoader.COMPUTE_NORMALS = false;
    /**
     * Optimize the normals for the model. Lighting can be uneven if you use OptimizeWithUV = true because new vertices can be created for the same location if they pertain to different faces.
     * Using OptimizehNormals = true will help smoothing the lighting by averaging the normals of those vertices.
     */
    OBJFileLoader.OPTIMIZE_NORMALS = false;
    /**
     * Defines custom scaling of UV coordinates of loaded meshes.
     */
    OBJFileLoader.UV_SCALING = new babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.Vector2(1, 1);
    /**
     * Skip loading the materials even if defined in the OBJ file (materials are ignored).
     */
    OBJFileLoader.SKIP_MATERIALS = false;
    /**
     * When a material fails to load OBJ loader will silently fail and onSuccess() callback will be triggered.
     *
     * Defaults to true for backwards compatibility.
     */
    OBJFileLoader.MATERIAL_LOADING_FAILS_SILENTLY = true;
    /**
     * Loads assets without handedness conversions. This flag is for compatibility. Use it only if absolutely required. Defaults to false.
     */
    OBJFileLoader.USE_LEGACY_BEHAVIOR = false;
    return OBJFileLoader;
}());
//Add this loader into the register plugin
(0,babylonjs_Maths_math_vector__WEBPACK_IMPORTED_MODULE_0__.registerSceneLoaderPlugin)(new OBJFileLoader());


/***/ }),

/***/ "../../../dev/loaders/src/OBJ/objLoadingOptions.ts":
/*!*********************************************************!*\
  !*** ../../../dev/loaders/src/OBJ/objLoadingOptions.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "../../../dev/loaders/src/OBJ/solidParser.ts":
/*!***************************************************!*\
  !*** ../../../dev/loaders/src/OBJ/solidParser.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SolidParser: () => (/* binding */ SolidParser)
/* harmony export */ });
/* harmony import */ var babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babylonjs/Misc/logger */ "babylonjs/Misc/tools");
/* harmony import */ var babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__);








/**
 * Class used to load mesh data from OBJ content
 */
var SolidParser = /** @class */ (function () {
    /**
     * Creates a new SolidParser
     * @param materialToUse defines the array to fill with the list of materials to use (it will be filled by the parse function)
     * @param babylonMeshesArray defines the array to fill with the list of loaded meshes (it will be filled by the parse function)
     * @param loadingOptions defines the loading options to use
     */
    function SolidParser(materialToUse, babylonMeshesArray, loadingOptions) {
        this._positions = []; //values for the positions of vertices
        this._normals = []; //Values for the normals
        this._uvs = []; //Values for the textures
        this._colors = [];
        this._extColors = []; //Extension color
        this._meshesFromObj = []; //[mesh] Contains all the obj meshes
        this._indicesForBabylon = []; //The list of indices for VertexData
        this._wrappedPositionForBabylon = []; //The list of position in vectors
        this._wrappedUvsForBabylon = []; //Array with all value of uvs to match with the indices
        this._wrappedColorsForBabylon = []; // Array with all color values to match with the indices
        this._wrappedNormalsForBabylon = []; //Array with all value of normals to match with the indices
        this._tuplePosNorm = []; //Create a tuple with indice of Position, Normal, UV  [pos, norm, uvs]
        this._curPositionInIndices = 0;
        this._hasMeshes = false; //Meshes are defined in the file
        this._unwrappedPositionsForBabylon = []; //Value of positionForBabylon w/o Vector3() [x,y,z]
        this._unwrappedColorsForBabylon = []; // Value of colorForBabylon w/o Color4() [r,g,b,a]
        this._unwrappedNormalsForBabylon = []; //Value of normalsForBabylon w/o Vector3()  [x,y,z]
        this._unwrappedUVForBabylon = []; //Value of uvsForBabylon w/o Vector3()      [x,y,z]
        this._triangles = []; //Indices from new triangles coming from polygons
        this._materialNameFromObj = ""; //The name of the current material
        this._objMeshName = ""; //The name of the current obj mesh
        this._increment = 1; //Id for meshes created by the multimaterial
        this._isFirstMaterial = true;
        this._grayColor = new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Color4(0.5, 0.5, 0.5, 1);
        this._hasLineData = false; //If this mesh has line segment(l) data
        this._materialToUse = materialToUse;
        this._babylonMeshesArray = babylonMeshesArray;
        this._loadingOptions = loadingOptions;
    }
    /**
     * Search for obj in the given array.
     * This function is called to check if a couple of data already exists in an array.
     *
     * If found, returns the index of the founded tuple index. Returns -1 if not found
     * @param arr Array<{ normals: Array<number>, idx: Array<number> }>
     * @param obj Array<number>
     * @returns {boolean}
     */
    SolidParser.prototype._isInArray = function (arr, obj) {
        if (!arr[obj[0]]) {
            arr[obj[0]] = { normals: [], idx: [] };
        }
        var idx = arr[obj[0]].normals.indexOf(obj[1]);
        return idx === -1 ? -1 : arr[obj[0]].idx[idx];
    };
    SolidParser.prototype._isInArrayUV = function (arr, obj) {
        if (!arr[obj[0]]) {
            arr[obj[0]] = { normals: [], idx: [], uv: [] };
        }
        var idx = arr[obj[0]].normals.indexOf(obj[1]);
        if (idx != 1 && obj[2] === arr[obj[0]].uv[idx]) {
            return arr[obj[0]].idx[idx];
        }
        return -1;
    };
    /**
     * This function set the data for each triangle.
     * Data are position, normals and uvs
     * If a tuple of (position, normal) is not set, add the data into the corresponding array
     * If the tuple already exist, add only their indice
     *
     * @param indicePositionFromObj Integer The index in positions array
     * @param indiceUvsFromObj Integer The index in uvs array
     * @param indiceNormalFromObj Integer The index in normals array
     * @param positionVectorFromOBJ Vector3 The value of position at index objIndice
     * @param textureVectorFromOBJ Vector3 The value of uvs
     * @param normalsVectorFromOBJ Vector3 The value of normals at index objNormale
     * @param positionColorsFromOBJ
     */
    SolidParser.prototype._setData = function (indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj, positionVectorFromOBJ, textureVectorFromOBJ, normalsVectorFromOBJ, positionColorsFromOBJ) {
        //Check if this tuple already exists in the list of tuples
        var _index;
        if (this._loadingOptions.optimizeWithUV) {
            _index = this._isInArrayUV(this._tuplePosNorm, [indicePositionFromObj, indiceNormalFromObj, indiceUvsFromObj]);
        }
        else {
            _index = this._isInArray(this._tuplePosNorm, [indicePositionFromObj, indiceNormalFromObj]);
        }
        //If it not exists
        if (_index === -1) {
            //Add an new indice.
            //The array of indices is only an array with his length equal to the number of triangles - 1.
            //We add vertices data in this order
            this._indicesForBabylon.push(this._wrappedPositionForBabylon.length);
            //Push the position of vertice for Babylon
            //Each element is a Vector3(x,y,z)
            this._wrappedPositionForBabylon.push(positionVectorFromOBJ);
            //Push the uvs for Babylon
            //Each element is a Vector2(u,v)
            //If the UVs are missing, set (u,v)=(0,0)
            textureVectorFromOBJ = textureVectorFromOBJ !== null && textureVectorFromOBJ !== void 0 ? textureVectorFromOBJ : new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector2(0, 0);
            this._wrappedUvsForBabylon.push(textureVectorFromOBJ);
            //Push the normals for Babylon
            //Each element is a Vector3(x,y,z)
            this._wrappedNormalsForBabylon.push(normalsVectorFromOBJ);
            if (positionColorsFromOBJ !== undefined) {
                //Push the colors for Babylon
                //Each element is a BABYLON.Color4(r,g,b,a)
                this._wrappedColorsForBabylon.push(positionColorsFromOBJ);
            }
            //Add the tuple in the comparison list
            this._tuplePosNorm[indicePositionFromObj].normals.push(indiceNormalFromObj);
            this._tuplePosNorm[indicePositionFromObj].idx.push(this._curPositionInIndices++);
            if (this._loadingOptions.optimizeWithUV) {
                this._tuplePosNorm[indicePositionFromObj].uv.push(indiceUvsFromObj);
            }
        }
        else {
            //The tuple already exists
            //Add the index of the already existing tuple
            //At this index we can get the value of position, normal, color and uvs of vertex
            this._indicesForBabylon.push(_index);
        }
    };
    /**
     * Transform Vector() and BABYLON.Color() objects into numbers in an array
     */
    SolidParser.prototype._unwrapData = function () {
        try {
            //Every array has the same length
            for (var l = 0; l < this._wrappedPositionForBabylon.length; l++) {
                //Push the x, y, z values of each element in the unwrapped array
                this._unwrappedPositionsForBabylon.push(this._wrappedPositionForBabylon[l].x * this._handednessSign, this._wrappedPositionForBabylon[l].y, this._wrappedPositionForBabylon[l].z);
                this._unwrappedNormalsForBabylon.push(this._wrappedNormalsForBabylon[l].x * this._handednessSign, this._wrappedNormalsForBabylon[l].y, this._wrappedNormalsForBabylon[l].z);
                this._unwrappedUVForBabylon.push(this._wrappedUvsForBabylon[l].x, this._wrappedUvsForBabylon[l].y); //z is an optional value not supported by BABYLON
                if (this._loadingOptions.importVertexColors) {
                    //Push the r, g, b, a values of each element in the unwrapped array
                    this._unwrappedColorsForBabylon.push(this._wrappedColorsForBabylon[l].r, this._wrappedColorsForBabylon[l].g, this._wrappedColorsForBabylon[l].b, this._wrappedColorsForBabylon[l].a);
                }
            }
            // Reset arrays for the next new meshes
            this._wrappedPositionForBabylon.length = 0;
            this._wrappedNormalsForBabylon.length = 0;
            this._wrappedUvsForBabylon.length = 0;
            this._wrappedColorsForBabylon.length = 0;
            this._tuplePosNorm.length = 0;
            this._curPositionInIndices = 0;
        }
        catch (e) {
            throw new Error("Unable to unwrap data while parsing OBJ data.");
        }
    };
    /**
     * Create triangles from polygons
     * It is important to notice that a triangle is a polygon
     * We get 5 patterns of face defined in OBJ File :
     * facePattern1 = ["1","2","3","4","5","6"]
     * facePattern2 = ["1/1","2/2","3/3","4/4","5/5","6/6"]
     * facePattern3 = ["1/1/1","2/2/2","3/3/3","4/4/4","5/5/5","6/6/6"]
     * facePattern4 = ["1//1","2//2","3//3","4//4","5//5","6//6"]
     * facePattern5 = ["-1/-1/-1","-2/-2/-2","-3/-3/-3","-4/-4/-4","-5/-5/-5","-6/-6/-6"]
     * Each pattern is divided by the same method
     * @param faces Array[String] The indices of elements
     * @param v Integer The variable to increment
     */
    SolidParser.prototype._getTriangles = function (faces, v) {
        //Work for each element of the array
        for (var faceIndex = v; faceIndex < faces.length - 1; faceIndex++) {
            //Add on the triangle variable the indexes to obtain triangles
            this._pushTriangle(faces, faceIndex);
        }
        //Result obtained after 2 iterations:
        //Pattern1 => triangle = ["1","2","3","1","3","4"];
        //Pattern2 => triangle = ["1/1","2/2","3/3","1/1","3/3","4/4"];
        //Pattern3 => triangle = ["1/1/1","2/2/2","3/3/3","1/1/1","3/3/3","4/4/4"];
        //Pattern4 => triangle = ["1//1","2//2","3//3","1//1","3//3","4//4"];
        //Pattern5 => triangle = ["-1/-1/-1","-2/-2/-2","-3/-3/-3","-1/-1/-1","-3/-3/-3","-4/-4/-4"];
    };
    /**
     * To get color between color and extension color
     * @param index Integer The index of the element in the array
     * @returns value of target color
     */
    SolidParser.prototype._getColor = function (index) {
        var _a;
        if (this._loadingOptions.importVertexColors) {
            return (_a = this._extColors[index]) !== null && _a !== void 0 ? _a : this._colors[index];
        }
        else {
            return undefined;
        }
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 1
     * In this pattern we get vertice positions
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern1 = function (face, v) {
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        //For each element in the triangles array.
        //This var could contains 1 to an infinity of triangles
        for (var k = 0; k < this._triangles.length; k++) {
            // Set position indice
            var indicePositionFromObj = parseInt(this._triangles[k]) - 1;
            this._setData(indicePositionFromObj, 0, 0, // In the pattern 1, normals and uvs are not defined
            this._positions[indicePositionFromObj], // Get the vectors data
            babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero(), babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector3.Up(), // Create default vectors
            this._getColor(indicePositionFromObj));
        }
        //Reset variable for the next line
        this._triangles.length = 0;
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 2
     * In this pattern we get vertice positions and uvs
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern2 = function (face, v) {
        var _a;
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "1/1"
            //Split the data for getting position and uv
            var point = this._triangles[k].split("/"); // ["1", "1"]
            //Set position indice
            var indicePositionFromObj = parseInt(point[0]) - 1;
            //Set uv indice
            var indiceUvsFromObj = parseInt(point[1]) - 1;
            this._setData(indicePositionFromObj, indiceUvsFromObj, 0, //Default value for normals
            this._positions[indicePositionFromObj], //Get the values for each element
            (_a = this._uvs[indiceUvsFromObj]) !== null && _a !== void 0 ? _a : babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero(), babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector3.Up(), //Default value for normals
            this._getColor(indicePositionFromObj));
        }
        //Reset variable for the next line
        this._triangles.length = 0;
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 3
     * In this pattern we get vertice positions, uvs and normals
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern3 = function (face, v) {
        var _a, _b;
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "1/1/1"
            //Split the data for getting position, uv, and normals
            var point = this._triangles[k].split("/"); // ["1", "1", "1"]
            // Set position indice
            var indicePositionFromObj = parseInt(point[0]) - 1;
            // Set uv indice
            var indiceUvsFromObj = parseInt(point[1]) - 1;
            // Set normal indice
            var indiceNormalFromObj = parseInt(point[2]) - 1;
            this._setData(indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj, this._positions[indicePositionFromObj], (_a = this._uvs[indiceUvsFromObj]) !== null && _a !== void 0 ? _a : babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero(), (_b = this._normals[indiceNormalFromObj]) !== null && _b !== void 0 ? _b : babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector3.Up() //Set the vector for each component
            );
        }
        //Reset variable for the next line
        this._triangles.length = 0;
    };
    /**
     * Create triangles and push the data for each polygon for the pattern 4
     * In this pattern we get vertice positions and normals
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern4 = function (face, v) {
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "1//1"
            //Split the data for getting position and normals
            var point = this._triangles[k].split("//"); // ["1", "1"]
            // We check indices, and normals
            var indicePositionFromObj = parseInt(point[0]) - 1;
            var indiceNormalFromObj = parseInt(point[1]) - 1;
            this._setData(indicePositionFromObj, 1, //Default value for uv
            indiceNormalFromObj, this._positions[indicePositionFromObj], //Get each vector of data
            babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector2.Zero(), this._normals[indiceNormalFromObj], this._getColor(indicePositionFromObj));
        }
        //Reset variable for the next line
        this._triangles.length = 0;
    };
    /*
     * Create triangles and push the data for each polygon for the pattern 3
     * In this pattern we get vertice positions, uvs and normals
     * @param face
     * @param v
     */
    SolidParser.prototype._setDataForCurrentFaceWithPattern5 = function (face, v) {
        //Get the indices of triangles for each polygon
        this._getTriangles(face, v);
        for (var k = 0; k < this._triangles.length; k++) {
            //triangle[k] = "-1/-1/-1"
            //Split the data for getting position, uv, and normals
            var point = this._triangles[k].split("/"); // ["-1", "-1", "-1"]
            // Set position indice
            var indicePositionFromObj = this._positions.length + parseInt(point[0]);
            // Set uv indice
            var indiceUvsFromObj = this._uvs.length + parseInt(point[1]);
            // Set normal indice
            var indiceNormalFromObj = this._normals.length + parseInt(point[2]);
            this._setData(indicePositionFromObj, indiceUvsFromObj, indiceNormalFromObj, this._positions[indicePositionFromObj], this._uvs[indiceUvsFromObj], this._normals[indiceNormalFromObj], //Set the vector for each component
            this._getColor(indicePositionFromObj));
        }
        //Reset variable for the next line
        this._triangles.length = 0;
    };
    SolidParser.prototype._addPreviousObjMesh = function () {
        //Check if it is not the first mesh. Otherwise we don't have data.
        if (this._meshesFromObj.length > 0) {
            //Get the previous mesh for applying the data about the faces
            //=> in obj file, faces definition append after the name of the mesh
            this._handledMesh = this._meshesFromObj[this._meshesFromObj.length - 1];
            //Set the data into Array for the mesh
            this._unwrapData();
            if (this._loadingOptions.useLegacyBehavior) {
                // Reverse tab. Otherwise face are displayed in the wrong sens
                this._indicesForBabylon.reverse();
            }
            //Set the information for the mesh
            //Slice the array to avoid rewriting because of the fact this is the same var which be rewrited
            this._handledMesh.indices = this._indicesForBabylon.slice();
            this._handledMesh.positions = this._unwrappedPositionsForBabylon.slice();
            this._handledMesh.normals = this._unwrappedNormalsForBabylon.slice();
            this._handledMesh.uvs = this._unwrappedUVForBabylon.slice();
            this._handledMesh.hasLines = this._hasLineData;
            if (this._loadingOptions.importVertexColors) {
                this._handledMesh.colors = this._unwrappedColorsForBabylon.slice();
            }
            //Reset the array for the next mesh
            this._indicesForBabylon.length = 0;
            this._unwrappedPositionsForBabylon.length = 0;
            this._unwrappedColorsForBabylon.length = 0;
            this._unwrappedNormalsForBabylon.length = 0;
            this._unwrappedUVForBabylon.length = 0;
            this._hasLineData = false;
        }
    };
    SolidParser.prototype._optimizeNormals = function (mesh) {
        var positions = mesh.getVerticesData(babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.PositionKind);
        var normals = mesh.getVerticesData(babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.NormalKind);
        var mapVertices = {};
        if (!positions || !normals) {
            return;
        }
        for (var i = 0; i < positions.length / 3; i++) {
            var x = positions[i * 3 + 0];
            var y = positions[i * 3 + 1];
            var z = positions[i * 3 + 2];
            var key = x + "_" + y + "_" + z;
            var lst = mapVertices[key];
            if (!lst) {
                lst = [];
                mapVertices[key] = lst;
            }
            lst.push(i);
        }
        var normal = new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector3();
        for (var key in mapVertices) {
            var lst = mapVertices[key];
            if (lst.length < 2) {
                continue;
            }
            var v0Idx = lst[0];
            for (var i = 1; i < lst.length; ++i) {
                var vIdx = lst[i];
                normals[v0Idx * 3 + 0] += normals[vIdx * 3 + 0];
                normals[v0Idx * 3 + 1] += normals[vIdx * 3 + 1];
                normals[v0Idx * 3 + 2] += normals[vIdx * 3 + 2];
            }
            normal.copyFromFloats(normals[v0Idx * 3 + 0], normals[v0Idx * 3 + 1], normals[v0Idx * 3 + 2]);
            normal.normalize();
            for (var i = 0; i < lst.length; ++i) {
                var vIdx = lst[i];
                normals[vIdx * 3 + 0] = normal.x;
                normals[vIdx * 3 + 1] = normal.y;
                normals[vIdx * 3 + 2] = normal.z;
            }
        }
        mesh.setVerticesData(babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.VertexBuffer.NormalKind, normals);
    };
    SolidParser._IsLineElement = function (line) {
        return line.startsWith("l");
    };
    SolidParser._IsObjectElement = function (line) {
        return line.startsWith("o");
    };
    SolidParser._IsGroupElement = function (line) {
        return line.startsWith("g");
    };
    SolidParser._GetZbrushMRGB = function (line, notParse) {
        if (!line.startsWith("mrgb"))
            return null;
        line = line.replace("mrgb", "").trim();
        // if include vertex color , not load mrgb anymore
        if (notParse)
            return [];
        var regex = /[a-z0-9]/g;
        var regArray = line.match(regex);
        if (!regArray || regArray.length % 8 !== 0) {
            return [];
        }
        var array = [];
        for (var regIndex = 0; regIndex < regArray.length / 8; regIndex++) {
            //each item is MMRRGGBB, m is material index
            // const m = regArray[regIndex * 8 + 0] + regArray[regIndex * 8 + 1];
            var r = regArray[regIndex * 8 + 2] + regArray[regIndex * 8 + 3];
            var g = regArray[regIndex * 8 + 4] + regArray[regIndex * 8 + 5];
            var b = regArray[regIndex * 8 + 6] + regArray[regIndex * 8 + 7];
            array.push(new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Color4(parseInt(r, 16) / 255, parseInt(g, 16) / 255, parseInt(b, 16) / 255, 1));
        }
        return array;
    };
    /**
     * Function used to parse an OBJ string
     * @param meshesNames defines the list of meshes to load (all if not defined)
     * @param data defines the OBJ string
     * @param scene defines the hosting scene
     * @param assetContainer defines the asset container to load data in
     * @param onFileToLoadFound defines a callback that will be called if a MTL file is found
     */
    SolidParser.prototype.parse = function (meshesNames, data, scene, assetContainer, onFileToLoadFound) {
        var _this = this;
        var _a, _b;
        //Move Santitize here to forbid delete zbrush data
        // Sanitize data
        data = data.replace(/#MRGB/g, "mrgb");
        data = data.replace(/#.*$/gm, "").trim();
        if (this._loadingOptions.useLegacyBehavior) {
            this._pushTriangle = function (faces, faceIndex) { return _this._triangles.push(faces[0], faces[faceIndex], faces[faceIndex + 1]); };
            this._handednessSign = 1;
        }
        else if (scene.useRightHandedSystem) {
            this._pushTriangle = function (faces, faceIndex) { return _this._triangles.push(faces[0], faces[faceIndex + 1], faces[faceIndex]); };
            this._handednessSign = 1;
        }
        else {
            this._pushTriangle = function (faces, faceIndex) { return _this._triangles.push(faces[0], faces[faceIndex], faces[faceIndex + 1]); };
            this._handednessSign = -1;
        }
        // Split the file into lines
        // Preprocess line data
        var linesOBJ = data.split("\n");
        var lineLines = [];
        var currentGroup = [];
        lineLines.push(currentGroup);
        for (var i = 0; i < linesOBJ.length; i++) {
            var line = linesOBJ[i].trim().replace(/\s\s/g, " ");
            // Comment or newLine
            if (line.length === 0 || line.charAt(0) === "#") {
                continue;
            }
            if (SolidParser._IsGroupElement(line) || SolidParser._IsObjectElement(line)) {
                currentGroup = [];
                lineLines.push(currentGroup);
            }
            if (SolidParser._IsLineElement(line)) {
                var lineValues = line.split(" ");
                // create line elements with two vertices only
                for (var i_1 = 1; i_1 < lineValues.length - 1; i_1++) {
                    currentGroup.push("l ".concat(lineValues[i_1], " ").concat(lineValues[i_1 + 1]));
                }
            }
            else {
                currentGroup.push(line);
            }
        }
        var lines = lineLines.flat();
        // Look at each line
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim().replace(/\s\s/g, " ");
            var result = void 0;
            // Comment or newLine
            if (line.length === 0 || line.charAt(0) === "#") {
                continue;
            }
            else if (SolidParser.VertexPattern.test(line)) {
                //Get information about one position possible for the vertices
                result = line.match(/[^ ]+/g); // match will return non-null due to passing regex pattern
                // Value of result with line: "v 1.0 2.0 3.0"
                // ["v", "1.0", "2.0", "3.0"]
                // Create a Vector3 with the position x, y, z
                this._positions.push(new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
                if (this._loadingOptions.importVertexColors) {
                    if (result.length >= 7) {
                        var r = parseFloat(result[4]);
                        var g = parseFloat(result[5]);
                        var b = parseFloat(result[6]);
                        this._colors.push(new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Color4(r > 1 ? r / 255 : r, g > 1 ? g / 255 : g, b > 1 ? b / 255 : b, result.length === 7 || result[7] === undefined ? 1 : parseFloat(result[7])));
                    }
                    else {
                        // TODO: maybe push NULL and if all are NULL to skip (and remove grayColor var).
                        this._colors.push(this._grayColor);
                    }
                }
            }
            else if ((result = SolidParser.NormalPattern.exec(line)) !== null) {
                //Create a Vector3 with the normals x, y, z
                //Value of result
                // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
                //Add the Vector in the list of normals
                this._normals.push(new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])));
            }
            else if ((result = SolidParser.UVPattern.exec(line)) !== null) {
                //Create a Vector2 with the normals u, v
                //Value of result
                // ["vt 0.1 0.2 0.3", "0.1", "0.2"]
                //Add the Vector in the list of uvs
                this._uvs.push(new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Vector2(parseFloat(result[1]) * this._loadingOptions.UVScaling.x, parseFloat(result[2]) * this._loadingOptions.UVScaling.y));
                //Identify patterns of faces
                //Face could be defined in different type of pattern
            }
            else if ((result = SolidParser.FacePattern3.exec(line)) !== null) {
                //Value of result:
                //["f 1/1/1 2/2/2 3/3/3", "1/1/1 2/2/2 3/3/3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern3(result[1].trim().split(" "), // ["1/1/1", "2/2/2", "3/3/3"]
                1);
            }
            else if ((result = SolidParser.FacePattern4.exec(line)) !== null) {
                //Value of result:
                //["f 1//1 2//2 3//3", "1//1 2//2 3//3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern4(result[1].trim().split(" "), // ["1//1", "2//2", "3//3"]
                1);
            }
            else if ((result = SolidParser.FacePattern5.exec(line)) !== null) {
                //Value of result:
                //["f -1/-1/-1 -2/-2/-2 -3/-3/-3", "-1/-1/-1 -2/-2/-2 -3/-3/-3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern5(result[1].trim().split(" "), // ["-1/-1/-1", "-2/-2/-2", "-3/-3/-3"]
                1);
            }
            else if ((result = SolidParser.FacePattern2.exec(line)) !== null) {
                //Value of result:
                //["f 1/1 2/2 3/3", "1/1 2/2 3/3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern2(result[1].trim().split(" "), // ["1/1", "2/2", "3/3"]
                1);
            }
            else if ((result = SolidParser.FacePattern1.exec(line)) !== null) {
                //Value of result
                //["f 1 2 3", "1 2 3"...]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern1(result[1].trim().split(" "), // ["1", "2", "3"]
                1);
                // Define a mesh or an object
                // Each time this keyword is analyzed, create a new Object with all data for creating a babylonMesh
            }
            else if ((result = SolidParser.LinePattern1.exec(line)) !== null) {
                //Value of result
                //["l 1 2"]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern1(result[1].trim().split(" "), // ["1", "2"]
                0);
                this._hasLineData = true;
                // Define a mesh or an object
                // Each time this keyword is analyzed, create a new Object with all data for creating a babylonMesh
            }
            else if ((result = SolidParser.LinePattern2.exec(line)) !== null) {
                //Value of result
                //["l 1/1 2/2"]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern2(result[1].trim().split(" "), // ["1/1", "2/2"]
                0);
                this._hasLineData = true;
                // Define a mesh or an object
                // Each time this keyword is analyzed, create a new Object with all data for creating a babylonMesh
            }
            else if ((result = SolidParser._GetZbrushMRGB(line, !this._loadingOptions.importVertexColors))) {
                result.forEach(function (element) {
                    _this._extColors.push(element);
                });
            }
            else if ((result = SolidParser.LinePattern3.exec(line)) !== null) {
                //Value of result
                //["l 1/1/1 2/2/2"]
                //Set the data for this face
                this._setDataForCurrentFaceWithPattern3(result[1].trim().split(" "), // ["1/1/1", "2/2/2"]
                0);
                this._hasLineData = true;
                // Define a mesh or an object
                // Each time this keyword is analyzed, create a new Object with all data for creating a babylonMesh
            }
            else if (SolidParser.GroupDescriptor.test(line) || SolidParser.ObjectDescriptor.test(line)) {
                // Create a new mesh corresponding to the name of the group.
                // Definition of the mesh
                var objMesh = {
                    name: line.substring(2).trim(),
                    indices: null,
                    positions: null,
                    normals: null,
                    uvs: null,
                    colors: null,
                    materialName: this._materialNameFromObj,
                    isObject: SolidParser.ObjectDescriptor.test(line),
                };
                this._addPreviousObjMesh();
                //Push the last mesh created with only the name
                this._meshesFromObj.push(objMesh);
                //Set this variable to indicate that now meshesFromObj has objects defined inside
                this._hasMeshes = true;
                this._isFirstMaterial = true;
                this._increment = 1;
                //Keyword for applying a material
            }
            else if (SolidParser.UseMtlDescriptor.test(line)) {
                //Get the name of the material
                this._materialNameFromObj = line.substring(7).trim();
                //If this new material is in the same mesh
                if (!this._isFirstMaterial || !this._hasMeshes) {
                    //Set the data for the previous mesh
                    this._addPreviousObjMesh();
                    //Create a new mesh
                    var objMesh = 
                    //Set the name of the current obj mesh
                    {
                        name: (this._objMeshName || "mesh") + "_mm" + this._increment.toString(),
                        indices: null,
                        positions: null,
                        normals: null,
                        uvs: null,
                        colors: null,
                        materialName: this._materialNameFromObj,
                        isObject: false,
                    };
                    this._increment++;
                    //If meshes are already defined
                    this._meshesFromObj.push(objMesh);
                    this._hasMeshes = true;
                }
                //Set the material name if the previous line define a mesh
                if (this._hasMeshes && this._isFirstMaterial) {
                    //Set the material name to the previous mesh (1 material per mesh)
                    this._meshesFromObj[this._meshesFromObj.length - 1].materialName = this._materialNameFromObj;
                    this._isFirstMaterial = false;
                }
                // Keyword for loading the mtl file
            }
            else if (SolidParser.MtlLibGroupDescriptor.test(line)) {
                // Get the name of mtl file
                onFileToLoadFound(line.substring(7).trim());
                // Apply smoothing
            }
            else if (SolidParser.SmoothDescriptor.test(line)) {
                // smooth shading => apply smoothing
                // Today I don't know it work with babylon and with obj.
                // With the obj file  an integer is set
            }
            else {
                //If there is another possibility
                babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Logger.Log("Unhandled expression at line : " + line);
            }
        }
        // At the end of the file, add the last mesh into the meshesFromObj array
        if (this._hasMeshes) {
            // Set the data for the last mesh
            this._handledMesh = this._meshesFromObj[this._meshesFromObj.length - 1];
            if (this._loadingOptions.useLegacyBehavior) {
                //Reverse indices for displaying faces in the good sense
                this._indicesForBabylon.reverse();
            }
            //Get the good array
            this._unwrapData();
            //Set array
            this._handledMesh.indices = this._indicesForBabylon;
            this._handledMesh.positions = this._unwrappedPositionsForBabylon;
            this._handledMesh.normals = this._unwrappedNormalsForBabylon;
            this._handledMesh.uvs = this._unwrappedUVForBabylon;
            this._handledMesh.hasLines = this._hasLineData;
            if (this._loadingOptions.importVertexColors) {
                this._handledMesh.colors = this._unwrappedColorsForBabylon;
            }
        }
        // If any o or g keyword not found, create a mesh with a random id
        if (!this._hasMeshes) {
            var newMaterial = null;
            if (this._indicesForBabylon.length) {
                if (this._loadingOptions.useLegacyBehavior) {
                    // reverse tab of indices
                    this._indicesForBabylon.reverse();
                }
                //Get positions normals uvs
                this._unwrapData();
            }
            else {
                // There is no indices in the file. We will have to switch to point cloud rendering
                for (var _i = 0, _c = this._positions; _i < _c.length; _i++) {
                    var pos = _c[_i];
                    this._unwrappedPositionsForBabylon.push(pos.x, pos.y, pos.z);
                }
                if (this._normals.length) {
                    for (var _d = 0, _e = this._normals; _d < _e.length; _d++) {
                        var normal = _e[_d];
                        this._unwrappedNormalsForBabylon.push(normal.x, normal.y, normal.z);
                    }
                }
                if (this._uvs.length) {
                    for (var _f = 0, _g = this._uvs; _f < _g.length; _f++) {
                        var uv = _g[_f];
                        this._unwrappedUVForBabylon.push(uv.x, uv.y);
                    }
                }
                if (this._extColors.length) {
                    for (var _h = 0, _j = this._extColors; _h < _j.length; _h++) {
                        var color = _j[_h];
                        this._unwrappedColorsForBabylon.push(color.r, color.g, color.b, color.a);
                    }
                }
                else {
                    if (this._colors.length) {
                        for (var _k = 0, _l = this._colors; _k < _l.length; _k++) {
                            var color = _l[_k];
                            this._unwrappedColorsForBabylon.push(color.r, color.g, color.b, color.a);
                        }
                    }
                }
                if (!this._materialNameFromObj) {
                    // Create a material with point cloud on
                    newMaterial = new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.StandardMaterial(babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Geometry.RandomId(), scene);
                    newMaterial.pointsCloud = true;
                    this._materialNameFromObj = newMaterial.name;
                    if (!this._normals.length) {
                        newMaterial.disableLighting = true;
                        newMaterial.emissiveColor = babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Color3.White();
                    }
                }
            }
            //Set data for one mesh
            this._meshesFromObj.push({
                name: babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Geometry.RandomId(),
                indices: this._indicesForBabylon,
                positions: this._unwrappedPositionsForBabylon,
                colors: this._unwrappedColorsForBabylon,
                normals: this._unwrappedNormalsForBabylon,
                uvs: this._unwrappedUVForBabylon,
                materialName: this._materialNameFromObj,
                directMaterial: newMaterial,
                isObject: true,
                hasLines: this._hasLineData,
            });
        }
        //Set data for each mesh
        for (var j = 0; j < this._meshesFromObj.length; j++) {
            //check meshesNames (stlFileLoader)
            if (meshesNames && this._meshesFromObj[j].name) {
                if (meshesNames instanceof Array) {
                    if (meshesNames.indexOf(this._meshesFromObj[j].name) === -1) {
                        continue;
                    }
                }
                else {
                    if (this._meshesFromObj[j].name !== meshesNames) {
                        continue;
                    }
                }
            }
            //Get the current mesh
            //Set the data with VertexBuffer for each mesh
            this._handledMesh = this._meshesFromObj[j];
            //Create a Mesh with the name of the obj mesh
            scene._blockEntityCollection = !!assetContainer;
            var babylonMesh = new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.Mesh(this._meshesFromObj[j].name, scene);
            babylonMesh._parentContainer = assetContainer;
            scene._blockEntityCollection = false;
            this._handledMesh._babylonMesh = babylonMesh;
            // If this is a group mesh, it should have an object mesh as a parent. So look for the first object mesh that appears before it.
            if (!this._handledMesh.isObject) {
                for (var k = j - 1; k >= 0; --k) {
                    if (this._meshesFromObj[k].isObject && this._meshesFromObj[k]._babylonMesh) {
                        babylonMesh.parent = this._meshesFromObj[k]._babylonMesh;
                        break;
                    }
                }
            }
            //Push the name of the material to an array
            //This is indispensable for the importMesh function
            this._materialToUse.push(this._meshesFromObj[j].materialName);
            //If the mesh is a line mesh
            if (this._handledMesh.hasLines) {
                (_a = babylonMesh._internalMetadata) !== null && _a !== void 0 ? _a : (babylonMesh._internalMetadata = {});
                babylonMesh._internalMetadata["_isLine"] = true; //this is a line mesh
            }
            if (((_b = this._handledMesh.positions) === null || _b === void 0 ? void 0 : _b.length) === 0) {
                //Push the mesh into an array
                this._babylonMeshesArray.push(babylonMesh);
                continue;
            }
            var vertexData = new babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.VertexData(); //The container for the values
            //Set the data for the babylonMesh
            vertexData.uvs = this._handledMesh.uvs;
            vertexData.indices = this._handledMesh.indices;
            vertexData.positions = this._handledMesh.positions;
            if (this._loadingOptions.computeNormals) {
                var normals = new Array();
                babylonjs_Buffers_buffer__WEBPACK_IMPORTED_MODULE_0__.VertexData.ComputeNormals(this._handledMesh.positions, this._handledMesh.indices, normals);
                vertexData.normals = normals;
            }
            else {
                vertexData.normals = this._handledMesh.normals;
            }
            if (this._loadingOptions.importVertexColors) {
                vertexData.colors = this._handledMesh.colors;
            }
            //Set the data from the VertexBuffer to the current Mesh
            vertexData.applyToMesh(babylonMesh);
            if (this._loadingOptions.invertY) {
                babylonMesh.scaling.y *= -1;
            }
            if (this._loadingOptions.optimizeNormals) {
                this._optimizeNormals(babylonMesh);
            }
            //Push the mesh into an array
            this._babylonMeshesArray.push(babylonMesh);
            if (this._handledMesh.directMaterial) {
                babylonMesh.material = this._handledMesh.directMaterial;
            }
        }
    };
    // Descriptor
    /** Object descriptor */
    SolidParser.ObjectDescriptor = /^o/;
    /** Group descriptor */
    SolidParser.GroupDescriptor = /^g/;
    /** Material lib descriptor */
    SolidParser.MtlLibGroupDescriptor = /^mtllib /;
    /** Use a material descriptor */
    SolidParser.UseMtlDescriptor = /^usemtl /;
    /** Smooth descriptor */
    SolidParser.SmoothDescriptor = /^s /;
    // Patterns
    /** Pattern used to detect a vertex */
    SolidParser.VertexPattern = /^v(\s+[\d|.|+|\-|e|E]+){3,7}/;
    /** Pattern used to detect a normal */
    SolidParser.NormalPattern = /^vn(\s+[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)/;
    /** Pattern used to detect a UV set */
    SolidParser.UVPattern = /^vt(\s+[\d|.|+|\-|e|E]+)( +[\d|.|+|\-|e|E]+)/;
    /** Pattern used to detect a first kind of face (f vertex vertex vertex) */
    SolidParser.FacePattern1 = /^f\s+(([\d]{1,}[\s]?){3,})+/;
    /** Pattern used to detect a second kind of face (f vertex/uvs vertex/uvs vertex/uvs) */
    SolidParser.FacePattern2 = /^f\s+((([\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
    /** Pattern used to detect a third kind of face (f vertex/uvs/normal vertex/uvs/normal vertex/uvs/normal) */
    SolidParser.FacePattern3 = /^f\s+((([\d]{1,}\/[\d]{1,}\/[\d]{1,}[\s]?){3,})+)/;
    /** Pattern used to detect a fourth kind of face (f vertex//normal vertex//normal vertex//normal)*/
    SolidParser.FacePattern4 = /^f\s+((([\d]{1,}\/\/[\d]{1,}[\s]?){3,})+)/;
    /** Pattern used to detect a fifth kind of face (f -vertex/-uvs/-normal -vertex/-uvs/-normal -vertex/-uvs/-normal) */
    SolidParser.FacePattern5 = /^f\s+(((-[\d]{1,}\/-[\d]{1,}\/-[\d]{1,}[\s]?){3,})+)/;
    /** Pattern used to detect a line(l vertex vertex) */
    SolidParser.LinePattern1 = /^l\s+(([\d]{1,}[\s]?){2,})+/;
    /** Pattern used to detect a second kind of line (l vertex/uvs vertex/uvs) */
    SolidParser.LinePattern2 = /^l\s+((([\d]{1,}\/[\d]{1,}[\s]?){2,})+)/;
    /** Pattern used to detect a third kind of line (l vertex/uvs/normal vertex/uvs/normal) */
    SolidParser.LinePattern3 = /^l\s+((([\d]{1,}\/[\d]{1,}\/[\d]{1,}[\s]?){2,})+)/;
    return SolidParser;
}());


/***/ }),

/***/ "../../../lts/loaders/src/legacy/legacy-objFileLoader.ts":
/*!***************************************************************!*\
  !*** ../../../lts/loaders/src/legacy/legacy-objFileLoader.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MTLFileLoader: () => (/* reexport safe */ loaders_OBJ_index__WEBPACK_IMPORTED_MODULE_0__.MTLFileLoader),
/* harmony export */   OBJFileLoader: () => (/* reexport safe */ loaders_OBJ_index__WEBPACK_IMPORTED_MODULE_0__.OBJFileLoader),
/* harmony export */   SolidParser: () => (/* reexport safe */ loaders_OBJ_index__WEBPACK_IMPORTED_MODULE_0__.SolidParser)
/* harmony export */ });
/* harmony import */ var loaders_OBJ_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! loaders/OBJ/index */ "../../../dev/loaders/src/OBJ/index.ts");
/* eslint-disable import/no-internal-modules */

/**
 * This is the entry point for the UMD module.
 * The entry point for a future ESM package should be index.ts
 */
var globalObject = typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : typeof window !== "undefined" ? window : undefined;
if (typeof globalObject !== "undefined") {
    for (var key in loaders_OBJ_index__WEBPACK_IMPORTED_MODULE_0__) {
        if (!globalObject.BABYLON[key]) {
            globalObject.BABYLON[key] = loaders_OBJ_index__WEBPACK_IMPORTED_MODULE_0__[key];
        }
    }
}



/***/ }),

/***/ "babylonjs/Misc/tools":
/*!****************************************************************************************************!*\
  !*** external {"root":"BABYLON","commonjs":"babylonjs","commonjs2":"babylonjs","amd":"babylonjs"} ***!
  \****************************************************************************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_babylonjs_Misc_tools__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!******************************!*\
  !*** ./src/objFileLoader.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   loaders: () => (/* reexport module object */ _lts_loaders_legacy_legacy_objFileLoader__WEBPACK_IMPORTED_MODULE_0__)
/* harmony export */ });
/* harmony import */ var _lts_loaders_legacy_legacy_objFileLoader__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @lts/loaders/legacy/legacy-objFileLoader */ "../../../lts/loaders/src/legacy/legacy-objFileLoader.ts");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_lts_loaders_legacy_legacy_objFileLoader__WEBPACK_IMPORTED_MODULE_0__);

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFieWxvbi5vYmpGaWxlTG9hZGVyLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkE7QUFDQTtBQUNBO0FBSUE7O0FBRUE7QUFDQTtBQUFBO0FBTUE7O0FBRUE7QUFDQTtBQStNQTtBQTdNQTs7Ozs7Ozs7OztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7Ozs7OztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBdE5BOztBQUVBO0FBQ0E7QUFvTkE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0FDL05BO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0xBO0FBQ0E7QUFHQTtBQUNBO0FBR0E7QUFDQTtBQUVBO0FBRUE7QUFZQTs7O0FBR0E7QUFDQTtBQW1FQTs7OztBQUlBO0FBQ0E7QUFsQkE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFFQTtBQVVBO0FBQ0E7QUE5REE7QUFIQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTs7O0FBSkE7QUE4REE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUFBO0FBRUE7Ozs7Ozs7Ozs7QUFVQTtBQUNBO0FBTUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7OztBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7OztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7OztBQU1BO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7Ozs7O0FBU0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQXhVQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQVlBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUVBOzs7O0FBSUE7QUFDQTtBQUVBOztBQUVBO0FBQ0E7QUFzUkE7QUFBQTtBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMVdBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBSUE7QUFnQkE7O0FBRUE7QUFDQTtBQXFFQTs7Ozs7QUFLQTtBQUNBO0FBckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUtBO0FBU0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7Ozs7QUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7Ozs7Ozs7OztBQWFBO0FBQ0E7QUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7Ozs7Ozs7Ozs7QUFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7QUFJQTtBQUNBOztBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFJQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOzs7OztBQUtBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUlBO0FBQ0E7QUFFQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBRUE7Ozs7O0FBS0E7QUFDQTs7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7QUFLQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBR0E7QUFFQTtBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBT0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7Ozs7QUFPQTtBQUNBO0FBQUE7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUdBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFFQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUVBO0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBRUE7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFFQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUdBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF5N0JBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzUvQkE7QUFDQTtBQUVBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTs7Ozs7Ozs7Ozs7QUNoQkE7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNQQTs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9MT0FERVJTL3dlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIndlYnBhY2s6Ly9MT0FERVJTLy4uLy4uLy4uL2Rldi9sb2FkZXJzL3NyYy9PQkovaW5kZXgudHMiLCJ3ZWJwYWNrOi8vTE9BREVSUy8uLi8uLi8uLi9kZXYvbG9hZGVycy9zcmMvT0JKL210bEZpbGVMb2FkZXIudHMiLCJ3ZWJwYWNrOi8vTE9BREVSUy8uLi8uLi8uLi9kZXYvbG9hZGVycy9zcmMvT0JKL29iakZpbGVMb2FkZXIubWV0YWRhdGEudHMiLCJ3ZWJwYWNrOi8vTE9BREVSUy8uLi8uLi8uLi9kZXYvbG9hZGVycy9zcmMvT0JKL29iakZpbGVMb2FkZXIudHMiLCJ3ZWJwYWNrOi8vTE9BREVSUy8uLi8uLi8uLi9kZXYvbG9hZGVycy9zcmMvT0JKL3NvbGlkUGFyc2VyLnRzIiwid2VicGFjazovL0xPQURFUlMvLi4vLi4vLi4vbHRzL2xvYWRlcnMvc3JjL2xlZ2FjeS9sZWdhY3ktb2JqRmlsZUxvYWRlci50cyIsIndlYnBhY2s6Ly9MT0FERVJTL2V4dGVybmFsIHVtZCB7XCJyb290XCI6XCJCQUJZTE9OXCIsXCJjb21tb25qc1wiOlwiYmFieWxvbmpzXCIsXCJjb21tb25qczJcIjpcImJhYnlsb25qc1wiLFwiYW1kXCI6XCJiYWJ5bG9uanNcIn0iLCJ3ZWJwYWNrOi8vTE9BREVSUy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9MT0FERVJTL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL0xPQURFUlMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0xPQURFUlMvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9MT0FERVJTL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vTE9BREVSUy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL0xPQURFUlMvLi9zcmMvb2JqRmlsZUxvYWRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KHJlcXVpcmUoXCJiYWJ5bG9uanNcIikpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJiYWJ5bG9uanMtbG9hZGVyc1wiLCBbXCJiYWJ5bG9uanNcIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wiYmFieWxvbmpzLWxvYWRlcnNcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJiYWJ5bG9uanNcIikpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkxPQURFUlNcIl0gPSBmYWN0b3J5KHJvb3RbXCJCQUJZTE9OXCJdKTtcbn0pKCh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdGhpcyksIChfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2JhYnlsb25qc19NaXNjX3Rvb2xzX18pID0+IHtcbnJldHVybiAiLCJleHBvcnQgKiBmcm9tIFwiLi9tdGxGaWxlTG9hZGVyXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL29iakxvYWRpbmdPcHRpb25zXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL3NvbGlkUGFyc2VyXCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL29iakZpbGVMb2FkZXJcIjtcclxuIiwiaW1wb3J0IHR5cGUgeyBOdWxsYWJsZSB9IGZyb20gXCJjb3JlL3R5cGVzXCI7XHJcbmltcG9ydCB7IENvbG9yMyB9IGZyb20gXCJjb3JlL01hdGhzL21hdGguY29sb3JcIjtcclxuaW1wb3J0IHsgVGV4dHVyZSB9IGZyb20gXCJjb3JlL01hdGVyaWFscy9UZXh0dXJlcy90ZXh0dXJlXCI7XHJcbmltcG9ydCB7IFN0YW5kYXJkTWF0ZXJpYWwgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvc3RhbmRhcmRNYXRlcmlhbFwiO1xyXG5cclxuaW1wb3J0IHR5cGUgeyBTY2VuZSB9IGZyb20gXCJjb3JlL3NjZW5lXCI7XHJcbmltcG9ydCB0eXBlIHsgQXNzZXRDb250YWluZXIgfSBmcm9tIFwiY29yZS9hc3NldENvbnRhaW5lclwiO1xyXG4vKipcclxuICogQ2xhc3MgcmVhZGluZyBhbmQgcGFyc2luZyB0aGUgTVRMIGZpbGUgYnVuZGxlZCB3aXRoIHRoZSBvYmogZmlsZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBNVExGaWxlTG9hZGVyIHtcclxuICAgIC8qKlxyXG4gICAgICogSW52ZXJ0IFktQXhpcyBvZiByZWZlcmVuY2VkIHRleHR1cmVzIG9uIGxvYWRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBJTlZFUlRfVEVYVFVSRV9ZID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFsbCBtYXRlcmlhbCBsb2FkZWQgZnJvbSB0aGUgbXRsIHdpbGwgYmUgc2V0IGhlcmVcclxuICAgICAqL1xyXG4gICAgcHVibGljIG1hdGVyaWFsczogU3RhbmRhcmRNYXRlcmlhbFtdID0gW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgcmVhZCB0aGUgbXRsIGZpbGUgYW5kIGNyZWF0ZSBlYWNoIG1hdGVyaWFsIGRlc2NyaWJlZCBpbnNpZGVcclxuICAgICAqIFRoaXMgZnVuY3Rpb24gY291bGQgYmUgaW1wcm92ZSBieSBhZGRpbmcgOlxyXG4gICAgICogLXNvbWUgY29tcG9uZW50IG1pc3NpbmcgKE5pLCBUZi4uLilcclxuICAgICAqIC1pbmNsdWRpbmcgdGhlIHNwZWNpZmljIG9wdGlvbnMgYXZhaWxhYmxlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHNjZW5lIGRlZmluZXMgdGhlIHNjZW5lIHRoZSBtYXRlcmlhbCB3aWxsIGJlIGNyZWF0ZWQgaW5cclxuICAgICAqIEBwYXJhbSBkYXRhIGRlZmluZXMgdGhlIG10bCBkYXRhIHRvIHBhcnNlXHJcbiAgICAgKiBAcGFyYW0gcm9vdFVybCBkZWZpbmVzIHRoZSByb290dXJsIHRvIHVzZSBpbiBvcmRlciB0byBsb2FkIHJlbGF0aXZlIGRlcGVuZGVuY2llc1xyXG4gICAgICogQHBhcmFtIGFzc2V0Q29udGFpbmVyIGRlZmluZXMgdGhlIGFzc2V0IGNvbnRhaW5lciB0byBzdG9yZSB0aGUgbWF0ZXJpYWwgaW4gKGNhbiBiZSBudWxsKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcGFyc2VNVEwoc2NlbmU6IFNjZW5lLCBkYXRhOiBzdHJpbmcgfCBBcnJheUJ1ZmZlciwgcm9vdFVybDogc3RyaW5nLCBhc3NldENvbnRhaW5lcjogTnVsbGFibGU8QXNzZXRDb250YWluZXI+KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1NwbGl0IHRoZSBsaW5lcyBmcm9tIHRoZSBmaWxlXHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBkYXRhLnNwbGl0KFwiXFxuXCIpO1xyXG4gICAgICAgIC8vIHdoaXRlc3BhY2UgY2hhciBpZTogWyBcXHRcXHJcXG5cXGZdXHJcbiAgICAgICAgY29uc3QgZGVsaW1pdGVyX3BhdHRlcm4gPSAvXFxzKy87XHJcbiAgICAgICAgLy9BcnJheSB3aXRoIFJHQiBjb2xvcnNcclxuICAgICAgICBsZXQgY29sb3I6IG51bWJlcltdO1xyXG4gICAgICAgIC8vTmV3IG1hdGVyaWFsXHJcbiAgICAgICAgbGV0IG1hdGVyaWFsOiBOdWxsYWJsZTxTdGFuZGFyZE1hdGVyaWFsPiA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vTG9vayBhdCBlYWNoIGxpbmVcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tpXS50cmltKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBCbGFuayBsaW5lIG9yIGNvbW1lbnRcclxuICAgICAgICAgICAgaWYgKGxpbmUubGVuZ3RoID09PSAwIHx8IGxpbmUuY2hhckF0KDApID09PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vR2V0IHRoZSBmaXJzdCBwYXJhbWV0ZXIgKGtleXdvcmQpXHJcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IGxpbmUuaW5kZXhPZihcIiBcIik7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSBwb3MgPj0gMCA/IGxpbmUuc3Vic3RyaW5nKDAsIHBvcykgOiBsaW5lO1xyXG4gICAgICAgICAgICBrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICAgICAgICAgIC8vR2V0IHRoZSBkYXRhIGZvbGxvd2luZyB0aGUga2V5XHJcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlOiBzdHJpbmcgPSBwb3MgPj0gMCA/IGxpbmUuc3Vic3RyaW5nKHBvcyArIDEpLnRyaW0oKSA6IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvL1RoaXMgbXRsIGtleXdvcmQgd2lsbCBjcmVhdGUgdGhlIG5ldyBtYXRlcmlhbFxyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcIm5ld210bFwiKSB7XHJcbiAgICAgICAgICAgICAgICAvL0NoZWNrIGlmIGl0IGlzIHRoZSBmaXJzdCBtYXRlcmlhbC5cclxuICAgICAgICAgICAgICAgIC8vIE1hdGVyaWFscyBzcGVjaWZpY2F0aW9ucyBhcmUgZGVzY3JpYmVkIGFmdGVyIHRoaXMga2V5d29yZC5cclxuICAgICAgICAgICAgICAgIGlmIChtYXRlcmlhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vQWRkIHRoZSBwcmV2aW91cyBtYXRlcmlhbCBpbiB0aGUgbWF0ZXJpYWwgYXJyYXkuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXRlcmlhbHMucHVzaChtYXRlcmlhbCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBhIG5ldyBtYXRlcmlhbC5cclxuICAgICAgICAgICAgICAgIC8vIHZhbHVlIGlzIHRoZSBuYW1lIG9mIHRoZSBtYXRlcmlhbCByZWFkIGluIHRoZSBtdGwgZmlsZVxyXG5cclxuICAgICAgICAgICAgICAgIHNjZW5lLl9ibG9ja0VudGl0eUNvbGxlY3Rpb24gPSAhIWFzc2V0Q29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCh2YWx1ZSwgc2NlbmUpO1xyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwuX3BhcmVudENvbnRhaW5lciA9IGFzc2V0Q29udGFpbmVyO1xyXG4gICAgICAgICAgICAgICAgc2NlbmUuX2Jsb2NrRW50aXR5Q29sbGVjdGlvbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJrZFwiICYmIG1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEaWZmdXNlIGNvbG9yIChjb2xvciB1bmRlciB3aGl0ZSBsaWdodCkgdXNpbmcgUkdCIHZhbHVlc1xyXG5cclxuICAgICAgICAgICAgICAgIC8vdmFsdWUgID0gXCJyIGcgYlwiXHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IDxudW1iZXJbXT52YWx1ZS5zcGxpdChkZWxpbWl0ZXJfcGF0dGVybiwgMykubWFwKHBhcnNlRmxvYXQpO1xyXG4gICAgICAgICAgICAgICAgLy9jb2xvciA9IFtyLGcsYl1cclxuICAgICAgICAgICAgICAgIC8vU2V0IHRnaGUgY29sb3IgaW50byB0aGUgbWF0ZXJpYWxcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IENvbG9yMy5Gcm9tQXJyYXkoY29sb3IpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJrYVwiICYmIG1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBbWJpZW50IGNvbG9yIChjb2xvciB1bmRlciBzaGFkb3cpIHVzaW5nIFJHQiB2YWx1ZXNcclxuXHJcbiAgICAgICAgICAgICAgICAvL3ZhbHVlID0gXCJyIGcgYlwiXHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IDxudW1iZXJbXT52YWx1ZS5zcGxpdChkZWxpbWl0ZXJfcGF0dGVybiwgMykubWFwKHBhcnNlRmxvYXQpO1xyXG4gICAgICAgICAgICAgICAgLy9jb2xvciA9IFtyLGcsYl1cclxuICAgICAgICAgICAgICAgIC8vU2V0IHRnaGUgY29sb3IgaW50byB0aGUgbWF0ZXJpYWxcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsLmFtYmllbnRDb2xvciA9IENvbG9yMy5Gcm9tQXJyYXkoY29sb3IpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJrc1wiICYmIG1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTcGVjdWxhciBjb2xvciAoY29sb3Igd2hlbiBsaWdodCBpcyByZWZsZWN0ZWQgZnJvbSBzaGlueSBzdXJmYWNlKSB1c2luZyBSR0IgdmFsdWVzXHJcblxyXG4gICAgICAgICAgICAgICAgLy92YWx1ZSA9IFwiciBnIGJcIlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSA8bnVtYmVyW10+dmFsdWUuc3BsaXQoZGVsaW1pdGVyX3BhdHRlcm4sIDMpLm1hcChwYXJzZUZsb2F0KTtcclxuICAgICAgICAgICAgICAgIC8vY29sb3IgPSBbcixnLGJdXHJcbiAgICAgICAgICAgICAgICAvL1NldCB0aGUgY29sb3IgaW50byB0aGUgbWF0ZXJpYWxcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsLnNwZWN1bGFyQ29sb3IgPSBDb2xvcjMuRnJvbUFycmF5KGNvbG9yKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwia2VcIiAmJiBtYXRlcmlhbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRW1pc3NpdmUgY29sb3IgdXNpbmcgUkdCIHZhbHVlc1xyXG4gICAgICAgICAgICAgICAgY29sb3IgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXJfcGF0dGVybiwgMykubWFwKHBhcnNlRmxvYXQpO1xyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwuZW1pc3NpdmVDb2xvciA9IENvbG9yMy5Gcm9tQXJyYXkoY29sb3IpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJuc1wiICYmIG1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAvL3ZhbHVlID0gXCJJbnRlZ2VyXCJcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsLnNwZWN1bGFyUG93ZXIgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwiZFwiICYmIG1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAvL2QgaXMgZGlzc29sdmUgZm9yIGN1cnJlbnQgbWF0ZXJpYWwuIEl0IG1lYW4gYWxwaGEgZm9yIEJBQllMT05cclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsLmFscGhhID0gcGFyc2VGbG9hdCh2YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9UZXh0dXJlXHJcbiAgICAgICAgICAgICAgICAvL1RoaXMgcGFydCBjYW4gYmUgaW1wcm92ZWQgYnkgYWRkaW5nIHRoZSBwb3NzaWJsZSBvcHRpb25zIG9mIHRleHR1cmVcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwibWFwX2thXCIgJiYgbWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFtYmllbnQgdGV4dHVyZSBtYXAgd2l0aCBhIGxvYWRlZCBpbWFnZVxyXG4gICAgICAgICAgICAgICAgLy9XZSBtdXN0IGZpcnN0IGdldCB0aGUgZm9sZGVyIG9mIHRoZSBpbWFnZVxyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwuYW1iaWVudFRleHR1cmUgPSBNVExGaWxlTG9hZGVyLl9HZXRUZXh0dXJlKHJvb3RVcmwsIHZhbHVlLCBzY2VuZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcIm1hcF9rZFwiICYmIG1hdGVyaWFsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEaWZmdXNlIHRleHR1cmUgbWFwIHdpdGggYSBsb2FkZWQgaW1hZ2VcclxuICAgICAgICAgICAgICAgIG1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gTVRMRmlsZUxvYWRlci5fR2V0VGV4dHVyZShyb290VXJsLCB2YWx1ZSwgc2NlbmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJtYXBfa3NcIiAmJiBtYXRlcmlhbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gU3BlY3VsYXIgdGV4dHVyZSBtYXAgd2l0aCBhIGxvYWRlZCBpbWFnZVxyXG4gICAgICAgICAgICAgICAgLy9XZSBtdXN0IGZpcnN0IGdldCB0aGUgZm9sZGVyIG9mIHRoZSBpbWFnZVxyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwuc3BlY3VsYXJUZXh0dXJlID0gTVRMRmlsZUxvYWRlci5fR2V0VGV4dHVyZShyb290VXJsLCB2YWx1ZSwgc2NlbmUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJtYXBfbnNcIikge1xyXG4gICAgICAgICAgICAgICAgLy9TcGVjdWxhclxyXG4gICAgICAgICAgICAgICAgLy9TcGVjdWxhciBoaWdobGlnaHQgY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICAvL1dlIG11c3QgZmlyc3QgZ2V0IHRoZSBmb2xkZXIgb2YgdGhlIGltYWdlXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgLy9Ob3Qgc3VwcG9ydGVkIGJ5IEJBQllMT05cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAvLyAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwibWFwX2J1bXBcIiAmJiBtYXRlcmlhbCkge1xyXG4gICAgICAgICAgICAgICAgLy9UaGUgYnVtcCB0ZXh0dXJlXHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZXMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXJfcGF0dGVybik7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBidW1wTXVsdGlwbGllckluZGV4ID0gdmFsdWVzLmluZGV4T2YoXCItYm1cIik7XHJcbiAgICAgICAgICAgICAgICBsZXQgYnVtcE11bHRpcGxpZXI6IE51bGxhYmxlPHN0cmluZz4gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChidW1wTXVsdGlwbGllckluZGV4ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBidW1wTXVsdGlwbGllciA9IHZhbHVlc1tidW1wTXVsdGlwbGllckluZGV4ICsgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnNwbGljZShidW1wTXVsdGlwbGllckluZGV4LCAyKTsgLy8gcmVtb3ZlXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwuYnVtcFRleHR1cmUgPSBNVExGaWxlTG9hZGVyLl9HZXRUZXh0dXJlKHJvb3RVcmwsIHZhbHVlcy5qb2luKFwiIFwiKSwgc2NlbmUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGVyaWFsLmJ1bXBUZXh0dXJlICYmIGJ1bXBNdWx0aXBsaWVyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0ZXJpYWwuYnVtcFRleHR1cmUubGV2ZWwgPSBwYXJzZUZsb2F0KGJ1bXBNdWx0aXBsaWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwibWFwX2RcIiAmJiBtYXRlcmlhbCkge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGRpc3NvbHZlIG9mIHRoZSBtYXRlcmlhbFxyXG4gICAgICAgICAgICAgICAgbWF0ZXJpYWwub3BhY2l0eVRleHR1cmUgPSBNVExGaWxlTG9hZGVyLl9HZXRUZXh0dXJlKHJvb3RVcmwsIHZhbHVlLCBzY2VuZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9PcHRpb25zIGZvciBpbGx1bWluYXRpb25cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwiaWxsdW1cIikge1xyXG4gICAgICAgICAgICAgICAgLy9JbGx1bWluYXRpb25cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gXCIwXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1RoYXQgbWVhbiBLZCA9PSBLZFxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCIxXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL0NvbG9yIG9uIGFuZCBBbWJpZW50IG9uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIjJcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vSGlnaGxpZ2h0IG9uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIjNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vUmVmbGVjdGlvbiBvbiBhbmQgUmF5IHRyYWNlIG9uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIjRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVHJhbnNwYXJlbmN5OiBHbGFzcyBvbiwgUmVmbGVjdGlvbjogUmF5IHRyYWNlIG9uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIjVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vUmVmbGVjdGlvbjogRnJlc25lbCBvbiBhbmQgUmF5IHRyYWNlIG9uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIjZcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVHJhbnNwYXJlbmN5OiBSZWZyYWN0aW9uIG9uLCBSZWZsZWN0aW9uOiBGcmVzbmVsIG9mZiBhbmQgUmF5IHRyYWNlIG9uXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIjdcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVHJhbnNwYXJlbmN5OiBSZWZyYWN0aW9uIG9uLCBSZWZsZWN0aW9uOiBGcmVzbmVsIG9uIGFuZCBSYXkgdHJhY2Ugb25cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IFwiOFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9SZWZsZWN0aW9uIG9uIGFuZCBSYXkgdHJhY2Ugb2ZmXHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBcIjlcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vVHJhbnNwYXJlbmN5OiBHbGFzcyBvbiwgUmVmbGVjdGlvbjogUmF5IHRyYWNlIG9mZlxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gXCIxMFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9DYXN0cyBzaGFkb3dzIG9udG8gaW52aXNpYmxlIHN1cmZhY2VzXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlVuaGFuZGxlZCBleHByZXNzaW9uIGF0IGxpbmUgOiBcIiArIGkgKydcXG4nICsgXCJ3aXRoIHZhbHVlIDogXCIgKyBsaW5lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvL0F0IHRoZSBlbmQgb2YgdGhlIGZpbGUsIGFkZCB0aGUgbGFzdCBtYXRlcmlhbFxyXG4gICAgICAgIGlmIChtYXRlcmlhbCkge1xyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFscy5wdXNoKG1hdGVyaWFsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSB0ZXh0dXJlIGZvciB0aGUgbWF0ZXJpYWwuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIG1hdGVyaWFsIGlzIGltcG9ydGVkIGZyb20gaW5wdXQgZmlsZSxcclxuICAgICAqIFdlIHNhbml0aXplIHRoZSB1cmwgdG8gZW5zdXJlIGl0IHRha2VzIHRoZSB0ZXh0dXJlIGZyb20gYXNpZGUgdGhlIG1hdGVyaWFsLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSByb290VXJsIFRoZSByb290IHVybCB0byBsb2FkIGZyb21cclxuICAgICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgc3RvcmVkIGluIHRoZSBtdGxcclxuICAgICAqIEBwYXJhbSBzY2VuZVxyXG4gICAgICogQHJldHVybnMgVGhlIFRleHR1cmVcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgX0dldFRleHR1cmUocm9vdFVybDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBzY2VuZTogU2NlbmUpOiBOdWxsYWJsZTxUZXh0dXJlPiB7XHJcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB1cmwgPSByb290VXJsO1xyXG4gICAgICAgIC8vIExvYWQgZnJvbSBpbnB1dCBmaWxlLlxyXG4gICAgICAgIGlmIChyb290VXJsID09PSBcImZpbGU6XCIpIHtcclxuICAgICAgICAgICAgbGV0IGxhc3REZWxpbWl0ZXIgPSB2YWx1ZS5sYXN0SW5kZXhPZihcIlxcXFxcIik7XHJcbiAgICAgICAgICAgIGlmIChsYXN0RGVsaW1pdGVyID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgbGFzdERlbGltaXRlciA9IHZhbHVlLmxhc3RJbmRleE9mKFwiL1wiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGxhc3REZWxpbWl0ZXIgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdXJsICs9IHZhbHVlLnN1YnN0cmluZyhsYXN0RGVsaW1pdGVyICsgMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB1cmwgKz0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTm90IGZyb20gaW5wdXQgZmlsZS5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdXJsICs9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBUZXh0dXJlKHVybCwgc2NlbmUsIGZhbHNlLCBNVExGaWxlTG9hZGVyLklOVkVSVF9URVhUVVJFX1kpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8taW50ZXJuYWwtbW9kdWxlc1xyXG5pbXBvcnQgdHlwZSB7IElTY2VuZUxvYWRlclBsdWdpbk1ldGFkYXRhIH0gZnJvbSBcImNvcmUvaW5kZXhcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBPQkpGaWxlTG9hZGVyTWV0YWRhdGEgPSB7XHJcbiAgICBuYW1lOiBcIm9ialwiLFxyXG4gICAgZXh0ZW5zaW9uczogXCIub2JqXCIsXHJcbn0gYXMgY29uc3Qgc2F0aXNmaWVzIElTY2VuZUxvYWRlclBsdWdpbk1ldGFkYXRhO1xyXG4iLCJpbXBvcnQgdHlwZSB7IE51bGxhYmxlIH0gZnJvbSBcImNvcmUvdHlwZXNcIjtcclxuaW1wb3J0IHsgVmVjdG9yMiB9IGZyb20gXCJjb3JlL01hdGhzL21hdGgudmVjdG9yXCI7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSBcImNvcmUvTWlzYy90b29sc1wiO1xyXG5pbXBvcnQgdHlwZSB7IEFic3RyYWN0TWVzaCB9IGZyb20gXCJjb3JlL01lc2hlcy9hYnN0cmFjdE1lc2hcIjtcclxuaW1wb3J0IHR5cGUgeyBJU2NlbmVMb2FkZXJQbHVnaW5Bc3luYywgSVNjZW5lTG9hZGVyUGx1Z2luRmFjdG9yeSwgSVNjZW5lTG9hZGVyUGx1Z2luLCBJU2NlbmVMb2FkZXJBc3luY1Jlc3VsdCB9IGZyb20gXCJjb3JlL0xvYWRpbmcvc2NlbmVMb2FkZXJcIjtcclxuaW1wb3J0IHsgcmVnaXN0ZXJTY2VuZUxvYWRlclBsdWdpbiB9IGZyb20gXCJjb3JlL0xvYWRpbmcvc2NlbmVMb2FkZXJcIjtcclxuaW1wb3J0IHsgQXNzZXRDb250YWluZXIgfSBmcm9tIFwiY29yZS9hc3NldENvbnRhaW5lclwiO1xyXG5pbXBvcnQgdHlwZSB7IFNjZW5lIH0gZnJvbSBcImNvcmUvc2NlbmVcIjtcclxuaW1wb3J0IHR5cGUgeyBXZWJSZXF1ZXN0IH0gZnJvbSBcImNvcmUvTWlzYy93ZWJSZXF1ZXN0XCI7XHJcbmltcG9ydCB7IE9CSkZpbGVMb2FkZXJNZXRhZGF0YSB9IGZyb20gXCIuL29iakZpbGVMb2FkZXIubWV0YWRhdGFcIjtcclxuaW1wb3J0IHsgTVRMRmlsZUxvYWRlciB9IGZyb20gXCIuL210bEZpbGVMb2FkZXJcIjtcclxuaW1wb3J0IHR5cGUgeyBPQkpMb2FkaW5nT3B0aW9ucyB9IGZyb20gXCIuL29iakxvYWRpbmdPcHRpb25zXCI7XHJcbmltcG9ydCB7IFNvbGlkUGFyc2VyIH0gZnJvbSBcIi4vc29saWRQYXJzZXJcIjtcclxuaW1wb3J0IHR5cGUgeyBNZXNoIH0gZnJvbSBcImNvcmUvTWVzaGVzL21lc2hcIjtcclxuaW1wb3J0IHsgU3RhbmRhcmRNYXRlcmlhbCB9IGZyb20gXCJjb3JlL01hdGVyaWFscy9zdGFuZGFyZE1hdGVyaWFsXCI7XHJcblxyXG5kZWNsYXJlIG1vZHVsZSBcImNvcmUvTG9hZGluZy9zY2VuZUxvYWRlclwiIHtcclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBqc2RvYy9yZXF1aXJlLWpzZG9jXHJcbiAgICBleHBvcnQgaW50ZXJmYWNlIFNjZW5lTG9hZGVyUGx1Z2luT3B0aW9ucyB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRGVmaW5lcyBvcHRpb25zIGZvciB0aGUgb2JqIGxvYWRlci5cclxuICAgICAgICAgKi9cclxuICAgICAgICBbT0JKRmlsZUxvYWRlck1ldGFkYXRhLm5hbWVdOiB7fTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9CSiBmaWxlIHR5cGUgbG9hZGVyLlxyXG4gKiBUaGlzIGlzIGEgYmFieWxvbiBzY2VuZSBsb2FkZXIgcGx1Z2luLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIE9CSkZpbGVMb2FkZXIgaW1wbGVtZW50cyBJU2NlbmVMb2FkZXJQbHVnaW5Bc3luYywgSVNjZW5lTG9hZGVyUGx1Z2luRmFjdG9yeSB7XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgaWYgVVZzIGFyZSBvcHRpbWl6ZWQgYnkgZGVmYXVsdCBkdXJpbmcgbG9hZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBPUFRJTUlaRV9XSVRIX1VWID0gdHJ1ZTtcclxuICAgIC8qKlxyXG4gICAgICogSW52ZXJ0IG1vZGVsIG9uIHktYXhpcyAoZG9lcyBhIG1vZGVsIHNjYWxpbmcgaW52ZXJzaW9uKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc3RhdGljIElOVkVSVF9ZID0gZmFsc2U7XHJcbiAgICAvKipcclxuICAgICAqIEludmVydCBZLUF4aXMgb2YgcmVmZXJlbmNlZCB0ZXh0dXJlcyBvbiBsb2FkXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IElOVkVSVF9URVhUVVJFX1koKSB7XHJcbiAgICAgICAgcmV0dXJuIE1UTEZpbGVMb2FkZXIuSU5WRVJUX1RFWFRVUkVfWTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHNldCBJTlZFUlRfVEVYVFVSRV9ZKHZhbHVlOiBib29sZWFuKSB7XHJcbiAgICAgICAgTVRMRmlsZUxvYWRlci5JTlZFUlRfVEVYVFVSRV9ZID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbmNsdWRlIGluIG1lc2hlcyB0aGUgdmVydGV4IGNvbG9ycyBhdmFpbGFibGUgaW4gc29tZSBPQkogZmlsZXMuICBUaGlzIGlzIG5vdCBwYXJ0IG9mIE9CSiBzdGFuZGFyZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBJTVBPUlRfVkVSVEVYX0NPTE9SUyA9IGZhbHNlO1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wdXRlIHRoZSBub3JtYWxzIGZvciB0aGUgbW9kZWwsIGV2ZW4gaWYgbm9ybWFscyBhcmUgcHJlc2VudCBpbiB0aGUgZmlsZS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBDT01QVVRFX05PUk1BTFMgPSBmYWxzZTtcclxuICAgIC8qKlxyXG4gICAgICogT3B0aW1pemUgdGhlIG5vcm1hbHMgZm9yIHRoZSBtb2RlbC4gTGlnaHRpbmcgY2FuIGJlIHVuZXZlbiBpZiB5b3UgdXNlIE9wdGltaXplV2l0aFVWID0gdHJ1ZSBiZWNhdXNlIG5ldyB2ZXJ0aWNlcyBjYW4gYmUgY3JlYXRlZCBmb3IgdGhlIHNhbWUgbG9jYXRpb24gaWYgdGhleSBwZXJ0YWluIHRvIGRpZmZlcmVudCBmYWNlcy5cclxuICAgICAqIFVzaW5nIE9wdGltaXplaE5vcm1hbHMgPSB0cnVlIHdpbGwgaGVscCBzbW9vdGhpbmcgdGhlIGxpZ2h0aW5nIGJ5IGF2ZXJhZ2luZyB0aGUgbm9ybWFscyBvZiB0aG9zZSB2ZXJ0aWNlcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBPUFRJTUlaRV9OT1JNQUxTID0gZmFsc2U7XHJcbiAgICAvKipcclxuICAgICAqIERlZmluZXMgY3VzdG9tIHNjYWxpbmcgb2YgVVYgY29vcmRpbmF0ZXMgb2YgbG9hZGVkIG1lc2hlcy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBVVl9TQ0FMSU5HID0gbmV3IFZlY3RvcjIoMSwgMSk7XHJcbiAgICAvKipcclxuICAgICAqIFNraXAgbG9hZGluZyB0aGUgbWF0ZXJpYWxzIGV2ZW4gaWYgZGVmaW5lZCBpbiB0aGUgT0JKIGZpbGUgKG1hdGVyaWFscyBhcmUgaWdub3JlZCkuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgU0tJUF9NQVRFUklBTFMgPSBmYWxzZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZW4gYSBtYXRlcmlhbCBmYWlscyB0byBsb2FkIE9CSiBsb2FkZXIgd2lsbCBzaWxlbnRseSBmYWlsIGFuZCBvblN1Y2Nlc3MoKSBjYWxsYmFjayB3aWxsIGJlIHRyaWdnZXJlZC5cclxuICAgICAqXHJcbiAgICAgKiBEZWZhdWx0cyB0byB0cnVlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBNQVRFUklBTF9MT0FESU5HX0ZBSUxTX1NJTEVOVExZID0gdHJ1ZTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIExvYWRzIGFzc2V0cyB3aXRob3V0IGhhbmRlZG5lc3MgY29udmVyc2lvbnMuIFRoaXMgZmxhZyBpcyBmb3IgY29tcGF0aWJpbGl0eS4gVXNlIGl0IG9ubHkgaWYgYWJzb2x1dGVseSByZXF1aXJlZC4gRGVmYXVsdHMgdG8gZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgVVNFX0xFR0FDWV9CRUhBVklPUiA9IGZhbHNlO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGVmaW5lcyB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9IE9CSkZpbGVMb2FkZXJNZXRhZGF0YS5uYW1lO1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWZpbmVzIHRoZSBleHRlbnNpb24gdGhlIHBsdWdpbiBpcyBhYmxlIHRvIGxvYWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyByZWFkb25seSBleHRlbnNpb25zID0gT0JKRmlsZUxvYWRlck1ldGFkYXRhLmV4dGVuc2lvbnM7XHJcblxyXG4gICAgcHJpdmF0ZSBfYXNzZXRDb250YWluZXI6IE51bGxhYmxlPEFzc2V0Q29udGFpbmVyPiA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBfbG9hZGluZ09wdGlvbnM6IE9CSkxvYWRpbmdPcHRpb25zO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlcyBsb2FkZXIgZm9yIC5PQkogZmlsZXNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbG9hZGluZ09wdGlvbnMgb3B0aW9ucyBmb3IgbG9hZGluZyBhbmQgcGFyc2luZyBPQkovTVRMIGZpbGVzLlxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihsb2FkaW5nT3B0aW9ucz86IE9CSkxvYWRpbmdPcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy5fbG9hZGluZ09wdGlvbnMgPSBsb2FkaW5nT3B0aW9ucyB8fCBPQkpGaWxlTG9hZGVyLl9EZWZhdWx0TG9hZGluZ09wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0IF9EZWZhdWx0TG9hZGluZ09wdGlvbnMoKTogT0JKTG9hZGluZ09wdGlvbnMge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvbXB1dGVOb3JtYWxzOiBPQkpGaWxlTG9hZGVyLkNPTVBVVEVfTk9STUFMUyxcclxuICAgICAgICAgICAgb3B0aW1pemVOb3JtYWxzOiBPQkpGaWxlTG9hZGVyLk9QVElNSVpFX05PUk1BTFMsXHJcbiAgICAgICAgICAgIGltcG9ydFZlcnRleENvbG9yczogT0JKRmlsZUxvYWRlci5JTVBPUlRfVkVSVEVYX0NPTE9SUyxcclxuICAgICAgICAgICAgaW52ZXJ0WTogT0JKRmlsZUxvYWRlci5JTlZFUlRfWSxcclxuICAgICAgICAgICAgaW52ZXJ0VGV4dHVyZVk6IE9CSkZpbGVMb2FkZXIuSU5WRVJUX1RFWFRVUkVfWSxcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxyXG4gICAgICAgICAgICBVVlNjYWxpbmc6IE9CSkZpbGVMb2FkZXIuVVZfU0NBTElORyxcclxuICAgICAgICAgICAgbWF0ZXJpYWxMb2FkaW5nRmFpbHNTaWxlbnRseTogT0JKRmlsZUxvYWRlci5NQVRFUklBTF9MT0FESU5HX0ZBSUxTX1NJTEVOVExZLFxyXG4gICAgICAgICAgICBvcHRpbWl6ZVdpdGhVVjogT0JKRmlsZUxvYWRlci5PUFRJTUlaRV9XSVRIX1VWLFxyXG4gICAgICAgICAgICBza2lwTWF0ZXJpYWxzOiBPQkpGaWxlTG9hZGVyLlNLSVBfTUFURVJJQUxTLFxyXG4gICAgICAgICAgICB1c2VMZWdhY3lCZWhhdmlvcjogT0JKRmlsZUxvYWRlci5VU0VfTEVHQUNZX0JFSEFWSU9SLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxscyBzeW5jaHJvbm91c2x5IHRoZSBNVEwgZmlsZSBhdHRhY2hlZCB0byB0aGlzIG9iai5cclxuICAgICAqIExvYWQgZnVuY3Rpb24gb3IgaW1wb3J0TWVzaCBmdW5jdGlvbiBkb24ndCBlbmFibGUgdG8gbG9hZCAyIGZpbGVzIGluIHRoZSBzYW1lIHRpbWUgYXN5bmNocm9ub3VzbHkuXHJcbiAgICAgKiBXaXRob3V0IHRoaXMgZnVuY3Rpb24gbWF0ZXJpYWxzIGFyZSBub3QgZGlzcGxheWVkIGluIHRoZSBmaXJzdCBmcmFtZSAoYnV0IGRpc3BsYXllZCBhZnRlcikuXHJcbiAgICAgKiBJbiBjb25zZXF1ZW5jZSBpdCBpcyBpbXBvc3NpYmxlIHRvIGdldCBtYXRlcmlhbCBpbmZvcm1hdGlvbiBpbiB5b3VyIEhUTUwgZmlsZVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB1cmwgVGhlIFVSTCBvZiB0aGUgTVRMIGZpbGVcclxuICAgICAqIEBwYXJhbSByb290VXJsIGRlZmluZXMgd2hlcmUgdG8gbG9hZCBkYXRhIGZyb21cclxuICAgICAqIEBwYXJhbSBvblN1Y2Nlc3MgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIE1UTCBmaWxlIGlzIGxvYWRlZFxyXG4gICAgICogQHBhcmFtIG9uRmFpbHVyZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9sb2FkTVRMKFxyXG4gICAgICAgIHVybDogc3RyaW5nLFxyXG4gICAgICAgIHJvb3RVcmw6IHN0cmluZyxcclxuICAgICAgICBvblN1Y2Nlc3M6IChyZXNwb25zZTogc3RyaW5nIHwgQXJyYXlCdWZmZXIsIHJlc3BvbnNlVXJsPzogc3RyaW5nKSA9PiBhbnksXHJcbiAgICAgICAgb25GYWlsdXJlOiAocGF0aE9mRmlsZTogc3RyaW5nLCBleGNlcHRpb24/OiBhbnkpID0+IHZvaWRcclxuICAgICkge1xyXG4gICAgICAgIC8vVGhlIGNvbXBsZXRlIHBhdGggdG8gdGhlIG10bCBmaWxlXHJcbiAgICAgICAgY29uc3QgcGF0aE9mRmlsZSA9IHJvb3RVcmwgKyB1cmw7XHJcblxyXG4gICAgICAgIC8vIExvYWRzIHRocm91Z2ggdGhlIGJhYnlsb24gdG9vbHMgdG8gYWxsb3cgZmlsZUlucHV0IHNlYXJjaC5cclxuICAgICAgICBUb29scy5Mb2FkRmlsZShwYXRoT2ZGaWxlLCBvblN1Y2Nlc3MsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmYWxzZSwgKHJlcXVlc3Q/OiBXZWJSZXF1ZXN0IHwgdW5kZWZpbmVkLCBleGNlcHRpb24/OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgb25GYWlsdXJlKHBhdGhPZkZpbGUsIGV4Y2VwdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbnN0YW50aWF0ZXMgYSBPQkogZmlsZSBsb2FkZXIgcGx1Z2luLlxyXG4gICAgICogQHJldHVybnMgdGhlIGNyZWF0ZWQgcGx1Z2luXHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZVBsdWdpbigpOiBJU2NlbmVMb2FkZXJQbHVnaW5Bc3luYyB8IElTY2VuZUxvYWRlclBsdWdpbiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBPQkpGaWxlTG9hZGVyKE9CSkZpbGVMb2FkZXIuX0RlZmF1bHRMb2FkaW5nT3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJZiB0aGUgZGF0YSBzdHJpbmcgY2FuIGJlIGxvYWRlZCBkaXJlY3RseS5cclxuICAgICAqIEByZXR1cm5zIGlmIHRoZSBkYXRhIGNhbiBiZSBsb2FkZWQgZGlyZWN0bHlcclxuICAgICAqL1xyXG4gICAgcHVibGljIGNhbkRpcmVjdExvYWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW1wb3J0cyBvbmUgb3IgbW9yZSBtZXNoZXMgZnJvbSB0aGUgbG9hZGVkIE9CSiBkYXRhIGFuZCBhZGRzIHRoZW0gdG8gdGhlIHNjZW5lXHJcbiAgICAgKiBAcGFyYW0gbWVzaGVzTmFtZXMgYSBzdHJpbmcgb3IgYXJyYXkgb2Ygc3RyaW5ncyBvZiB0aGUgbWVzaCBuYW1lcyB0aGF0IHNob3VsZCBiZSBsb2FkZWQgZnJvbSB0aGUgZmlsZVxyXG4gICAgICogQHBhcmFtIHNjZW5lIHRoZSBzY2VuZSB0aGUgbWVzaGVzIHNob3VsZCBiZSBhZGRlZCB0b1xyXG4gICAgICogQHBhcmFtIGRhdGEgdGhlIE9CSiBkYXRhIHRvIGxvYWRcclxuICAgICAqIEBwYXJhbSByb290VXJsIHJvb3QgdXJsIHRvIGxvYWQgZnJvbVxyXG4gICAgICogQHJldHVybnMgYSBwcm9taXNlIGNvbnRhaW5pbmcgdGhlIGxvYWRlZCBtZXNoZXMsIHBhcnRpY2xlcywgc2tlbGV0b25zIGFuZCBhbmltYXRpb25zXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbXBvcnRNZXNoQXN5bmMobWVzaGVzTmFtZXM6IGFueSwgc2NlbmU6IFNjZW5lLCBkYXRhOiBhbnksIHJvb3RVcmw6IHN0cmluZyk6IFByb21pc2U8SVNjZW5lTG9hZGVyQXN5bmNSZXN1bHQ+IHtcclxuICAgICAgICAvL2dldCB0aGUgbWVzaGVzIGZyb20gT0JKIGZpbGVcclxuICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VTb2xpZChtZXNoZXNOYW1lcywgc2NlbmUsIGRhdGEsIHJvb3RVcmwpLnRoZW4oKG1lc2hlcykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgbWVzaGVzOiBtZXNoZXMsXHJcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZVN5c3RlbXM6IFtdLFxyXG4gICAgICAgICAgICAgICAgc2tlbGV0b25zOiBbXSxcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbkdyb3VwczogW10sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1Ob2RlczogW10sXHJcbiAgICAgICAgICAgICAgICBnZW9tZXRyaWVzOiBbXSxcclxuICAgICAgICAgICAgICAgIGxpZ2h0czogW10sXHJcbiAgICAgICAgICAgICAgICBzcHJpdGVNYW5hZ2VyczogW10sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbXBvcnRzIGFsbCBvYmplY3RzIGZyb20gdGhlIGxvYWRlZCBPQkogZGF0YSBhbmQgYWRkcyB0aGVtIHRvIHRoZSBzY2VuZVxyXG4gICAgICogQHBhcmFtIHNjZW5lIHRoZSBzY2VuZSB0aGUgb2JqZWN0cyBzaG91bGQgYmUgYWRkZWQgdG9cclxuICAgICAqIEBwYXJhbSBkYXRhIHRoZSBPQkogZGF0YSB0byBsb2FkXHJcbiAgICAgKiBAcGFyYW0gcm9vdFVybCByb290IHVybCB0byBsb2FkIGZyb21cclxuICAgICAqIEByZXR1cm5zIGEgcHJvbWlzZSB3aGljaCBjb21wbGV0ZXMgd2hlbiBvYmplY3RzIGhhdmUgYmVlbiBsb2FkZWQgdG8gdGhlIHNjZW5lXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBsb2FkQXN5bmMoc2NlbmU6IFNjZW5lLCBkYXRhOiBzdHJpbmcsIHJvb3RVcmw6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIC8vR2V0IHRoZSAzRCBtb2RlbFxyXG4gICAgICAgIHJldHVybiB0aGlzLmltcG9ydE1lc2hBc3luYyhudWxsLCBzY2VuZSwgZGF0YSwgcm9vdFVybCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIHJldHVybiB2b2lkXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkIGludG8gYW4gYXNzZXQgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIHNjZW5lIFRoZSBzY2VuZSB0byBsb2FkIGludG9cclxuICAgICAqIEBwYXJhbSBkYXRhIFRoZSBkYXRhIHRvIGltcG9ydFxyXG4gICAgICogQHBhcmFtIHJvb3RVcmwgVGhlIHJvb3QgdXJsIGZvciBzY2VuZSBhbmQgcmVzb3VyY2VzXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgbG9hZGVkIGFzc2V0IGNvbnRhaW5lclxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgbG9hZEFzc2V0Q29udGFpbmVyQXN5bmMoc2NlbmU6IFNjZW5lLCBkYXRhOiBzdHJpbmcsIHJvb3RVcmw6IHN0cmluZyk6IFByb21pc2U8QXNzZXRDb250YWluZXI+IHtcclxuICAgICAgICBjb25zdCBjb250YWluZXIgPSBuZXcgQXNzZXRDb250YWluZXIoc2NlbmUpO1xyXG4gICAgICAgIHRoaXMuX2Fzc2V0Q29udGFpbmVyID0gY29udGFpbmVyO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5pbXBvcnRNZXNoQXN5bmMobnVsbCwgc2NlbmUsIGRhdGEsIHJvb3RVcmwpXHJcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5tZXNoZXMuZm9yRWFjaCgobWVzaCkgPT4gY29udGFpbmVyLm1lc2hlcy5wdXNoKG1lc2gpKTtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5tZXNoZXMuZm9yRWFjaCgobWVzaCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGVyaWFsID0gbWVzaC5tYXRlcmlhbDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWF0ZXJpYWxzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb250YWluZXIubWF0ZXJpYWxzLmluZGV4T2YobWF0ZXJpYWwpID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIubWF0ZXJpYWxzLnB1c2gobWF0ZXJpYWwpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRleHR1cmVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0dXJlcyA9IG1hdGVyaWFsLmdldEFjdGl2ZVRleHR1cmVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlcy5mb3JFYWNoKCh0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5lci50ZXh0dXJlcy5pbmRleE9mKHQpID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci50ZXh0dXJlcy5wdXNoKHQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hc3NldENvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGFpbmVyO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9hc3NldENvbnRhaW5lciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBleDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWFkIHRoZSBPQkogZmlsZSBhbmQgY3JlYXRlIGFuIEFycmF5IG9mIG1lc2hlcy5cclxuICAgICAqIEVhY2ggbWVzaCBjb250YWlucyBhbGwgaW5mb3JtYXRpb24gZ2l2ZW4gYnkgdGhlIE9CSiBhbmQgdGhlIE1UTCBmaWxlLlxyXG4gICAgICogaS5lLiB2ZXJ0aWNlcyBwb3NpdGlvbnMgYW5kIGluZGljZXMsIG9wdGlvbmFsIG5vcm1hbHMgdmFsdWVzLCBvcHRpb25hbCBVViB2YWx1ZXMsIG9wdGlvbmFsIG1hdGVyaWFsXHJcbiAgICAgKiBAcGFyYW0gbWVzaGVzTmFtZXMgZGVmaW5lcyBhIHN0cmluZyBvciBhcnJheSBvZiBzdHJpbmdzIG9mIHRoZSBtZXNoIG5hbWVzIHRoYXQgc2hvdWxkIGJlIGxvYWRlZCBmcm9tIHRoZSBmaWxlXHJcbiAgICAgKiBAcGFyYW0gc2NlbmUgZGVmaW5lcyB0aGUgc2NlbmUgd2hlcmUgYXJlIGRpc3BsYXllZCB0aGUgZGF0YVxyXG4gICAgICogQHBhcmFtIGRhdGEgZGVmaW5lcyB0aGUgY29udGVudCBvZiB0aGUgb2JqIGZpbGVcclxuICAgICAqIEBwYXJhbSByb290VXJsIGRlZmluZXMgdGhlIHBhdGggdG8gdGhlIGZvbGRlclxyXG4gICAgICogQHJldHVybnMgdGhlIGxpc3Qgb2YgbG9hZGVkIG1lc2hlc1xyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9wYXJzZVNvbGlkKG1lc2hlc05hbWVzOiBhbnksIHNjZW5lOiBTY2VuZSwgZGF0YTogc3RyaW5nLCByb290VXJsOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PEFic3RyYWN0TWVzaD4+IHtcclxuICAgICAgICBsZXQgZmlsZVRvTG9hZDogc3RyaW5nID0gXCJcIjsgLy9UaGUgbmFtZSBvZiB0aGUgbXRsRmlsZSB0byBsb2FkXHJcbiAgICAgICAgY29uc3QgbWF0ZXJpYWxzRnJvbU1UTEZpbGU6IE1UTEZpbGVMb2FkZXIgPSBuZXcgTVRMRmlsZUxvYWRlcigpO1xyXG4gICAgICAgIGNvbnN0IG1hdGVyaWFsVG9Vc2U6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgY29uc3QgYmFieWxvbk1lc2hlc0FycmF5OiBBcnJheTxNZXNoPiA9IFtdOyAvL1RoZSBtZXNoIGZvciBiYWJ5bG9uXHJcblxyXG4gICAgICAgIC8vIFNhbml0aXplIGRhdGFcclxuICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC8jLiokL2dtLCBcIlwiKS50cmltKCk7XHJcblxyXG4gICAgICAgIC8vIE1haW4gZnVuY3Rpb25cclxuICAgICAgICBjb25zdCBzb2xpZFBhcnNlciA9IG5ldyBTb2xpZFBhcnNlcihtYXRlcmlhbFRvVXNlLCBiYWJ5bG9uTWVzaGVzQXJyYXksIHRoaXMuX2xvYWRpbmdPcHRpb25zKTtcclxuXHJcbiAgICAgICAgc29saWRQYXJzZXIucGFyc2UobWVzaGVzTmFtZXMsIGRhdGEsIHNjZW5lLCB0aGlzLl9hc3NldENvbnRhaW5lciwgKGZpbGVOYW1lOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgICAgZmlsZVRvTG9hZCA9IGZpbGVOYW1lO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBsb2FkIHRoZSBtYXRlcmlhbHNcclxuICAgICAgICBjb25zdCBtdGxQcm9taXNlczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcclxuICAgICAgICAvLyBDaGVjayBpZiB3ZSBoYXZlIGEgZmlsZSB0byBsb2FkXHJcbiAgICAgICAgaWYgKGZpbGVUb0xvYWQgIT09IFwiXCIgJiYgIXRoaXMuX2xvYWRpbmdPcHRpb25zLnNraXBNYXRlcmlhbHMpIHtcclxuICAgICAgICAgICAgLy9Mb2FkIHRoZSBmaWxlIHN5bmNocm9ub3VzbHlcclxuICAgICAgICAgICAgbXRsUHJvbWlzZXMucHVzaChcclxuICAgICAgICAgICAgICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb2FkTVRMKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlVG9Mb2FkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByb290VXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoZGF0YUxvYWRlZCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBtYXRlcmlhbHMgdGhhbmtzIE1UTExvYWRlciBmdW5jdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGVyaWFsc0Zyb21NVExGaWxlLnBhcnNlTVRMKHNjZW5lLCBkYXRhTG9hZGVkLCByb290VXJsLCB0aGlzLl9hc3NldENvbnRhaW5lcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9Mb29rIGF0IGVhY2ggbWF0ZXJpYWwgbG9hZGVkIGluIHRoZSBtdGwgZmlsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgbWF0ZXJpYWxzRnJvbU1UTEZpbGUubWF0ZXJpYWxzLmxlbmd0aDsgbisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vVGhyZWUgdmFyaWFibGVzIHRvIGdldCBhbGwgbWVzaGVzIHdpdGggdGhlIHNhbWUgbWF0ZXJpYWxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBfaW5kaWNlcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgX2luZGV4O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9UaGUgbWF0ZXJpYWwgZnJvbSBNVEwgZmlsZSBpcyB1c2VkIGluIHRoZSBtZXNoZXMgbG9hZGVkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vUHVzaCB0aGUgaW5kaWNlIGluIGFuIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQ2hlY2sgaWYgdGhlIG1hdGVyaWFsIGlzIG5vdCB1c2VkIGZvciBhbm90aGVyIG1lc2hcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKChfaW5kZXggPSBtYXRlcmlhbFRvVXNlLmluZGV4T2YobWF0ZXJpYWxzRnJvbU1UTEZpbGUubWF0ZXJpYWxzW25dLm5hbWUsIHN0YXJ0SW5kZXgpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaW5kaWNlcy5wdXNoKF9pbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gX2luZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0lmIHRoZSBtYXRlcmlhbCBpcyBub3QgdXNlZCBkaXNwb3NlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfaW5kZXggPT09IC0xICYmIF9pbmRpY2VzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9JZiB0aGUgbWF0ZXJpYWwgaXMgbm90IG5lZWRlZCwgcmVtb3ZlIGl0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXRlcmlhbHNGcm9tTVRMRmlsZS5tYXRlcmlhbHNbbl0uZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgbyA9IDA7IG8gPCBfaW5kaWNlcy5sZW5ndGg7IG8rKykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQXBwbHkgdGhlIG1hdGVyaWFsIHRvIHRoZSBNZXNoIGZvciBlYWNoIG1lc2ggd2l0aCB0aGUgbWF0ZXJpYWxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNoID0gYmFieWxvbk1lc2hlc0FycmF5W19pbmRpY2VzW29dXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtYXRlcmlhbCA9IG1hdGVyaWFsc0Zyb21NVExGaWxlLm1hdGVyaWFsc1tuXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNoLm1hdGVyaWFsID0gbWF0ZXJpYWw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWVzaC5nZXRUb3RhbEluZGljZXMoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBObyBpbmRpY2VzLCB3ZSBuZWVkIHRvIHR1cm4gb24gcG9pbnQgY2xvdWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0ZXJpYWwucG9pbnRzQ2xvdWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuV2FybihgRXJyb3IgcHJvY2Vzc2luZyBNVEwgZmlsZTogJyR7ZmlsZVRvTG9hZH0nYCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdPcHRpb25zLm1hdGVyaWFsTG9hZGluZ0ZhaWxzU2lsZW50bHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChwYXRoT2ZGaWxlOiBzdHJpbmcsIGV4Y2VwdGlvbj86IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9vbHMuV2FybihgRXJyb3IgZG93bmxvYWRpbmcgTVRMIGZpbGU6ICcke2ZpbGVUb0xvYWR9J2ApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdPcHRpb25zLm1hdGVyaWFsTG9hZGluZ0ZhaWxzU2lsZW50bHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChleGNlcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vUmV0dXJuIGFuIGFycmF5IHdpdGggYWxsIE1lc2hcclxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwobXRsUHJvbWlzZXMpLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBpc0xpbmUgPSAobWVzaDogQWJzdHJhY3RNZXNoKSA9PiBCb29sZWFuKG1lc2guX2ludGVybmFsTWV0YWRhdGE/LltcIl9pc0xpbmVcIl0gPz8gZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBtZXNoLCBkZXRlcm1pbmUgaWYgaXQgaXMgYSBsaW5lIG1lc2gsIGNsb25lIG9yIG1vZGlmeSB0aGUgbWF0ZXJpYWwgdG8gbGluZSByZW5kZXJpbmcuXHJcbiAgICAgICAgICAgIGJhYnlsb25NZXNoZXNBcnJheS5mb3JFYWNoKChtZXNoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNMaW5lKG1lc2gpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdCA9IG1lc2gubWF0ZXJpYWwgPz8gbmV3IFN0YW5kYXJkTWF0ZXJpYWwobWVzaC5uYW1lICsgXCJfbGluZVwiLCBzY2VuZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgYW5vdGhlciBtZXNoIGlzIHVzaW5nIHRoaXMgbWF0ZXJpYWwgYW5kIGl0IGlzIG5vdCBhIGxpbmUgdGhlbiB3ZSBuZWVkIHRvIGNsb25lIGl0LlxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5lZWRDbG9uZSA9IG1hdC5nZXRCaW5kZWRNZXNoZXMoKS5maWx0ZXIoKGUpID0+ICFpc0xpbmUoZSkpLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5lZWRDbG9uZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXQgPSBtYXQuY2xvbmUobWF0Lm5hbWUgKyBcIl9saW5lXCIpID8/IG1hdDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0LndpcmVmcmFtZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzaC5tYXRlcmlhbCA9IG1hdDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWVzaC5faW50ZXJuYWxNZXRhZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNoLl9pbnRlcm5hbE1ldGFkYXRhW1wiX2lzTGluZVwiXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJhYnlsb25NZXNoZXNBcnJheTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLy9BZGQgdGhpcyBsb2FkZXIgaW50byB0aGUgcmVnaXN0ZXIgcGx1Z2luXHJcbnJlZ2lzdGVyU2NlbmVMb2FkZXJQbHVnaW4obmV3IE9CSkZpbGVMb2FkZXIoKSk7XHJcbiIsImltcG9ydCB0eXBlIHsgQXNzZXRDb250YWluZXIgfSBmcm9tIFwiY29yZS9hc3NldENvbnRhaW5lclwiO1xyXG5pbXBvcnQgeyBWZXJ0ZXhCdWZmZXIgfSBmcm9tIFwiY29yZS9CdWZmZXJzL2J1ZmZlclwiO1xyXG5pbXBvcnQgdHlwZSB7IE1hdGVyaWFsIH0gZnJvbSBcImNvcmUvTWF0ZXJpYWxzL21hdGVyaWFsXCI7XHJcbmltcG9ydCB7IFN0YW5kYXJkTWF0ZXJpYWwgfSBmcm9tIFwiY29yZS9NYXRlcmlhbHMvc3RhbmRhcmRNYXRlcmlhbFwiO1xyXG5pbXBvcnQgeyBDb2xvcjMsIENvbG9yNCB9IGZyb20gXCJjb3JlL01hdGhzL21hdGguY29sb3JcIjtcclxuaW1wb3J0IHsgVmVjdG9yMiwgVmVjdG9yMyB9IGZyb20gXCJjb3JlL01hdGhzL21hdGgudmVjdG9yXCI7XHJcbmltcG9ydCB0eXBlIHsgQWJzdHJhY3RNZXNoIH0gZnJvbSBcImNvcmUvTWVzaGVzL2Fic3RyYWN0TWVzaFwiO1xyXG5pbXBvcnQgeyBHZW9tZXRyeSB9IGZyb20gXCJjb3JlL01lc2hlcy9nZW9tZXRyeVwiO1xyXG5pbXBvcnQgeyBNZXNoIH0gZnJvbSBcImNvcmUvTWVzaGVzL21lc2hcIjtcclxuaW1wb3J0IHsgVmVydGV4RGF0YSB9IGZyb20gXCJjb3JlL01lc2hlcy9tZXNoLnZlcnRleERhdGFcIjtcclxuaW1wb3J0IHR5cGUgeyBTY2VuZSB9IGZyb20gXCJjb3JlL3NjZW5lXCI7XHJcbmltcG9ydCB0eXBlIHsgTnVsbGFibGUgfSBmcm9tIFwiY29yZS90eXBlc1wiO1xyXG5pbXBvcnQgdHlwZSB7IE9CSkxvYWRpbmdPcHRpb25zIH0gZnJvbSBcIi4vb2JqTG9hZGluZ09wdGlvbnNcIjtcclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcImNvcmUvTWlzYy9sb2dnZXJcIjtcclxuXHJcbnR5cGUgTWVzaE9iamVjdCA9IHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIGluZGljZXM6IE51bGxhYmxlPEFycmF5PG51bWJlcj4+O1xyXG4gICAgcG9zaXRpb25zOiBOdWxsYWJsZTxBcnJheTxudW1iZXI+PjtcclxuICAgIG5vcm1hbHM6IE51bGxhYmxlPEFycmF5PG51bWJlcj4+O1xyXG4gICAgY29sb3JzOiBOdWxsYWJsZTxBcnJheTxudW1iZXI+PjtcclxuICAgIHV2czogTnVsbGFibGU8QXJyYXk8bnVtYmVyPj47XHJcbiAgICBtYXRlcmlhbE5hbWU6IHN0cmluZztcclxuICAgIGRpcmVjdE1hdGVyaWFsPzogTnVsbGFibGU8TWF0ZXJpYWw+O1xyXG4gICAgaXNPYmplY3Q6IGJvb2xlYW47IC8vIElmIHRoZSBlbnRpdHkgaXMgZGVmaW5lZCBhcyBhbiBvYmplY3QgKFwib1wiKSwgb3IgZ3JvdXAgKFwiZ1wiKVxyXG4gICAgX2JhYnlsb25NZXNoPzogQWJzdHJhY3RNZXNoOyAvLyBUaGUgY29ycmVzcG9uZGluZyBCYWJ5bG9uIG1lc2hcclxuICAgIGhhc0xpbmVzPzogYm9vbGVhbjsgLy8gSWYgdGhlIG1lc2ggaGFzIGxpbmVzXHJcbn07XHJcblxyXG4vKipcclxuICogQ2xhc3MgdXNlZCB0byBsb2FkIG1lc2ggZGF0YSBmcm9tIE9CSiBjb250ZW50XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU29saWRQYXJzZXIge1xyXG4gICAgLy8gRGVzY3JpcHRvclxyXG4gICAgLyoqIE9iamVjdCBkZXNjcmlwdG9yICovXHJcbiAgICBwdWJsaWMgc3RhdGljIE9iamVjdERlc2NyaXB0b3IgPSAvXm8vO1xyXG4gICAgLyoqIEdyb3VwIGRlc2NyaXB0b3IgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgR3JvdXBEZXNjcmlwdG9yID0gL15nLztcclxuICAgIC8qKiBNYXRlcmlhbCBsaWIgZGVzY3JpcHRvciAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBNdGxMaWJHcm91cERlc2NyaXB0b3IgPSAvXm10bGxpYiAvO1xyXG4gICAgLyoqIFVzZSBhIG1hdGVyaWFsIGRlc2NyaXB0b3IgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgVXNlTXRsRGVzY3JpcHRvciA9IC9edXNlbXRsIC87XHJcbiAgICAvKiogU21vb3RoIGRlc2NyaXB0b3IgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgU21vb3RoRGVzY3JpcHRvciA9IC9ecyAvO1xyXG5cclxuICAgIC8vIFBhdHRlcm5zXHJcbiAgICAvKiogUGF0dGVybiB1c2VkIHRvIGRldGVjdCBhIHZlcnRleCAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBWZXJ0ZXhQYXR0ZXJuID0gL152KFxccytbXFxkfC58K3xcXC18ZXxFXSspezMsN30vO1xyXG4gICAgLyoqIFBhdHRlcm4gdXNlZCB0byBkZXRlY3QgYSBub3JtYWwgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTm9ybWFsUGF0dGVybiA9IC9edm4oXFxzK1tcXGR8LnwrfFxcLXxlfEVdKykoICtbXFxkfC58K3xcXC18ZXxFXSspKCArW1xcZHwufCt8XFwtfGV8RV0rKS87XHJcbiAgICAvKiogUGF0dGVybiB1c2VkIHRvIGRldGVjdCBhIFVWIHNldCAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBVVlBhdHRlcm4gPSAvXnZ0KFxccytbXFxkfC58K3xcXC18ZXxFXSspKCArW1xcZHwufCt8XFwtfGV8RV0rKS87XHJcbiAgICAvKiogUGF0dGVybiB1c2VkIHRvIGRldGVjdCBhIGZpcnN0IGtpbmQgb2YgZmFjZSAoZiB2ZXJ0ZXggdmVydGV4IHZlcnRleCkgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjZVBhdHRlcm4xID0gL15mXFxzKygoW1xcZF17MSx9W1xcc10/KXszLH0pKy87XHJcbiAgICAvKiogUGF0dGVybiB1c2VkIHRvIGRldGVjdCBhIHNlY29uZCBraW5kIG9mIGZhY2UgKGYgdmVydGV4L3V2cyB2ZXJ0ZXgvdXZzIHZlcnRleC91dnMpICovXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY2VQYXR0ZXJuMiA9IC9eZlxccysoKChbXFxkXXsxLH1cXC9bXFxkXXsxLH1bXFxzXT8pezMsfSkrKS87XHJcbiAgICAvKiogUGF0dGVybiB1c2VkIHRvIGRldGVjdCBhIHRoaXJkIGtpbmQgb2YgZmFjZSAoZiB2ZXJ0ZXgvdXZzL25vcm1hbCB2ZXJ0ZXgvdXZzL25vcm1hbCB2ZXJ0ZXgvdXZzL25vcm1hbCkgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgRmFjZVBhdHRlcm4zID0gL15mXFxzKygoKFtcXGRdezEsfVxcL1tcXGRdezEsfVxcL1tcXGRdezEsfVtcXHNdPyl7Myx9KSspLztcclxuICAgIC8qKiBQYXR0ZXJuIHVzZWQgdG8gZGV0ZWN0IGEgZm91cnRoIGtpbmQgb2YgZmFjZSAoZiB2ZXJ0ZXgvL25vcm1hbCB2ZXJ0ZXgvL25vcm1hbCB2ZXJ0ZXgvL25vcm1hbCkqL1xyXG4gICAgcHVibGljIHN0YXRpYyBGYWNlUGF0dGVybjQgPSAvXmZcXHMrKCgoW1xcZF17MSx9XFwvXFwvW1xcZF17MSx9W1xcc10/KXszLH0pKykvO1xyXG4gICAgLyoqIFBhdHRlcm4gdXNlZCB0byBkZXRlY3QgYSBmaWZ0aCBraW5kIG9mIGZhY2UgKGYgLXZlcnRleC8tdXZzLy1ub3JtYWwgLXZlcnRleC8tdXZzLy1ub3JtYWwgLXZlcnRleC8tdXZzLy1ub3JtYWwpICovXHJcbiAgICBwdWJsaWMgc3RhdGljIEZhY2VQYXR0ZXJuNSA9IC9eZlxccysoKCgtW1xcZF17MSx9XFwvLVtcXGRdezEsfVxcLy1bXFxkXXsxLH1bXFxzXT8pezMsfSkrKS87XHJcbiAgICAvKiogUGF0dGVybiB1c2VkIHRvIGRldGVjdCBhIGxpbmUobCB2ZXJ0ZXggdmVydGV4KSAqL1xyXG4gICAgcHVibGljIHN0YXRpYyBMaW5lUGF0dGVybjEgPSAvXmxcXHMrKChbXFxkXXsxLH1bXFxzXT8pezIsfSkrLztcclxuICAgIC8qKiBQYXR0ZXJuIHVzZWQgdG8gZGV0ZWN0IGEgc2Vjb25kIGtpbmQgb2YgbGluZSAobCB2ZXJ0ZXgvdXZzIHZlcnRleC91dnMpICovXHJcbiAgICBwdWJsaWMgc3RhdGljIExpbmVQYXR0ZXJuMiA9IC9ebFxccysoKChbXFxkXXsxLH1cXC9bXFxkXXsxLH1bXFxzXT8pezIsfSkrKS87XHJcbiAgICAvKiogUGF0dGVybiB1c2VkIHRvIGRldGVjdCBhIHRoaXJkIGtpbmQgb2YgbGluZSAobCB2ZXJ0ZXgvdXZzL25vcm1hbCB2ZXJ0ZXgvdXZzL25vcm1hbCkgKi9cclxuICAgIHB1YmxpYyBzdGF0aWMgTGluZVBhdHRlcm4zID0gL15sXFxzKygoKFtcXGRdezEsfVxcL1tcXGRdezEsfVxcL1tcXGRdezEsfVtcXHNdPyl7Mix9KSspLztcclxuXHJcbiAgICBwcml2YXRlIF9sb2FkaW5nT3B0aW9uczogT0JKTG9hZGluZ09wdGlvbnM7XHJcbiAgICBwcml2YXRlIF9wb3NpdGlvbnM6IEFycmF5PFZlY3RvcjM+ID0gW107IC8vdmFsdWVzIGZvciB0aGUgcG9zaXRpb25zIG9mIHZlcnRpY2VzXHJcbiAgICBwcml2YXRlIF9ub3JtYWxzOiBBcnJheTxWZWN0b3IzPiA9IFtdOyAvL1ZhbHVlcyBmb3IgdGhlIG5vcm1hbHNcclxuICAgIHByaXZhdGUgX3V2czogQXJyYXk8VmVjdG9yMj4gPSBbXTsgLy9WYWx1ZXMgZm9yIHRoZSB0ZXh0dXJlc1xyXG4gICAgcHJpdmF0ZSBfY29sb3JzOiBBcnJheTxDb2xvcjQ+ID0gW107XHJcbiAgICBwcml2YXRlIF9leHRDb2xvcnM6IEFycmF5PENvbG9yND4gPSBbXTsgLy9FeHRlbnNpb24gY29sb3JcclxuICAgIHByaXZhdGUgX21lc2hlc0Zyb21PYmo6IEFycmF5PE1lc2hPYmplY3Q+ID0gW107IC8vW21lc2hdIENvbnRhaW5zIGFsbCB0aGUgb2JqIG1lc2hlc1xyXG4gICAgcHJpdmF0ZSBfaGFuZGxlZE1lc2g6IE1lc2hPYmplY3Q7IC8vVGhlIGN1cnJlbnQgbWVzaCBvZiBtZXNoZXMgYXJyYXlcclxuICAgIHByaXZhdGUgX2luZGljZXNGb3JCYWJ5bG9uOiBBcnJheTxudW1iZXI+ID0gW107IC8vVGhlIGxpc3Qgb2YgaW5kaWNlcyBmb3IgVmVydGV4RGF0YVxyXG4gICAgcHJpdmF0ZSBfd3JhcHBlZFBvc2l0aW9uRm9yQmFieWxvbjogQXJyYXk8VmVjdG9yMz4gPSBbXTsgLy9UaGUgbGlzdCBvZiBwb3NpdGlvbiBpbiB2ZWN0b3JzXHJcbiAgICBwcml2YXRlIF93cmFwcGVkVXZzRm9yQmFieWxvbjogQXJyYXk8VmVjdG9yMj4gPSBbXTsgLy9BcnJheSB3aXRoIGFsbCB2YWx1ZSBvZiB1dnMgdG8gbWF0Y2ggd2l0aCB0aGUgaW5kaWNlc1xyXG4gICAgcHJpdmF0ZSBfd3JhcHBlZENvbG9yc0ZvckJhYnlsb246IEFycmF5PENvbG9yND4gPSBbXTsgLy8gQXJyYXkgd2l0aCBhbGwgY29sb3IgdmFsdWVzIHRvIG1hdGNoIHdpdGggdGhlIGluZGljZXNcclxuICAgIHByaXZhdGUgX3dyYXBwZWROb3JtYWxzRm9yQmFieWxvbjogQXJyYXk8VmVjdG9yMz4gPSBbXTsgLy9BcnJheSB3aXRoIGFsbCB2YWx1ZSBvZiBub3JtYWxzIHRvIG1hdGNoIHdpdGggdGhlIGluZGljZXNcclxuICAgIHByaXZhdGUgX3R1cGxlUG9zTm9ybTogQXJyYXk8eyBub3JtYWxzOiBBcnJheTxudW1iZXI+OyBpZHg6IEFycmF5PG51bWJlcj47IHV2OiBBcnJheTxudW1iZXI+IH0+ID0gW107IC8vQ3JlYXRlIGEgdHVwbGUgd2l0aCBpbmRpY2Ugb2YgUG9zaXRpb24sIE5vcm1hbCwgVVYgIFtwb3MsIG5vcm0sIHV2c11cclxuICAgIHByaXZhdGUgX2N1clBvc2l0aW9uSW5JbmRpY2VzID0gMDtcclxuICAgIHByaXZhdGUgX2hhc01lc2hlczogQm9vbGVhbiA9IGZhbHNlOyAvL01lc2hlcyBhcmUgZGVmaW5lZCBpbiB0aGUgZmlsZVxyXG4gICAgcHJpdmF0ZSBfdW53cmFwcGVkUG9zaXRpb25zRm9yQmFieWxvbjogQXJyYXk8bnVtYmVyPiA9IFtdOyAvL1ZhbHVlIG9mIHBvc2l0aW9uRm9yQmFieWxvbiB3L28gVmVjdG9yMygpIFt4LHksel1cclxuICAgIHByaXZhdGUgX3Vud3JhcHBlZENvbG9yc0ZvckJhYnlsb246IEFycmF5PG51bWJlcj4gPSBbXTsgLy8gVmFsdWUgb2YgY29sb3JGb3JCYWJ5bG9uIHcvbyBDb2xvcjQoKSBbcixnLGIsYV1cclxuICAgIHByaXZhdGUgX3Vud3JhcHBlZE5vcm1hbHNGb3JCYWJ5bG9uOiBBcnJheTxudW1iZXI+ID0gW107IC8vVmFsdWUgb2Ygbm9ybWFsc0ZvckJhYnlsb24gdy9vIFZlY3RvcjMoKSAgW3gseSx6XVxyXG4gICAgcHJpdmF0ZSBfdW53cmFwcGVkVVZGb3JCYWJ5bG9uOiBBcnJheTxudW1iZXI+ID0gW107IC8vVmFsdWUgb2YgdXZzRm9yQmFieWxvbiB3L28gVmVjdG9yMygpICAgICAgW3gseSx6XVxyXG4gICAgcHJpdmF0ZSBfdHJpYW5nbGVzOiBBcnJheTxzdHJpbmc+ID0gW107IC8vSW5kaWNlcyBmcm9tIG5ldyB0cmlhbmdsZXMgY29taW5nIGZyb20gcG9seWdvbnNcclxuICAgIHByaXZhdGUgX21hdGVyaWFsTmFtZUZyb21PYmo6IHN0cmluZyA9IFwiXCI7IC8vVGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgbWF0ZXJpYWxcclxuICAgIHByaXZhdGUgX29iak1lc2hOYW1lOiBzdHJpbmcgPSBcIlwiOyAvL1RoZSBuYW1lIG9mIHRoZSBjdXJyZW50IG9iaiBtZXNoXHJcbiAgICBwcml2YXRlIF9pbmNyZW1lbnQ6IG51bWJlciA9IDE7IC8vSWQgZm9yIG1lc2hlcyBjcmVhdGVkIGJ5IHRoZSBtdWx0aW1hdGVyaWFsXHJcbiAgICBwcml2YXRlIF9pc0ZpcnN0TWF0ZXJpYWw6IGJvb2xlYW4gPSB0cnVlO1xyXG4gICAgcHJpdmF0ZSBfZ3JheUNvbG9yID0gbmV3IENvbG9yNCgwLjUsIDAuNSwgMC41LCAxKTtcclxuICAgIHByaXZhdGUgX21hdGVyaWFsVG9Vc2U6IHN0cmluZ1tdO1xyXG4gICAgcHJpdmF0ZSBfYmFieWxvbk1lc2hlc0FycmF5OiBBcnJheTxNZXNoPjtcclxuICAgIHByaXZhdGUgX3B1c2hUcmlhbmdsZTogKGZhY2VzOiBBcnJheTxzdHJpbmc+LCBmYWNlSW5kZXg6IG51bWJlcikgPT4gdm9pZDtcclxuICAgIHByaXZhdGUgX2hhbmRlZG5lc3NTaWduOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIF9oYXNMaW5lRGF0YTogYm9vbGVhbiA9IGZhbHNlOyAvL0lmIHRoaXMgbWVzaCBoYXMgbGluZSBzZWdtZW50KGwpIGRhdGFcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgU29saWRQYXJzZXJcclxuICAgICAqIEBwYXJhbSBtYXRlcmlhbFRvVXNlIGRlZmluZXMgdGhlIGFycmF5IHRvIGZpbGwgd2l0aCB0aGUgbGlzdCBvZiBtYXRlcmlhbHMgdG8gdXNlIChpdCB3aWxsIGJlIGZpbGxlZCBieSB0aGUgcGFyc2UgZnVuY3Rpb24pXHJcbiAgICAgKiBAcGFyYW0gYmFieWxvbk1lc2hlc0FycmF5IGRlZmluZXMgdGhlIGFycmF5IHRvIGZpbGwgd2l0aCB0aGUgbGlzdCBvZiBsb2FkZWQgbWVzaGVzIChpdCB3aWxsIGJlIGZpbGxlZCBieSB0aGUgcGFyc2UgZnVuY3Rpb24pXHJcbiAgICAgKiBAcGFyYW0gbG9hZGluZ09wdGlvbnMgZGVmaW5lcyB0aGUgbG9hZGluZyBvcHRpb25zIHRvIHVzZVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IobWF0ZXJpYWxUb1VzZTogc3RyaW5nW10sIGJhYnlsb25NZXNoZXNBcnJheTogQXJyYXk8TWVzaD4sIGxvYWRpbmdPcHRpb25zOiBPQkpMb2FkaW5nT3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMuX21hdGVyaWFsVG9Vc2UgPSBtYXRlcmlhbFRvVXNlO1xyXG4gICAgICAgIHRoaXMuX2JhYnlsb25NZXNoZXNBcnJheSA9IGJhYnlsb25NZXNoZXNBcnJheTtcclxuICAgICAgICB0aGlzLl9sb2FkaW5nT3B0aW9ucyA9IGxvYWRpbmdPcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2VhcmNoIGZvciBvYmogaW4gdGhlIGdpdmVuIGFycmF5LlxyXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgdG8gY2hlY2sgaWYgYSBjb3VwbGUgb2YgZGF0YSBhbHJlYWR5IGV4aXN0cyBpbiBhbiBhcnJheS5cclxuICAgICAqXHJcbiAgICAgKiBJZiBmb3VuZCwgcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGZvdW5kZWQgdHVwbGUgaW5kZXguIFJldHVybnMgLTEgaWYgbm90IGZvdW5kXHJcbiAgICAgKiBAcGFyYW0gYXJyIEFycmF5PHsgbm9ybWFsczogQXJyYXk8bnVtYmVyPiwgaWR4OiBBcnJheTxudW1iZXI+IH0+XHJcbiAgICAgKiBAcGFyYW0gb2JqIEFycmF5PG51bWJlcj5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9pc0luQXJyYXkoYXJyOiBBcnJheTx7IG5vcm1hbHM6IEFycmF5PG51bWJlcj47IGlkeDogQXJyYXk8bnVtYmVyPiB9Piwgb2JqOiBBcnJheTxudW1iZXI+KSB7XHJcbiAgICAgICAgaWYgKCFhcnJbb2JqWzBdXSkge1xyXG4gICAgICAgICAgICBhcnJbb2JqWzBdXSA9IHsgbm9ybWFsczogW10sIGlkeDogW10gfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaWR4ID0gYXJyW29ialswXV0ubm9ybWFscy5pbmRleE9mKG9ialsxXSk7XHJcblxyXG4gICAgICAgIHJldHVybiBpZHggPT09IC0xID8gLTEgOiBhcnJbb2JqWzBdXS5pZHhbaWR4XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIF9pc0luQXJyYXlVVihhcnI6IEFycmF5PHsgbm9ybWFsczogQXJyYXk8bnVtYmVyPjsgaWR4OiBBcnJheTxudW1iZXI+OyB1djogQXJyYXk8bnVtYmVyPiB9Piwgb2JqOiBBcnJheTxudW1iZXI+KSB7XHJcbiAgICAgICAgaWYgKCFhcnJbb2JqWzBdXSkge1xyXG4gICAgICAgICAgICBhcnJbb2JqWzBdXSA9IHsgbm9ybWFsczogW10sIGlkeDogW10sIHV2OiBbXSB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpZHggPSBhcnJbb2JqWzBdXS5ub3JtYWxzLmluZGV4T2Yob2JqWzFdKTtcclxuXHJcbiAgICAgICAgaWYgKGlkeCAhPSAxICYmIG9ialsyXSA9PT0gYXJyW29ialswXV0udXZbaWR4XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyW29ialswXV0uaWR4W2lkeF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgZnVuY3Rpb24gc2V0IHRoZSBkYXRhIGZvciBlYWNoIHRyaWFuZ2xlLlxyXG4gICAgICogRGF0YSBhcmUgcG9zaXRpb24sIG5vcm1hbHMgYW5kIHV2c1xyXG4gICAgICogSWYgYSB0dXBsZSBvZiAocG9zaXRpb24sIG5vcm1hbCkgaXMgbm90IHNldCwgYWRkIHRoZSBkYXRhIGludG8gdGhlIGNvcnJlc3BvbmRpbmcgYXJyYXlcclxuICAgICAqIElmIHRoZSB0dXBsZSBhbHJlYWR5IGV4aXN0LCBhZGQgb25seSB0aGVpciBpbmRpY2VcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gaW5kaWNlUG9zaXRpb25Gcm9tT2JqIEludGVnZXIgVGhlIGluZGV4IGluIHBvc2l0aW9ucyBhcnJheVxyXG4gICAgICogQHBhcmFtIGluZGljZVV2c0Zyb21PYmogSW50ZWdlciBUaGUgaW5kZXggaW4gdXZzIGFycmF5XHJcbiAgICAgKiBAcGFyYW0gaW5kaWNlTm9ybWFsRnJvbU9iaiBJbnRlZ2VyIFRoZSBpbmRleCBpbiBub3JtYWxzIGFycmF5XHJcbiAgICAgKiBAcGFyYW0gcG9zaXRpb25WZWN0b3JGcm9tT0JKIFZlY3RvcjMgVGhlIHZhbHVlIG9mIHBvc2l0aW9uIGF0IGluZGV4IG9iakluZGljZVxyXG4gICAgICogQHBhcmFtIHRleHR1cmVWZWN0b3JGcm9tT0JKIFZlY3RvcjMgVGhlIHZhbHVlIG9mIHV2c1xyXG4gICAgICogQHBhcmFtIG5vcm1hbHNWZWN0b3JGcm9tT0JKIFZlY3RvcjMgVGhlIHZhbHVlIG9mIG5vcm1hbHMgYXQgaW5kZXggb2JqTm9ybWFsZVxyXG4gICAgICogQHBhcmFtIHBvc2l0aW9uQ29sb3JzRnJvbU9CSlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zZXREYXRhKFxyXG4gICAgICAgIGluZGljZVBvc2l0aW9uRnJvbU9iajogbnVtYmVyLFxyXG4gICAgICAgIGluZGljZVV2c0Zyb21PYmo6IG51bWJlcixcclxuICAgICAgICBpbmRpY2VOb3JtYWxGcm9tT2JqOiBudW1iZXIsXHJcbiAgICAgICAgcG9zaXRpb25WZWN0b3JGcm9tT0JKOiBWZWN0b3IzLFxyXG4gICAgICAgIHRleHR1cmVWZWN0b3JGcm9tT0JKOiBWZWN0b3IyLFxyXG4gICAgICAgIG5vcm1hbHNWZWN0b3JGcm9tT0JKOiBWZWN0b3IzLFxyXG4gICAgICAgIHBvc2l0aW9uQ29sb3JzRnJvbU9CSj86IENvbG9yNFxyXG4gICAgKSB7XHJcbiAgICAgICAgLy9DaGVjayBpZiB0aGlzIHR1cGxlIGFscmVhZHkgZXhpc3RzIGluIHRoZSBsaXN0IG9mIHR1cGxlc1xyXG4gICAgICAgIGxldCBfaW5kZXg6IG51bWJlcjtcclxuICAgICAgICBpZiAodGhpcy5fbG9hZGluZ09wdGlvbnMub3B0aW1pemVXaXRoVVYpIHtcclxuICAgICAgICAgICAgX2luZGV4ID0gdGhpcy5faXNJbkFycmF5VVYodGhpcy5fdHVwbGVQb3NOb3JtLCBbaW5kaWNlUG9zaXRpb25Gcm9tT2JqLCBpbmRpY2VOb3JtYWxGcm9tT2JqLCBpbmRpY2VVdnNGcm9tT2JqXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgX2luZGV4ID0gdGhpcy5faXNJbkFycmF5KHRoaXMuX3R1cGxlUG9zTm9ybSwgW2luZGljZVBvc2l0aW9uRnJvbU9iaiwgaW5kaWNlTm9ybWFsRnJvbU9ial0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9JZiBpdCBub3QgZXhpc3RzXHJcbiAgICAgICAgaWYgKF9pbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgLy9BZGQgYW4gbmV3IGluZGljZS5cclxuICAgICAgICAgICAgLy9UaGUgYXJyYXkgb2YgaW5kaWNlcyBpcyBvbmx5IGFuIGFycmF5IHdpdGggaGlzIGxlbmd0aCBlcXVhbCB0byB0aGUgbnVtYmVyIG9mIHRyaWFuZ2xlcyAtIDEuXHJcbiAgICAgICAgICAgIC8vV2UgYWRkIHZlcnRpY2VzIGRhdGEgaW4gdGhpcyBvcmRlclxyXG4gICAgICAgICAgICB0aGlzLl9pbmRpY2VzRm9yQmFieWxvbi5wdXNoKHRoaXMuX3dyYXBwZWRQb3NpdGlvbkZvckJhYnlsb24ubGVuZ3RoKTtcclxuICAgICAgICAgICAgLy9QdXNoIHRoZSBwb3NpdGlvbiBvZiB2ZXJ0aWNlIGZvciBCYWJ5bG9uXHJcbiAgICAgICAgICAgIC8vRWFjaCBlbGVtZW50IGlzIGEgVmVjdG9yMyh4LHkseilcclxuICAgICAgICAgICAgdGhpcy5fd3JhcHBlZFBvc2l0aW9uRm9yQmFieWxvbi5wdXNoKHBvc2l0aW9uVmVjdG9yRnJvbU9CSik7XHJcbiAgICAgICAgICAgIC8vUHVzaCB0aGUgdXZzIGZvciBCYWJ5bG9uXHJcbiAgICAgICAgICAgIC8vRWFjaCBlbGVtZW50IGlzIGEgVmVjdG9yMih1LHYpXHJcbiAgICAgICAgICAgIC8vSWYgdGhlIFVWcyBhcmUgbWlzc2luZywgc2V0ICh1LHYpPSgwLDApXHJcbiAgICAgICAgICAgIHRleHR1cmVWZWN0b3JGcm9tT0JKID0gdGV4dHVyZVZlY3RvckZyb21PQkogPz8gbmV3IFZlY3RvcjIoMCwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3dyYXBwZWRVdnNGb3JCYWJ5bG9uLnB1c2godGV4dHVyZVZlY3RvckZyb21PQkopO1xyXG4gICAgICAgICAgICAvL1B1c2ggdGhlIG5vcm1hbHMgZm9yIEJhYnlsb25cclxuICAgICAgICAgICAgLy9FYWNoIGVsZW1lbnQgaXMgYSBWZWN0b3IzKHgseSx6KVxyXG4gICAgICAgICAgICB0aGlzLl93cmFwcGVkTm9ybWFsc0ZvckJhYnlsb24ucHVzaChub3JtYWxzVmVjdG9yRnJvbU9CSik7XHJcblxyXG4gICAgICAgICAgICBpZiAocG9zaXRpb25Db2xvcnNGcm9tT0JKICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vUHVzaCB0aGUgY29sb3JzIGZvciBCYWJ5bG9uXHJcbiAgICAgICAgICAgICAgICAvL0VhY2ggZWxlbWVudCBpcyBhIEJBQllMT04uQ29sb3I0KHIsZyxiLGEpXHJcbiAgICAgICAgICAgICAgICB0aGlzLl93cmFwcGVkQ29sb3JzRm9yQmFieWxvbi5wdXNoKHBvc2l0aW9uQ29sb3JzRnJvbU9CSik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vQWRkIHRoZSB0dXBsZSBpbiB0aGUgY29tcGFyaXNvbiBsaXN0XHJcbiAgICAgICAgICAgIHRoaXMuX3R1cGxlUG9zTm9ybVtpbmRpY2VQb3NpdGlvbkZyb21PYmpdLm5vcm1hbHMucHVzaChpbmRpY2VOb3JtYWxGcm9tT2JqKTtcclxuICAgICAgICAgICAgdGhpcy5fdHVwbGVQb3NOb3JtW2luZGljZVBvc2l0aW9uRnJvbU9ial0uaWR4LnB1c2godGhpcy5fY3VyUG9zaXRpb25JbkluZGljZXMrKyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkaW5nT3B0aW9ucy5vcHRpbWl6ZVdpdGhVVikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHVwbGVQb3NOb3JtW2luZGljZVBvc2l0aW9uRnJvbU9ial0udXYucHVzaChpbmRpY2VVdnNGcm9tT2JqKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vVGhlIHR1cGxlIGFscmVhZHkgZXhpc3RzXHJcbiAgICAgICAgICAgIC8vQWRkIHRoZSBpbmRleCBvZiB0aGUgYWxyZWFkeSBleGlzdGluZyB0dXBsZVxyXG4gICAgICAgICAgICAvL0F0IHRoaXMgaW5kZXggd2UgY2FuIGdldCB0aGUgdmFsdWUgb2YgcG9zaXRpb24sIG5vcm1hbCwgY29sb3IgYW5kIHV2cyBvZiB2ZXJ0ZXhcclxuICAgICAgICAgICAgdGhpcy5faW5kaWNlc0ZvckJhYnlsb24ucHVzaChfaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZm9ybSBWZWN0b3IoKSBhbmQgQkFCWUxPTi5Db2xvcigpIG9iamVjdHMgaW50byBudW1iZXJzIGluIGFuIGFycmF5XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3Vud3JhcERhdGEoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy9FdmVyeSBhcnJheSBoYXMgdGhlIHNhbWUgbGVuZ3RoXHJcbiAgICAgICAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgdGhpcy5fd3JhcHBlZFBvc2l0aW9uRm9yQmFieWxvbi5sZW5ndGg7IGwrKykge1xyXG4gICAgICAgICAgICAgICAgLy9QdXNoIHRoZSB4LCB5LCB6IHZhbHVlcyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIHVud3JhcHBlZCBhcnJheVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW53cmFwcGVkUG9zaXRpb25zRm9yQmFieWxvbi5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dyYXBwZWRQb3NpdGlvbkZvckJhYnlsb25bbF0ueCAqIHRoaXMuX2hhbmRlZG5lc3NTaWduLFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dyYXBwZWRQb3NpdGlvbkZvckJhYnlsb25bbF0ueSxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl93cmFwcGVkUG9zaXRpb25Gb3JCYWJ5bG9uW2xdLnpcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91bndyYXBwZWROb3JtYWxzRm9yQmFieWxvbi5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3dyYXBwZWROb3JtYWxzRm9yQmFieWxvbltsXS54ICogdGhpcy5faGFuZGVkbmVzc1NpZ24sXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JhcHBlZE5vcm1hbHNGb3JCYWJ5bG9uW2xdLnksXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fd3JhcHBlZE5vcm1hbHNGb3JCYWJ5bG9uW2xdLnpcclxuICAgICAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW53cmFwcGVkVVZGb3JCYWJ5bG9uLnB1c2godGhpcy5fd3JhcHBlZFV2c0ZvckJhYnlsb25bbF0ueCwgdGhpcy5fd3JhcHBlZFV2c0ZvckJhYnlsb25bbF0ueSk7IC8veiBpcyBhbiBvcHRpb25hbCB2YWx1ZSBub3Qgc3VwcG9ydGVkIGJ5IEJBQllMT05cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkaW5nT3B0aW9ucy5pbXBvcnRWZXJ0ZXhDb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1B1c2ggdGhlIHIsIGcsIGIsIGEgdmFsdWVzIG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgdW53cmFwcGVkIGFycmF5XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW53cmFwcGVkQ29sb3JzRm9yQmFieWxvbi5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cmFwcGVkQ29sb3JzRm9yQmFieWxvbltsXS5yLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cmFwcGVkQ29sb3JzRm9yQmFieWxvbltsXS5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cmFwcGVkQ29sb3JzRm9yQmFieWxvbltsXS5iLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl93cmFwcGVkQ29sb3JzRm9yQmFieWxvbltsXS5hXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBSZXNldCBhcnJheXMgZm9yIHRoZSBuZXh0IG5ldyBtZXNoZXNcclxuICAgICAgICAgICAgdGhpcy5fd3JhcHBlZFBvc2l0aW9uRm9yQmFieWxvbi5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl93cmFwcGVkTm9ybWFsc0ZvckJhYnlsb24ubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fd3JhcHBlZFV2c0ZvckJhYnlsb24ubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fd3JhcHBlZENvbG9yc0ZvckJhYnlsb24ubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fdHVwbGVQb3NOb3JtLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBvc2l0aW9uSW5JbmRpY2VzID0gMDtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byB1bndyYXAgZGF0YSB3aGlsZSBwYXJzaW5nIE9CSiBkYXRhLlwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgdHJpYW5nbGVzIGZyb20gcG9seWdvbnNcclxuICAgICAqIEl0IGlzIGltcG9ydGFudCB0byBub3RpY2UgdGhhdCBhIHRyaWFuZ2xlIGlzIGEgcG9seWdvblxyXG4gICAgICogV2UgZ2V0IDUgcGF0dGVybnMgb2YgZmFjZSBkZWZpbmVkIGluIE9CSiBGaWxlIDpcclxuICAgICAqIGZhY2VQYXR0ZXJuMSA9IFtcIjFcIixcIjJcIixcIjNcIixcIjRcIixcIjVcIixcIjZcIl1cclxuICAgICAqIGZhY2VQYXR0ZXJuMiA9IFtcIjEvMVwiLFwiMi8yXCIsXCIzLzNcIixcIjQvNFwiLFwiNS81XCIsXCI2LzZcIl1cclxuICAgICAqIGZhY2VQYXR0ZXJuMyA9IFtcIjEvMS8xXCIsXCIyLzIvMlwiLFwiMy8zLzNcIixcIjQvNC80XCIsXCI1LzUvNVwiLFwiNi82LzZcIl1cclxuICAgICAqIGZhY2VQYXR0ZXJuNCA9IFtcIjEvLzFcIixcIjIvLzJcIixcIjMvLzNcIixcIjQvLzRcIixcIjUvLzVcIixcIjYvLzZcIl1cclxuICAgICAqIGZhY2VQYXR0ZXJuNSA9IFtcIi0xLy0xLy0xXCIsXCItMi8tMi8tMlwiLFwiLTMvLTMvLTNcIixcIi00Ly00Ly00XCIsXCItNS8tNS8tNVwiLFwiLTYvLTYvLTZcIl1cclxuICAgICAqIEVhY2ggcGF0dGVybiBpcyBkaXZpZGVkIGJ5IHRoZSBzYW1lIG1ldGhvZFxyXG4gICAgICogQHBhcmFtIGZhY2VzIEFycmF5W1N0cmluZ10gVGhlIGluZGljZXMgb2YgZWxlbWVudHNcclxuICAgICAqIEBwYXJhbSB2IEludGVnZXIgVGhlIHZhcmlhYmxlIHRvIGluY3JlbWVudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZXRUcmlhbmdsZXMoZmFjZXM6IEFycmF5PHN0cmluZz4sIHY6IG51bWJlcikge1xyXG4gICAgICAgIC8vV29yayBmb3IgZWFjaCBlbGVtZW50IG9mIHRoZSBhcnJheVxyXG4gICAgICAgIGZvciAobGV0IGZhY2VJbmRleCA9IHY7IGZhY2VJbmRleCA8IGZhY2VzLmxlbmd0aCAtIDE7IGZhY2VJbmRleCsrKSB7XHJcbiAgICAgICAgICAgIC8vQWRkIG9uIHRoZSB0cmlhbmdsZSB2YXJpYWJsZSB0aGUgaW5kZXhlcyB0byBvYnRhaW4gdHJpYW5nbGVzXHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hUcmlhbmdsZShmYWNlcywgZmFjZUluZGV4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vUmVzdWx0IG9idGFpbmVkIGFmdGVyIDIgaXRlcmF0aW9uczpcclxuICAgICAgICAvL1BhdHRlcm4xID0+IHRyaWFuZ2xlID0gW1wiMVwiLFwiMlwiLFwiM1wiLFwiMVwiLFwiM1wiLFwiNFwiXTtcclxuICAgICAgICAvL1BhdHRlcm4yID0+IHRyaWFuZ2xlID0gW1wiMS8xXCIsXCIyLzJcIixcIjMvM1wiLFwiMS8xXCIsXCIzLzNcIixcIjQvNFwiXTtcclxuICAgICAgICAvL1BhdHRlcm4zID0+IHRyaWFuZ2xlID0gW1wiMS8xLzFcIixcIjIvMi8yXCIsXCIzLzMvM1wiLFwiMS8xLzFcIixcIjMvMy8zXCIsXCI0LzQvNFwiXTtcclxuICAgICAgICAvL1BhdHRlcm40ID0+IHRyaWFuZ2xlID0gW1wiMS8vMVwiLFwiMi8vMlwiLFwiMy8vM1wiLFwiMS8vMVwiLFwiMy8vM1wiLFwiNC8vNFwiXTtcclxuICAgICAgICAvL1BhdHRlcm41ID0+IHRyaWFuZ2xlID0gW1wiLTEvLTEvLTFcIixcIi0yLy0yLy0yXCIsXCItMy8tMy8tM1wiLFwiLTEvLTEvLTFcIixcIi0zLy0zLy0zXCIsXCItNC8tNC8tNFwiXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvIGdldCBjb2xvciBiZXR3ZWVuIGNvbG9yIGFuZCBleHRlbnNpb24gY29sb3JcclxuICAgICAqIEBwYXJhbSBpbmRleCBJbnRlZ2VyIFRoZSBpbmRleCBvZiB0aGUgZWxlbWVudCBpbiB0aGUgYXJyYXlcclxuICAgICAqIEByZXR1cm5zIHZhbHVlIG9mIHRhcmdldCBjb2xvclxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9nZXRDb2xvcihpbmRleDogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdPcHRpb25zLmltcG9ydFZlcnRleENvbG9ycykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZXh0Q29sb3JzW2luZGV4XSA/PyB0aGlzLl9jb2xvcnNbaW5kZXhdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHRyaWFuZ2xlcyBhbmQgcHVzaCB0aGUgZGF0YSBmb3IgZWFjaCBwb2x5Z29uIGZvciB0aGUgcGF0dGVybiAxXHJcbiAgICAgKiBJbiB0aGlzIHBhdHRlcm4gd2UgZ2V0IHZlcnRpY2UgcG9zaXRpb25zXHJcbiAgICAgKiBAcGFyYW0gZmFjZVxyXG4gICAgICogQHBhcmFtIHZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0RGF0YUZvckN1cnJlbnRGYWNlV2l0aFBhdHRlcm4xKGZhY2U6IEFycmF5PHN0cmluZz4sIHY6IG51bWJlcikge1xyXG4gICAgICAgIC8vR2V0IHRoZSBpbmRpY2VzIG9mIHRyaWFuZ2xlcyBmb3IgZWFjaCBwb2x5Z29uXHJcbiAgICAgICAgdGhpcy5fZ2V0VHJpYW5nbGVzKGZhY2UsIHYpO1xyXG4gICAgICAgIC8vRm9yIGVhY2ggZWxlbWVudCBpbiB0aGUgdHJpYW5nbGVzIGFycmF5LlxyXG4gICAgICAgIC8vVGhpcyB2YXIgY291bGQgY29udGFpbnMgMSB0byBhbiBpbmZpbml0eSBvZiB0cmlhbmdsZXNcclxuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAvLyBTZXQgcG9zaXRpb24gaW5kaWNlXHJcbiAgICAgICAgICAgIGNvbnN0IGluZGljZVBvc2l0aW9uRnJvbU9iaiA9IHBhcnNlSW50KHRoaXMuX3RyaWFuZ2xlc1trXSkgLSAxO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fc2V0RGF0YShcclxuICAgICAgICAgICAgICAgIGluZGljZVBvc2l0aW9uRnJvbU9iaixcclxuICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAwLCAvLyBJbiB0aGUgcGF0dGVybiAxLCBub3JtYWxzIGFuZCB1dnMgYXJlIG5vdCBkZWZpbmVkXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbnNbaW5kaWNlUG9zaXRpb25Gcm9tT2JqXSwgLy8gR2V0IHRoZSB2ZWN0b3JzIGRhdGFcclxuICAgICAgICAgICAgICAgIFZlY3RvcjIuWmVybygpLFxyXG4gICAgICAgICAgICAgICAgVmVjdG9yMy5VcCgpLCAvLyBDcmVhdGUgZGVmYXVsdCB2ZWN0b3JzXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9nZXRDb2xvcihpbmRpY2VQb3NpdGlvbkZyb21PYmopXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vUmVzZXQgdmFyaWFibGUgZm9yIHRoZSBuZXh0IGxpbmVcclxuICAgICAgICB0aGlzLl90cmlhbmdsZXMubGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSB0cmlhbmdsZXMgYW5kIHB1c2ggdGhlIGRhdGEgZm9yIGVhY2ggcG9seWdvbiBmb3IgdGhlIHBhdHRlcm4gMlxyXG4gICAgICogSW4gdGhpcyBwYXR0ZXJuIHdlIGdldCB2ZXJ0aWNlIHBvc2l0aW9ucyBhbmQgdXZzXHJcbiAgICAgKiBAcGFyYW0gZmFjZVxyXG4gICAgICogQHBhcmFtIHZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0RGF0YUZvckN1cnJlbnRGYWNlV2l0aFBhdHRlcm4yKGZhY2U6IEFycmF5PHN0cmluZz4sIHY6IG51bWJlcikge1xyXG4gICAgICAgIC8vR2V0IHRoZSBpbmRpY2VzIG9mIHRyaWFuZ2xlcyBmb3IgZWFjaCBwb2x5Z29uXHJcbiAgICAgICAgdGhpcy5fZ2V0VHJpYW5nbGVzKGZhY2UsIHYpO1xyXG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgIC8vdHJpYW5nbGVba10gPSBcIjEvMVwiXHJcbiAgICAgICAgICAgIC8vU3BsaXQgdGhlIGRhdGEgZm9yIGdldHRpbmcgcG9zaXRpb24gYW5kIHV2XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5fdHJpYW5nbGVzW2tdLnNwbGl0KFwiL1wiKTsgLy8gW1wiMVwiLCBcIjFcIl1cclxuICAgICAgICAgICAgLy9TZXQgcG9zaXRpb24gaW5kaWNlXHJcbiAgICAgICAgICAgIGNvbnN0IGluZGljZVBvc2l0aW9uRnJvbU9iaiA9IHBhcnNlSW50KHBvaW50WzBdKSAtIDE7XHJcbiAgICAgICAgICAgIC8vU2V0IHV2IGluZGljZVxyXG4gICAgICAgICAgICBjb25zdCBpbmRpY2VVdnNGcm9tT2JqID0gcGFyc2VJbnQocG9pbnRbMV0pIC0gMTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NldERhdGEoXHJcbiAgICAgICAgICAgICAgICBpbmRpY2VQb3NpdGlvbkZyb21PYmosXHJcbiAgICAgICAgICAgICAgICBpbmRpY2VVdnNGcm9tT2JqLFxyXG4gICAgICAgICAgICAgICAgMCwgLy9EZWZhdWx0IHZhbHVlIGZvciBub3JtYWxzXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbnNbaW5kaWNlUG9zaXRpb25Gcm9tT2JqXSwgLy9HZXQgdGhlIHZhbHVlcyBmb3IgZWFjaCBlbGVtZW50XHJcbiAgICAgICAgICAgICAgICB0aGlzLl91dnNbaW5kaWNlVXZzRnJvbU9ial0gPz8gVmVjdG9yMi5aZXJvKCksXHJcbiAgICAgICAgICAgICAgICBWZWN0b3IzLlVwKCksIC8vRGVmYXVsdCB2YWx1ZSBmb3Igbm9ybWFsc1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0Q29sb3IoaW5kaWNlUG9zaXRpb25Gcm9tT2JqKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9SZXNldCB2YXJpYWJsZSBmb3IgdGhlIG5leHQgbGluZVxyXG4gICAgICAgIHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIHRyaWFuZ2xlcyBhbmQgcHVzaCB0aGUgZGF0YSBmb3IgZWFjaCBwb2x5Z29uIGZvciB0aGUgcGF0dGVybiAzXHJcbiAgICAgKiBJbiB0aGlzIHBhdHRlcm4gd2UgZ2V0IHZlcnRpY2UgcG9zaXRpb25zLCB1dnMgYW5kIG5vcm1hbHNcclxuICAgICAqIEBwYXJhbSBmYWNlXHJcbiAgICAgKiBAcGFyYW0gdlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIF9zZXREYXRhRm9yQ3VycmVudEZhY2VXaXRoUGF0dGVybjMoZmFjZTogQXJyYXk8c3RyaW5nPiwgdjogbnVtYmVyKSB7XHJcbiAgICAgICAgLy9HZXQgdGhlIGluZGljZXMgb2YgdHJpYW5nbGVzIGZvciBlYWNoIHBvbHlnb25cclxuICAgICAgICB0aGlzLl9nZXRUcmlhbmdsZXMoZmFjZSwgdik7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgIC8vdHJpYW5nbGVba10gPSBcIjEvMS8xXCJcclxuICAgICAgICAgICAgLy9TcGxpdCB0aGUgZGF0YSBmb3IgZ2V0dGluZyBwb3NpdGlvbiwgdXYsIGFuZCBub3JtYWxzXHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5fdHJpYW5nbGVzW2tdLnNwbGl0KFwiL1wiKTsgLy8gW1wiMVwiLCBcIjFcIiwgXCIxXCJdXHJcbiAgICAgICAgICAgIC8vIFNldCBwb3NpdGlvbiBpbmRpY2VcclxuICAgICAgICAgICAgY29uc3QgaW5kaWNlUG9zaXRpb25Gcm9tT2JqID0gcGFyc2VJbnQocG9pbnRbMF0pIC0gMTtcclxuICAgICAgICAgICAgLy8gU2V0IHV2IGluZGljZVxyXG4gICAgICAgICAgICBjb25zdCBpbmRpY2VVdnNGcm9tT2JqID0gcGFyc2VJbnQocG9pbnRbMV0pIC0gMTtcclxuICAgICAgICAgICAgLy8gU2V0IG5vcm1hbCBpbmRpY2VcclxuICAgICAgICAgICAgY29uc3QgaW5kaWNlTm9ybWFsRnJvbU9iaiA9IHBhcnNlSW50KHBvaW50WzJdKSAtIDE7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9zZXREYXRhKFxyXG4gICAgICAgICAgICAgICAgaW5kaWNlUG9zaXRpb25Gcm9tT2JqLFxyXG4gICAgICAgICAgICAgICAgaW5kaWNlVXZzRnJvbU9iaixcclxuICAgICAgICAgICAgICAgIGluZGljZU5vcm1hbEZyb21PYmosXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbnNbaW5kaWNlUG9zaXRpb25Gcm9tT2JqXSxcclxuICAgICAgICAgICAgICAgIHRoaXMuX3V2c1tpbmRpY2VVdnNGcm9tT2JqXSA/PyBWZWN0b3IyLlplcm8oKSxcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbHNbaW5kaWNlTm9ybWFsRnJvbU9ial0gPz8gVmVjdG9yMy5VcCgpIC8vU2V0IHRoZSB2ZWN0b3IgZm9yIGVhY2ggY29tcG9uZW50XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vUmVzZXQgdmFyaWFibGUgZm9yIHRoZSBuZXh0IGxpbmVcclxuICAgICAgICB0aGlzLl90cmlhbmdsZXMubGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSB0cmlhbmdsZXMgYW5kIHB1c2ggdGhlIGRhdGEgZm9yIGVhY2ggcG9seWdvbiBmb3IgdGhlIHBhdHRlcm4gNFxyXG4gICAgICogSW4gdGhpcyBwYXR0ZXJuIHdlIGdldCB2ZXJ0aWNlIHBvc2l0aW9ucyBhbmQgbm9ybWFsc1xyXG4gICAgICogQHBhcmFtIGZhY2VcclxuICAgICAqIEBwYXJhbSB2XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX3NldERhdGFGb3JDdXJyZW50RmFjZVdpdGhQYXR0ZXJuNChmYWNlOiBBcnJheTxzdHJpbmc+LCB2OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9nZXRUcmlhbmdsZXMoZmFjZSwgdik7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aDsgaysrKSB7XHJcbiAgICAgICAgICAgIC8vdHJpYW5nbGVba10gPSBcIjEvLzFcIlxyXG4gICAgICAgICAgICAvL1NwbGl0IHRoZSBkYXRhIGZvciBnZXR0aW5nIHBvc2l0aW9uIGFuZCBub3JtYWxzXHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gdGhpcy5fdHJpYW5nbGVzW2tdLnNwbGl0KFwiLy9cIik7IC8vIFtcIjFcIiwgXCIxXCJdXHJcbiAgICAgICAgICAgIC8vIFdlIGNoZWNrIGluZGljZXMsIGFuZCBub3JtYWxzXHJcbiAgICAgICAgICAgIGNvbnN0IGluZGljZVBvc2l0aW9uRnJvbU9iaiA9IHBhcnNlSW50KHBvaW50WzBdKSAtIDE7XHJcbiAgICAgICAgICAgIGNvbnN0IGluZGljZU5vcm1hbEZyb21PYmogPSBwYXJzZUludChwb2ludFsxXSkgLSAxO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fc2V0RGF0YShcclxuICAgICAgICAgICAgICAgIGluZGljZVBvc2l0aW9uRnJvbU9iaixcclxuICAgICAgICAgICAgICAgIDEsIC8vRGVmYXVsdCB2YWx1ZSBmb3IgdXZcclxuICAgICAgICAgICAgICAgIGluZGljZU5vcm1hbEZyb21PYmosXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wb3NpdGlvbnNbaW5kaWNlUG9zaXRpb25Gcm9tT2JqXSwgLy9HZXQgZWFjaCB2ZWN0b3Igb2YgZGF0YVxyXG4gICAgICAgICAgICAgICAgVmVjdG9yMi5aZXJvKCksXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub3JtYWxzW2luZGljZU5vcm1hbEZyb21PYmpdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fZ2V0Q29sb3IoaW5kaWNlUG9zaXRpb25Gcm9tT2JqKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL1Jlc2V0IHZhcmlhYmxlIGZvciB0aGUgbmV4dCBsaW5lXHJcbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzLmxlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSB0cmlhbmdsZXMgYW5kIHB1c2ggdGhlIGRhdGEgZm9yIGVhY2ggcG9seWdvbiBmb3IgdGhlIHBhdHRlcm4gM1xyXG4gICAgICogSW4gdGhpcyBwYXR0ZXJuIHdlIGdldCB2ZXJ0aWNlIHBvc2l0aW9ucywgdXZzIGFuZCBub3JtYWxzXHJcbiAgICAgKiBAcGFyYW0gZmFjZVxyXG4gICAgICogQHBhcmFtIHZcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfc2V0RGF0YUZvckN1cnJlbnRGYWNlV2l0aFBhdHRlcm41KGZhY2U6IEFycmF5PHN0cmluZz4sIHY6IG51bWJlcikge1xyXG4gICAgICAgIC8vR2V0IHRoZSBpbmRpY2VzIG9mIHRyaWFuZ2xlcyBmb3IgZWFjaCBwb2x5Z29uXHJcbiAgICAgICAgdGhpcy5fZ2V0VHJpYW5nbGVzKGZhY2UsIHYpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgICAvL3RyaWFuZ2xlW2tdID0gXCItMS8tMS8tMVwiXHJcbiAgICAgICAgICAgIC8vU3BsaXQgdGhlIGRhdGEgZm9yIGdldHRpbmcgcG9zaXRpb24sIHV2LCBhbmQgbm9ybWFsc1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMuX3RyaWFuZ2xlc1trXS5zcGxpdChcIi9cIik7IC8vIFtcIi0xXCIsIFwiLTFcIiwgXCItMVwiXVxyXG4gICAgICAgICAgICAvLyBTZXQgcG9zaXRpb24gaW5kaWNlXHJcbiAgICAgICAgICAgIGNvbnN0IGluZGljZVBvc2l0aW9uRnJvbU9iaiA9IHRoaXMuX3Bvc2l0aW9ucy5sZW5ndGggKyBwYXJzZUludChwb2ludFswXSk7XHJcbiAgICAgICAgICAgIC8vIFNldCB1diBpbmRpY2VcclxuICAgICAgICAgICAgY29uc3QgaW5kaWNlVXZzRnJvbU9iaiA9IHRoaXMuX3V2cy5sZW5ndGggKyBwYXJzZUludChwb2ludFsxXSk7XHJcbiAgICAgICAgICAgIC8vIFNldCBub3JtYWwgaW5kaWNlXHJcbiAgICAgICAgICAgIGNvbnN0IGluZGljZU5vcm1hbEZyb21PYmogPSB0aGlzLl9ub3JtYWxzLmxlbmd0aCArIHBhcnNlSW50KHBvaW50WzJdKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX3NldERhdGEoXHJcbiAgICAgICAgICAgICAgICBpbmRpY2VQb3NpdGlvbkZyb21PYmosXHJcbiAgICAgICAgICAgICAgICBpbmRpY2VVdnNGcm9tT2JqLFxyXG4gICAgICAgICAgICAgICAgaW5kaWNlTm9ybWFsRnJvbU9iaixcclxuICAgICAgICAgICAgICAgIHRoaXMuX3Bvc2l0aW9uc1tpbmRpY2VQb3NpdGlvbkZyb21PYmpdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdXZzW2luZGljZVV2c0Zyb21PYmpdLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbm9ybWFsc1tpbmRpY2VOb3JtYWxGcm9tT2JqXSwgLy9TZXQgdGhlIHZlY3RvciBmb3IgZWFjaCBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgIHRoaXMuX2dldENvbG9yKGluZGljZVBvc2l0aW9uRnJvbU9iailcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy9SZXNldCB2YXJpYWJsZSBmb3IgdGhlIG5leHQgbGluZVxyXG4gICAgICAgIHRoaXMuX3RyaWFuZ2xlcy5sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX2FkZFByZXZpb3VzT2JqTWVzaCgpIHtcclxuICAgICAgICAvL0NoZWNrIGlmIGl0IGlzIG5vdCB0aGUgZmlyc3QgbWVzaC4gT3RoZXJ3aXNlIHdlIGRvbid0IGhhdmUgZGF0YS5cclxuICAgICAgICBpZiAodGhpcy5fbWVzaGVzRnJvbU9iai5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIC8vR2V0IHRoZSBwcmV2aW91cyBtZXNoIGZvciBhcHBseWluZyB0aGUgZGF0YSBhYm91dCB0aGUgZmFjZXNcclxuICAgICAgICAgICAgLy89PiBpbiBvYmogZmlsZSwgZmFjZXMgZGVmaW5pdGlvbiBhcHBlbmQgYWZ0ZXIgdGhlIG5hbWUgb2YgdGhlIG1lc2hcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlZE1lc2ggPSB0aGlzLl9tZXNoZXNGcm9tT2JqW3RoaXMuX21lc2hlc0Zyb21PYmoubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgICAgICAvL1NldCB0aGUgZGF0YSBpbnRvIEFycmF5IGZvciB0aGUgbWVzaFxyXG4gICAgICAgICAgICB0aGlzLl91bndyYXBEYXRhKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5fbG9hZGluZ09wdGlvbnMudXNlTGVnYWN5QmVoYXZpb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vIFJldmVyc2UgdGFiLiBPdGhlcndpc2UgZmFjZSBhcmUgZGlzcGxheWVkIGluIHRoZSB3cm9uZyBzZW5zXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbmRpY2VzRm9yQmFieWxvbi5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vU2V0IHRoZSBpbmZvcm1hdGlvbiBmb3IgdGhlIG1lc2hcclxuICAgICAgICAgICAgLy9TbGljZSB0aGUgYXJyYXkgdG8gYXZvaWQgcmV3cml0aW5nIGJlY2F1c2Ugb2YgdGhlIGZhY3QgdGhpcyBpcyB0aGUgc2FtZSB2YXIgd2hpY2ggYmUgcmV3cml0ZWRcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlZE1lc2guaW5kaWNlcyA9IHRoaXMuX2luZGljZXNGb3JCYWJ5bG9uLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoLnBvc2l0aW9ucyA9IHRoaXMuX3Vud3JhcHBlZFBvc2l0aW9uc0ZvckJhYnlsb24uc2xpY2UoKTtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlZE1lc2gubm9ybWFscyA9IHRoaXMuX3Vud3JhcHBlZE5vcm1hbHNGb3JCYWJ5bG9uLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoLnV2cyA9IHRoaXMuX3Vud3JhcHBlZFVWRm9yQmFieWxvbi5zbGljZSgpO1xyXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVkTWVzaC5oYXNMaW5lcyA9IHRoaXMuX2hhc0xpbmVEYXRhO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdPcHRpb25zLmltcG9ydFZlcnRleENvbG9ycykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlZE1lc2guY29sb3JzID0gdGhpcy5fdW53cmFwcGVkQ29sb3JzRm9yQmFieWxvbi5zbGljZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1Jlc2V0IHRoZSBhcnJheSBmb3IgdGhlIG5leHQgbWVzaFxyXG4gICAgICAgICAgICB0aGlzLl9pbmRpY2VzRm9yQmFieWxvbi5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB0aGlzLl91bndyYXBwZWRQb3NpdGlvbnNGb3JCYWJ5bG9uLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3Vud3JhcHBlZENvbG9yc0ZvckJhYnlsb24ubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fdW53cmFwcGVkTm9ybWFsc0ZvckJhYnlsb24ubGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgdGhpcy5fdW53cmFwcGVkVVZGb3JCYWJ5bG9uLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhc0xpbmVEYXRhID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgX29wdGltaXplTm9ybWFscyhtZXNoOiBBYnN0cmFjdE1lc2gpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBtZXNoLmdldFZlcnRpY2VzRGF0YShWZXJ0ZXhCdWZmZXIuUG9zaXRpb25LaW5kKTtcclxuICAgICAgICBjb25zdCBub3JtYWxzID0gbWVzaC5nZXRWZXJ0aWNlc0RhdGEoVmVydGV4QnVmZmVyLk5vcm1hbEtpbmQpO1xyXG4gICAgICAgIGNvbnN0IG1hcFZlcnRpY2VzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlcltdIH0gPSB7fTtcclxuXHJcbiAgICAgICAgaWYgKCFwb3NpdGlvbnMgfHwgIW5vcm1hbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbnMubGVuZ3RoIC8gMzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBwb3NpdGlvbnNbaSAqIDMgKyAwXTtcclxuICAgICAgICAgICAgY29uc3QgeSA9IHBvc2l0aW9uc1tpICogMyArIDFdO1xyXG4gICAgICAgICAgICBjb25zdCB6ID0gcG9zaXRpb25zW2kgKiAzICsgMl07XHJcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHggKyBcIl9cIiArIHkgKyBcIl9cIiArIHo7XHJcblxyXG4gICAgICAgICAgICBsZXQgbHN0ID0gbWFwVmVydGljZXNba2V5XTtcclxuICAgICAgICAgICAgaWYgKCFsc3QpIHtcclxuICAgICAgICAgICAgICAgIGxzdCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgbWFwVmVydGljZXNba2V5XSA9IGxzdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsc3QucHVzaChpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IG5ldyBWZWN0b3IzKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbWFwVmVydGljZXMpIHtcclxuICAgICAgICAgICAgY29uc3QgbHN0ID0gbWFwVmVydGljZXNba2V5XTtcclxuICAgICAgICAgICAgaWYgKGxzdC5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdjBJZHggPSBsc3RbMF07XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbHN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2SWR4ID0gbHN0W2ldO1xyXG4gICAgICAgICAgICAgICAgbm9ybWFsc1t2MElkeCAqIDMgKyAwXSArPSBub3JtYWxzW3ZJZHggKiAzICsgMF07XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW3YwSWR4ICogMyArIDFdICs9IG5vcm1hbHNbdklkeCAqIDMgKyAxXTtcclxuICAgICAgICAgICAgICAgIG5vcm1hbHNbdjBJZHggKiAzICsgMl0gKz0gbm9ybWFsc1t2SWR4ICogMyArIDJdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBub3JtYWwuY29weUZyb21GbG9hdHMobm9ybWFsc1t2MElkeCAqIDMgKyAwXSwgbm9ybWFsc1t2MElkeCAqIDMgKyAxXSwgbm9ybWFsc1t2MElkeCAqIDMgKyAyXSk7XHJcbiAgICAgICAgICAgIG5vcm1hbC5ub3JtYWxpemUoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbHN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2SWR4ID0gbHN0W2ldO1xyXG4gICAgICAgICAgICAgICAgbm9ybWFsc1t2SWR4ICogMyArIDBdID0gbm9ybWFsLng7XHJcbiAgICAgICAgICAgICAgICBub3JtYWxzW3ZJZHggKiAzICsgMV0gPSBub3JtYWwueTtcclxuICAgICAgICAgICAgICAgIG5vcm1hbHNbdklkeCAqIDMgKyAyXSA9IG5vcm1hbC56O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1lc2guc2V0VmVydGljZXNEYXRhKFZlcnRleEJ1ZmZlci5Ob3JtYWxLaW5kLCBub3JtYWxzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfSXNMaW5lRWxlbWVudChsaW5lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gbGluZS5zdGFydHNXaXRoKFwibFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfSXNPYmplY3RFbGVtZW50KGxpbmU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBsaW5lLnN0YXJ0c1dpdGgoXCJvXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIF9Jc0dyb3VwRWxlbWVudChsaW5lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gbGluZS5zdGFydHNXaXRoKFwiZ1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBfR2V0WmJydXNoTVJHQihsaW5lOiBzdHJpbmcsIG5vdFBhcnNlOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKCFsaW5lLnN0YXJ0c1dpdGgoXCJtcmdiXCIpKSByZXR1cm4gbnVsbDtcclxuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKFwibXJnYlwiLCBcIlwiKS50cmltKCk7XHJcbiAgICAgICAgLy8gaWYgaW5jbHVkZSB2ZXJ0ZXggY29sb3IgLCBub3QgbG9hZCBtcmdiIGFueW1vcmVcclxuICAgICAgICBpZiAobm90UGFyc2UpIHJldHVybiBbXTtcclxuICAgICAgICBjb25zdCByZWdleCA9IC9bYS16MC05XS9nO1xyXG4gICAgICAgIGNvbnN0IHJlZ0FycmF5ID0gbGluZS5tYXRjaChyZWdleCk7XHJcbiAgICAgICAgaWYgKCFyZWdBcnJheSB8fCByZWdBcnJheS5sZW5ndGggJSA4ICE9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYXJyYXk6IENvbG9yNFtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcmVnSW5kZXggPSAwOyByZWdJbmRleCA8IHJlZ0FycmF5Lmxlbmd0aCAvIDg7IHJlZ0luZGV4KyspIHtcclxuICAgICAgICAgICAgLy9lYWNoIGl0ZW0gaXMgTU1SUkdHQkIsIG0gaXMgbWF0ZXJpYWwgaW5kZXhcclxuICAgICAgICAgICAgLy8gY29uc3QgbSA9IHJlZ0FycmF5W3JlZ0luZGV4ICogOCArIDBdICsgcmVnQXJyYXlbcmVnSW5kZXggKiA4ICsgMV07XHJcbiAgICAgICAgICAgIGNvbnN0IHIgPSByZWdBcnJheVtyZWdJbmRleCAqIDggKyAyXSArIHJlZ0FycmF5W3JlZ0luZGV4ICogOCArIDNdO1xyXG4gICAgICAgICAgICBjb25zdCBnID0gcmVnQXJyYXlbcmVnSW5kZXggKiA4ICsgNF0gKyByZWdBcnJheVtyZWdJbmRleCAqIDggKyA1XTtcclxuICAgICAgICAgICAgY29uc3QgYiA9IHJlZ0FycmF5W3JlZ0luZGV4ICogOCArIDZdICsgcmVnQXJyYXlbcmVnSW5kZXggKiA4ICsgN107XHJcbiAgICAgICAgICAgIGFycmF5LnB1c2gobmV3IENvbG9yNChwYXJzZUludChyLCAxNikgLyAyNTUsIHBhcnNlSW50KGcsIDE2KSAvIDI1NSwgcGFyc2VJbnQoYiwgMTYpIC8gMjU1LCAxKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhcnJheTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZ1bmN0aW9uIHVzZWQgdG8gcGFyc2UgYW4gT0JKIHN0cmluZ1xyXG4gICAgICogQHBhcmFtIG1lc2hlc05hbWVzIGRlZmluZXMgdGhlIGxpc3Qgb2YgbWVzaGVzIHRvIGxvYWQgKGFsbCBpZiBub3QgZGVmaW5lZClcclxuICAgICAqIEBwYXJhbSBkYXRhIGRlZmluZXMgdGhlIE9CSiBzdHJpbmdcclxuICAgICAqIEBwYXJhbSBzY2VuZSBkZWZpbmVzIHRoZSBob3N0aW5nIHNjZW5lXHJcbiAgICAgKiBAcGFyYW0gYXNzZXRDb250YWluZXIgZGVmaW5lcyB0aGUgYXNzZXQgY29udGFpbmVyIHRvIGxvYWQgZGF0YSBpblxyXG4gICAgICogQHBhcmFtIG9uRmlsZVRvTG9hZEZvdW5kIGRlZmluZXMgYSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIGlmIGEgTVRMIGZpbGUgaXMgZm91bmRcclxuICAgICAqL1xyXG4gICAgcHVibGljIHBhcnNlKG1lc2hlc05hbWVzOiBhbnksIGRhdGE6IHN0cmluZywgc2NlbmU6IFNjZW5lLCBhc3NldENvbnRhaW5lcjogTnVsbGFibGU8QXNzZXRDb250YWluZXI+LCBvbkZpbGVUb0xvYWRGb3VuZDogKGZpbGVUb0xvYWQ6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIC8vTW92ZSBTYW50aXRpemUgaGVyZSB0byBmb3JiaWQgZGVsZXRlIHpicnVzaCBkYXRhXHJcbiAgICAgICAgLy8gU2FuaXRpemUgZGF0YVxyXG4gICAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UoLyNNUkdCL2csIFwibXJnYlwiKTtcclxuICAgICAgICBkYXRhID0gZGF0YS5yZXBsYWNlKC8jLiokL2dtLCBcIlwiKS50cmltKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdPcHRpb25zLnVzZUxlZ2FjeUJlaGF2aW9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hUcmlhbmdsZSA9IChmYWNlcywgZmFjZUluZGV4KSA9PiB0aGlzLl90cmlhbmdsZXMucHVzaChmYWNlc1swXSwgZmFjZXNbZmFjZUluZGV4XSwgZmFjZXNbZmFjZUluZGV4ICsgMV0pO1xyXG4gICAgICAgICAgICB0aGlzLl9oYW5kZWRuZXNzU2lnbiA9IDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzY2VuZS51c2VSaWdodEhhbmRlZFN5c3RlbSkge1xyXG4gICAgICAgICAgICB0aGlzLl9wdXNoVHJpYW5nbGUgPSAoZmFjZXMsIGZhY2VJbmRleCkgPT4gdGhpcy5fdHJpYW5nbGVzLnB1c2goZmFjZXNbMF0sIGZhY2VzW2ZhY2VJbmRleCArIDFdLCBmYWNlc1tmYWNlSW5kZXhdKTtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGVkbmVzc1NpZ24gPSAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3B1c2hUcmlhbmdsZSA9IChmYWNlcywgZmFjZUluZGV4KSA9PiB0aGlzLl90cmlhbmdsZXMucHVzaChmYWNlc1swXSwgZmFjZXNbZmFjZUluZGV4XSwgZmFjZXNbZmFjZUluZGV4ICsgMV0pO1xyXG4gICAgICAgICAgICB0aGlzLl9oYW5kZWRuZXNzU2lnbiA9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3BsaXQgdGhlIGZpbGUgaW50byBsaW5lc1xyXG4gICAgICAgIC8vIFByZXByb2Nlc3MgbGluZSBkYXRhXHJcbiAgICAgICAgY29uc3QgbGluZXNPQkogPSBkYXRhLnNwbGl0KFwiXFxuXCIpO1xyXG4gICAgICAgIGNvbnN0IGxpbmVMaW5lczogc3RyaW5nW11bXSA9IFtdO1xyXG4gICAgICAgIGxldCBjdXJyZW50R3JvdXA6IHN0cmluZ1tdID0gW107XHJcblxyXG4gICAgICAgIGxpbmVMaW5lcy5wdXNoKGN1cnJlbnRHcm91cCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXNPQkoubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzT0JKW2ldLnRyaW0oKS5yZXBsYWNlKC9cXHNcXHMvZywgXCIgXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29tbWVudCBvciBuZXdMaW5lXHJcbiAgICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA9PT0gMCB8fCBsaW5lLmNoYXJBdCgwKSA9PT0gXCIjXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoU29saWRQYXJzZXIuX0lzR3JvdXBFbGVtZW50KGxpbmUpIHx8IFNvbGlkUGFyc2VyLl9Jc09iamVjdEVsZW1lbnQobGluZSkpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgbGluZUxpbmVzLnB1c2goY3VycmVudEdyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKFNvbGlkUGFyc2VyLl9Jc0xpbmVFbGVtZW50KGxpbmUpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lVmFsdWVzID0gbGluZS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbGluZSBlbGVtZW50cyB3aXRoIHR3byB2ZXJ0aWNlcyBvbmx5XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGxpbmVWYWx1ZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEdyb3VwLnB1c2goYGwgJHtsaW5lVmFsdWVzW2ldfSAke2xpbmVWYWx1ZXNbaSArIDFdfWApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEdyb3VwLnB1c2gobGluZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gbGluZUxpbmVzLmZsYXQoKTtcclxuICAgICAgICAvLyBMb29rIGF0IGVhY2ggbGluZVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW2ldLnRyaW0oKS5yZXBsYWNlKC9cXHNcXHMvZywgXCIgXCIpO1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0O1xyXG4gICAgICAgICAgICAvLyBDb21tZW50IG9yIG5ld0xpbmVcclxuICAgICAgICAgICAgaWYgKGxpbmUubGVuZ3RoID09PSAwIHx8IGxpbmUuY2hhckF0KDApID09PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoU29saWRQYXJzZXIuVmVydGV4UGF0dGVybi50ZXN0KGxpbmUpKSB7XHJcbiAgICAgICAgICAgICAgICAvL0dldCBpbmZvcm1hdGlvbiBhYm91dCBvbmUgcG9zaXRpb24gcG9zc2libGUgZm9yIHRoZSB2ZXJ0aWNlc1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbGluZS5tYXRjaCgvW14gXSsvZykhOyAvLyBtYXRjaCB3aWxsIHJldHVybiBub24tbnVsbCBkdWUgdG8gcGFzc2luZyByZWdleCBwYXR0ZXJuXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVmFsdWUgb2YgcmVzdWx0IHdpdGggbGluZTogXCJ2IDEuMCAyLjAgMy4wXCJcclxuICAgICAgICAgICAgICAgIC8vIFtcInZcIiwgXCIxLjBcIiwgXCIyLjBcIiwgXCIzLjBcIl1cclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIFZlY3RvcjMgd2l0aCB0aGUgcG9zaXRpb24geCwgeSwgelxyXG4gICAgICAgICAgICAgICAgdGhpcy5fcG9zaXRpb25zLnB1c2gobmV3IFZlY3RvcjMocGFyc2VGbG9hdChyZXN1bHRbMV0pLCBwYXJzZUZsb2F0KHJlc3VsdFsyXSksIHBhcnNlRmxvYXQocmVzdWx0WzNdKSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkaW5nT3B0aW9ucy5pbXBvcnRWZXJ0ZXhDb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA+PSA3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBwYXJzZUZsb2F0KHJlc3VsdFs0XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGcgPSBwYXJzZUZsb2F0KHJlc3VsdFs1XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGIgPSBwYXJzZUZsb2F0KHJlc3VsdFs2XSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb2xvcnMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb2xvcjQociA+IDEgPyByIC8gMjU1IDogciwgZyA+IDEgPyBnIC8gMjU1IDogZywgYiA+IDEgPyBiIC8gMjU1IDogYiwgcmVzdWx0Lmxlbmd0aCA9PT0gNyB8fCByZXN1bHRbN10gPT09IHVuZGVmaW5lZCA/IDEgOiBwYXJzZUZsb2F0KHJlc3VsdFs3XSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogbWF5YmUgcHVzaCBOVUxMIGFuZCBpZiBhbGwgYXJlIE5VTEwgdG8gc2tpcCAoYW5kIHJlbW92ZSBncmF5Q29sb3IgdmFyKS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29sb3JzLnB1c2godGhpcy5fZ3JheUNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHJlc3VsdCA9IFNvbGlkUGFyc2VyLk5vcm1hbFBhdHRlcm4uZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGEgVmVjdG9yMyB3aXRoIHRoZSBub3JtYWxzIHgsIHksIHpcclxuICAgICAgICAgICAgICAgIC8vVmFsdWUgb2YgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAvLyBbXCJ2biAxLjAgMi4wIDMuMFwiLCBcIjEuMFwiLCBcIjIuMFwiLCBcIjMuMFwiXVxyXG4gICAgICAgICAgICAgICAgLy9BZGQgdGhlIFZlY3RvciBpbiB0aGUgbGlzdCBvZiBub3JtYWxzXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub3JtYWxzLnB1c2gobmV3IFZlY3RvcjMocGFyc2VGbG9hdChyZXN1bHRbMV0pLCBwYXJzZUZsb2F0KHJlc3VsdFsyXSksIHBhcnNlRmxvYXQocmVzdWx0WzNdKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKChyZXN1bHQgPSBTb2xpZFBhcnNlci5VVlBhdHRlcm4uZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vQ3JlYXRlIGEgVmVjdG9yMiB3aXRoIHRoZSBub3JtYWxzIHUsIHZcclxuICAgICAgICAgICAgICAgIC8vVmFsdWUgb2YgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAvLyBbXCJ2dCAwLjEgMC4yIDAuM1wiLCBcIjAuMVwiLCBcIjAuMlwiXVxyXG4gICAgICAgICAgICAgICAgLy9BZGQgdGhlIFZlY3RvciBpbiB0aGUgbGlzdCBvZiB1dnNcclxuICAgICAgICAgICAgICAgIHRoaXMuX3V2cy5wdXNoKG5ldyBWZWN0b3IyKHBhcnNlRmxvYXQocmVzdWx0WzFdKSAqIHRoaXMuX2xvYWRpbmdPcHRpb25zLlVWU2NhbGluZy54LCBwYXJzZUZsb2F0KHJlc3VsdFsyXSkgKiB0aGlzLl9sb2FkaW5nT3B0aW9ucy5VVlNjYWxpbmcueSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSWRlbnRpZnkgcGF0dGVybnMgb2YgZmFjZXNcclxuICAgICAgICAgICAgICAgIC8vRmFjZSBjb3VsZCBiZSBkZWZpbmVkIGluIGRpZmZlcmVudCB0eXBlIG9mIHBhdHRlcm5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICgocmVzdWx0ID0gU29saWRQYXJzZXIuRmFjZVBhdHRlcm4zLmV4ZWMobGluZSkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvL1ZhbHVlIG9mIHJlc3VsdDpcclxuICAgICAgICAgICAgICAgIC8vW1wiZiAxLzEvMSAyLzIvMiAzLzMvM1wiLCBcIjEvMS8xIDIvMi8yIDMvMy8zXCIuLi5dXHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZXQgdGhlIGRhdGEgZm9yIHRoaXMgZmFjZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0RGF0YUZvckN1cnJlbnRGYWNlV2l0aFBhdHRlcm4zKFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsxXS50cmltKCkuc3BsaXQoXCIgXCIpLCAvLyBbXCIxLzEvMVwiLCBcIjIvMi8yXCIsIFwiMy8zLzNcIl1cclxuICAgICAgICAgICAgICAgICAgICAxXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKChyZXN1bHQgPSBTb2xpZFBhcnNlci5GYWNlUGF0dGVybjQuZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vVmFsdWUgb2YgcmVzdWx0OlxyXG4gICAgICAgICAgICAgICAgLy9bXCJmIDEvLzEgMi8vMiAzLy8zXCIsIFwiMS8vMSAyLy8yIDMvLzNcIi4uLl1cclxuXHJcbiAgICAgICAgICAgICAgICAvL1NldCB0aGUgZGF0YSBmb3IgdGhpcyBmYWNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXREYXRhRm9yQ3VycmVudEZhY2VXaXRoUGF0dGVybjQoXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WzFdLnRyaW0oKS5zcGxpdChcIiBcIiksIC8vIFtcIjEvLzFcIiwgXCIyLy8yXCIsIFwiMy8vM1wiXVxyXG4gICAgICAgICAgICAgICAgICAgIDFcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHJlc3VsdCA9IFNvbGlkUGFyc2VyLkZhY2VQYXR0ZXJuNS5leGVjKGxpbmUpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy9WYWx1ZSBvZiByZXN1bHQ6XHJcbiAgICAgICAgICAgICAgICAvL1tcImYgLTEvLTEvLTEgLTIvLTIvLTIgLTMvLTMvLTNcIiwgXCItMS8tMS8tMSAtMi8tMi8tMiAtMy8tMy8tM1wiLi4uXVxyXG5cclxuICAgICAgICAgICAgICAgIC8vU2V0IHRoZSBkYXRhIGZvciB0aGlzIGZhY2VcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldERhdGFGb3JDdXJyZW50RmFjZVdpdGhQYXR0ZXJuNShcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbMV0udHJpbSgpLnNwbGl0KFwiIFwiKSwgLy8gW1wiLTEvLTEvLTFcIiwgXCItMi8tMi8tMlwiLCBcIi0zLy0zLy0zXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgMVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICgocmVzdWx0ID0gU29saWRQYXJzZXIuRmFjZVBhdHRlcm4yLmV4ZWMobGluZSkpICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvL1ZhbHVlIG9mIHJlc3VsdDpcclxuICAgICAgICAgICAgICAgIC8vW1wiZiAxLzEgMi8yIDMvM1wiLCBcIjEvMSAyLzIgMy8zXCIuLi5dXHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZXQgdGhlIGRhdGEgZm9yIHRoaXMgZmFjZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0RGF0YUZvckN1cnJlbnRGYWNlV2l0aFBhdHRlcm4yKFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsxXS50cmltKCkuc3BsaXQoXCIgXCIpLCAvLyBbXCIxLzFcIiwgXCIyLzJcIiwgXCIzLzNcIl1cclxuICAgICAgICAgICAgICAgICAgICAxXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKChyZXN1bHQgPSBTb2xpZFBhcnNlci5GYWNlUGF0dGVybjEuZXhlYyhsaW5lKSkgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vVmFsdWUgb2YgcmVzdWx0XHJcbiAgICAgICAgICAgICAgICAvL1tcImYgMSAyIDNcIiwgXCIxIDIgM1wiLi4uXVxyXG5cclxuICAgICAgICAgICAgICAgIC8vU2V0IHRoZSBkYXRhIGZvciB0aGlzIGZhY2VcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldERhdGFGb3JDdXJyZW50RmFjZVdpdGhQYXR0ZXJuMShcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbMV0udHJpbSgpLnNwbGl0KFwiIFwiKSwgLy8gW1wiMVwiLCBcIjJcIiwgXCIzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgMVxyXG4gICAgICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZWZpbmUgYSBtZXNoIG9yIGFuIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgLy8gRWFjaCB0aW1lIHRoaXMga2V5d29yZCBpcyBhbmFseXplZCwgY3JlYXRlIGEgbmV3IE9iamVjdCB3aXRoIGFsbCBkYXRhIGZvciBjcmVhdGluZyBhIGJhYnlsb25NZXNoXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHJlc3VsdCA9IFNvbGlkUGFyc2VyLkxpbmVQYXR0ZXJuMS5leGVjKGxpbmUpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy9WYWx1ZSBvZiByZXN1bHRcclxuICAgICAgICAgICAgICAgIC8vW1wibCAxIDJcIl1cclxuXHJcbiAgICAgICAgICAgICAgICAvL1NldCB0aGUgZGF0YSBmb3IgdGhpcyBmYWNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXREYXRhRm9yQ3VycmVudEZhY2VXaXRoUGF0dGVybjEoXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0WzFdLnRyaW0oKS5zcGxpdChcIiBcIiksIC8vIFtcIjFcIiwgXCIyXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgMFxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hhc0xpbmVEYXRhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEZWZpbmUgYSBtZXNoIG9yIGFuIG9iamVjdFxyXG4gICAgICAgICAgICAgICAgLy8gRWFjaCB0aW1lIHRoaXMga2V5d29yZCBpcyBhbmFseXplZCwgY3JlYXRlIGEgbmV3IE9iamVjdCB3aXRoIGFsbCBkYXRhIGZvciBjcmVhdGluZyBhIGJhYnlsb25NZXNoXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHJlc3VsdCA9IFNvbGlkUGFyc2VyLkxpbmVQYXR0ZXJuMi5leGVjKGxpbmUpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy9WYWx1ZSBvZiByZXN1bHRcclxuICAgICAgICAgICAgICAgIC8vW1wibCAxLzEgMi8yXCJdXHJcblxyXG4gICAgICAgICAgICAgICAgLy9TZXQgdGhlIGRhdGEgZm9yIHRoaXMgZmFjZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0RGF0YUZvckN1cnJlbnRGYWNlV2l0aFBhdHRlcm4yKFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdFsxXS50cmltKCkuc3BsaXQoXCIgXCIpLCAvLyBbXCIxLzFcIiwgXCIyLzJcIl1cclxuICAgICAgICAgICAgICAgICAgICAwXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faGFzTGluZURhdGEgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIERlZmluZSBhIG1lc2ggb3IgYW4gb2JqZWN0XHJcbiAgICAgICAgICAgICAgICAvLyBFYWNoIHRpbWUgdGhpcyBrZXl3b3JkIGlzIGFuYWx5emVkLCBjcmVhdGUgYSBuZXcgT2JqZWN0IHdpdGggYWxsIGRhdGEgZm9yIGNyZWF0aW5nIGEgYmFieWxvbk1lc2hcclxuICAgICAgICAgICAgfSBlbHNlIGlmICgocmVzdWx0ID0gU29saWRQYXJzZXIuX0dldFpicnVzaE1SR0IobGluZSwgIXRoaXMuX2xvYWRpbmdPcHRpb25zLmltcG9ydFZlcnRleENvbG9ycykpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V4dENvbG9ycy5wdXNoKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKHJlc3VsdCA9IFNvbGlkUGFyc2VyLkxpbmVQYXR0ZXJuMy5leGVjKGxpbmUpKSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgLy9WYWx1ZSBvZiByZXN1bHRcclxuICAgICAgICAgICAgICAgIC8vW1wibCAxLzEvMSAyLzIvMlwiXVxyXG5cclxuICAgICAgICAgICAgICAgIC8vU2V0IHRoZSBkYXRhIGZvciB0aGlzIGZhY2VcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NldERhdGFGb3JDdXJyZW50RmFjZVdpdGhQYXR0ZXJuMyhcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHRbMV0udHJpbSgpLnNwbGl0KFwiIFwiKSwgLy8gW1wiMS8xLzFcIiwgXCIyLzIvMlwiXVxyXG4gICAgICAgICAgICAgICAgICAgIDBcclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9oYXNMaW5lRGF0YSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGVmaW5lIGEgbWVzaCBvciBhbiBvYmplY3RcclxuICAgICAgICAgICAgICAgIC8vIEVhY2ggdGltZSB0aGlzIGtleXdvcmQgaXMgYW5hbHl6ZWQsIGNyZWF0ZSBhIG5ldyBPYmplY3Qgd2l0aCBhbGwgZGF0YSBmb3IgY3JlYXRpbmcgYSBiYWJ5bG9uTWVzaFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFNvbGlkUGFyc2VyLkdyb3VwRGVzY3JpcHRvci50ZXN0KGxpbmUpIHx8IFNvbGlkUGFyc2VyLk9iamVjdERlc2NyaXB0b3IudGVzdChsaW5lKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IG1lc2ggY29ycmVzcG9uZGluZyB0byB0aGUgbmFtZSBvZiB0aGUgZ3JvdXAuXHJcbiAgICAgICAgICAgICAgICAvLyBEZWZpbml0aW9uIG9mIHRoZSBtZXNoXHJcbiAgICAgICAgICAgICAgICBjb25zdCBvYmpNZXNoOiBNZXNoT2JqZWN0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGxpbmUuc3Vic3RyaW5nKDIpLnRyaW0oKSwgLy9TZXQgdGhlIG5hbWUgb2YgdGhlIGN1cnJlbnQgb2JqIG1lc2hcclxuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uczogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBub3JtYWxzOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIHV2czogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcnM6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgbWF0ZXJpYWxOYW1lOiB0aGlzLl9tYXRlcmlhbE5hbWVGcm9tT2JqLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzT2JqZWN0OiBTb2xpZFBhcnNlci5PYmplY3REZXNjcmlwdG9yLnRlc3QobGluZSksXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkUHJldmlvdXNPYmpNZXNoKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9QdXNoIHRoZSBsYXN0IG1lc2ggY3JlYXRlZCB3aXRoIG9ubHkgdGhlIG5hbWVcclxuICAgICAgICAgICAgICAgIHRoaXMuX21lc2hlc0Zyb21PYmoucHVzaChvYmpNZXNoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1NldCB0aGlzIHZhcmlhYmxlIHRvIGluZGljYXRlIHRoYXQgbm93IG1lc2hlc0Zyb21PYmogaGFzIG9iamVjdHMgZGVmaW5lZCBpbnNpZGVcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hhc01lc2hlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0ZpcnN0TWF0ZXJpYWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5jcmVtZW50ID0gMTtcclxuICAgICAgICAgICAgICAgIC8vS2V5d29yZCBmb3IgYXBwbHlpbmcgYSBtYXRlcmlhbFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKFNvbGlkUGFyc2VyLlVzZU10bERlc2NyaXB0b3IudGVzdChsaW5lKSkge1xyXG4gICAgICAgICAgICAgICAgLy9HZXQgdGhlIG5hbWUgb2YgdGhlIG1hdGVyaWFsXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tYXRlcmlhbE5hbWVGcm9tT2JqID0gbGluZS5zdWJzdHJpbmcoNykudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vSWYgdGhpcyBuZXcgbWF0ZXJpYWwgaXMgaW4gdGhlIHNhbWUgbWVzaFxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXNGaXJzdE1hdGVyaWFsIHx8ICF0aGlzLl9oYXNNZXNoZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1NldCB0aGUgZGF0YSBmb3IgdGhlIHByZXZpb3VzIG1lc2hcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRQcmV2aW91c09iak1lc2goKTtcclxuICAgICAgICAgICAgICAgICAgICAvL0NyZWF0ZSBhIG5ldyBtZXNoXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2JqTWVzaDogTWVzaE9iamVjdCA9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vU2V0IHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IG9iaiBtZXNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICh0aGlzLl9vYmpNZXNoTmFtZSB8fCBcIm1lc2hcIikgKyBcIl9tbVwiICsgdGhpcy5faW5jcmVtZW50LnRvU3RyaW5nKCksIC8vU2V0IHRoZSBuYW1lIG9mIHRoZSBjdXJyZW50IG9iaiBtZXNoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFsczogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHV2czogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yczogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGVyaWFsTmFtZTogdGhpcy5fbWF0ZXJpYWxOYW1lRnJvbU9iaixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT2JqZWN0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbmNyZW1lbnQrKztcclxuICAgICAgICAgICAgICAgICAgICAvL0lmIG1lc2hlcyBhcmUgYWxyZWFkeSBkZWZpbmVkXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWVzaGVzRnJvbU9iai5wdXNoKG9iak1lc2gpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhc01lc2hlcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL1NldCB0aGUgbWF0ZXJpYWwgbmFtZSBpZiB0aGUgcHJldmlvdXMgbGluZSBkZWZpbmUgYSBtZXNoXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2hhc01lc2hlcyAmJiB0aGlzLl9pc0ZpcnN0TWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICAvL1NldCB0aGUgbWF0ZXJpYWwgbmFtZSB0byB0aGUgcHJldmlvdXMgbWVzaCAoMSBtYXRlcmlhbCBwZXIgbWVzaClcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9tZXNoZXNGcm9tT2JqW3RoaXMuX21lc2hlc0Zyb21PYmoubGVuZ3RoIC0gMV0ubWF0ZXJpYWxOYW1lID0gdGhpcy5fbWF0ZXJpYWxOYW1lRnJvbU9iajtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0ZpcnN0TWF0ZXJpYWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIEtleXdvcmQgZm9yIGxvYWRpbmcgdGhlIG10bCBmaWxlXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoU29saWRQYXJzZXIuTXRsTGliR3JvdXBEZXNjcmlwdG9yLnRlc3QobGluZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgbmFtZSBvZiBtdGwgZmlsZVxyXG4gICAgICAgICAgICAgICAgb25GaWxlVG9Mb2FkRm91bmQobGluZS5zdWJzdHJpbmcoNykudHJpbSgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBcHBseSBzbW9vdGhpbmdcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChTb2xpZFBhcnNlci5TbW9vdGhEZXNjcmlwdG9yLnRlc3QobGluZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIHNtb290aCBzaGFkaW5nID0+IGFwcGx5IHNtb290aGluZ1xyXG4gICAgICAgICAgICAgICAgLy8gVG9kYXkgSSBkb24ndCBrbm93IGl0IHdvcmsgd2l0aCBiYWJ5bG9uIGFuZCB3aXRoIG9iai5cclxuICAgICAgICAgICAgICAgIC8vIFdpdGggdGhlIG9iaiBmaWxlICBhbiBpbnRlZ2VyIGlzIHNldFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy9JZiB0aGVyZSBpcyBhbm90aGVyIHBvc3NpYmlsaXR5XHJcbiAgICAgICAgICAgICAgICBMb2dnZXIuTG9nKFwiVW5oYW5kbGVkIGV4cHJlc3Npb24gYXQgbGluZSA6IFwiICsgbGluZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQXQgdGhlIGVuZCBvZiB0aGUgZmlsZSwgYWRkIHRoZSBsYXN0IG1lc2ggaW50byB0aGUgbWVzaGVzRnJvbU9iaiBhcnJheVxyXG4gICAgICAgIGlmICh0aGlzLl9oYXNNZXNoZXMpIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRoZSBkYXRhIGZvciB0aGUgbGFzdCBtZXNoXHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoID0gdGhpcy5fbWVzaGVzRnJvbU9ialt0aGlzLl9tZXNoZXNGcm9tT2JqLmxlbmd0aCAtIDFdO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdPcHRpb25zLnVzZUxlZ2FjeUJlaGF2aW9yKSB7XHJcbiAgICAgICAgICAgICAgICAvL1JldmVyc2UgaW5kaWNlcyBmb3IgZGlzcGxheWluZyBmYWNlcyBpbiB0aGUgZ29vZCBzZW5zZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5faW5kaWNlc0ZvckJhYnlsb24ucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL0dldCB0aGUgZ29vZCBhcnJheVxyXG4gICAgICAgICAgICB0aGlzLl91bndyYXBEYXRhKCk7XHJcbiAgICAgICAgICAgIC8vU2V0IGFycmF5XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoLmluZGljZXMgPSB0aGlzLl9pbmRpY2VzRm9yQmFieWxvbjtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlZE1lc2gucG9zaXRpb25zID0gdGhpcy5fdW53cmFwcGVkUG9zaXRpb25zRm9yQmFieWxvbjtcclxuICAgICAgICAgICAgdGhpcy5faGFuZGxlZE1lc2gubm9ybWFscyA9IHRoaXMuX3Vud3JhcHBlZE5vcm1hbHNGb3JCYWJ5bG9uO1xyXG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVkTWVzaC51dnMgPSB0aGlzLl91bndyYXBwZWRVVkZvckJhYnlsb247XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoLmhhc0xpbmVzID0gdGhpcy5faGFzTGluZURhdGE7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkaW5nT3B0aW9ucy5pbXBvcnRWZXJ0ZXhDb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoLmNvbG9ycyA9IHRoaXMuX3Vud3JhcHBlZENvbG9yc0ZvckJhYnlsb247XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIGFueSBvIG9yIGcga2V5d29yZCBub3QgZm91bmQsIGNyZWF0ZSBhIG1lc2ggd2l0aCBhIHJhbmRvbSBpZFxyXG4gICAgICAgIGlmICghdGhpcy5faGFzTWVzaGVzKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXdNYXRlcmlhbDogTnVsbGFibGU8U3RhbmRhcmRNYXRlcmlhbD4gPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5faW5kaWNlc0ZvckJhYnlsb24ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbG9hZGluZ09wdGlvbnMudXNlTGVnYWN5QmVoYXZpb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyByZXZlcnNlIHRhYiBvZiBpbmRpY2VzXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5kaWNlc0ZvckJhYnlsb24ucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vR2V0IHBvc2l0aW9ucyBub3JtYWxzIHV2c1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdW53cmFwRGF0YSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gaW5kaWNlcyBpbiB0aGUgZmlsZS4gV2Ugd2lsbCBoYXZlIHRvIHN3aXRjaCB0byBwb2ludCBjbG91ZCByZW5kZXJpbmdcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgcG9zIG9mIHRoaXMuX3Bvc2l0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Vud3JhcHBlZFBvc2l0aW9uc0ZvckJhYnlsb24ucHVzaChwb3MueCwgcG9zLnksIHBvcy56KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbm9ybWFscy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IG5vcm1hbCBvZiB0aGlzLl9ub3JtYWxzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Vud3JhcHBlZE5vcm1hbHNGb3JCYWJ5bG9uLnB1c2gobm9ybWFsLngsIG5vcm1hbC55LCBub3JtYWwueik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl91dnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCB1diBvZiB0aGlzLl91dnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW53cmFwcGVkVVZGb3JCYWJ5bG9uLnB1c2godXYueCwgdXYueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9leHRDb2xvcnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB0aGlzLl9leHRDb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdW53cmFwcGVkQ29sb3JzRm9yQmFieWxvbi5wdXNoKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIsIGNvbG9yLmEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2NvbG9ycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBjb2xvciBvZiB0aGlzLl9jb2xvcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Vud3JhcHBlZENvbG9yc0ZvckJhYnlsb24ucHVzaChjb2xvci5yLCBjb2xvci5nLCBjb2xvci5iLCBjb2xvci5hKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX21hdGVyaWFsTmFtZUZyb21PYmopIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBDcmVhdGUgYSBtYXRlcmlhbCB3aXRoIHBvaW50IGNsb3VkIG9uXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3TWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbChHZW9tZXRyeS5SYW5kb21JZCgpLCBzY2VuZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG5ld01hdGVyaWFsLnBvaW50c0Nsb3VkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbWF0ZXJpYWxOYW1lRnJvbU9iaiA9IG5ld01hdGVyaWFsLm5hbWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5fbm9ybWFscy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF0ZXJpYWwuZGlzYWJsZUxpZ2h0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3TWF0ZXJpYWwuZW1pc3NpdmVDb2xvciA9IENvbG9yMy5XaGl0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9TZXQgZGF0YSBmb3Igb25lIG1lc2hcclxuICAgICAgICAgICAgdGhpcy5fbWVzaGVzRnJvbU9iai5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IEdlb21ldHJ5LlJhbmRvbUlkKCksXHJcbiAgICAgICAgICAgICAgICBpbmRpY2VzOiB0aGlzLl9pbmRpY2VzRm9yQmFieWxvbixcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uczogdGhpcy5fdW53cmFwcGVkUG9zaXRpb25zRm9yQmFieWxvbixcclxuICAgICAgICAgICAgICAgIGNvbG9yczogdGhpcy5fdW53cmFwcGVkQ29sb3JzRm9yQmFieWxvbixcclxuICAgICAgICAgICAgICAgIG5vcm1hbHM6IHRoaXMuX3Vud3JhcHBlZE5vcm1hbHNGb3JCYWJ5bG9uLFxyXG4gICAgICAgICAgICAgICAgdXZzOiB0aGlzLl91bndyYXBwZWRVVkZvckJhYnlsb24sXHJcbiAgICAgICAgICAgICAgICBtYXRlcmlhbE5hbWU6IHRoaXMuX21hdGVyaWFsTmFtZUZyb21PYmosXHJcbiAgICAgICAgICAgICAgICBkaXJlY3RNYXRlcmlhbDogbmV3TWF0ZXJpYWwsXHJcbiAgICAgICAgICAgICAgICBpc09iamVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGhhc0xpbmVzOiB0aGlzLl9oYXNMaW5lRGF0YSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL1NldCBkYXRhIGZvciBlYWNoIG1lc2hcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuX21lc2hlc0Zyb21PYmoubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgLy9jaGVjayBtZXNoZXNOYW1lcyAoc3RsRmlsZUxvYWRlcilcclxuICAgICAgICAgICAgaWYgKG1lc2hlc05hbWVzICYmIHRoaXMuX21lc2hlc0Zyb21PYmpbal0ubmFtZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lc2hlc05hbWVzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWVzaGVzTmFtZXMuaW5kZXhPZih0aGlzLl9tZXNoZXNGcm9tT2JqW2pdLm5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9tZXNoZXNGcm9tT2JqW2pdLm5hbWUgIT09IG1lc2hlc05hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9HZXQgdGhlIGN1cnJlbnQgbWVzaFxyXG4gICAgICAgICAgICAvL1NldCB0aGUgZGF0YSB3aXRoIFZlcnRleEJ1ZmZlciBmb3IgZWFjaCBtZXNoXHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoID0gdGhpcy5fbWVzaGVzRnJvbU9ialtqXTtcclxuICAgICAgICAgICAgLy9DcmVhdGUgYSBNZXNoIHdpdGggdGhlIG5hbWUgb2YgdGhlIG9iaiBtZXNoXHJcblxyXG4gICAgICAgICAgICBzY2VuZS5fYmxvY2tFbnRpdHlDb2xsZWN0aW9uID0gISFhc3NldENvbnRhaW5lcjtcclxuICAgICAgICAgICAgY29uc3QgYmFieWxvbk1lc2ggPSBuZXcgTWVzaCh0aGlzLl9tZXNoZXNGcm9tT2JqW2pdLm5hbWUsIHNjZW5lKTtcclxuICAgICAgICAgICAgYmFieWxvbk1lc2guX3BhcmVudENvbnRhaW5lciA9IGFzc2V0Q29udGFpbmVyO1xyXG4gICAgICAgICAgICBzY2VuZS5fYmxvY2tFbnRpdHlDb2xsZWN0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZWRNZXNoLl9iYWJ5bG9uTWVzaCA9IGJhYnlsb25NZXNoO1xyXG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGEgZ3JvdXAgbWVzaCwgaXQgc2hvdWxkIGhhdmUgYW4gb2JqZWN0IG1lc2ggYXMgYSBwYXJlbnQuIFNvIGxvb2sgZm9yIHRoZSBmaXJzdCBvYmplY3QgbWVzaCB0aGF0IGFwcGVhcnMgYmVmb3JlIGl0LlxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2hhbmRsZWRNZXNoLmlzT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gaiAtIDE7IGsgPj0gMDsgLS1rKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX21lc2hlc0Zyb21PYmpba10uaXNPYmplY3QgJiYgdGhpcy5fbWVzaGVzRnJvbU9ialtrXS5fYmFieWxvbk1lc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFieWxvbk1lc2gucGFyZW50ID0gdGhpcy5fbWVzaGVzRnJvbU9ialtrXS5fYmFieWxvbk1lc2ghO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vUHVzaCB0aGUgbmFtZSBvZiB0aGUgbWF0ZXJpYWwgdG8gYW4gYXJyYXlcclxuICAgICAgICAgICAgLy9UaGlzIGlzIGluZGlzcGVuc2FibGUgZm9yIHRoZSBpbXBvcnRNZXNoIGZ1bmN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuX21hdGVyaWFsVG9Vc2UucHVzaCh0aGlzLl9tZXNoZXNGcm9tT2JqW2pdLm1hdGVyaWFsTmFtZSk7XHJcbiAgICAgICAgICAgIC8vSWYgdGhlIG1lc2ggaXMgYSBsaW5lIG1lc2hcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hhbmRsZWRNZXNoLmhhc0xpbmVzKSB7XHJcbiAgICAgICAgICAgICAgICBiYWJ5bG9uTWVzaC5faW50ZXJuYWxNZXRhZGF0YSA/Pz0ge307XHJcbiAgICAgICAgICAgICAgICBiYWJ5bG9uTWVzaC5faW50ZXJuYWxNZXRhZGF0YVtcIl9pc0xpbmVcIl0gPSB0cnVlOyAvL3RoaXMgaXMgYSBsaW5lIG1lc2hcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuX2hhbmRsZWRNZXNoLnBvc2l0aW9ucz8ubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvL1B1c2ggdGhlIG1lc2ggaW50byBhbiBhcnJheVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fYmFieWxvbk1lc2hlc0FycmF5LnB1c2goYmFieWxvbk1lc2gpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHZlcnRleERhdGE6IFZlcnRleERhdGEgPSBuZXcgVmVydGV4RGF0YSgpOyAvL1RoZSBjb250YWluZXIgZm9yIHRoZSB2YWx1ZXNcclxuICAgICAgICAgICAgLy9TZXQgdGhlIGRhdGEgZm9yIHRoZSBiYWJ5bG9uTWVzaFxyXG4gICAgICAgICAgICB2ZXJ0ZXhEYXRhLnV2cyA9IHRoaXMuX2hhbmRsZWRNZXNoLnV2cztcclxuICAgICAgICAgICAgdmVydGV4RGF0YS5pbmRpY2VzID0gdGhpcy5faGFuZGxlZE1lc2guaW5kaWNlcztcclxuICAgICAgICAgICAgdmVydGV4RGF0YS5wb3NpdGlvbnMgPSB0aGlzLl9oYW5kbGVkTWVzaC5wb3NpdGlvbnM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb2FkaW5nT3B0aW9ucy5jb21wdXRlTm9ybWFscykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsczogQXJyYXk8bnVtYmVyPiA9IG5ldyBBcnJheTxudW1iZXI+KCk7XHJcbiAgICAgICAgICAgICAgICBWZXJ0ZXhEYXRhLkNvbXB1dGVOb3JtYWxzKHRoaXMuX2hhbmRsZWRNZXNoLnBvc2l0aW9ucywgdGhpcy5faGFuZGxlZE1lc2guaW5kaWNlcywgbm9ybWFscyk7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhEYXRhLm5vcm1hbHMgPSBub3JtYWxzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmVydGV4RGF0YS5ub3JtYWxzID0gdGhpcy5faGFuZGxlZE1lc2gubm9ybWFscztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fbG9hZGluZ09wdGlvbnMuaW1wb3J0VmVydGV4Q29sb3JzKSB7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhEYXRhLmNvbG9ycyA9IHRoaXMuX2hhbmRsZWRNZXNoLmNvbG9ycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL1NldCB0aGUgZGF0YSBmcm9tIHRoZSBWZXJ0ZXhCdWZmZXIgdG8gdGhlIGN1cnJlbnQgTWVzaFxyXG4gICAgICAgICAgICB2ZXJ0ZXhEYXRhLmFwcGx5VG9NZXNoKGJhYnlsb25NZXNoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2xvYWRpbmdPcHRpb25zLmludmVydFkpIHtcclxuICAgICAgICAgICAgICAgIGJhYnlsb25NZXNoLnNjYWxpbmcueSAqPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fbG9hZGluZ09wdGlvbnMub3B0aW1pemVOb3JtYWxzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpbWl6ZU5vcm1hbHMoYmFieWxvbk1lc2gpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL1B1c2ggdGhlIG1lc2ggaW50byBhbiBhcnJheVxyXG4gICAgICAgICAgICB0aGlzLl9iYWJ5bG9uTWVzaGVzQXJyYXkucHVzaChiYWJ5bG9uTWVzaCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5faGFuZGxlZE1lc2guZGlyZWN0TWF0ZXJpYWwpIHtcclxuICAgICAgICAgICAgICAgIGJhYnlsb25NZXNoLm1hdGVyaWFsID0gdGhpcy5faGFuZGxlZE1lc2guZGlyZWN0TWF0ZXJpYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLyogZXNsaW50LWRpc2FibGUgaW1wb3J0L25vLWludGVybmFsLW1vZHVsZXMgKi9cclxuaW1wb3J0ICogYXMgTG9hZGVycyBmcm9tIFwibG9hZGVycy9PQkovaW5kZXhcIjtcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgdGhlIFVNRCBtb2R1bGUuXHJcbiAqIFRoZSBlbnRyeSBwb2ludCBmb3IgYSBmdXR1cmUgRVNNIHBhY2thZ2Ugc2hvdWxkIGJlIGluZGV4LnRzXHJcbiAqL1xyXG5jb25zdCBnbG9iYWxPYmplY3QgPSB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHVuZGVmaW5lZDtcclxuaWYgKHR5cGVvZiBnbG9iYWxPYmplY3QgIT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgIGZvciAoY29uc3Qga2V5IGluIExvYWRlcnMpIHtcclxuICAgICAgICBpZiAoISg8YW55Pmdsb2JhbE9iamVjdCkuQkFCWUxPTltrZXldKSB7XHJcbiAgICAgICAgICAgICg8YW55Pmdsb2JhbE9iamVjdCkuQkFCWUxPTltrZXldID0gKDxhbnk+TG9hZGVycylba2V5XTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCAqIGZyb20gXCJsb2FkZXJzL09CSi9pbmRleFwiO1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfYmFieWxvbmpzX01pc2NfdG9vbHNfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgKiBhcyBsb2FkZXJzIGZyb20gXCJAbHRzL2xvYWRlcnMvbGVnYWN5L2xlZ2FjeS1vYmpGaWxlTG9hZGVyXCI7XHJcbmV4cG9ydCB7IGxvYWRlcnMgfTtcclxuZXhwb3J0IGRlZmF1bHQgbG9hZGVycztcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9