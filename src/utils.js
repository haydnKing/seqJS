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
 * @param {Number} [default=0] The value to initialise all elements to
 * @class
 */
seqJS.utils.rarray = function(N, M, default){
    default = default || 0;

    var data = new Array(N*M);
    for(var i =0; i < N*M; i++){
        data[i] = default;
    }

    /** Returns the value of the ith row, jth column 
     * @function
     * @param {integer} i
     * @param {integer} j
     * @returns {Number}
     */
    this.get = function(i,j){
        return data[N*i+j];
    }

    /** Set the value of the ith row, jth column
     * @function
     * @param {integer} i
     * @param {integer} j
     * @param {Number} value The value to set
     */
    this.set = function(i,j,value){
        data[N*i+j] = value;
    }
    
};


}());
