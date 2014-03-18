/* global seqJS:true */ 

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


 module('seqJS#GenbankParser');

 test('correct Parser', function() {
     var p = seqJS.getParser('gb');
     equal(p.type(), 'gb');

     p = seqJS.getParser('genbank');
     equal(p.type(), 'gb');
 });

}());
