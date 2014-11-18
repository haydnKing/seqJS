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

    return traceback(a,seq);
};

var malloc = function(seq){
    //We could save some memory here, but at the expense of some processor time
    var N = seq.length(),
        a = new Array(N*N),
        i,j;
    //Fill upper right triangle
    for(i=0;i<N;i++){
        for(j=Math.max(i-1,0);j<N;j++){
            a[i*N+j] = {v: 0, p:-1};
        }
    }

     
    return a;
};

var draw = function(a, N){
    var i=0,j=0,line,v;
    for(;i<N;i++){
        line = [];
        for(j=0;j<N;j++){
            v = a[i*N + j];
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
    var N = seq.length(),
        s = seq.seq(),
        mv,mp,m,
        i,j,k,o;
    for(o=1;o<N;o++){
        for(i=0;i<N-o;i++){
            for(j=i+o;j<N;j++){
                mp = [(i+1)*N+j, i*N+j-1];
                mv = [a[mp[0]].v, a[mp[1]].v];
                if(pair[s[i]] === s[j]){
                    mp.push((i+1)*N+j-1);
                    mv.push(a[(i+1)*N+j-1].v+1);
                }
                for(k=i+1;k<j;k++){
                    mp.push([i*N+k, (k+1)*N+j]);
                    mv.push(a[i*N+k].v+a[(k+1)*N+j].v);
                }
                m = Math.max.apply(null,mv);
                a[i*N+j].p = mp[mv.indexOf(m)];
                a[i*N+j].v = m;
            }
        }
    }
};

var traceback = function(/*a, seq*/){
    //var N = seq.length();

    return "NOT_IMPLEMENTED";
};

}());
