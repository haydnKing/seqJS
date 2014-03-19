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
        Parser.call(this);
        var self = this, comments =['#', ';', '%', '/'] ;
        var S_LOCUS = 0, S_HDR = 1, S_FT = 2, S_SEQ = 3;
        var state = S_LOCUS, c_line, c_data = null;

        var keymap = {
            DEFINITION: 'desc'
        };

        var annmap = {
            ACCESSION: 'accession',
            NID: 'NID',
            PID: 'PID',
            DBSOURCE: 'db_source',
            KEYWORDS: 'keywords',
            SEGMENT: 'segment',
            SOURCE: 'source',
            ORGANISM: 'organism',
            COMMENT: 'comment',
            VERSION: 'version',
            PROJECT: 'project',
            DBLINK: 'db_link'
        };

        var refmap = {
            AUTHORS: 'authors',
            CONSRTM: 'consortium',
            TITLE: 'title',
            JOURNAL: 'journal',
            MEDLINE: 'medline',
            PUBMED: 'pubmed',
            REMARK: 'remark'
        };


        var LOCUS = /LOCUS       (\S+)\s+(\d+)\s(bp|aa|rc)\s+((?:ss-|ds-|ms)?(?:DNA|RNA|tRNA|mRNA|uRNA|snRNA|cRNA))?\s+(linear|circular)?\s+(\w{3})\s+(\d{1,2}-\w{3}-\d{4})/;

        this.type = function() {return 'gb';};

        this._parse_lines = function(lines){
            c_line = 0;
            var more = true;
            while(more){
                switch(state){
                    case S_LOCUS:
                        more = self._find_locus(lines);
                        c_data = {};
                        more = self._parse_locus(lines);
                        break;
                    case S_HDR:
                        more = self._parse_hdr(lines);
                        break;
                    case S_FT:
                        state = S_SEQ;
                        break;
                    case S_SEQ:
                        self._build_record();
                        state = S_LOCUS;
                        break;
                }
            }


        };

        this._find_locus = function(lines){
            var line;
            while(c_line < lines.length){
                line = lines[c_line];
                //if line is a locus line
                if(line.substr(0,12) === 'LOCUS       '){
                    return true;
                }
                //if line is a comment
                else if(comments.indexOf(line.trim()[0]) > -1){
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
                c_data.unit = m[3];
                c_data.residue = m[4];
                c_data.topology = m[5] || 'linear';
                c_data.division = m[6];
                c_data.date = m[7];
                
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
            c_data.annotations = c_data.annotations || {references:[]};
            while(c_line < lines.length){
                lline = lines[c_line].substring(0,12);
                rline = lines[c_line].substring(12);
                //continue an annotation
                if(lline === '            '){
                    if(!c_key){
                        throw [c_line, 'Expected key while parsing header'];
                    }
                    c_val = c_val + rline;
                }
                //or start a new one
                else {
                    //save the old annotation
                    if(c_key){
                        self._save_annotation(c_key, c_val);
                    }
                    c_key = lline.trim();
                    c_val = rline;
                    //save where we got to
                    s_line = c_line;
                }

                //if we've reached the FT
                if(c_key === 'FEATURES'){
                    state = S_FT;
                    return true;
                }
                
                
                c_line++;
            }
            //we didn't get to the end of the current annotation - backtrack
            //and try again in the next chunk
            c_line = s_line;
            return false;
        };

        this._save_annotation = function(key, value) {
            if(keymap[key]){
                c_data[keymap[key]] = value;
            }
            if(annmap[key]){
                c_data.annotations[annmap[key]] = value;
            }
            else if(refmap[key]){
                var l = c_data.annotations.references.length;
                if(l === 0){
                    throw [c_line, "Key "+key+" found before REFERENCE"];
                }
                c_data.annotations.references[l-1][refmap[key]] = value;
            }
            else if(key === 'REFERENCE'){
                c_data.annotations.references.push({});
            }

        };

        this._parse_ft = function(lines){
            state = S_SEQ;
            return c_line < lines.length;
        };

        this._build_record = function(){
            var seq = new seqJS.Seq('A', seqJS.ALPH_DNA);

            var r = new seqJS.Record(seq, 0, c_data.name,c_data.desc, c_data.annotations);


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

