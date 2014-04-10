/* global seqJS:true, TEST_DATA:true */
/* global gbrecord_eq:true */

(function() {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfequalions)
      stop(increment)
      start(decrement)
    Test equalions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */


module('seqJS#GenbankParser', {
    setup: function() {
       this.parser = seqJS.getParser('genbank');
    }
});

    test('correct Parser', function() {
        var p = seqJS.getParser('gb');
        equal(p.type(), 'gb');

        p = seqJS.getParser('genbank');
        equal(p.type(), 'gb');
    });
  
    var test_parse = function(num){
        return function() {
            this.parser.setRecordCb(function(record){
                gbrecord_eq(record, TEST_DATA.parser_genbank.valid[num].object);
                start();
            });

            this.parser.parse(TEST_DATA.parser_genbank.valid[num].string);
        };
    };

    var test_chunk_parse = function(num, chunk_size){
        chunk_size = chunk_size || 64;
        return function() {
            this.parser.setRecordCb(function(record){
                gbrecord_eq(record, TEST_DATA.parser_genbank.valid[num].object);
                start();
            });

            var d = TEST_DATA.parser_genbank.valid[num].string;
            for(var i=0; i < d.length; i+=chunk_size){
                this.parser.parse(d.substr(i,chunk_size));
            }
        };
    };

    var test_num;

    for(test_num=0; test_num < TEST_DATA.parser_genbank.valid.length; test_num++)
    {
        asyncTest('parse valid ' + test_num, test_parse(test_num));
    }

    for(test_num=0; test_num < TEST_DATA.parser_genbank.valid.length; test_num++)
    {
        asyncTest('chunk parse valid ' + test_num, test_chunk_parse(test_num));
    }



    asyncTest('parse old-style record', function(){
        
        this.parser.setRecordCb(function(record){
            gbrecord_eq(record, TEST_DATA.parser_genbank.valid[0].object);
            start();
        });

        this.parser.parse(TEST_DATA.parser_genbank.valid[0].old_string);

    });

module('seqJS#GenbankWriter', {
    setup: function() {
       this.parser = seqJS.getParser('genbank');
    }
});

    var compare_file = function(actual, expected, name){

        var a = actual.split('\n'),
            e = expected.split('\n');

        var msg = name + ': Number of lines is wrong';
        if(a.length > e.length){
            msg += ' -- extra lines:\n' + a.slice(e.length).join('\n');
        }
        equal(a.length, e.length, msg);

        for(var i = 0; i < Math.min(a.length, e.length); i++){
            equal(a[i], e[i], name + ": line "+i+" is wrong");
        }
    };


    var test_write = function(num){
        return function(){
            this.parser.setRecordCb(function(record){
                var output = seqJS.write(record, 'gb');

                compare_file(output, TEST_DATA.parser_genbank.valid[num].string,
                     'Record['+num+']');

                start();
            });

            this.parser.parse(TEST_DATA.parser_genbank.valid[num].string);
        };
        
    };


    for(test_num=0; test_num < TEST_DATA.parser_genbank.valid.length; test_num++)
    {
        asyncTest('parse/write entire record ' + test_num, test_write(test_num));
    }

}());
