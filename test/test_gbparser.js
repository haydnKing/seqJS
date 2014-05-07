/* global seqJS:true, TEST_DATA:true*/
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
                gbrecord_eq(record, 
                            TEST_DATA.parser_genbank.valid[num].object);
                start();
            });

            this.parser.parse(TEST_DATA.parser_genbank.valid[num].input);
        };
    };
/*
    var test_chunk_parse = function(num, chunk_size){
        chunk_size = chunk_size || 64;
        return function() {
            this.parser.setRecordCb(function(record){
                gbrecord_eq(record, 
                            TEST_DATA.parser_genbank.valid[num].object);
                start();
            });

            var d = TEST_DATA.parser_genbank.valid[num].input;
            for(var i=0; i < d.length; i+=chunk_size){
                this.parser.parse(d.substr(i,chunk_size));
            }

        };
    };
*/
    var test_num;

    for(test_num=0; test_num < TEST_DATA.parser_genbank.valid.length; 
        test_num++)
    {
        asyncTest('parse valid ' + test_num, test_parse(test_num));
    }
/*
    for(test_num=0; test_num < TEST_DATA.parser_genbank.valid.length; 
        test_num++)
    {
        asyncTest('chunk parse valid ' + test_num, 
                  test_chunk_parse(test_num));
    }
*/
}());
