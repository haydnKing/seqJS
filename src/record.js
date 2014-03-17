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
    var span_fmt = /(\S+)\.\.(\S+)/;
    seqJS.Span = function(_location1, _location2, complement){
        var self = this;
        complement = complement || false;
        //if we're given a string
        if(typeof _location1 === 'string' || _location1 instanceof String){
            var m = span_fmt.exec(_location1);
            if(m===null){
                throw "Malformed location string \'"+_location1+"\'";
            }
            _location1 = new seqJS.Location(m[1]);
            _location2 = new seqJS.Location(m[2]);
        }

        //if we're given numbers then implicit exact
        if(typeof _location1 === 'number' && typeof _location2 === 'number'){
            _location1 = new seqJS.Location(_location1);
            _location2 = new seqJS.Location(_location2);
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

        this.isComplement = function() {
            return complement;
        };
        this.setComplement = function(value) {
            complement = value;
        };

        this.getSpans = function() {
            return new Array(self);
        };

        this.isSpan = function() {return true;};
    };

    var operator_fmt = /^(complement|join|order)\((.+)\)$/;
    var tokenize = function(string){
        var ret = [], items = string.split(',');
        var depth = 0, current = '';
        for(var i = 0; i < items.length; i++){
            if(current){
                current = current + ',' + items[i];
            }
            else{
                current = items[i];
            }
            depth = - (current.split('(').length - 1) + (current.split(')').length -1 );
            if(depth === 0){
                ret.push(current.trim());
                current = '';
            }
        }
        if(depth > 0){
            throw "Unmatched parentheses in \'"+string+"\'";
        }
        return ret;
    };

    seqJS.LocationOperator = function(location, prev_op){
        var items = [], operator = '';

        var m = operator_fmt.exec(location);
        if(m){
            operator = m[1];
            switch(operator){
                case 'complement':
                    items.push(new seqJS.LocationOperator(m[2].trim()));
                    break;
                case 'join':
                case 'order':
                    //check whether we're duplicating
                    if(prev_op !== undefined && operator !== prev_op){
                        throw "Location lines cannot mix join(...) and order(...)";
                    }
                    var s_items = tokenize(m[2]);
                    for(var i = 0; i < s_items.length; i++){
                        items.push(new seqJS.LocationOperator(s_items[i], operator));
                    }
            }
        }
        else {
            items.push(new seqJS.Span(location));
        }

        this.toString = function() {
            var s = [];
            for(var i = 0; i < items.length; i++){
                s.push(items[i].toString());
            }
            if(operator){
                return operator + '(' + s.join(',') + ')';
            }
            return s[0];
        };
        
        this.setComplement = function(value){
            value = value || false;
            if(operator === 'complement'){
                value = !value;
            }
            for(var i = 0; i < items.length; i++){
                items[i].setComplement(value);
            }
        };

        this.getSpans = function(){
            var spans = [], i;
            if(operator === 'complement'){
                for(i = items.length-1; i >= 0; i--){
                    spans = spans.concat(items[i].getSpans().reverse());
                }
            }
            else{
                for(i = 0; i < items.length; i++){
                    spans = spans.concat(items[i].getSpans());
                }
            }
            return spans;
        };

        this.getMergeOperator = function() {
            var op;
            if(prev_op) {
                return prev_op;
            }
            else {
                for(var i = 0; i < items.length; i++){
                    if(!items[i].isSpan()){
                        op = items[i].getMergeOperator();
                        if(op){
                            return op;
                        }
                    }
                }
            }
            return '';
        };

        this.isSpan = function() {return false;};

    };



    /*
     * FeatureLocation
     */
    seqJS.FeatureLocation = function(location){
        var loc;
        try{
            loc = new seqJS.LocationOperator(location);
        }
        catch(e){
            throw e + " while parsing location string \'"+location+"\'";
        }
        //set complement flags on Spans
        loc.setComplement();

        this.toString = function(){
            return loc.toString();
        };

        this.getSpans = function() {
            return loc.getSpans();
        };

        this.getMergeOperator = function() {
            return loc.getMergeOperator();
        };
    };
    
    /*
     * Feature
     *  Store information about a feature
     *      - type: the feature type -- gene, CDS, etc.
     *      - location: feature location -- either a FeatureLocation object or
     *          string from which one will be built
     *      - qualifiers: dictionary Object of qualifiers to be stored with the
     *          feature
     *
     *
     *  type, location & qualifiers are getters/settors
     *
     *  clearQualifiers: clears either a single qualifier, an array of
     *      qualifiers or all qualifiers if undefined
     */
    seqJS.Feature = function(_type, _location, qualifiers){
        if(_type === undefined){
            throw "Features cannot be constructed without a type";
        }
        if(_location === undefined){
            throw "Features must have a location";
        }
        qualifiers = qualifiers || {};

        if(typeof _location === 'string' || _location instanceof String){
            _location = new seqJS.FeatureLocation(_location);
        }

        this.type = function(new_type) {
            _type = new_type || _type;
            return _type;
        };

        this.location = function(new_location){
            _location = new_location || _location;
            return _location;
        };

        this.qualifier = function(key, value) {
            if(key === undefined){
                throw "Key must be defined";
            }
            qualifiers[key] = value || qualifiers[key];
            return qualifiers[key];
        };

        this.clearQualifiers = function(to_remove){
            if(to_remove === undefined){
                qualifiers = {};
            }
            else if(to_remove instanceof Array){
                for(var i = 0; i < to_remove.length; i++){
                    qualifiers[to_remove[i]] = undefined;
                }
            }
            else {
                qualifiers[to_remove] = undefined;
            }
        };

        this.qualifierKeys = function() {
            var keys = [];
            for(var k in qualifiers){
                keys.push(k);
            }
            return keys;
        };
    };


}());
