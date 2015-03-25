/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

var seqJS = seqJS || {};

/**
 * @namespace seqJS.align
 */
seqJS.align = {};

(function(){

/**
 * A simple cost function - 0 if x = y, 1 otherwise
 * @param {string} x
 * @param {string} y
 * @returns {integer} cost
 */
seqJS.align.simple_cost = function(x,y){
    return (x.charAt(0) === y.charAt(0)) ? 0 : 1;
};

/**
 * Calculate the local alignment of Y to X
 * using the SS-2 algorithm from Altschul and Erickson (1986)
 * @param {seqJS.Record|seqJS.Seq|string} X The sequence to align to
 * @param {seqJS.Record|seqJS.Seq|string} Y The sequence to align
 * @param {string} cost_function The cost function
 * @param {Object} gap_penulty Cost of a gap, equal to v + k*u, where k is the length of the gap
 * @param {integer} gap_penulty.v The cost of opening a gap
 * @param {integer} gap_penulty.u The cost on increasing the size of an open gap
 */
seqJS.align.SS2 = function(X, Y, cost_fn, gap_penulty){
    //convert X and Y to strings
    
    //assert(X is the longest)


    //allocate memory
    var N = X.length,
        M = Y.length,
        P = new seqJS.utils.rarray(N+1,M+1),
        Q = new seqJS.utils.rarray(N+1,M+1),
        R = new seqJS.utils.rarray(N+1,M+1),
        a = new seqJS.utils.rarray(N+2,M+2),
        b = new seqJS.utils.rarray(N+2,M+2),
        c = new seqJS.utils.rarray(N+2,M+2),
        d = new seqJS.utils.rarray(N+2,M+2),
        e = new seqJS.utils.rarray(N+2,M+2),
        f = new seqJS.utils.rarray(N+2,M+2),
        g = new seqJS.utils.rarray(N+2,M+2),
        v = gap_penulty.v,
        u = gap_penulty.v,
        i,j;

    //Step 1
    for(j=0;j<N+1;j++){
        P.set(0, j, Infinity);
        R.set(0, j, v+j*u);
    }
    for(i=0;i<M+1;i++){
        Q.set(i, 0, Infinity);
        R.set(i, 0, v+i*u);
    }
    R.set(0,0,0);
    c.set(M+1,N+1, 1);

    //Cost Assignment
    for(i=0;i<M+1;i++){
        for(j=0;j<N+1;j++){

            //Step 2
            P.set(i,j, u + Math.min(P.get(i-1,j), R.get(i-1,j) + v));
            //Step 3
            if(P.get(i,j) === P.get(i-1,j) + u){
                d.set(i-1,j,1);
            }
            if(P.get(i,j) === R.get(i-1,j) + v){
                e.set(i-1,j,1);
            }
            //step 4
            Q.set(i, j, u + Math.min(Q.get(i,j-1), R.get(i,j-1) + v));
            //step 5
            if(Q.get(i,j) === Q.get(i,j-i)+u){
                f.set(i,j-i,1);
            }
            if(Q.get(i,j) === R.get(i,j-1) + v + u){
                g.set(i,j-1,1);
            }
            //step 6
            R.set(i,j, Math.min(P.get(i,j), 
                                Q.get(i,j), 
                                R.get(i-1,j-1) + cost_fn(X.charAt(i), 
                                                         Y.charAt(j))));
            //step 7
            if(R.get(i,j) === P.get(i,j)){
                a.set(i,j,1);
            }
            if(R.get(i,j) === Q.get(i,j)){
                b.set(i,j,1);
            }
            if(R.get(i,j) === R.get(i-1,j-1) + cost_fn(X.charAt(i),Y.charAt(j))){
                c.set(i,j,1);
            }
        }
    }

    //Edge Assignment
    for(i=M; i >= 0; i--){
        for(j=N; j >= 0; j--){

            //step 8
            if((a.get(i+1,j)===0 || e.get(i,j)===0) &&
               (b.get(i,j+1)===0 || g.get(i,j)===0) &&
               (c.get(i+1,j+1)===0)){
                a.set(i,j,0);
                b.set(i,j,0);
                c.set(i,j,0);
            }
            //step 9
            if((a.get(i+1,j) !== 0) ||
               (b.get(i,j+1) !== 0) ||
               (c.get(i+1,j+1) !== 0)){
                //step 10
                if(a.get(i+1,j)===0 || d.get(i,j)===0){
                    d.set(i+1,j, 1-e.get(i,j));
                    e.set(i,  j, 1-a.get(i,j));
                    a.set(i,j,1);
                }
                else{
                    d.set(i+1,j,0);
                    e.set(i,j,0);
                }
                //step 11
                if(b.get(i,j+1)===1 && f.get(i,j)===1){
                    f.set(i,j+1, 1-g.get(i,j));
                    g.set(i,j, 1-b.get(i,j));
                    b.set(i,j,1);
                }
                else{
                    f.set(i,j+1,0);
                    g.set(i,j,0);
                }
            }
        }
    }


    //return everything, for now
    return {
        'P':P,
        'Q':Q,
        'R':R,
        'a':a,
        'b':b,
        'c':c,
        'd':d,
        'e':e,
        'f':f,
        'g':g,
    };


};


}());
