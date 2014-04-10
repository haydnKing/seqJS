/* global console:true */
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
        var remaining_data = [], record_cb, self=this, line_num=0;

        this.type = function() {return type;};
        this.parse = function(data){
            try{
                console.log('parse("'+data.replace(/\n/g,'\\n')+'")');
                var lines = (remaining_data + data).split('\n');
                //last item isn't a full line
                remaining_data = lines[lines.length-1];
                lines.splice(-1,1);
                var consumed = self._parse_lines(lines);
                remaining_data = lines.slice(consumed).concat(remaining_data).join('\n');
                line_num += consumed;
            }
            catch (e) {
                if(e instanceof Array){
                    throw {
                        line_num: e[0] + line_num,
                        msg: e[1],
                        line: lines[e[0]],
                        toString: function(){
                            return "Line "+this.line_num+": "+this.msg+"  \""+
                                this.line + "\"";
                        }
                    };
                }
                throw e;
            }
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
        Parser.call(this);
        var self = this, comments =['#', ';', '%', '/'] ;
        var S_LOCUS = 0, S_HDR = 1, S_FT = 2, S_SEQ = 3;
        var state = S_LOCUS, c_line, c_data = null;

        var keymap = {
            DEFINITION: 'desc'
        };

        var refmap = {
            AUTHORS: 'authors',
            CONSRTM: 'consortium',
            TITLE: 'title',
            JOURNAL: 'journal',
            MEDLINE: 'medline',
            PUBMED: 'pubmed',
            COMMENT: 'comment'
        };


        var LOCUS = /LOCUS       (\S+)\s+(\d+)\s(bp|aa|rc)\s+(ss-|ds-|ms-)?(DNA|RNA|tRNA|mRNA|uRNA|snRNA|cRNA)?\s+(linear|circular)?\s+(\w{3})\s+(\d{1,2}-\w{3}-\d{4})/;

        this.type = function() {return 'gb';};

        this._parse_lines = function(lines){
            console.log('  _parse_lines(['+lines+'])');
            c_line = 0;
            var more = lines.length > c_line;
            while(more){
                switch(state){
                    case S_LOCUS:
                        more = self._find_locus(lines);
                        if(more){
                            c_data = {
                                seq: '',
                                features: [],
                                annotations: {
                                    references: []
                            }};
                            more = self._parse_locus(lines);
                        }
                        break;
                    case S_HDR:
                        more = self._parse_hdr(lines);
                        break;
                    case S_FT:
                        more = self._parse_ft(lines);
                        break;
                    case S_SEQ:
                        more = self._parse_seq(lines);
                        break;
                }
            }
            console.log('  -> '+c_line);
            return c_line;
        };

        this._find_locus = function(lines){
            var line;
            while(c_line < lines.length){
                line = lines[c_line].trim();
                //if line is a locus line
                if(line.substr(0,12) === 'LOCUS       '){
                    return true;
                }
                //if line is blank or comment
                else if((line === '') || (comments.indexOf(line[0]) > -1)){
                    c_line++;
                }
                else{
                    throw [c_line, "Expected a LOCUS line"];
                }
            }
            return false;
        };

        this._parse_locus = function(lines){
            var line = lines[c_line];

            var m = LOCUS.exec(line);
            if(m){
                c_data.name = m[1];
                c_data.length = parseInt(m[2],10);
                c_data.annotations.strand_type = m[4] || '';
                c_data.annotations.residue_type = m[5] || '';
                c_data.annotations.topology = m[6] || 'linear';
                c_data.annotations.data_division = m[7];
                c_data.annotations.date = m[8];
                
                state = S_HDR;
            }
            else{
                throw [c_line, 'Badly formatted LOCUS line "'+line+'"'];
            }

            c_line++;
            return c_line < lines.length;
        };

        this._parse_hdr = function(lines){
            var c_key, c_val, lline, rline, s_line = c_line;
            while(c_line < lines.length){
                lline = lines[c_line].substring(0,12);
                rline = lines[c_line].substring(12);
                //continue an annotation
                if(lline === '            '){
                    if(!c_key){
                        throw [c_line, 'Expected key while parsing header'];
                    }
                    c_val.push(rline);
                }
                //or start a new one
                else {
                    //save the old annotation
                    if(c_key){
                        self._save_annotation(c_key, c_val);
                    }
                    c_key = lline.trim();
                    c_val = [rline];
                    //save where we got to
                    s_line = c_line;
                }

                //if we've reached the FT
                if(c_key === 'FEATURES'){
                    state = S_FT;
                    c_line++;
                    return c_line < lines.length;
                }
                
                
                c_line++;
            }
            //we didn't get to the end of the current annotation - backtrack
            //and try again in the next chunk
            c_line = s_line;
            return false;
        };

        this._save_annotation = function(key, value) {
            var l, m, m2;
            if(keymap[key]){
                c_data[keymap[key]] = value.join(' ');
            }
            else if(refmap[key]){
                l = c_data.annotations.references.length;
                if(l === 0){
                    throw [c_line, "Key "+key+" found before REFERENCE"];
                }
                var v = value.join(' ');
                m = parseInt(v,10);
                if(!isNaN(m)){
                    v = m;
                }
                c_data.annotations.references[l-1][refmap[key]] = v;
            }
            switch(key){
                case 'REFERENCE':
                    value = value.join(' ');
                    l = [];
                    m = /(\d+)\s+\(\w+ (.+)\)/.exec(value);
                    if(m){
                        l = m[2].split(';').map(function(v){
                            m2 = /(\d+) to (\d+)/.exec(v);
                            if(m2){
                                return [parseInt(m2[1],10), parseInt(m2[2],10)];
                            }
                            else{
                                throw [c_line, "Badly formatted REFERENCE"];
                            }
                        });
                    }
                    else {
                        throw [c_line, "Badly formatted REFERENCE"];
                    }
                    c_data.annotations.references.push({
                        location: l
                    });
                    break;
                case 'VERSION':
                    //version line should be formatted 
                    //      ACCESSION.version [GI:gi]
                    m = /(\S+)\.(\d+)(?:\s+GI:(\d+))?/.exec(value.join(' '));
                    if(m){
                        c_data.annotations['accession'] = m[1];
                        c_data.annotations['version'] = m[2];
                        c_data.annotations['gi'] = m[3];
                    }
                    else {
                        c_data.annotations['version'] = value.join(' ');
                    }
                    break;
                case 'ORGANISM':
                    //ORGANISM line - organism name \n taxonomy.
                    c_data.annotations.organism = value[0];
                    var a = value.slice(1).join(' ').trim();
                    if(a[a.length-1] === '.'){
                        a = a.slice(0, a.length-1);
                    }
                    c_data.annotations.taxonomy = a.split(';').map(function(v){
                        return v.trim();
                    });
                    break;
                default: 
                    c_data.annotations[key.toLowerCase()] = value.join(' ');
            }

        };

        this._parse_ft = function(lines){
            var s_line = c_line;
            var line_l='', line_r='', c_feat, next_l, next_r, m;

            while(c_line < lines.length){

                next_l = lines[c_line].substr(0,21).trim();
                next_r = lines[c_line].substr(21);

                //If there's a new line
                if(next_l || next_r[0] === '/'){
                    //current line is complete
                    
                    //if a new feature starts
                    if(line_l || !c_feat){
                        //save old feature
                        if(c_feat){
                            c_data.features.push(c_feat);
                        }
                        if(!line_l){
                            throw [c_line, 'Feature must have a type'];
                        }
                        //make a new one
                        try{
                            c_feat = new seqJS.Feature(line_l, line_r);
                        }
                        catch(e) {
                            throw [c_line, 'Couldn\'t parse feature: ' + e];
                        }
                    }
                    //else if there's a new qualifier
                    else {
                        if(m = /\/(\w+)="(.+)"/.exec(line_r)){
                            c_feat.qualifier(m[1], m[2]);
                        }
                        else if(m = /\/(\w+)=(\d+(?:\.\d+)?)$/.exec(line_r)){
                            c_feat.qualifier(m[1], parseInt(m[2], 10));
                        }
                    }

                    //move to next line
                    line_l = next_l;
                    line_r = next_r;
                }
                else{
                    //next_l continues from this line
                    line_r = line_r + next_r;
                }
              

                c_line++;
            }
            //We ran out of data during the last feature
            //back up to the start of the feature
            c_line = s_line;
            return false;
        };


        this._parse_seq = function(lines){
            var line, i, rt = (c_data.annotations.residue_type || '').toUpperCase();
            if(rt.indexOf('DNA') > -1){
                c_data.alphabet = 'DNA';
            }
            else if(rt.indexOf('RNA') > -1){
                c_data.alphabet = 'RNA';
            }
            else {
                c_data.alphabet = 'PROT';
            }
            var letters = seqJS.Letters[c_data.alphabet];

            while(c_line < lines.length){
                line = lines[c_line];

                if(line.trim() === '//'){
                    state = S_LOCUS;
                    self._build_record();
                    c_line++;
                    return c_line < lines.length;
                }
                
                line = line.substr(10).replace(/ /g, '').toUpperCase();
                //checkLetters
                for(i = 0; i < line.length; i++){
                    if(letters.indexOf(line[i]) < 0){
                        //check for ambiguous
                        if(c_data.alphabet[0] !== 'a'){
                            c_data.alphabet = 'a' + c_data.alphabet;
                            letters = seqJS.Letters[c_data.alphabet];
                            i = i-1;
                            continue;
                        }
                        throw [c_line, "Invalid character '"+line[i]+"'"];
                    }
                }
                c_data.seq = c_data.seq + line;
                c_line++;
            }
            return c_line < lines.length;
        };

        this._build_record = function(){
            var seq = new seqJS.Seq(c_data.seq, 
                                    c_data.alphabet, 
                                    c_data.features);

            var r = new seqJS.Record(seq, 0, c_data.name, c_data.desc, c_data.annotations);

            self._triggerRecordCb(r);
        };
            

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

