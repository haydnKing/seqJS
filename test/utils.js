/* global gbrecord_eq:true, seqJS:true */
/* jshint unused:false */

var test_parse = function(data, format){
    return function() {
        var records = seqJS.read(data.input, format);
        gbrecord_eq(records[0], data.object);
    };
};

var test_chunk_parse = function(data, format, chunk_size){
    chunk_size = chunk_size || 64;
    return function() {
        var parser = seqJS.getParser(format);
        parser.setRecordCb(function(record){
            gbrecord_eq(record, data.object);
            start();
        });

        for(var i=0; i < data.input.length; i+=chunk_size){
            parser.parse(data.input.substr(i,chunk_size));
        }
        parser.flush();

    };
};

var compare_file = function(actual, expected){

    var a = actual.split('\n'),
        e = expected.split('\n');

    var msg = 'Number of lines is wrong';
    if(a.length > e.length){
        msg += ' -- extra lines:\n' + a.slice(e.length).join('\n');
    }
    equal(a.length, e.length, msg);

    var t;
    for(var i = 0; i < Math.min(a.length, e.length); i++){
        t = (a[i] === e[i]);
        ok(t, "Line "+i+" is wrong\n\tExpected: \""+e[i]+"\"\n\tActual  : \""+a[i]+"\"");
        if(!t) {break;}
    }
};

var test_write = function(data, format){
    return function(){
        var records = seqJS.read(data.input, format);
        var output = seqJS.write(records[0], format);

        if(data.output !== undefined){
            compare_file(output, data.output);
        }
        else {
            compare_file(output, data.input);
        }
    };
    
};

var test_format = function(valid_data, format, name){

    module('seqJS#'+name+'Parser');
        var test_num;

        for(test_num=0; test_num < valid_data.length; test_num++)
        {
            test('parse valid ' + test_num, 
                 test_parse(valid_data[test_num], format));
        }

        for(test_num=0; test_num < valid_data.length; test_num++)
        {
            asyncTest('chunk parse valid ' + test_num, 
                      test_chunk_parse(valid_data[test_num], format));
        }

        test('parse all records', function() {
            var joined_data = '';
            for(test_num=0; test_num < valid_data.length; test_num++)
            {
                joined_data = joined_data + '\n' + valid_data[test_num].input;
            }

            var records = seqJS.read(joined_data, format);
            for(test_num=0; test_num < valid_data.length; test_num++)
            {
                gbrecord_eq(records[test_num], valid_data[test_num].object);
            }
        });


    module('seqJS#'+name+'Writer');

        for(test_num=0; test_num < valid_data.length; test_num++)
        {
            test('parse/write entire record ' + test_num, 
                      test_write(valid_data[test_num], format));
        }

};