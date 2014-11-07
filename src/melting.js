/* global console:true */
/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

var seqJS = seqJS || {};

/**
 * @namespace seqJS.Melt
 */
seqJS.Melt = {};

(function(){

/*
 * Data from SantaLucia 1996
 */
var DH = 0, DS = 1, //DG = 2,
    ALL_PAIRS = ['AA','AT','AG','AC','TA','TT','TG','TC','GA','GT','GG','GC',
    'CA','CT','CG','CC'],
    default_data = 'Allawi1997',
    data = {
        SantaLucia1996: {
            pairs: {
                AA: [-8.4 , -23.6, -1.02],
                AC: [-8.6 , -23.0, -1.43],
                AG: [-6.1 , -16.1, -1.16],
                AT: [-6.5 , -18.8, -0.73],

                CA: [-7.4 , -19.3, -1.38],
                CC: [-6.7 , -15.6, -1.77],
                CG: [-10.1, -25.5, -2.09],
                CT: [-6.1 , -16.1, -1.16],

                GA: [-7.7 , -20.3, -1.46],
                GC: [-11.1, -28.4, -2.28],
                GG: [-6.7 , -15.6, -1.77],
                GT: [-8.6 , -23.0, -1.43],

                TA: [-6.3 , -18.5, -0.60],
                TC: [-7.7 , -20.3, -1.46],
                TG: [-7.4 , -19.3, -1.38],
                TT: [-8.4 , -23.6, -1.02],
            },
            init: {
                G: [0, -5.9, +1.82],
                C: [0, -5.9, +1.82],
                A: [0, -9.0, +2.8],
                T: [0, -9.0, +2.8]
            },
            sym: [0, -1.4, +0.4],
            TA_pen: [+0.4, 0, +0.4]
        },
        Allawi1997: {
            pairs: {
                AA: [-7.9 , -22.2, -1.00], 
                AC: [-8.4 , -22.4, -1.44], 
                AG: [-7.8 , -21.0, -1.28], 
                AT: [-7.2 , -20.4, -0.88], 

                CA: [-8.5 , -22.7, -1.45], 
                CC: [-8.0 , -19.9, -1.84],
                CG: [-10.6, -27.2, -2.17], 
                CT: [-7.8 , -21.0, -1.28], 

                GT: [-8.4 , -22.4, -1.44], 
                GA: [-8.2 , -22.2, -1.30], 
                GC: [-9.8 , -24.4, -2.24], 
                GG: [-8.0 , -19.9, -1.84],

                TA: [-7.2 , -21.3, -0.58], 
                TC: [-8.2 , -22.2, -1.30], 
                TG: [-8.5 , -22.7, -1.45], 
                TT: [-7.9 , -22.2, -1.00], 
            },
            init: {
                C: [0.1, -2.8, 0.98], 
                G: [0.1, -2.8, 0.98], 
                T: [2.3, 4.1 , 1.03],
                A: [2.3, 4.1 , 1.03],
            },
            sym: [0, -1.4, +0.4],
        },
        oligocalc: {
            pairs: {
                 AA : [-8.0 , -21.9],
                 AT : [-5.6 , -15.2],
                 AG : [-6.6 , -16.4],
                 AC : [-9.4 , -25.5],
                 TA : [-6.6 , -18.4],
                 TT : [-8.0 , -21.9],
                 TC : [-8.8 , -23.5],
                 TG : [-8.2 , -21.0],
                 CA : [-8.2 , -21.0],
                 CT : [-6.6 , -16.4],
                 CG : [-11.8, -29.0],
                 CC : [-10.9, -28.4],
                 GT : [-9.4 , -25.5],
                 GA : [-8.8 , -23.5],
                 GC : [-10.5, -26.4],
                 GG : [-10.9, -28.4],
            },
            init: {
                G: [0, 0, 0],
                C: [0, 0, 0],
                A: [0, 0, 0],
                T: [0, 0, 0]
            },
            sym: [0, 0, 0],
            TA_pen: [0, 0, 0],
            dH_adjust: 3.4
        }
    };

var r_default = {
    Na: 1000.0,
    K: 0.0,
    Tris: 0.0,
    Mg: 0.0,
    dNTP: 0.0,
    Oligo: 0.5,
},
r_units = {
    Na: 'mM',
    K: 'mM',
    Tris: 'mM',
    Mg: 'mM',
    dNTP: 'mM',
    Oligo: 'uM',
},
r_presets = {
    Phusion: {
        Na: 50.0,
        K: 0.0,
        Tris: 0.0,
        Mg: 1.5,
        dNTP: 0.2,
        Oligo: 0.5,
    },
    Q5: {
        Na: 50.0,
        K: 0.0,
        Tris: 0.0,
        Mg: 2.0,
        dNTP: 0.2,
        Oligo: 0.5,
    },
};



var count_pairs = function(s){
    var r = {};
    ALL_PAIRS.forEach(function(p){r[p] = 0;});

    var prev = null;
    s.split('').forEach(function(b){
        if(prev!==null){
            r[prev+b] += 1;
        }
        prev = b;
    });

    return r;
};

var count_end_ta = function(s){
    var r = 0;
    for(var i=s.length-1; i>=0; i = i-1){
        if(s[i]==='T'){
            r+=1;
        }
        else{
            return r;
        }
    }
    return r;
};

var allawi97_init = function(seq){
    var s = seq.seq(),
        d = data['Allawi1997'].init,
        l = s.length;

    var R = [d[s[l-1]][DH] + d[s[l-2]][DH], d[s[l-1]][DH] + d[s[l-2]][DH]];
    var L = [d[s[0]][DH] + d[s[1]][DH], d[s[0]][DH] + d[s[1]][DH]];

    return (R[0]/R[1] < L[0]/L[1]) ? R : L;
};


/**
 * Compute the melting temperature of the given sequence
 * @param {String|seqJS.Seq} seq The sequence to be melted
 * @param {String} [dataset] the name of the dataset to use
 * @returns {float} the predicted melting temperature
 */
seqJS.Melt.melt = function(seq, dataset){
    dataset = (dataset===undefined ? default_data : dataset);
    var thermo = data[dataset];
    //convert to a Seq
    if(!(seq.seq instanceof Function)){
        seq = new seqJS.Seq(seq, 'DNA');
    }
    console.log('\nmelt('+seq+')');

    var dH = 0.0, dS = 0.0,
        c = count_pairs(seq.seq()),
        Ct = 0.0001;


    ALL_PAIRS.forEach(function(p){
        dH = dH + c[p] * thermo.pairs[p][DH];
        dS = dS + c[p] * thermo.pairs[p][DS];
    });

    if(seq.seq() === seq.reverseComplement().seq()){
        dS = dS + thermo.sym[DS];
    }


    if(dataset === 'Allawi1997'){
        var i = allawi97_init(seq);
        dH = dH + i[DH];
        dS = dS + i[DS];
    }
    else{
        var ta = count_end_ta(seq.seq());
        dH = dH + thermo.init[seq.seq()[0]][DH] + ta * thermo.TA_pen[DH];
        dS = dS + thermo.init[seq.seq()[0]][DS] + ta * thermo.TA_pen[DS];
    }

    console.log('\tdH , dS: '+dH+', '+dS);
    console.log('\tRlnK: ' + 1.987*Math.log(Ct));

    dH = dH + (thermo.hasOwnProperty('dH_adjust') ? thermo.dH_adjust : 0.0);
    return 1000.0 * dH / (dS + 1.987 * Math.log(Ct)) - 273.15;
};

/**
 * Return a list of supported datasets
 * @returns {String[]} available datasets
 */
seqJS.Melt.getDatasets = function(){
    return Object.getOwnPropertyNames(data);
};

/**
 * Returns the name of the default dataset
 * @returns {String} the name of the dataset
 */
seqJS.Melt.getDefaultDataset = function(){
    return default_data;
};

/**
 * Return a list of reaction parameters
 * @returns {String[]} reaction parameters
 */
seqJS.Melt.getReactionParameterNames = function(){
    return Object.getOwnPropertyNames(r_default);
};

/**
 * Return the units for the given parameter
 * @param {String} param The name of the reaction param
 * @returns {String} The units that param should be expressed in 
 */
seqJS.Melt.getReactionParameterUnits = function(param){
    return r_units[param];
};

/**
 * Return a list of reaction presets
 * @returns {String[]} reaction preset parametrs
 */
seqJS.Melt.getReactionPresets = function(){
    return Object.getOwnPropertyNames(r_presets);
};

/**
 * Return a dictionary containing the reaction parameters. If settings is a
 * string, return parameters from the preset values, otherwise make sure that
 * the object contains all required values (filling from the default if not)
 * and return it
 * @param {String|Object} [settings] The settings to use. Returns default
 * settings if left blank
 * @returns {Object} reaction parameters
 */
seqJS.Melt.getReactionParameters = function(s){
    s = (s===undefined ? {} : s);

    if(typeof s === 'string' || s instanceof String){
        if(Object.getOwnPropertyNames(r_presets).indexOf(s) < 0){
            throw('Unknown reaction preset \''+s+'\'');
        }
        return r_presets[s];
    }
    var r = {};
    
    seqJS.Melt.getReactionParameterNames().forEach(function(v){
        if(!s.hasOwnProperty(v)){
            r[v] = r_default[v];
        }
        else {
            r[v] = s[v];
        }
    });

    return r;
};


}());