

function create_lighthouses(scene, shadowGenerator) {

// Create the Morse tower at position (10,0,5) with 8 segments,
    const morseTower = createMorseTower(scene, shadowGenerator, {

        // => x: 1959.8547327640256, y: 248.25910073079265, z: 955.0814661695462
        basePosition: new BABYLON.Vector3(1971, 249, 955),
        towerHeightInSegments: 8,
        segmentHeight: 2.5,
        towerRadius: 2,
        topSphereDiameter: 3,
        morseCode: "-.-- --- ..-    .- .-. .    - --- ---    ... -- .- .-. -", 
        blinkUnit: 300,         // ms for a dot
        separationTime: 1000    // ms of pause after pattern
    });
    
    const lighthouse = createMorseTower(scene, shadowGenerator, {
    
        // => x: 1959.8547327640256, y: 248.25910073079265, z: 955.0814661695462
        basePosition: new BABYLON.Vector3(-1986, 25, -1380),
        towerHeightInSegments: 8,
        segmentHeight: 2.5,
        towerRadius: 2,
        topSphereDiameter: 3,
        morseCode: "-.-. ..- .-. .. --- ... .. - -.--   -.- .. .-.. .-.. . -..   - .... .   -.-. .- -", 
        blinkUnit: 300,         // ms for a dot
        separationTime: 1000    // ms of pause after pattern
    });

}