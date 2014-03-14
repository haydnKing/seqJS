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
     * record object
     */
    seqJS.Record = function(seq, id, name, desc, features, annotations){
        if(! seq instanceof seqJS.Seq){
            throw("seq must be a seqJS.Seq instance");
        }
        this.seq = seq;
        this.id = id || 0;
        this.name = name || "unnamed";
        this.desc = desc || "";
        this.features = features || [];
        this.annotations = annotations || {};

    };

    /*
     * Seq object
     */
    seqJS.ALPH_DNA = 1;
    seqJS.ALPH_RNA = 2;
    seqJS.ALPH_PROT = 3;
    seqJS.Seq = function(_seq, _alphabet){
        _seq = _seq.toUpper();
        if([seqJS.ALPH_DNA, seqJS.ALPH_RNA, seqJS.ALPH_PROT].indexOf(_alphabet) < 0){
            throw "Invalid Alphabet";
        }
        this.seq = function() {return _seq;};
        this.length = function() {return _seq.length();};
        this.alphabet = function() {return _alphabet;};
    };

    /*
     * Locations
     */
    seqJS.LOC_BEFORE = 1;
    seqJS.LOC_EXACT = 2;
    seqJS.LOC_AFTER = 3;
    seqJS.Location = function(_location, _operator) {
        _operator = _operator || seqJS.LOC_EXACT;
        if([seqJS.LOC_BEFORE, seqJS.LOC_EXACT, seqJS.LOC_AFTER].indexOf(_operator) === -1){
            throw "Invalid location operator \'" + _operator + "\'";
        }
        if(_location < 1){
            throw "Invalid location \'" + _location + "\'";
        }
        this.location = function() {return _location;};
        this.operator = function() {return _operator;};
    };


   

}());
