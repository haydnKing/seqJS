/*
 * seqJS
 * https://github.com/haydnKing/seqJS
 *
 * Copyright (c) 2014 Haydn King
 * Licensed under the MIT license.
 */

var seqJS = seqJS || {};

(function(){

    var pad_l = function(str, val){
        if(str.length > val){
            return str.substring(0,val);
        }
        return spaces(val - str.length) + str;
    };
    var pad_r = function(str, val){
        if(str.length > val){
            return str.substring(0,val);
        }
        return str + spaces(val - str.length);
    };
    var spaces = function(val){
        var r = '';
        for(var i = 0; i < val; i++){
            r += ' ';
        }
        return r;
    };
    var word_wrap = function(line, max_len, wrap){
        wrap = wrap || '\n';
        var lines = [],
            i,
            l = '',
            s = line.match(/[^ ,\.]*(?:[ ,\.]|$)/g),
            w;

        for(i = 0; i < s.length; i++){
            w = s[i];
            while((l.length+w.trim().length) >= max_len){
                if(l){
                    lines.push(l.trim());
                    l = '';
                }
                else{
                    lines.push(w.substring(0,max_len));
                    w = w.substring(max_len);
                }
            }
            l += w;
        }
        lines.push(l);
        return lines.join(wrap);
    };

    var writers = {};

    var gb_write = function(record){
        var get_date = function(){
            var d = new Date();
            return d.getDate().toString() + '-' + [
                'JAN',
                'FEB',
                'MAR',
                'APR',
                'MAY',
                'JUN',
                'JUL',
                'AUG',
                'SEP',
                'OCT',
                'NOV',
                'DEC'][d.getMonth()] + '-' + d.getFullYear().toString();
        };



        var write_locus = function(record){
            var ra = record.annotation,
                rs = record.seq(),
                name = record.name(),
                len = record.length().toString();
            if((name.length + len.length) >= 28){
                name = name.substr(0, 27 - len.length);
            }
            return "LOCUS       " +
              name + ' ' + 
              pad_l(len, 27 - name.length) +
              ' ' + record.seq().lengthUnit() + ' ' +
              pad_l( (rs.strandType() ? (rs.strandType()+'-') : ''), 3) + ' ' + 
              pad_r(rs.residueType() || '', 7) +
              pad_r( (rs.topology() === 'circular') ? 'circular' : 'linear', 8) +
              ' ' + (ra('data_division') || 'SYN') +
              ' ' + (ra('date') || get_date()) + '\n'; 
        };

        var write_annotation = function(key, value, indent){
            indent = indent || false;
            value = (value || '.').toString();

            return pad_r( (indent ? '  ' : '') + key.toUpperCase(), 11) + 
                ' ' + word_wrap(value,68,'\n            ') + '\n';
        };

        var write_reference = function(num, ref){

            var l = [],
                keys = ['authors','title','journal','medline',' pubmed'];
            for(var i in ref.location){
                l.push(ref.location[i].join(' to '));
            }
            l = l.join('; ');

            var r = write_annotation('reference', (num+1).toString() + '  (' +
                (record.seq().lengthUnit() === 'bp' ? 'bases' : 'residues') + ' ' +
                l + ')');

            for(i in keys){
                if(ref[keys[i].trim()]){
                    r += write_annotation(keys[i], ref[keys[i].trim()], true);
                }
            }

            return r;
        };


        var write_annotations = function(r){
            var ra = r.annotation,i,
                annots = r.listAnnotations(),
                exclude = ['accession', 'version', 'keywords', 'source', 
                    'organism', 'data_division', 'topology', 'strand_type', 
                    'residue_type',
                    'date', 'definition', 'gi', 'dbsource',
                    'authors', 'title', 'journal', 'pubmed', 'medline'],
                ret = write_annotation('definition', record.desc()) + 
                write_annotation('accession', ra('accession') || '0') + 
                write_annotation('version', (ra('accession') || '0') + '.' + 
                    (ra('version') || '0') + '  GI:' + (ra('gi') || '0')) +
                ((ra('dbsource') === undefined) ? 
                    '' : write_annotation('dbsource',ra('dbsource'))) + 
                write_annotation('keywords', ra('keywords')) + 
                write_annotation('source', ra('source')) + 
                write_annotation('organism', ra('organism'), true) + 
                write_annotation('', ra('taxonomy').join('; ') + '.');


            for(i =0; i < ra('references').length; i++){
                ret += write_reference(i, ra('references')[i]);
            }

            //add non-standard annotations
            for(i in annots){
                if(exclude.indexOf(annots[i]) < 0){
                    if(typeof(ra(annots[i])) === 'string' || ra(annots[i]) instanceof String){
                        ret += write_annotation(annots[i], ra(annots[i]));
                    }
                }
            }

            return ret;
        };

        var write_feature = function(f){
            var i,q,v,qk = f.qualifierKeys(),
                ret = '     ' + pad_r(f.type(),15) + ' ' + 
                f.location().toGenbankString() + '\n';

            for(i in qk){
                v = f.qualifier(qk[i]);
                if(typeof(v) === 'string' || v instanceof String){
                    q = word_wrap('/' + qk[i] + '="'+v+'"',58);
                }
                else
                {
                    q = '/'+qk[i]+'='+v.toString();
                }

                ret += '                     ' + 
                    q.split('\n').join('\n                     ') + '\n'; 
            }

            return ret;
        };

        var write_features = function(r){

            var ret = 'FEATURES             Location/Qualifiers\n',
                i, fs = r.seq().features();

            for(i = 0; i < fs.length; i++){
                ret += write_feature(fs[i]);
            }

            return ret;
        };

        var write_sequence = function(r){
            var o = "ORIGIN\n",
                p,
                s = r.seq().seq();

            for(p=0; p < s.length; p += 60)
            {
                o += pad_l((p+1).toString(), 9) + ' ' + 
                     s.substr(p,60)
                        .toLowerCase()
                        .replace(/(.{10})/g, '$1 ')
                        .trim() +
                     '\n';
            }

            return o;
        };

        return write_locus(record) + 
            write_annotations(record) +
            write_features(record) +
            write_sequence(record) + 
            '//\n';
    };

    writers['gb'] = writers['genbank'] = gb_write;


    var fasta_write = function(record){

        return  '>' + record.name() + 
                ((record.desc() === '') ? '' : (' ' + record.desc())) +
                '\n' +
                word_wrap(record.seq().seq(), 70);

    };
    writers['fa'] = writers['fas'] = writers['fasta'] = fasta_write;


    /** Write a record to a string in the specified format and return the string
     *  @param {seqJS.Record} record The record to write
     *  @param {string} format The format to use - e.g. 'gb' or 'fasta'
     *  @returns {string} The record formatted according to format
     */
    seqJS.write = function(record, format){
        if(Object.keys(writers).indexOf(format) > -1){
            return writers[format](record);
        }
        else {
            throw "Unknown format \'"+format+"\'. Known formats are " + 
                Object.keys(writers).join(', ') + '.';
        }
    };

}());

