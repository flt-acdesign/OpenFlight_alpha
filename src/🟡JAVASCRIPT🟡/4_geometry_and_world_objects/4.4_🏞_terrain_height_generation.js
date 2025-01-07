


/***************************************************************
 * Example terrain function for generating terrain heights
 ***************************************************************/



function undulationMap(x, z, freqX, freqZ, amplitude) {
    let baseWave =
        (Math.sin(freqX * x * 1.1)) ** 3 *
        (Math.sin(freqZ * z * x / 1100)) ** 3 *
        2;

    let octave1 =
        (Math.sin(freqX * 2 * x)) ** 4 *
        (Math.cos(freqZ * 1.7 * z)) ** 4 *
        1;

    let octave2 =
        (Math.sin(freqX * 6 * x)) ** 5 *
        (Math.sin(freqZ * 4 * z)) ** 5 *
        .3;

    let octave3 =
        (Math.sin(freqX * 7 * x + z / 100)) ** 8 *
        (Math.sin(freqZ * 6 * z)) ** 8 *
        0.06;

    // Combine them and scale
        
        distance = (x**2 + z**2) **.5 
        island_radius = 2500

        modulation  = (distance < island_radius) ? 0 : (distance - island_radius) / 1000

        //heightY = (distance < 2500) ? amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) : -15
        heightY = amplitude * (((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) -  modulation)


    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY +14
}







function undulationMap_2025_01_07(x, z, freqX, freqZ, amplitude) {

    distance = (x**2 + z**2) **.5 
    island_radius = 2500

    let baseWave =
        (Math.sin(freqX * x * 1.1)) ** 3 *
        (Math.sin(freqZ * z * x / 1100)) ** 3 *
        2;

    let octave1 =
        (Math.sin(freqX * 3 * x)) ** 4 *
        (Math.cos(freqZ * 1 * z)) ** 4 *
        1;

    let octave2 =
        (Math.sin(freqX * 6 * x)) ** 5 *
        (Math.sin(freqZ * 4 * z)) ** 5 *
        .3;

    let octave3 =
        (Math.sin(freqX * 7 * x + z / 100)) ** 8 *
        (Math.sin(freqZ * 6 * z)) ** 8 *
        0.06;

    // Combine them and scale
        
        modulation  = (distance < island_radius) ? 0 : (distance - island_radius) / 1000

        //heightY = (distance < 2500) ? amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) : -15
        heightY = amplitude * (((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) -  modulation)


    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY +14
}






function undulationMap2(x, z, freqX, freqZ, amplitude) {
    let baseWave =
        (Math.sin(freqX * x * 1.1)) ** 3 *
        (Math.sin(freqZ * z * x / 1100)) ** 3 *
        2;

    let octave1 =
        (Math.sin(freqX * 2 * x)) ** 4 *
        (Math.cos(freqZ * 1.7 * z)) ** 4 *
        1;

    let octave2 =
        (Math.sin(freqX * 6 * x)) ** 5 *
        (Math.sin(freqZ * 4 * z)) ** 5 *
        .3;

    let octave3 =
        (Math.sin(freqX * 7 * x + z / 100)) ** 8 *
        (Math.sin(freqZ * 6 * z)) ** 8 *
        0.06;

    // Combine them and scale
         heightY = amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1300 ) 


    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY;
}



function undulationMap_old(x, z, freqX, freqZ, amplitude) {
    let baseWave =
        (Math.sin(freqX * x * 1.1)) *
        (Math.sin(freqZ * z * x / 1000)) *
        2;

    let octave1 =
        (Math.sin(freqX * 2 * x)) ** 2 *
        (Math.cos(freqZ * 2 * z)) ** 2 *
        1;

    let octave2 =
        (Math.sin(freqX * 5 * x)) ** 4 *
        (Math.sin(freqZ * 5 * z)) ** 6 *
        0.3;

    let octave3 =
        (Math.sin(freqX * 8 * x)) ** 8 *
        (Math.sin(freqZ * 8 * z)) ** 8 *
        0.06;

    // Combine them and scale
    let heightY = amplitude * ((baseWave + octave1 + octave2 + octave3) / 4) * (x / 1000);

    // Flatten near origin if desired
    if (Math.abs(x) < 100 && Math.abs(z) < 300) {
        heightY = 0;
    }
    return heightY;
}
