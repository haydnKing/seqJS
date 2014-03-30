/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

var seqJS = seqJS || {};

(function(){

    var pad_l = function(str, val){
        if(str.length > val){
            return str.substring(0,val);
        }
        return spaces(val - str.length) + str;
    };
    var spaces = function(val){
        var r = '';
        for(var i = 0; i < val; i++){
            r += ' ';
        }
        return r;
    };

    var writers = {};

    var gb_write = function(record){
        var i;

        var get_date = function(){
            var d = new Date();
            return d.getDate().toString() + '-' + [
                'JAN',
                'FEB',
                'MAR',
                'APR',
                'MAY',
                'JUN',
                'JUL',
                'AUG',
                'SEP',
                'OCT',
                'NOV',
                'DEC'][d.getMonth()] + '-' + d.getFullYear().toString();
        };

        var get_locus = function(record){
            var r = "LOCUS       ",
                ra = record.annotations,
                name = record.name,
                len = record.length().toString();
            if((name.length + len.length) >= 28){
                name = name.substr(0, 27 - len.length);
            }
            r += name;
            for(i=0; i < 28 - (name.length+len.length); i++){
                r += ' ';
            }
            r += len;

            r += ' ' + record.seq.unit() + ' ';

            r += pad_l(ra.residue_type || '', 6);

            r += pad_l( (ra.topology === 'circular') ? 'circular' : '', 13);

            r += ' ' + (ra.data_division || 'SYN');

            r += ' ' + (ra.date || get_date()); 
            

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

