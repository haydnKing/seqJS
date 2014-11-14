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
 * @namespace seqJS.ss
 */
seqJS.ss = {};

(function(){
/**
 * Estimate the secondary structure for a given sequence
 * @param {seqJS.Seq} seq The sequence to be melted
 * @returns {String} the predicted secondary structure in dot-bracket notation
 */
seqJS.ss.predict = function(seq){
    var a = malloc(seq);
    console.log('\nINIT:');
    draw(a,seq.length());
    fill(a,seq);
    console.log('FILL:');
    draw(a,seq.length());

    return "NOT_IMPLEMENTED";
};

var malloc = function(seq){
    //We could save some memory here, but at the expense of some processor time
    var l = seq.length(),
        a = new Array(l*l),
        i,j;
    //Fill upper right triangle
    for(i=0;i<l;i++){
        for(j=Math.max(i-1,0);j<l;j++){
            a[i*l+j] = {v: 0, p:-1};
        }
    }

     
    return a;
};

var draw = function(a, l){
    var i=0,j=0,line,v;
    for(;i<l;i++){
        line = [];
        for(j=0;j<l;j++){
            v = a[i*l + j];
            line.push(v===undefined ? ' ' : v.v);
        }
        console.log(line.join(' '));
    }
};

var pair = {
    A: 'T',
    T: 'A',
    G: 'C',
    C: 'G',
};

var fill = function(a, seq){
    var l = seq.length(),
        s = seq.seq(),
        i,j;
    for(i=1; i < l; i++){
        for(j=i; j < (l-i)*l; j+=l+1){
            a[j].v = Math.max(a[j-1].v,
                         a[j+l].v,
                         a[j+l-1].v+(s[j%l]===pair[s[Math.floor(j/l)]] ? 1 : 0));
        }
    }
};

}());
