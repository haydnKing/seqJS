/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

seqJS = seqJS || {};

(function($){

    /*
     * Parser object
     */
    var Parser = function(type){
        var type = type;

        this.parse = function(data){
            return {};
        };
    }

    /*
     * getParser(type) - return a parser object
     *      type: 'gb' or 'fasta'
     */
    seqJS.getParser =  function(type){
        return new Parser(type);
    };

}(jQuery));
