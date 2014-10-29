/*global seqJS:true  */

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

module('seqJS.melt');

test('simple melting', function(){
    //equal(seqJS.melt('ATCGATGGCATGCTAGCTGA', 'oligocalc'), 89.4);
    //equal(seqJS.melt('ATCGATGG', 'oligocalc'), 50.2);
    equal(seqJS.melt('GCTAGC', 'Allawi1997'), 49.1);
    //equal(seqJS.melt('GCTAGC'), 32.6);
});


}());


