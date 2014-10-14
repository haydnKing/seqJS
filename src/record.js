/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

/**
 * @namespace
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

    /**
     * Stores a biological sequence record. Records are typically created 
     * synchronously using {@link seqJS.read} or asynchronously using 
     * {@link seqJS.getParser}. They can be written to strings using 
     * {@link seqJS.write}.
     * @constructor
     * @param {seqJS.Seq} seq the sequence object
     * @param {string} id the record's id
     * @param {string} name the record's name
     * @param {string} desc the record's description
     * @param {Object} annotations the record's annotations in {key: value, ...} form
     */
    seqJS.Record = function(seq, id, name, desc, annotations){
        if(! seq instanceof seqJS.Seq){
            throw("seq must be a seqJS.Seq instance");
        }
        /** 
         * Get the sequence object 
         * @returns {seqJS.Seq} The sequence object 
         */
        this.seq = function() {return seq;};
        /** 
         * Get or set the record id
         * @param {string|Number} [_id] The new ID
         * @returns {string|Number|seqJS.Record} Either the record's ID if no 
         * arguments, or this if the ID was set
         */
        this.id = function (_id) {
            if(_id === undefined)
            {
                return id || 0;
            }
            id = _id;
            return this;
        };
        /** 
         * Get or set the record's name
         * @param {string} [_name] The new name
         * @returns {string|seqJS.Record} Either the name if no argument was
         * given or this if the name was set
         */
        this.name = function(_name) {
            if(_name === undefined) {
                return name || "unnamed";
            }
            name = _name;
            return this;
        };
        /** 
         * Get or set the record description
         * @param {string} [_desc] The new description
         * @returns {string|seqJS.Record} Either the description if no argument
         * was given or this if the description was set
         */
        this.desc = function(_desc) {
            if(_desc === undefined){
                return desc || "";
            }
            desc = _desc;
            return this;
        };


        //Initialise the annotations
        annotations = annotations || {};
        for (var attr in DEF_ANNOTATIONS) { 
            annotations[attr] = annotations[attr] || DEF_ANNOTATIONS[attr]; 
        }

        /** Get or set an annotation if value is provided
         * @param {string} key annotation key
         * @param {string} [value] the new annotation value
         *
         * @return {string|seqJS.Record} return the annotation if no value was
         * given or this if a value is given
         */
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

        /** List the record's annotations
         * @returns {Array} an array of annotations
         */
        this.listAnnotations = function() {
            var ret = [], p;
            for(p in annotations){
                ret.push(p);
            }
            return ret;            
        };

        /** Remove an annotation
         * @returns {seqJS.Record} returns this
         */
        this.clearAnnotation = function(k) {
            annotations[k] = undefined;
            return this;
        };

        /** Get sequence length, an alias for this.seq().length()
         * @returns {Number} the number of nucleotides in the sequence
         */
        this.length = function() {
            return this.seq().length();
        };
    };

    /*
     * Seq object
     */

    /** Array of possible alphabets as strings
     * @constant {Array(string)} seqJS.Alphabets
     */
    seqJS.Alphabets = ['DNA','aDNA','RNA','aRNA','PROT','aPROT'];
    /** Dictionary of regular expressions which sequences of each alphabet
     * should match
     * @constant {Object} seqJS.Alphabets_RE
     */
    seqJS.Alphabets_RE = {
        DNA: /^[ACGT]*$/,
        aDNA: /^[ACGTRYSWKMBDHVN]*$/,
        RNA: /^[ACGU]*$/,
        aRNA: /^[ACGURYSWKMBDHVN]*$/,
        PROT: /^[ACDEFGHIKLMNPQRSTVWY]*$/,
        aPROT: /^[ACDEFGHIKLMNPQRSTVWYBXZ]*$/
    };
    /** Dictionary of regular expressions used to find characters which don't
     * match Alphabets_RE 
     * @constant {Object} seqJS.Alphabets_iRE
     */
    seqJS.Alphabets_iRE = {
        DNA: /([^ACGT])/g,
        aDNA: /[^ACGTRYSWKMBDHVN]/g,
        RNA: /[^ACGU]/g,
        aRNA: /[^ACGURYSWKMBDHVN]/g,
        PROT: /[^ACDEFGHIKLMNPQRSTVWY]/g,
        aPROT: /[^ACDEFGHIKLMNPQRSTVWYBXZ]/g
    };
    /** An object representing a biological sequence
     * @constructor
     * @param {string} seq the sequence as a string
     * @param {string} alphabet the alphabet, one of {@link seqJS.Alphabets},
     * either 'DNA', 'aDNA', 'RNA', 'aRNA', 'PROT' or 'aPROT'
     * @param {Array} [features=new Array()] an array of {@link seqJS.Feature} objects referring to
     * the sequence
     * @param {string} [topology='linear'] sequence topology, 'linear' or
     * 'circular'
     * @param {string} [length_unit=taken from alphabet] the length unit of
     * the sequence, one of 'bp', 'aa' or 'rc'
     * @param {string} [strand_type=''] type of strand, e.g. 'ss', 'ds'.
     * default is '' - unknown
     * @param {string} [residue_type=''] type of each residue e.g. 'DNA',
     * 'RNA'
     */
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
        var verify_sequence = function(){
            if(_seq.match(seqJS.Alphabets_RE[_alphabet]) === null){
                var f = _seq.match(seqJS.Alphabets_iRE[_alphabet]),
                    s = {};
                f.filter(function(v){
                    return s.hasOwnProperty(v) ? false : (s[v] = true);
                });
                throw("Sequence contains \'"+f.join('\',\'')+"\' which "+(f.length>1 ? 'do' : 'does')+" not belong to alphabet \'"+_alphabet+"\'");
            }
        };
        verify_sequence();

        //stably sort features
        var sort_feats = function(){
            var ifeatures = _features.map(function(v,i){return i;}),
                sfeatures = _features.map(function(v){return v.location().start();});
            
            ifeatures.sort(function(a,b){
                //difference in start position
                var i = sfeatures[a] - sfeatures[b];
                //if the start position is the same, compare indexes
                if(i === 0){
                    return a-b;
                }
                return i;
            });

            _features = ifeatures.map(function(v) {return _features[v];});
        };
        sort_feats();


        /** Get the sequence
         * @returns {string} the raw sequence
         */
        this.seq = function() {return _seq;};
        /** Get the sequence length (this.seq().length)
         * @returns {number} sequence length
         */
        this.length = function() {return _seq.length;};
        /** Get the sequence alphabet
         * @returns {string} sequence alphabet, one of {@link seqJS.Alphabets}
         */
        this.alphabet = function() {return _alphabet;};
        /** Get the alphabet type - i.e. for `alphabet`='aDNA' return 'DNA'
         * @returns {string} alphabet type
         */
        this.alphabetType = function() {
            return (this.isAmbiguous()) ? _alphabet.substr(1) : _alphabet;
        };
        /** Return true if the alphabet is ambiguous
         * @returns {bool} 
         */
        this.isAmbiguous = function(){
            return _alphabet[0] === 'a';
        };
        /** Set whether or not the alphabet should be ambiguous
         * @param {bool} [ambiguous=True] Whether to set ambiguous
         * @returns {seqJS.Seq} this
         */
        this.setAmbiguous = function(a){
            a = (a===undefined) ? true : a;
            if(a && !this.isAmbiguous()){
                _alphabet = 'a' + _alphabet;
            }
            else if (!a && this.isAmbiguous()){
                _alphabet = _alphabet.substr(1);
            }
            return this;
        };
        /** Get a list of features within the range [start,end], or all
         * features if they are not given
         * @param {int} [start] the first position
         * @param {int} [end=start] the second position
         * @param {boolean} [intersect=false] if true, return features which
         * intersect with [start,end], rather than just features which are
         * wholly contained by [start,end]
         * @returns {Array} an array of {@link seqJS.Feature} objects
         */
        this.features = function(start, end, intersect) {
            if(start === undefined){
                return _features;
            }
            else{
                end = end || start;
                intersect = intersect || false;

                var r = [];
                for(var f = 0; f < _features.length; f++){
                    if(intersect){
                        //include features if any spans intersect
                        if(_features[f].overlaps(start, end)){
                            r.push(_features[f]);
                        }
                    }
                    else{
                        //include only features which are wholly contained
                        if(_features[f].location().start() >= start &&
                           _features[f].location().end() <= end){
                            r.push(_features[f]);
                        }
                    }
                }

                return r;
            }
        };
        /** Get the length unit
         * @return {string} length unit ('bp','aa','rc')
         */
        this.lengthUnit = function(v) {
            if(v === undefined){
                return _length_unit;
            }
            test_lu(v);
            _length_unit = v;
            return this;
        };
        /** Get the residue type
         * @returns {string} residue type ('DNA', 'RNA', etc)
         */
        this.residueType = function(v) {
            if(v === undefined){
                return _residue_type;
            }
            _residue_type = v;
            return this;
        };
        /** Get the strand type
         * @returns {string} strand type ('ss','ds','')
         */
        this.strandType = function(v) {
            if(v === undefined){
                return _strand_type;
            }
            test_st(v);
            _strand_type = v;
            return this;
        };
        /** Get the topology of the molecule
         * @returns {string} either 'linear' or 'circular'
         */
        this.topology = function() {
            return _topology;
        };
        /** Set the topology to 'linear'
         * @returns {seqJS.Seq} this
         */
        this.linearize = function() {
            _topology = 'linear';
            return this;
        };
        /** Set the topology to 'circular'
         * @returns {seqJs.Seq} this
         */
        this.circularize = function() {
            _topology = 'circular';
            return this;
        };
        /** String representation for debugging
         * @returns {String} a string
         */
        this.toString = function() {
           return '[seqJS.Seq \"' + 
                (this.length() < 13 ? this.seq() : 
                    (this.seq().substring(0,5) + '...' + 
                     this.seq().substring(this.length()-5))) +
                '\",'+this.length()+'bp,\"' + this.alphabet() + '\",'+this.topology() + ']';
        };

        /** Return a substring from start to end.
         * 'start' and 'end' must be of the same type.
         * subseq works much the same as String.substring - e.g. s.subseq(5,7)
         * returns a Seq with two bases, those at positions 5 and 6
         * @param {seqJS.Location|int} start The position to start at
         * @param {seqJS.Location|int} end The position to end at
         * @param {boolean} [complement=false] If true, return the reverse
         * complement of the sub-sequence instead
         * @param {bool} [feats=false] Whether to include features
         * @returns {seqJS.Seq} The sub-sequence
         */
        this.subseq = function(start, end, complement, feats) {
            if(start.toInt instanceof Function &&
                 end.toInt instanceof Function) {
                start = start.toInt();
                end = end.toInt();
            }
            else if(start.toInt instanceof Function ||
                      end.toInt instanceof Function){
                throw('seqJS.Seq.subseq: start and end arguments must be the same type');
            }
            complement = complement || false;
            feats = (feats===undefined) ? false : feats;

            var _feats = (feats) ? this.features(start, end, true)
                .map(function(f){
                    return f.crop(start, end);
                }) : [];

            var s = new seqJS.Seq(this.seq().substring(start, end), 
                                  this.alphabet(),
                                  _feats,
                                  'linear',
                                  this.lengthUnit(),
                                  this.strandType(),
                                  this.residueType());
            if(complement){
                s = s.reverseComplement();
            }
            return s;
        };

        /** Return a new Seq which is the reverse complement of this sequence
         * @returns {seqJS.Seq} the new sequence
         */
        this.reverseComplement = function(){
            if(this.alphabet() !== 'DNA'){
                throw "Can only reverse complement DNA";
            }

            var replace = {'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G'};
            var nseq = _seq.split('')
                       .reverse()
                       .map(function(c){return replace[c];})
                       .join('');

            var nfeatures = _features.map(function(f){return f.invertDatum(_seq.length);}); 

            return new seqJS.Seq(nseq, 
                                 this.alphabet(),
                                 nfeatures,
                                 this.topology(),
                                 this.lengthUnit(),
                                 this.strandType(),
                                 this.residueType());
        };

        /** Append a sequence to the end of the sequence
         * @param {seqJS.Seq} rhs A linear sequence
         * @returns {seqJS.Seq} this
         */
        this.append = function(rhs){
            if(this.alphabetType() !== rhs.alphabetType()){
                throw('Can\'t join alphabets \''+this.alphabet()+
                      '\' with \''+rhs.alphabet()+'\'');
            }
            if(this.topology() !== 'linear' ||
               rhs.topology() !== 'linear'){
                throw('Can\'t join non-linear fragments');
            }
                
            //do we need to become ambiguous?
            if(!this.isAmbiguous() && rhs.isAmbiguous()){
                this.setAmbiguous(true);
            }
            _features = _features.concat(rhs.features().map(function(f){
                return f.offset(_seq.length);
            }));
            
            _seq = _seq + rhs.seq();
            return this;
            
        };

        /** Extract the sequence that the feature refers to
         * @param {seqJS.Feature} feat The feature whose underlying sequence we want to extract
         * @param {boolean} [extract_features=false] Whether or not to include
         * cropped features in the output {@link seqJS.Seq}. If 'feat' is a
         * multi-span feature, then features which are present in multiple
         * spans are kept as single features, with the spans merged using the
         * 'order' merge operator.
         * For example, if a seq has a feature whose location is 1..50, and you
         * extract a feature whose location is join(10..19,30..39), the
         * location of the resulting feature is order(1..10,11..20)
         * @returns {seqJS.Seq} A new sequence representing that of the feature
         */
        this.extract = function(feat, ef) {
            var s,
                spans = feat.location().getSpans();

            ef = (ef === undefined) ? false : ef;

            //make a new, empty seq
            s = new seqJS.Seq('', 
                              this.alphabet(),
                              [],
                              'linear',
                              this.lengthUnit(),
                              this.strandType(),
                              this.residueType());
            
            spans.forEach(function(i_span){
                s.append(this.subseq(i_span.left(), i_span.right(), i_span.isComplement(), ef)); 
            }, this);

            return s;
        };

    };

    var loc_fmt = /(?:^([<>]?)(\d+)$)|(?:^(\d+)\.(\d+)$)/;
 
    /** Represent a single location within a sequence.
     *  Locations can be an exact base (operator=''), some position before a
     *  specific base (operator='<'), some position after a specific base 
     *  (operator='>') or between two specific bases (operator='A.B').
     *  If 'location' argument is passed as a string, it is assumed to be 
     *  'biologist style' (i.e. 1-offset), if passed as an integer it is 
     *  assumed to be 0-offset
     * @constructor
     * @param {string|number} location Either a 1-offset string specifying the
     * location in genbank-style format or a 0-offset integer defining the 
     * first location
     * @param {string} [operator=''] The operator which applies to the location, 
     * either '', '<', '>', or '''. This parameter can only be given if 
     * 'location' is an integer. If 'operator' is given as '.', then 'location2' 
     * is required
     * @param {number} [location2] The second position, required when
     * operator='.' to define a range between 'location' and 'location2'
     */   
    seqJS.Location = function(_location, _operator, _location2) {
        if (typeof _location === 'string' || _location instanceof String){
            var m = loc_fmt.exec(_location);
            if(m===null){
                throw "Badly formated location \'"+_location+"\'";
            }
            if(m[1] !== undefined){
                _operator = m[1] || '';
                _location = parseInt(m[2],10) - 1;
            }
            else{
                _location = parseInt(m[3],10) - 1;
                _operator = '.';
                //Genbank is inclusize, so _location2 has one added to it
                //location is in range [_location:_location2)
                _location2= parseInt(m[4],10);
            }
        }
        _operator = _operator || '';
        if(['', '<', '>', '.'].indexOf(_operator) === -1){
            throw "Invalid location operator \'" + _operator + "\'";
        }
        if(_location < 0){
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
        /** Get the first location
         * @returns {number} The first location - equal to the exact location
         * if operator is ''
         */
        this.location = function() {return _location;};
        /** Get the second location. This is only defined if operator is '.'
         * @returns {number|undefined} returns the second location if operator
         * is '.'
         */
        this.location2= function() {return _location2;};
        /** Get the operator
         * @returns {string} either '', '<', '>' or '.'
         */
        this.operator = function() {return _operator;};

        /** Get the distance between two locations, i.e. the value of
         * lhs.toInt() - rhs.toInt()
         * @param {seqJS.Location} rhs the location to compare with
         * @returns {int} the distance between the locations
         */
        this.distance = function(rhs) {
            return this.toInt() - rhs.toInt();
        };

        /** Is the location less than rhs
         * @param {seqJS.Location|Number} rhs the location to compare with
         * @returns {boolean} true if rhs is strictly smaller than this
         */
        this.lt = function(rhs) {
            if(typeof(rhs) !== 'number') {
                rhs = rhs.location();
            }
            return (this.operator() === '.') ?
                _location2 < rhs :
                _location < rhs;
        };

        /** Is the location greater than rhs
         * @param {seqJS.Location|Number} rhs the location to compare with
         * @returns {boolean} true if rhs is greater than this
         */
        this.gt = function(rhs) {
            if(typeof(rhs) !== 'number'){
                rhs = (rhs.operator() === '.') ? rhs.location2() : rhs.location();
            }
            return _location > rhs;
        };
        /** Is the location less than or equal to rhs
         * @param {seqJS.Location|Number} rhs the location to compare with
         * @returns {boolean} true if rhs is strictly smaller than this
         */
        this.lte = function(rhs) {
            return !this.gt(rhs);
        };
        /** Is the location greater than or equal to rhs
         * @param {seqJS.Location|Number} rhs the location to compare with
         * @returns {boolean} true if rhs is greater than this
         */
        this.gte = function(rhs) {
            return !this.lt(rhs);
        };

        /** Get a 1-offset genbank style string representation
         * @returns {string} 
         */
        this.toGenbankString = function() {
            if(_operator === '.'){
                return (_location + 1) + '.' + (_location2);
            }
            return _operator + (_location + 1);
        };

        /** Get a 0-string representation of the Location for debugging
         * @param {int} [indent=0] How much to indent the string. Use
         * compressed notation (Location -> L) if indent < 0
         * @returns {string}
         */
        this.toString = function(indent) {
            indent = indent || 0;
            var ret = new Array(indent + 1).join('\t');
            return ret + (indent < 0 ? 'L(' : 'Location(') + 
                            ((_operator === '.') ? 
                            _location + '.' + _location2 :
                            _operator + _location) + ')';
        };


        /** Convert the location to an integer. By default just return the
         * first location
         * @returns {int} location as integer
         */
        this.toInt = function() {
            return this.location();
        };

        /** Convert to an integer using the leftmost position
         * @returns {int} location as leftmost position
         */
        this.left = function() {
            return this.location();
        };

        /** Convert to an integer using the rightmost position
         * @returns {int} location as rightmost position
         */
        this.right = function() {
            return (this.operator()==='.') ? this.location2() : this.location();
        };



        /** Return a new Location with an added offset
         * @param {int} offset the amount to add
         * @returns {seqJS.Location} the new location
         */
        this.offset = function(o) {
            if (_location + o >= 0){
                return new seqJS.Location(_location + o, _operator,
                            (_operator === '.' ? _location2 + o : undefined));
            }
            else {
                throw "location cannot be negative";
            }
        };

        /** Return a seqJS.Location with an inverted datum - 
         * the location will now be measured from the far end of the sequence
         * @param {int} length the length of the sequence
         * @returns this
         */
        this.invertDatum = function(l) {
            if(isNaN(l)){
                throw('seqJS.Location.invertDatum called with NaN');
            }
            var op = {'': '', '<': '>', '>': '<', '.': '.'};
            if(_operator !== '.'){
                //invert location and operator
                return new seqJS.Location(l - _location - 1, op[_operator]);
            }
            //else (_operator === '.')
            //if _location2 exists, we also need to swap the locations
            // such that _location < _location2
            return new seqJS.Location(l - _location2,
                                      '.',
                                      l - _location);
        };

        /** return a new location, cropped such that it is within the range 
         * [start,end). E.g. Location(3).crop(5,10) -> Location(0)
         * @param {seqJS.Location|int} left the start of the range
         * @param {seqJS.Location|int} right past the end location
         * @returns {seqJS.Location} the new location
         */
        this.crop = function(left, right){
            var _l, _o, _l2;
            //convert input to integers
            if(typeof(left) !== 'number'){
                left = left.toInt();
            }
            if(typeof(right) !== 'number'){
                right = right.toInt();
            }
            if(left > right){
                throw("seqJS.Location.crop("+left+", "+right+"): right cannot be smaller than left");
            }

            var c = function(x){
                if(x < left){return 0;}
                if(x > right){return right - left;}
                return x-left;
            };

            _l = c(_location);
            _o = _operator;
            if(_location2){
                _l2 = c(_location2);
            }
            if(_o === '<' && _location < left){
                _o = '';
            }
            else if(_o === '>' && _location > right){
                _o = '';
            }

            if(_l === _l2){
                _o = '';
                _l2 = undefined;
            }

            return new seqJS.Location(_l, _o, _l2);
        };
    };

    var span_fmt = /(\S+)\.\.(\S+)/;
    /** Represent a span between two locations. 
     * Either both locations can be passed seperately as seqJS.Locations, or
     * the span can be parsed from a Genbank string.
     * By definition location1 < location 2.
     *  @constructor 
     *  @param {string|seqJS.Location} _location1 the first location
     *  @param {seqJS.Location} [_location2] the second location
     */
    seqJS.Span = function(_location1, _location2, complement){
        var self = this;
        complement = complement || false;
        var parent = null;
        //if we're given a string
        if(typeof _location1 === 'string' || _location1 instanceof String){
            var m = span_fmt.exec(_location1);
            if(m===null){
                throw "Malformed location string \'"+_location1+"\'";
            }
            _location1 = new seqJS.Location(m[1]);
            //Genbank stores locations as being inclusive
            _location2 = new seqJS.Location(m[2]).offset(1);
        }
        //if we're given numbers then implicit exact
        else if(typeof _location1 === 'number' && typeof _location2 === 'number'){
            _location1 = new seqJS.Location(_location1);
            _location2 = new seqJS.Location(_location2);
        }
        else if(!(_location1 instanceof seqJS.Location && _location2 instanceof seqJS.Location)){
            throw "seqJS.Span: invalid argument types";
        }

        if(_location1.gt(_location2)){
            throw "First location is greater than the second";
        }


        /** Get the leftmost location
         * @returns {seqJS.Location} The first (smallest) location
         */
        this.left = function() {return _location1;};
        /** Get the rightmost location
         * @returns {seqJS.Location} The second (largest) location
         */
        this.right = function() {return _location2;};

        /** Does this span overlap with another span
         * @param {seqJS.Span} rhs the other span
         * @returns {boolean} true if the spans overlap
         */
        this.overlaps = function(rhs) {
            //check if we don't overlap
            if(this.right().right() <= rhs.left().left() || 
               this.left().left() >= rhs.right().right()){
                return false;
            }
            return true;
        };    

        /** Get a genbank style string representation of the span
         * @returns {string} genbank style string (e.g. 100..200)
         */
        this.toGenbankString = function() {
            return _location1.toGenbankString() + '..' + _location2.offset(-1).toGenbankString();
        };

        /** Get a 0-string representation of the Span for debugging
         * @param {int} [indent=0] How much to indent the string. If indent < 0
         * then use compressed notation
         * @returns {string}
         */
        this.toString = function(indent) {
            indent = indent || 0;
            var tabs = new Array(Math.abs(indent + 1)).join('\t');
            indent = indent < 0 ? -1 : 0;
            return tabs + (indent < 0 ? 'S(' : 'Span(') + 
                (this.isComplement() ? '-,' : '+,') +
                _location1.toString(indent) + ':' + 
                _location2.toString(indent) +')'; 
        };

        /** Returns true if the span is on the reverse strand
         * @returns {boolean} true if we're on the reverse strand
         */
        this.isComplement = function() {
            if(parent!==null){
                var p = parent.isComplement();
                return (complement) ? !p : p;
            }
            return complement;
        };

        /** Set the Span's parent
         * @param {object} parent the object to set as parent - requires and
         * isComplement method
         * @return {Span} this
         */
        this.setParent = function(_p){
            parent = _p;
            return this;
        };
                
        /** Get the size or length of the span
         * @returns {int} the length
         */
        this.length = function() {
            return this.right().right() - this.left().left();
        };

        /** Return a new span which is indexed from the other end of the
         * molecule
         * @param {Number} length The length of the sequence
         * @param {bool} [complement=true] Whether or not to complement the
         * returned span
         * @returns {seqJS.Span} the new span
         */
        this.invertDatum = function(l,c){
            c = (c === undefined) ? true : c;
            if(isNaN(l)){
                throw('seqJS.Span.invertDatum called with NaN');
            }
            return new seqJS.Span(_location2.offset(-1).invertDatum(l),
                                  _location1.invertDatum(l).offset(1),
                                  (c) ? !complement : complement);
        };

        /** Return a new span with offset added to it
         * @param {Number} offset the offset to add
         * @returns {seqJS.Span} the new span
         */
        this.offset = function(o){
            return new seqJS.Span(_location1.offset(o),
                                  _location2.offset(o),
                                  complement);
        };

        /** Return a new span, cropped to [start,end). If the span doesn't
         * overlap with this range then return undefined
         * @param {seqJS.Location|int} left The start of the range to crop to
         * @param {seqJS.Location|int} right The start of the range to crop to
         * @returns {seqJS.Span|undefined} The new Span
         */
        this.crop = function(left, right) {
            if(left.toInt instanceof Function){
                left = left.toInt();
            }
            if(right.toInt instanceof Function){
                right = right.toInt();
            }
            if(left > right){
                throw("seqJS.Span.crop("+right+","+left+"): right must be greater than left");
            }

            // if there's no overlap, return null
            if( _location1.gte(right) || _location2.lte(left) ){
                return null;
            }

            return new seqJS.Span(_location1.crop(left,right),
                                  _location2.crop(left,right),
                                  complement);
        };

        /** Get all spans -- in this case an array containing this
         * @return {Array(seqJS.Span)} an array of one
         */
        this.getSpans = function() {
            return new Array(self);
        };

        /** Is the object a span?
         * @returns {boolean} true
         */
        this.isSpan = function() {return true;};
    };

    var operator_fmt = /^(complement|join|order|merge)\((.+)\)$/;
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

    /*
     * parse a token.
     * if token is of form op(TOKENS) return a SpanOperator
     * otherwise return a Span
     */
    var parse_token = function(token){
        if(operator_fmt.exec(token)){
            return new seqJS.SpanOperator(token);
        }
        return new seqJS.Span(token);
    };


    /** An operator stores two things
     * 1) a string defining an operation 
     * 2) a list of {@link seqJS.SpanOperator} objects or a single {@link @seqJS.Span} which are acted on by the
     * operator
     * Valid operations are:
     *  - 'complement': Acts on a single Span
     *  - 'merge': Join a list of spans
     *  - '': no-op, zero or one Spans
     * @constructor
     * @param {string|Array.<seqJS.Span>} location the location string to
     * parse, or an array of Span to be contained. In the latter case, the
     * second argument is required
     * @param {string} [operation] The operation to be carried out. If this is
     * given then argument 1 must be an Array of Spans
     */
    seqJS.SpanOperator = function(location, operator){
        var items = [];
        var parent = null;
        var self = this;

        //If we're given a string to parse
        if(typeof(location) === 'string' || location instanceof String){
            var m = operator_fmt.exec(location);
            if(m){
                operator = m[1];
                location = m[2];
            }
            else{
                operator = '';
            }
            //if single token operator
            if(['','complement'].indexOf(operator) >= 0){
                items.push(parse_token(location));
            }
            else{
                operator = 'merge';
                tokenize(location).forEach(function(t){
                    items.push(parse_token(t));
                });
            }

        }
        //else, we're given an Array and an operator
        else{
            if(operator === undefined){
                throw("seqJS.SpanOperator: Required argument 'operator' missing");
            }
            items = location;
        }

        //set myself as the parent of each item
        items.forEach(function(i){
            i.setParent(self);
        });

        //Check that what we have makes sense
        switch(operator){
            case 'complement':
            case '':
                if(items.length > 1){
                    throw("seqJS.SpanOperator: operator '"+operator+"' accepts only one Span, not "+items.length);
                }
                break;
            case 'join':
            case 'order':
                operator = 'merge';
                break;
            case 'merge':
                break;
            default:
                throw("seqJS.SpanOperator: unknown operation '"+operator+"'");
        }

        /** Convert to a genbank style string
         * @returns {string} string representation
         */
        this.toGenbankString = function() {
            var s = [];
            for(var i = 0; i < items.length; i++){
                s.push(items[i].toGenbankString());
            }
            if(operator){
                return operator + '(' + s.join(',') + ')';
            }
            return s[0];
        };

        /** Get a 0-string representation of the SpanOperator for debugging
         * @param {int} [indent=0] How much to indent the string. If indent < 0
         * then use compressed notation.
         * @returns {string}
         */
        this.toString = function(indent) {
            indent = indent || 0;
            var n_indent = (indent < 0) ? indent : indent + 1;
            var tabs = new Array(Math.abs(indent+1)).join('\t');

            var ret = tabs + 
                (indent < 0 ? 'SO(\'' : 'SpanOperator(\'') + 
                operator + '\', [\n' + 
                items.map(function(x){return x.toString(n_indent);}).join(', \n') + 
                '\n' + tabs + '])';
            if(indent < 0){
                return ret.replace(/\n/g, '').replace(/\t/g, '');
            }
            return ret;
        };

        /** Add a new span to the list
         * @param {seqJS.Span|seqJS.SpanOperator} span the span (or list) to add
         * @returns {seqJS.SpanOperator} this
         */
        this.push = function(span){
            items.push(span);
            return this;
        };
        
        /** Is the SpanOperator (and it's children) are on the complementary strand?
         * @returns {bool} whether or not the SpanOperator is on the other
         * strand
         */
        this.isComplement = function(){
            var m = (operator==='complement'), p;
            if(parent!==null){
                p = parent.isComplement();
                return m ? !p : p;
            }
            return m;
        };

        /** Set the SpanOperator's parent
         * @param {object} parent the object to set as parent - requires and
         * isComplement method
         * @return {SpanOperator} this
         */
        this.setParent = function(_p){
            parent = _p;
            return this;
        };

        /** Get a list of all spans in the correct order
         * @returns {Array(seqJS.Span)} 
         */
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

        /** Get the operator
         * @returns {string} the operator or this
         */
        this.operator = function(){
            return operator;
        };

        /** Get the number of items
         * @returns {int} the number of items held by the SpanOperator
         */
        this.itemsLength = function(){
            return items.length;
        };

        /** Get the length of the sequence referred to by th contained spans
         * @returns {int}
         */
        this.length = function(){
            return items.reduce(function(prev, current) {
                return prev + current.length();
            }, 0);
        };

        /** Returns a new SpanOperator with an offset to every contained span
         * @param {int} offset the offset to add
         * @returns {seqJS.SpanOperator} the new SpanOperator
         */
        this.offset = function(o){
            return new seqJS.SpanOperator(items.map(function(x){return x.offset(o);}), operator);
        };

        /** Test whether I overlap with any of the other spans
         * @param {seqJS.Span|seqJS.SpanOperator} rhs the Span or SpanOperator to test with
         * @returns {boolean} true if overlap
         */
        this.overlaps = function(rhs){
            var r_s = rhs.getSpans();
            return items.some(function(l){
                return r_s.some(function(r){
                    return l.overlaps(r);
                });
            });
        };

        /** Test if the object is a span
         * @returns {boolean} false
         */
        this.isSpan = function() {return false;};

        /** Return a new SpanOperator which has been cropped to [start,end)
         * @param {seqJS.Location|int} left the start of the range to crop to
         * @param {seqJS.Location|int} right the end of the range to crop to
         * @param {boolean} [complement=false] whether to complement the returned
         * SpanOperator
         * @returns {seqJS.SpanOperator} the new spanlist, or null if there is
         * no overlap
         */
        this.crop = function(left, right, complement) {
            //Convert to integers
            if(right.toInt instanceof Function){
                right = right.toInt();
            }
            if(left.toInt instanceof Function){
                left = left.toInt();
            }
            //crop each item and remove nulls
            var _operator = operator,
                _items = items.map(function(x){return x.crop(left, right, false);})
                              .filter(function(x){return x !== null;});
            
            //return null if no overlap
            if(_items.length === 0){
                return null;
            }
            //if there's only one item
            if(_items.length === 1){
                //There's no point in 'merge' if there's only one item
                if(_operator !== 'complement'){
                    _operator = '';
                }
                //apply complement
                if(complement){
                    _operator = (_operator==='') ? 'complement' : '';
                    _items[0] = _items[0].invertDatum(right-left, false);
                }
                
                //If the item is a spanOperator with only one item, there's no
                //need to add another
                if(!_items[0].isSpan() && _items[0].itemsLength() === 1){
                    _operator = (_operator === _items[0].operator()) ? 
                        '' : 'complement';
                    _items[0].operator(_operator);
                    return _items[0];
                }
                return new seqJS.SpanOperator(_items, _operator);
            }

            //handle complement
            if(complement){
                _items = _items.map(function(x){return x.invertDatum(right-left, false);}).reverse();
                if(_operator==='' || _operator==='complement'){
                    return new seqJS.SpanOperator(_items, 
                                              (_operator==='') ? 
                                                  'complement' : '');
                }
                return new seqJS.SpanOperator([new seqJS.SpanOperator(_items, _operator)],
                                              'complement');
            }
            return new seqJS.SpanOperator(_items, _operator);
        };

        /** Remove items which are null
         * @returns {seqJS.SpanOperator} this
         */
        this.prune = function(){
            //remove nulls
            items = items.filter(function(x){if(x){return true;}return false;});
            if(operator === 'merge'){
                items.forEach(function(x){x.prune();});
            }
        };

        /** Return a new spanoperator with an inverted datum
         * @param {int} l The length of the molecule
         * @param {bool} [complement=True] Whether or not to complement
         * @returns {seqJS.SpanOperator} the new span operator
         */
        this.invertDatum = function(l, c){
            c = c || true;
            if(isNaN(l)){
                throw('seqJS.SpanOperator.invertDatum called with NaN');
            }
            var _items = items.map(function(x){return x.invertDatum(l,false);});
            if(c){
                if(['', 'complement'].indexOf(operator) >= 0){
                    return new seqJS.SpanOperator(_items, 
                                    operator==='' ? 'complement' : '');
                }
                return new seqJS.SpanOperator([
                            new seqJS.SpanOperator(_items, operator)],
                            'complement');
            }
            return new seqJS.SpanOperator(_items, operator);
        };
    };



    /**
     * FeatureLocation
     *  Store base SpanOperator and provide access to the underlying data
     * @constructor
     * @param {string|seqJS.SpanOperator} location the location of the feature
     * @param {string} [merge_op] the merge operator - overwritten unless
     * location is a SpanOperator
     */
    seqJS.FeatureLocation = function(location, merge_op){
        var _sl;
        if(typeof location === 'string' || location instanceof String){
            try{
                //test for mixed merge operations
                var o = location.indexOf('order') >= 0,
                    j = location.indexOf('join') >= 0;
                merge_op = o ? 'order': 'join';
                if(o && j){
                    throw("Mixing merge operators is not valid");
                }
                //parse location
                _sl = new seqJS.SpanOperator(location);
            }
            catch(e){
                throw(e + " while parsing location string \'"+location+"\'");
            }
        }
        else{
            _sl = location;
            merge_op = merge_op || 'join';
            if(merge_op !== 'join' && merge_op !== 'order'){
                throw("merge_op must be \'join\' or \'order\', not \'"+merge_op+"\'");
            }
        }

        /**
         * Get a Genbank style string representation of the location
         * @returns {string} String representation
         */
        this.toGenbankString = function(){
            return _sl.toGenbankString().replace(/merge/g, merge_op);
        };

        /** Get the merge operator, 'join' or 'order'
         * @returns {string}
         */
        this.getMergeOperator = function(){
            return merge_op;
        };

        /** Get a 0-string representation of the FeatureLocation for debugging
         * @param {int} [indent=0] How much to indent the string. If indent < 0
         * then use compressed notation.
         * @returns {string}
         */
        this.toString = function(indent) {
            indent = indent || 0;
            var n_indent = indent < 0 ? indent : indent + 1;
            var tabs = new Array(Math.abs(indent + 1)).join('\t');
            var ret = tabs + 
                (indent < 0 ? 'FL(\'' : 'FeatureLocation(\'') +
                    merge_op + '\', \n' +
                    _sl.toString(n_indent) + '\n' + tabs + ')';
            if(indent < 0){
                return ret.replace(/\n/g, '').replace(/\t/g, '');
            }
            return ret;
        };

        /**
         * Return a list of {@link seqJS.Span}s in the approptiate order
         * @returns {Array.<seqJS.Span>} An array of spans
         */
        this.getSpans = function() {
            return _sl.getSpans();
        };

        /** Does this location overlap with a span or range of locations?
         * @param {seqJS.FeatureLocation|Number} rhs the span or integer start
         * point
         * @param {Number} [b=rhs] integer end point
         * @returns {boolean} true if there is overlap
         */
        this.overlaps = function(rhs, b){
            var sl;
            if(typeof(rhs) === 'number'){
                sl = [new seqJS.Span(rhs, b || (rhs+1))];
            }
            else {
                sl = rhs.getSpans();
            }
            return sl.some(function(i){return _sl.overlaps(i);});
        };

        /**
         * Return the lowest point in the feature
         * @returns {int} the starting point
         */
        this.start = function() {
            var i = 0,
                s = this.getSpans(),
                m = s[0].left().toInt();
            for(;i < s.length; i++){
                if(s[i].left().toInt() < m){
                    m = s[i].left().toInt();
                }
            }
            return m;
        };

        /**
         * Return the highest point in the feature
         * @returns {int} the ending point
         */
        this.end = function() {
            var i = 0,
                s = this.getSpans(),
                m = s[0].right().toInt();
            for(;i < s.length; i++){
                if(s[i].right().toInt() > m){
                    m = s[i].right().toInt();
                }
            }
            return m;
        };

        /**
         * Return a FeatureLocation which has been offset by the given amount
         * @param {int} offset the offset
         * @returns {seqJS.FeatureLocation} the new location
         */
        this.offset = function(o){
            return new seqJS.FeatureLocation(_sl.offset(o), merge_op);
        };

        /** Return the length of the sequence that the feature refers to
         * @returns {int} sequence length
         */
        this.length = function(){
            return _sl.length();
        };

        /** Return a new FeatureLocation which has been cropped to rhs
         * @param {seqJS.FeatureLocation} rhs The FeatureLocation to crop to
         * @returns {seqJS.FeatureLocation} the new feature location
         */
        this.crop = function(rhs) {
            //for each span in rhs
            var len = 0,
                _items = rhs.getSpans().map(function(span){
                    //return a cropped SpanOperator
                    return _sl.crop(span.left(), 
                                    span.right(), 
                                    span.isComplement());
                })
                .filter(function(x) {return x!==null;})
                .map(function(x) {
                    var r = x.offset(len);
                    len = len + x.length();
                    return r;
                });
            //if nothing overlaps
            if(_items.length === 0){
                return null;
            }
            if(_items.length === 1){
                return new seqJS.FeatureLocation(_items[0]);
            }
            if(_items.length > 1){
                return new seqJS.FeatureLocation(new seqJS.SpanOperator(
                    _items, 'merge'),
                    rhs.getMergeOperator());
            }
        };

        /** Return a new FeatureLocation with an inverted datum
         * @returns {seqJS.FeatureLocation} the new feature location
         */
        this.invertDatum = function(l){
            return new seqJS.FeatureLocation(_sl.invertDatum(l));
        };
    };
    
    /**  Store information about a feature
     *      - type: the feature type -- gene, CDS, etc.
     *      - location: feature location -- either a FeatureLocation object or
     *          string from which one will be built
     *      - qualifiers: dictionary Object of qualifiers to be stored with the
     *          feature
     *
     * @constructor
     * @param {string} _type the Feature type (e.g. 'gene', 'CDS', ...)
     * @param {seqJS.FeatureLocation|string} _location The feature's location, either
     * as a string in genbank format (e.g. 1..50) or a 
     * {@link seqJS.FeatureLocation} object
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


        /** Get or set the feature type
         * @param {string} [new_type] if given, this is the new type
         * @returns {string|seqJS.Feature} return the type if there are no
         * arguments or this if a new_type is given
         */
        this.type = function(new_type) {
            if(new_type){
                _type = new_type;
                return self;
            }
            return _type;
        };

        /** Get or set the location
         * @param {string|seqJS.FeatureLocation} [new_location] If given, this
         * is the new location
         * @returns {seqJS.FeatureLocation|seqJS.Feature} returns this if a
         * new_location is given, otherwise returns the location
         */
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

        /** Get or set a feature qualifier
         * @param {string} key The qualifier name
         * @param {string} [value] The new qualifier value
         * @returns {seqJS.Feature|string} return the qualifier value if no
         * value is give, otherwise return this
         */
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

        /** Remove a feature qualifier
         * @param {string|Array(string)} [to_remove] the qualifier (or qualifiers
         * if an Array) to remove. Removes all qualifiers if to_remove is
         * omitted
         * @returns {seqJS.Feature} this
         */
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
            return this;
        };

        /** Get an array of all qualifiers
         * @returns {Array(string)} an Array of qualifier keys
         */
        this.qualifierKeys = function() {
            return q_keys;
        };

        /** Does the feature overlap with a second feature. 
         * @param {seqJS.Feature|int} rhs Either the feature to compare with or
         * the first integer position
         * @param {int} [b] optional second integer position
         * @returns {boolean} Whether or not the features overlap
         */
        this.overlaps = function(rhs, b) {
            if(typeof(rhs.location) === 'function'){
                return _location.overlaps(rhs.location());
            }
            return _location.overlaps(rhs,b);
        };

        /** Return a new {@link seqJS.Feature} which is a cropped version of
         * this one. If left is a seqJS.Feature then the other arguments are
         * ignored
         * @param {seqJS.Feature|seqJS.Location|int} left The position to start cropping
         * @param {seqJS.Location|int} [right] The position to end cropping
         * @param {bool} [complement=false] Whether or not to complement the Feature
         * @returns {seqJS.Feature} The cropped Feature
         */
        this.crop = function(left, right, c){
            //duplicate type and qualifiers, crop location
            var ret;
            c = (c===undefined) ? false : c;
            if(left.location instanceof Function){
                ret = new seqJS.Feature(this.type(), _location.crop(left));
            }
            else{
                ret = new seqJS.Feature(this.type(), 
                    _location.crop(new seqJS.SpanOperator(
                                [new seqJS.Span(left,right)],
                                (c) ? 'complement' : '')));
            }
            copy_qualifiers(ret);
            return ret;
        };

        /** Return a new seqJS.Feature which has been offset by the given
         * amount
         * @param {int} offset the amount to offset by
         * @return {seqJS.Feature} the new seqJS.Feature
         */
        this.offset = function(o){
            var r = new seqJS.Feature(this.type(), _location.offset(o));
            copy_qualifiers(r);
            return r;
        };

        /** Get a string representation of the Feature for debugging
         * @param {int} [indent=0] How much to indent the string. If indent < 0
         * then use compressed notation.
         * @returns {string} the string
         */
        this.toString = function(indent) {
            indent = indent || 0;
            return (indent < 0 ? 'F(\'' : 'Feature(\'') + this.type() + 
                '\', ' + this.location().toString(indent) + ')';
        };

        /** Return a new Feature which is indexed from the other end of the
         * molecule
         * @returns {seqJS.Feature} the new location
         */
        this.invertDatum = function(l){
            var f = new seqJS.Feature(_type, _location.invertDatum(l));
            copy_qualifiers(f);
            return f;
        };

        var copy_qualifiers = function(rhs){
            var i, k;
            for(i=0; i < q_keys.length; i++){
                k = q_keys[i];
                rhs.qualifier(k, qualifiers[k]);
            }
        };

        init();
    };


}());
