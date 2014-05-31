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
    var DEF_ANNOTATIONS = {
        "accession": "",
        "data_division": "",
        "date": "",
        "organism": "",
        "source": "",
        "taxonomy": [],
        "references": []
    };

    seqJS.Record = function(seq, id, name, desc, annotations){
        if(! seq instanceof seqJS.Seq){
            throw("seq must be a seqJS.Seq instance");
        }
        this.seq = seq;
        this.id = id || 0;
        this.name = name || "unnamed";
        this.desc = desc || "";
        
        annotations = annotations || {};
        for (var attr in DEF_ANNOTATIONS) { 
            annotations[attr] = annotations[attr] || DEF_ANNOTATIONS[attr]; 
        }

        this.annotation = function(k, v) {
            if(k === undefined){
                throw "Record::annotation(k,v): key is required";
            }
            if(v === undefined){
                return annotations[k];
            }
            else {
                annotations[k] = v;
                return this;
            }
        };

        this.listAnnotations = function() {
            var ret = [], p;
            for(p in annotations){
                ret.push(p);
            }
            return ret;            
        };

        this.clearAnnotation = function(k) {
            annotations[k] = undefined;
        };

        this.length = function() {
            return this.seq.length();
        };
    };

    /*
     * Seq object
     */
    seqJS.Alphabets = ['DNA','aDNA','RNA','aRNA','PROT','aPROT'];
    seqJS.Alphabets_RE = {
        DNA: /^[ACGT]+$/,
        aDNA: /^[ACGTRYSWKMBDHVN]+$/,
        RNA: /^[ACGU]+$/,
        aRNA: /^[ACGURYSWKMBDHVN]+$/,
        PROT: /^[ACDEFGHIKLMNPQRSTVWY]+$/,
        aPROT: /^[ACDEFGHIKLMNPQRSTVWYBXZ]+$/
    };
    seqJS.Seq = function(_seq, _alphabet, _features, _topology, _length_unit, _strand_type, _residue_type){
        if(_seq === undefined) { throw 'Argument seq is required';}
        if(_alphabet === undefined) { throw 'Argument alphabet is required';}
        _features = _features || [];
        _topology = _topology || "linear";
        if(['linear','circular'].indexOf(_topology) < 0){
            throw 'topology must be \'linear\' or \'circular\'';
        }
        _length_unit = _length_unit || ((_alphabet.indexOf('PROT') >= 0) ? 
            'aa' : 'bp');
        _residue_type= _residue_type || '';
        _strand_type = _strand_type || '';

        var test_st = function(st){
            if(['ss','ds','ms',''].indexOf(st) < 0){
                throw 'Strand type must be \'ss\', \'ds\', or \'ms\', not \''+st+'\'';
            }
        };
        var test_lu = function(lu){
            if(['bp', 'aa', 'rc'].indexOf(lu) < 0){
                throw 'Length unit must be \'bp\', \'aa\', or \'rc\', not \''+lu+'\'';
            }
        };

        test_st(_strand_type);
        test_lu(_length_unit);

        _seq = _seq.toUpperCase();
        if(seqJS.Alphabets.indexOf(_alphabet) < 0){
            throw "Invalid Alphabet";
        }
        this.seq = function() {return _seq;};
        this.length = function() {return _seq.length;};
        this.alphabet = function() {return _alphabet;};
        this.features = function() {return _features;};
        this.lengthUnit = function(v) {
            if(v === undefined){
                return _length_unit;
            }
            test_lu(v);
            _length_unit = v;
            return this;
        };
        this.residueType = function(v) {
            if(v === undefined){
                return _residue_type;
            }
            _residue_type = v;
            return this;
        };
        this.strandType = function(v) {
            if(v === undefined){
                return _strand_type;
            }
            test_st(v);
            _strand_type = v;
            return this;
        };
        this.topology = function() {
            return _topology;
        };
        this.linearize = function() {
            _topology = 'linear';
        };
        this.circularize = function() {
            _topology = 'circular';
        };
    };

    /*
     * Locations
     *
     * Represent a single location as either and exact base (''), before a
     * specific base ('<'), after a specific base ('>') or between two specific
     * bases ('A.B')
     *
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
     * Spans:
     *  Represent a span between two locations. By definition 
     *  location1 < location 2.
     *
     *  currently the complement flag is a bit redundant as it's handled by
     *  Location operator
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

    /*
     * LocationOperator:
     *  store a Span or several spans and an operator which affects those spans
     *  such as join(...), order(...) or complement()
     */

    var operator_fmt = /^(complement|join|order)\((.+)\)$/;
    /*
     * tokenize:
     *  split string arguments on commas, paying attention to the depth of
     *  parentheses, i.e. 'a,b,c(d,e,f),g' -> ['a', 'b', 'c(d,e,f)', 'g']
     */
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
     *  Store base LocationOperator and procide access to the underlying data
     *  (somehow)
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
    seqJS.Feature = function(_type, _location, _qualifiers){
        var self = this;

        if(_type === undefined){
            throw "Features cannot be constructed without a type";
        }
        if(_location === undefined){
            throw "Features must have a location";
        }

        if(typeof _location === 'string' || _location instanceof String){
            _location = new seqJS.FeatureLocation(_location);
        }

        
        var qualifiers = {};
        var q_keys = [];
        var init = function() {
            if(_qualifiers){
                for(var k in _qualifiers){
                    self.qualifier(k, _qualifiers[k]);
                }
            }
        };


        this.type = function(new_type) {
            if(new_type){
                _type = new_type;
                return self;
            }
            return _type;
        };

        this.location = function(new_location){
            if(new_location){
                if(typeof new_location === 'string' || 
                                    new_location instanceof String){
                    _location = new seqJS.FeatureLocation(new_location);
                }
                else {
                    _location = new_location;
                }
                return self;
            }
            return _location;
        };

        this.qualifier = function(key, value) {
            if(key === undefined){
                throw "Key must be defined";
            }
            if(value === undefined){
                return qualifiers[key];
            }
            else{
                if(q_keys.indexOf(key) < 0){
                    q_keys.push(key);
                }
                qualifiers[key] = value;
                return self;
            }
        };

        this.clearQualifiers = function(to_remove){
            var idx;
            if(to_remove === undefined){
                q_keys = [];
                qualifiers = {};
            }
            else if(to_remove instanceof Array){
                for(var i = 0; i < to_remove.length; i++){
                    qualifiers[to_remove[i]] = undefined;
                    idx = q_keys.indexOf(to_remove[i]);
                    if(idx > -1){
                        q_keys.splice(idx, 1);
                    }
                }
            }
            else {
                qualifiers[to_remove] = undefined;
                idx = q_keys.indexOf(to_remove);
                if(idx > -1){
                    q_keys.splice(idx, 1);
                }
            }
        };

        this.qualifierKeys = function() {
            return q_keys;
        };

        init();
    };


}());
