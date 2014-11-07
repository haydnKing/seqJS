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
            TA_pen: [0, 0, 0],
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
    return s.match(/T*$/)[0].length;
};

var get_init = function(s,e,thermo){
    var r = [0.0,0.0];
    r[DH] = thermo.init[s][DH] + thermo.init[e][DH];
    r[DS] = thermo.init[s][DS] + thermo.init[e][DS];
    return r;
};

/**
 * Compute the melting temperature of the given sequence
 * @param {String|seqJS.Seq} seq The sequence to be melted
 * @param {String|object} settings The settings for the reaction
 * @param {String} [dataset] the name of the dataset to use
 * @returns {float} the predicted melting temperature
 */
seqJS.Melt.melt = function(seq, settings, dataset){
    settings = seqJS.Melt.getReactionParameters(settings);
    dataset = (dataset===undefined ? default_data : dataset);
    var thermo = data[dataset];
    //convert to a Seq
    if(!(seq.seq instanceof Function)){
        seq = new seqJS.Seq(seq, 'DNA');
    }
    console.log('\nmelt('+seq+')');

    var dH = 0.0, dS = 0.0,
        c = count_pairs(seq.seq()),
        Ct = settings.Oligo * Math.pow(10,-6);


    ALL_PAIRS.forEach(function(p){
        dH = dH + c[p] * thermo.pairs[p][DH];
        dS = dS + c[p] * thermo.pairs[p][DS];
    });

    if(seq.seq() === seq.reverseComplement().seq()){
        dS = dS + thermo.sym[DS];
    }


    var ta = count_end_ta(seq.seq());
    var init = get_init(seq.seq()[0], seq.seq()[seq.length()-1], thermo);
    dH = dH + init[DH] + ta * thermo.TA_pen[DH];
    dS = dS + init[DS] + ta * thermo.TA_pen[DS];

    console.log('\tdH , dS: '+dH+', '+dS);
    console.log('\tRlnK: ' + 1.987*Math.log(Ct));

    dH = dH + (thermo.hasOwnProperty('dH_adjust') ? thermo.dH_adjust : 0.0);
    var Tm = 1000.0 * dH / (dS + 1.987 * Math.log(Ct));
    return seqJS.Melt.getSaltCorrection(settings, seq, Tm) - 273.15;
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

/**
 * Get the salt correction for the reaction settings, according to 
 * "Predicting Stability of DNA Duplexes in Solutions Containing Magnesium and
 * Monovalent Cations", R. Owczarzy, 2008. DOI: 10.1021/bi702363u
 * @param {String|Object} settings The reaction parameters to use
 * @param {seqJS.Seq} seq the sequence
 * @returns {Float} the number of degrees to adjust the melting temparature by
 */
seqJS.Melt.getSaltCorrection = function(s, seq, Tm){
    console.log('getSaltCorrection');
    s = seqJS.Melt.getReactionParameters(s);
    var fGC = seq.seq().match(/[GC]/g).length / seq.length(),
        Mon = (s.K + 0.5 * s.Tris + s.Na) * Math.pow(10,-3),
        Mg = (s.Mg * Math.pow(10,-3) - s.dNTP * Math.pow(10,-6)),
        R;

    if(Mon === 0){
        console.log('Mon === 0');
        return eq16_fixed(Mon, Mg,fGC,seq.length(),Tm);
    }
    R = Math.pow(Mg, 0.5) / Mon;
    console.log('R = Math.pow('+Mg+', 0.5) / '+Mon+' = '+R);
    if(R < 0.22){
        console.log('R ('+R+') < 0.22');
        return eq4(Mon, Mg, fGC, Tm);
    } else if(R < 6.0){
        console.log('R ('+R+') < 6');
        return eq16_var(Mon, Mg, fGC, seq.length(), Tm);
    }
    console.log('R ('+R+') >= 6');

    return eq16_fixed(Mon, Mg, fGC, seq.length(), Tm);
};

//Equation numbers below refer to equations in Owczarzy2008
var T2 = {
    a:  3.92 * Math.pow(10, -5),
    b: -9.11 * Math.pow(10, -6), 
    c:  6.26 * Math.pow(10, -5), 
    d:  1.42 * Math.pow(10, -5), 
    e: -4.82 * Math.pow(10, -4), 
    f:  5.25 * Math.pow(10, -4), 
    g:  8.31 * Math.pow(10, -5),
};

var eq16_fixed = function(Mon, Mg,fGC,N,Tm,p){
    p = (p===undefined ? T2 : p);
    var lMg = Math.log(Mg);
    var TmI = (1.0/Tm) + p.a + p.b * lMg + fGC * (p.c+p.d*lMg) + 
        (0.5/(N-1)) * ( (p.e+p.f*lMg) + p.g*lMg*lMg);

    return 1.0 / TmI;
};

var eq16_var = function(Mon, Mg,fGC,N,Tm){
    var lMon = Math.log(Mon),
        m5 = Math.pow(10,-5),
        m3 = Math.pow(10,-3),
        p = {
        a: 3.92*m5*(0.843-0.352*Math.sqrt(Mon)*lMon),
        b: T2.b, 
        c: T2.c, 
        d: 1.42*m5*(1.279-4.03*m3*lMon-8.03*m3*lMon*lMon), 
        e: T2.e, 
        f: T2.f, 
        g: 8.31*m5*(0.486-0.258*lMon+5.25*m3*lMon*lMon*lMon),
    };
    return eq16_fixed(Mon, Mg, fGC, N, Tm, p);
};

var eq4 = function(Mon, Mg,fGC,Tm){
    var lMon = Math.log(Mon);
    var TmI = (1.0/Tm) + (4.29*fGC-3.95)*Math.pow(10,-5)*lMon + 
        9.4*Math.pow(10,-6)*lMon*lMon;
    return 1.0 / TmI;
};


}());
