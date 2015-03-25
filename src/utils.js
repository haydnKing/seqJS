/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

var seqJS = seqJS || {};

/**
 * @namespace seqJS.utils
 */
seqJS.utils = {};

(function(){

/**
 * A NxM number array
 * @param {integer} N
 * @param {integer} M
 * @param {Number} [def=0] The value to initialise all elements to
 * @class
 */
seqJS.utils.rarray = function(M, N, def){
    def = def || 0;

    var data = new Array(M*N);
    for(var i =0; i < M*N; i++){
        data[i] = def;
    }

    /** Returns the value of the ith row, jth column 
     * @function
     * @param {integer} i
     * @param {integer} j
     * @returns {Number}
     */
    this.get = function(i,j){
        if(i<0 || i>=M || j<0 || j>=N){
            throw('('+i+','+j+') is out of rarray bounds ('+N+','+M+')');
        }
        return data[N*i+j];
    };

    /** Set the value of the ith row, jth column
     * @function
     * @param {integer} i
     * @param {integer} j
     * @param {Number} value The value to set
     */
    this.set = function(i,j,value){
       /* if(i<0 || i>=M || j<0 || j>=N){
            throw('('+i+','+j+') is out of rarray bounds ('+N+','+M+') while setting to '+value);
        }*/
        data[N*i+j] = value;
    };

    /** Return the size of the array
     * @function
     * @returns {Object} ret
     * @returns {integer} ret.M The number of rows
     * @returns {integer} ret.N the number of columns
     */
    this.size = function(){
        return {'N':N, 'M':M};
    };

    /** Return a copy of the underlying array
     * @function
     * @returns {Array[]}
     */
    this.toArray = function(){
        return data.slice();
    };

    /** Return a string representation of the array
     * @function
     * @returns {String}
     */
    this.toString = function(){
        var ret = ['rArray('];
        for(var i=0; i<M; i++){
            ret.push(data.slice(i*N, (i+1)*N).join(', '));
        }
        ret.push(')');
        return ret.join('\n');
    };

    
};


}());
