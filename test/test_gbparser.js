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

    asyncTest('parse entire record', function(){
        
        this.parser.setRecordCb(function(record){
            gbrecord_eq(record, TEST_DATA.parser_genbank.valid[0].object);
            start();
        });

        this.parser.parse(TEST_DATA.parser_genbank.valid[0].string);

    });

    asyncTest('parse entire protein record', function(){
        
        this.parser.setRecordCb(function(record){
            gbrecord_eq(record, TEST_DATA.parser_genbank.valid[1].object);
            start();
        });

        this.parser.parse(TEST_DATA.parser_genbank.valid[1].string);

    });

}());
