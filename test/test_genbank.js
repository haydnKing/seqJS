/* global seqJS:true, TEST_DATA:true, test_parse, test_chunk_parse, test_write, gbrecord_eq*/
/* jshint unused:false */

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

var valid_data = TEST_DATA.parser_genbank.valid;
var format = 'gb';

module('seqJS#GenbankParser');

    test('correct Parser', function() {
        var p = seqJS.getParser('gb');
        equal(p.type(), 'gb');

        p = seqJS.getParser('genbank');
        equal(p.type(), 'gb');
    });


    var test_num;

    for(test_num=0; test_num < valid_data.length; test_num++)
    {
        test('parse valid ' + test_num, 
             test_parse(valid_data[test_num], 'gb'));
    }

    for(test_num=0; test_num < valid_data.length; test_num++)
    {
        asyncTest('chunk parse valid ' + test_num, 
                  test_chunk_parse(valid_data[test_num], 'gb'));
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


module('seqJS#GenbankWriter');

    for(test_num=0; test_num < valid_data.length; test_num++)
    {
        test('parse/write entire record ' + test_num, 
                  test_write(valid_data[test_num], 'gb'));
    }

}());
