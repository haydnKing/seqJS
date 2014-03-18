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
     * Parser object:
     *  A generic parser which wraps the more specific parsers, such as
     *  GenBankParser or FastaParser.
     */
    var Parser = function(type){
        var remaining_data = [], record_cb, self=this;

        this.type = function() {return type;};
        this.parse = function(data){
            var lines = remaining_data.concat(data.split('\n'));
            var consumed = self._parse_lines(lines);
            remaining_data = lines.slice(consumed);
        };

        this._parse_lines = function(lines) {
            self._triggerRecordCb(lines);
            return lines.length;
        };
        
        this.setRecordCb = function(cb) {
            record_cb = cb;
        };

        this._triggerRecordCb = function(record) {
            if(typeof(record_cb) === 'function') {
                record_cb(record);
            }
        };
    };



    var parsers = {};
    /*
     * Genbank Parser
     *  Parse a GenBank file
     */

    var GenBankParser = function() {

        this.type = function() {return 'gb';};

    };
    GenBankParser.prototype = new Parser();
    parsers['gb'] = parsers['genbank'] = GenBankParser;
    

    /*
     * getParser(type) - return a parser object
     *      type: 'gb' or 'fasta'
     */
    seqJS.getParser =  function(type){
        if(Object.keys(parsers).indexOf(type) > -1){
            return new parsers[type]();
        }
        else {
            throw "Unknown parser type \'"+type+"\'. Known types are " + 
                Object.keys(parsers).join(', ') + '.';
        }
    };

}());

