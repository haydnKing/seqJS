/* global console:true */
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
        DNA: /^[ACGT]+$/,
        aDNA: /^[ACGTRYSWKMBDHVN]+$/,
        RNA: /^[ACGU]+$/,
        aRNA: /^[ACGURYSWKMBDHVN]+$/,
        PROT: /^[ACDEFGHIKLMNPQRSTVWY]+$/,
        aPROT: /^[ACDEFGHIKLMNPQRSTVWYBXZ]+$/
    };
    /** An object representing a biological sequence
     * @constructor
     * @param {string} _seq the sequence as a string
     * @param {string} _alphabet the alphabet, one of {@link seqJS.Alphabets}
     * @param {Array} [_features=new Array()] an array of {@link seqJS.Feature} objects referring to
     * the sequence
     * @param {string} [_topology='linear'] sequence topology, 'linear' or
     * 'circular'
     * @param {string} [_length_unit=taken from alphabet] the length unit of
     * the sequence, one of 'bp', 'aa' or 'rc'
     * @param {string} [_strand_type=''] type of strand, e.g. 'ss', 'ds'.
     * default is '' - unknown
     * @param {string} [_residue_type=''] type of each residue e.g. 'DNA',
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
         * @returns {seqJS.Seq} The sub-sequence
         */
        this.subseq = function(start, end, complement) {
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
            var s = new seqJS.Seq(this.seq().substring(start, end), 
                                  this.alphabet(),
                                  this.features(start, end),
                                  'linear',
                                  this.lengthUnit(),
                                  this.strandType(),
                                  this.residueType());
            if(complement){
                s.reverseComplement();
            }
            return s;
        };
        /** Perform a reverse complement on the seq
         * @returns {seqJS.Seq} this
         */
        this.reverseComplement = function(){
            if(this.alphabet() !== 'DNA'){
                throw "Can only reverse complement DNA";
            }

            var replace = {'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G'};
            _seq = _seq.split('')
                       .reverse()
                       .map(function(c){return replace[c];})
                       .join('');

            //TODO: Reverse complement features
            

            return this;
            
        };
        /** Append a sequence to the end of the sequence
         * @param {seqJS.Seq} rhs A linear sequence
         * @returns {seqJS.Seq} this
         */
        this.append = function(rhs){
            if(this.alphabet() === rhs.alphabet() &&
               this.topology() === 'linear' &&
               rhs.topology() === 'linear'){
                _seq = _seq + rhs.seq();
                //TODO: append features with an offset
                
                return this;
            }
            throw "Could not join sequences";
        };

        /** Extract the sequence that the feature refers to
         * TODO: find out which features should be kept
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
            var s, i, j, _s,
                subfeats = [], 
                i_span, i_feat,
                spans = feat.location().getSpans();

            //If we want features, choose them and extract them
            if(ef){
                console.log('#######################\nextract('+feat+')');
                _s = _features.filter(feat.overlaps, feat);
                for(i=0; i < spans.length; i++){
                    i_span = spans[i];
                    for(j=0; j < _s.length; j++){
                        i_feat = _s[j];
                        subfeats.push(i_feat.crop(i_span.left(), i_span.right(), i_span.isComplement()));
                    }
                }
            }
            s = new seqJS.Seq('', 
                              this.alphabet(),
                              subfeats,
                              'linear',
                              this.lengthUnit(),
                              this.strandType(),
                              this.residueType());
            
            for(i = 0; i < spans.length; i++){
                i_span = spans[i];
                s.append(this.subseq(i_span.left(), i_span.right(), i_span.isComplement())); 
            }

            return s;
        };

    };

    var loc_fmt = /(?:^([<>]?)(\d+)$)|(?:^(\d+)\.(\d+)$)/;
 
    /** Represent a single location as either and exact base (''), before a
     *  specific base ('<'), after a specific base ('>') or between two specific
     *  bases ('A.B').
     *  If location is passed as a string, it is assumed to be 'biologist
     *  style' (i.e. 1-offset), if passed as an integer it is assumed to be
     *  0-offset
     * @constructor
     * @param {string|number} _location Either a 1-offset string specifying the
     * location in genbank style or a 0-offset integer defining the first 
     * location
     * @param {string} [_operator=''] The operator which applies, either '', '<', 
     * '.', or '>'. This parameter can only be given if _location is an
     * integer. If _operator is given as '.', then _location2 is required
     * @param {number} [_location2] The second location, used only when
     * representing locations which are between two points, e.g 100.200
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
                rhs = (rhs.operator === '.') ? rhs.location2() : rhs.location();
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
        this.toString = function() {
            if(_operator === '.'){
                return (_location + 1) + '.' + (_location2);
            }
            return _operator + (_location + 1);
        };

        /** Convert the location to an integer. By default just return the
         * first location
         * @returns {int} location as integer
         */
        this.toInt = function() {
            return this.location();
        };

        /** Return a new Location with an added offset
         * @param {int} offset the amount to add
         * @returns {seqJS.Location} the new location
         */
        this.add = function(o) {
            if (_location + o > 0){
                return new seqJS.Location(_location + o, _operator,
                            (_operator === '.' ? _location2 + o : undefined));
            }
            else {
                throw "location cannot be negative";
            }
        };

        /** Return a new Location with an subtracted offset
         * @param {int} offset the amount to subtract
         * @returns {seqJS.Location} the new location
         */
        this.subtract = function(o) {
            return this.add(-o);
        };

        /** Return a seqJS.Location with an inverted datum - 
         * the location will now be measured from the far end of the sequence
         * @param {int} length the length of the sequence
         * @returns this
         */
        this.invertDatum = function(l) {
            console.log('>\t'+this+'.invertDatum('+l+')');
            var s;
            var op = {'': '', '<': '>', '>': '<', '.': '.'};
            if(_operator !== '.'){
                //invert location and operator
                s = new seqJS.Location(l - _location - 1, op[_operator]);
                console.log('>\tA'+s);
                return s;
            }
            //else (_operator === '.')
            //if _location2 exists, we also need to swap the locations
            // such that _location < _location2
            s = new seqJS.Location(l - _location2,
                                      '.',
                                      l - _location);
            console.log('>\tB'+s);
            return s;
        };

        /** return a cropped location such that it is in the range [start,end)
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
                _l2 = c(_l2);
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
     *  @param {boolean} [complement=false] true if the span is on the reverse strand
     */
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
            //Genbank stores locations as being inclusive
            _location2 = new seqJS.Location(m[2]).add(1);
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
            if(_location1.gte(rhs.right()) ||
               _location2.lte(rhs.left()) ){
                return false;
            }
            return true;
        };    

        /** Get a genbank style string representation
         * @returns {string} genbank style string (e.g. 100..200)
         */
        this.toString = function() {
            return _location1.toString() + '..' + _location2.subtract(1).toString();
        };

        /** Returns true if the span is on the reverse strand
         * @returns {boolean} true if we're on the reverse strand
         */
        this.isComplement = function() {
            return complement;
        };
        /** Set the value of the complement flag
         * @param {boolean} value The new complement value
         * @returns {seqJS.Span} this
         */
        this.setComplement = function(value) {
            complement = value;
            return this;
        };

        /** Return a new span which is indexed from the other end of the
         * molecule
         * @param {Number} length The length of the sequence
         * @returns {seqJS.Span} the new span
         */
        this.invertDatum = function(l){
            console.log('>"'+this+'".invertDatum('+(l)+')');
            var s = new seqJS.Span(_location2.invertDatum(l).add(1),
                                  _location1.invertDatum(l).add(1),
                                  !complement);
            console.log('>'+s);
            return s;
        };

        /** Return a new span with offset added to it
         * @param {Number} offset the offset to add
         * @returns {seqJS.Span} the new span
         */
        this.add = function(o){
            return new seqJS.Span(_location1.add(o),
                                  _location2.add(o),
                                  complement);
        };
        /** Return a new span with offset subtracted from it
         * @param {Number} offset the offset to subtract
         * @returns {seqJS.Span} the new span
         */
        this.subtract = function(o){
            return new seqJS.Span(_location1.subtract(o),
                                  _location2.subtract(o),
                                  complement);
        };

        /** Return a new span, cropped to [start,end). If the span doesn't
         * overlap with this range then return undefined
         * @param {seqJS.Location|int} left The start of the range to crop to
         * @param {seqJS.Location|int} right The start of the range to crop to
         * @param {boolean} [complement=false] whether to complement the
         * reuslting span or not 
         * @returns {seqJS.Span|undefined} The new Span
         */
        this.crop = function(left, right, c) {
            console.log('\t\tSpan("'+this+'").crop('+left.toInt()+', '+right.toInt()+', '+c+')');
            if(left.toInt instanceof Function){
                left = left.toInt();
            }
            if(right.toInt instanceof Function){
                right = right.toInt();
            }
            if(left > right){
                throw("seqJS.Span.crop("+right+","+left+"): right must be greater than left");
            }

            c = c || false;
            // if there's no overlap, return null
            if( _location1.gte(right) || _location2.lte(left) ){
                console.log('\t\treturn null');
                return null;
            }

            var sp = new seqJS.Span(_location1.crop(left,right),
                                  _location2.crop(left,right),
                                  (c) ? !complement : complement);
            console.log('\t\treturn '+sp);
            return sp;
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

    /** An operator stores two things
     * 1) a string defining an operation 
     * 2) a list of {@link seqJS.SpanOperator} objects or a single {@link @seqJS.Span} which are acted on by the
     * operator
     * Valid operations are:
     *  - 'complement': Acts on a single Span
     *  - 'join': Merges one or more Spans by 'join'ing them
     *  - 'order': Merges one or more Spans by 'order'ing them
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

        //If we're given a string to parse
        if(typeof(location) === 'string' || location instanceof String){
            var m = operator_fmt.exec(location);
            if(m){
                operator = m[1];
                switch(operator){
                    case 'complement':
                        items.push(new seqJS.SpanOperator(m[2].trim()));
                        break;
                    case 'join':
                    case 'order':
                        var s_items = tokenize(m[2]);
                        for(var i = 0; i < s_items.length; i++){
                            items.push(new seqJS.SpanOperator(s_items[i]));
                        }
                }
            }
            else {
                operator = '';
                //if location string is empty, there are no spans yet
                if(location){
                    items.push(new seqJS.SpanOperator([new seqJS.Span(location)], ''));
                }
            }
        }
        //else, we're given an Array and an operator
        else{
            if(operator === undefined){
                throw("seqJS.SpanOperator: Required argument 'operator' missing");
            }
            items = location;
        }

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
                break;
            default:
                throw("seqJS.SpanOperator: unknown operation '"+operator+"'");
        }

        /** Convert to a genbank style string
         * @returns {string} string representation
         */
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

        /** Add a new span to the list
         * @param {seqJS.Span|seqJS.SpanOperator} span the span (or list) to add
         * @returns {seqJS.SpanOperator} this
         */
        this.push = function(span){
            items.push(span);
            return this;
        };
        
        /** Called by an outer SpanOperator to set whether this should be
         * a complement or not
         * @param {boolean} value Whether or not spans should be on the reverse
         * strand
         */
        this.setComplement = function(value){
            value = value || false;
            if(operator === 'complement'){
                value = !value;
            }
            for(var i = 0; i < items.length; i++){
                items[i].setComplement(value);
            }
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

        /** Get or set the operator
         * @param {string} [op] the new operator
         * @returns {string|seqJS.SpanOperator} the operator or this
         */
        this.operator = function(op){
            if(op){
                operator = op;
                return this;
            }
            return operator;
        };

        /** Test if any of my sub-spans overlap
         * @param {seqJS.Span} rhs the span to test with
         * @returns {boolean} true if overlap
         */
        this.overlaps = function(rhs){
            return items.some(function(i){return i.overlaps(rhs);});
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
            console.log('\tSpanOperator("'+this+'").crop('+left.toInt()+', '+right.toInt()+', '+complement+')');
            var i, s, ret = [];
            for(i=0; i < items.length; i++){
                if(complement && (operator==='' || operator==='complement')){
                    operator = (operator==='') ? 'complement' : '';
                    s = items[i].crop(left, right, false);
                    s = s.invertDatum(right-left);
                }
                else{
                    s = items[i].crop(left, right, complement);
                }
                if(s){ 
                    ret.push(s);
                }
            }
            if(ret.length === 0){
                console.log('\treturn null');
                return null;
            }
            var so;
            if(ret.length === 1 && operator !== 'complement'){
                so = new seqJS.SpanOperator(ret, '');
                console.log('\treturn '+so);
                return so;
            }   
            so = new seqJS.SpanOperator(ret, operator);
            console.log('\treturn '+so);
            return so;
        };

        /** Remove items which are null
         * @returns {seqJS.SpanOperator} this
         */
        this.prune = function(){
            //remove nulls
            items = items.filter(function(x){if(x){return true;}return false;});
            if(operator === 'join' || operator === 'order'){
                items.forEach(function(x){x.prune();});
            }
        };

        /** Return a new spanoperator with an inverted datum
         * @returns {seqJS.SpanOperator} the new span operator
         */
        this.invertDatum = function(l){
            var _items = items.map(function(x){return x.invertDatum(l);});
            return new seqJS.SpanOperator(_items, operator);
        };
    };



    /**
     * FeatureLocation
     *  Store base SpanOperator and provide access to the underlying data
     * @constructor
     * @param {string|seqJS.FeatureLocation} location the location of the feature
     */
    seqJS.FeatureLocation = function(location){
        var _sl;
        if(typeof location === 'string' || location instanceof String){
            try{
                //test for mixed merge operations
                if(location.indexOf('order') >= 0 && location.indexOf('join') >= 0){
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
        }

        //set complement flags on Spans
        _sl.setComplement();

        /**
         * Get a string representation of the location
         * @returns {string} String representation
         */
        this.toString = function(){
            return _sl.toString();
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

        /** Return a new FeatureLocation which has been cropped to [start,end)
         * @param {seqJS.Location|int} left the start of the range to crop to
         * @param {seqJS.Location|int} right the end of the range to crop to
         * @param {boolean} [complement=false] whether or not to complement the
         * returned FeatureLocation
         * @returns {seqJS.FeatureLocation} the new feature location
         */
        this.crop = function(left, right, complement) {
            console.log('FeatureLocation("'+this+'").crop('+left.toInt()+', '+right.toInt()+', '+complement+')');
            var so = _sl.crop(left, right, complement);
            so.prune();
            var f = new seqJS.FeatureLocation(so);
            console.log('return '+f);
            return f;
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
         * this one
         * @param {seqJS.Location|int} left The position to start cropping
         * @param {seqJS.Location|int} right The position to end cropping
         * @param {bool} [complement=false] Whether or not to complement the Feature
         * @returns {seqJS.Feature} The cropped Feature
         */
        this.crop = function(left, right, complement){
            //duplicate type and qualifiers, crop location
            var ret = new seqJS.Feature(this.type(), 
                                        _location.crop(left,right,complement));
            copy_qualifiers(ret);
            return ret;
        };

        /** Get a string representation for debugging
         * @returns {string} the string
         */
        this.toString = function() {
            return '[seqJS.Feature \"'+this.type()+'\",'+
                this.location().toString()+']';
        };

        init();

        var copy_qualifiers = function(rhs){
            var i, k;
            for(i=0; i < q_keys.length; i++){
                k = q_keys[i];
                rhs.qualifier(k, qualifiers[k]);
            }
        };
    };


}());
