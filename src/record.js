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
        if(_seq === undefined) { throw 'Argument seq is required';}
        if(_alphabet === undefined) { throw 'Argument alphabet is required';}

        _seq = _seq.toUpperCase();
        if([seqJS.ALPH_DNA, seqJS.ALPH_RNA, seqJS.ALPH_PROT].indexOf(_alphabet) < 0){
            throw "Invalid Alphabet";
        }
        this.seq = function() {return _seq;};
        this.length = function() {return _seq.length;};
        this.alphabet = function() {return _alphabet;};
    };

    /*
     * Locations
     */
    var loc_fmt = /(?:^([<>]?)(\d+)$)|(?:^(\d+)\.(\d+)$)/;
    
    seqJS.Location = function(_location, _operator, _location2) {
        var self = this;
        if (typeof _location === 'string' || _location instanceof String){
            var m = loc_fmt.exec(_location);
            if(m===null){
                throw "Badly formated location \'"+_location+"\'";
            }
            if(m[1] !== undefined){
                _operator = m[1] || '';
                _location = parseInt(m[2],10);
            }
            else{
                _location = parseInt(m[3],10);
                _operator = '.';
                _location2= parseInt(m[4],10);
            }
        }
        _operator = _operator || '';
        if(['', '<', '>', '.'].indexOf(_operator) === -1){
            throw "Invalid location operator \'" + _operator + "\'";
        }
        if(_location < 1){
            throw "Invalid location \'" + _location + "\'";
        }
        if(_operator === '.'){
            if(_location2 === undefined){
                throw "Must have two locations for '.' operator";
            }
            if(_location2 < _location){
                throw "Second location must be less than the first";
            }
        }
        else{
            if(_location2 !== undefined){
                throw "Only 1 location required for '"+_operator+"'";
            }
        }
        this.location = function() {return _location;};
        this.location2= function() {return _location2;};
        this.operator = function() {return _operator;};

        this.lt = function(rhs) {return !self.ge(rhs);};
        this.gt = function(rhs) {
            if(rhs.operator() === '.'){
                return _location > rhs.location2();
            }
            return _location > rhs.location();
        };

        this.toString = function() {
            if(_operator === '.'){
                return _location + '.' + _location2;
            }
            return _operator + _location;
        };
    };

    /*
     * spans
     */
    var span_fmt = /(?:([<>]?)(\d+)(?=\.\.))|(?:(\d+)(\.)(\d+))\.\.(?:([<>]?)(\d+)(?=$))|(?:(\d+)(\.)(\d+))/;
    var from_match = function(m){
        if(m[0] === undefined){
            return new seqJS.Location(m[2],m[3],m[4]);
        }
        else{
            return new seqJS.Location(m[1], m[0]);
        }
    };
    seqJS.Span = function(_location1, _location2){
        //if we're given a string
        if(_location1 instanceof String){
            var m = _location1.search(span_fmt);
            _location1 = from_match(m.slice(1,5));
            _location2 = from_match(m.slice(6));
        }

        if(_location1.gt(_location2)){
            throw "First location is greater than the second";
        }

        this.location1 = function() {return _location1;};
        this.location2 = function() {return _location2;};

        this.overlaps = function(rhs) {
            if(_location1.lt(rhs.location1()) &&
               _location2.gt(rhs.location1())) {
                return true;
            }
            if(_location1.lt(rhs.location2()) &&
               _location2.gt(rhs.location2())) {
                return true;
            }
            if(_location1.gt(rhs.location1()) &&
               _location2.lt(rhs.location2())) {
                return true;
            }
            return false;
        };    

        this.toString = function() {
            return _location1.toString() + '..' + _location2.toString();
        };

    };

   

}());
