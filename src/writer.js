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
     * Writer object:
     *  A generic writer which wraps the more specific writers, such as
     *  GenBankWriter or FastaWriter.
     */
    var Writer = function(type){

        this.type = function() {return type;};

        this.write = function(/*record*/){
            //Implemented by subclass
            return '';
        };
    };

    var writers = {};
    /*
     * Genbank Parser
     *  Parse a GenBank file
     */

    var GenBankWriter = function() {
        Writer.call(this);
    };
    GenBankWriter.prototype = new Writer();
    writers['gb'] = writers['genbank'] = GenBankWriter;
    

    /*
     * getWriter(type) - return a writer object
     *      type: 'gb' or 'fasta'
     */
    seqJS.getWriter =  function(type){
        if(Object.keys(writers).indexOf(type) > -1){
            return new writers[type]();
        }
        else {
            throw "Unknown parser type \'"+type+"\'. Known types are " + 
                Object.keys(writers).join(', ') + '.';
        }
    };

}());

