/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

var seqJS = seqJS || {};

(function(){

    var writers = {};

    var gb_write = function(record){
        var i;


        var get_locus = function(record){
            var r = "LOCUS       ",
                name = record.name,
                len = record.length().toString();
            if((name.length + len.length) >= 28){
                name = name.substr(0, 27 - len.length);
            }
            r += name;
            for(i=0; i < 28 - (name.length+len.length);i++){
                r += ' ';
            }
            r += len;

            return r;
        };


        return get_locus(record);
    };

    writers['gb'] = gb_write;
    writers['genbank'] = gb_write;

    /*
     * seqJS.write(record, type) - write the record to a string and return the
     *  string
     *      type: 'gb' or 'fasta'
     */
    seqJS.write = function(record, type){
        if(Object.keys(writers).indexOf(type) > -1){
            return writers[type](record);
        }
        else {
            throw "Unknown format \'"+type+"\'. Known formats are " + 
                Object.keys(writers).join(', ') + '.';
        }
    };

}());

