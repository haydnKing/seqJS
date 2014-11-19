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
    fill(a,seq);
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
            a[i*N+j] = {v: 0, i:-1,j:-1};
        }
    }

     
    return a;
};
/*
var draw = function(a, seq){
    var N = seq.length();
    var i=0,j=0,line,v;
    console.log('  ' + seq.seq().split('').join(' '));
    for(;i<N;i++){
        line = [seq.seq()[i]];
        for(j=0;j<N;j++){
            v = a[i*N + j];
            line.push(v===undefined ? ' ' : v.v);
        }
        console.log(line.join(' '));
    }
};

var draw_trace = function(a, seq){
    var i,j,line,v,
        N = seq.length();
    console.log('  ' + seq.seq().split('').join(' '));
    for(i=0;i<N;i++){
        line = [seq.seq()[i]];
        for(j=0;j<N;j++){
            v = a[i*N + j];
            if(v===undefined) {
                line.push(' ');
                continue;
            }
            if((v.i.constructor === Array) && (v.j.constructor === Array)){
                line.push('@');
                continue;
            }
            if(v.i<0 || v.j < 0){
                line.push('*');
                continue;
            }
            var di = i-v.i,
                dj = j-v.j;
            if(di===-1 && dj === 1){
                line.push('/');
            } else if(di===-1 && dj === 0){
                line.push('|');
            } else if(di===0 && dj === 1){
                line.push('-');
            } else {
                line.push('?');
            }
        }
        console.log(line.join(' '));
    }
};
*/
var pair = {
    A: 'T',
    T: 'A',
    G: 'C',
    C: 'G',
};

var fill = function(a, seq){
    var N = seq.length(),
        s = seq.seq(),
        mv,mi,mj,
        i,j,k,o,
        u = function(i,j,v){
            if(v > mv){
                mv = v;
                mi = i;
                mj = j;
            }
        };
    for(o=1;o<N;o++){
        for(i=0;i<N-o;i++){
            for(j=i+o;j<N;j++){
                mv = -1;
                mi = -1;
                mj = -1;
                //case 1
                if(pair[s[i]] === s[j]){
                    u(i+1,j-1,a[(i+1)*N+j-1].v+1);
                }
                //case 2
                u(i+1, j,   a[(i+1)*N+j].v);
                //case 3
                u(i,   j-1, a[i*N+j-1].v);
                //case 4
                for(k=i+1;k<j;k++){
                    u([i,k+1],[k,j], a[i*N+k].v+a[(k+1)*N+j].v);
                }
                a[i*N+j].i = mi;
                a[i*N+j].j = mj;
                a[i*N+j].v = mv;
            }
        }
    }
};

var traceback = function(a, seq){
    var N = seq.length();
    var text = function(i,j){
        var b = a[i*N+j];
        if(b.i.constructor === Array){
            return text(b.i[0],b.j[0]) + text(b.i[1],b.j[1]);
        }
        var di= i-b.i, dj= j-b.j;
        if(b.i < 0 || b.j < 0){
            return (i===j) ? '.' : '';
        }
        if(di===-1 && dj === 1){
            return '(' + text(b.i,b.j) + ')';
        } else if(di === 0 && dj === 1){
            return text(b.i,b.j) + '.';
        } else if(di === -1 && dj === 0){
            return '.' + text(b.i,b.j);
        }
        throw('Traceback Error');
    };

    return text(0,N-1);
};

}());
