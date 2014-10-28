/* global console:true */
/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

var seqJS = seqJS || {};

(function(){

/*
 * Data from SantaLucia 1996
 */
var DH = 0, DS = 1, //DG = 2,
    PAIRS = {
AA: [-8.4 , -23.6, -1.02],
AT: [-6.5 , -18.8, -0.73],
AG: [-6.1 , -16.1, -1.16],
AC: [-8.6 , -23.0, -1.43],
CA: [-7.4 , -19.3, -1.38],
CT: [-6.1 , -16.1, -1.16],
CG: [-10.1, -25.5, -2.09],
CC: [-6.7 , -15.6, -1.77],
TT: [-8.4 , -23.6, -1.02],
TA: [-6.3 , -18.5, -0.60],
TC: [-7.7 , -20.3, -1.46],
TG: [-7.4 , -19.3, -1.38],
GT: [-8.6 , -23.0, -1.43],
GA: [-7.7 , -20.3, -1.46],
GC: [-11.1, -28.4, -2.28],
GG: [-6.7 , -15.6, -1.77],
    },
    ALL_PAIRS = ['AA','AT','AG','AC','TA','TT','TG','TC','GA','GT','GG','GC',
    'CA','CT','CG','CC'],
    INIT = {
        G: [0, -5.9, +1.82],
        C: [0, -5.9, +1.82],
        A: [0, -9.0, +2.8],
        T: [0, -9.0, +2.8]
    },
    SYM = [0, -1.4, +0.4],
    TA_pen = [+0.4, 0, +0.4];
    
var count_pairs = function(s){
    var r = {};
    ALL_PAIRS.forEach(function(p){r[p] = 0;});

    var prev = null;
    s.split('').forEach(function(b){
        if(prev!==null){
        console.log('r[\''+prev+b+'\'] += 1');
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


/**
 * Compute the melting temperature of the given sequence
 * @param{String|seqJS.Seq} seq The sequence to be melted
 * @returns {float} the predicted melting temperature
 */
seqJS.melt = function(seq){
    //convert to a Seq
    if(!(seq.seq instanceof Function)){
        seq = new seqJS.Seq(seq, 'DNA');
    }
    console.log('\tmelt('+seq+')');

    var dH = 0.0, dS = 0.0,
        c = count_pairs(seq.seq()),
        Ct = 0.0001;

    console.log('count_pairs: ');

    ALL_PAIRS.forEach(function(p){
        console.log('  '+p+': ' + c[p]);
        dH = dH + c[p] * PAIRS[p][DH];
        dS = dS + c[p] * PAIRS[p][DS];
    });

    if(seq.seq() === seq.reverseComplement().seq()){
        dS = dS + SYM[DS];
    }
    else{
        Ct = Ct / 4.0;
    }

    console.log('dH , dS: '+dH+', '+dS);

    var ta = count_end_ta(seq.seq());
    dH = dH + INIT[seq.seq()[0]][DH] + ta * TA_pen[DH];
    dS = dS + INIT[seq.seq()[0]][DS] + ta * TA_pen[DS];
    console.log('dH , dS: '+dH+', '+dS);

    return 1000.0 * dH / (dS + 1.987 * Math.log(Ct)) - 273.15;
};

}());
