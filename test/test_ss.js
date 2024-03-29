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

module('seqJS.ss');

test('Test ss', function(){
    var s = new seqJS.Seq('GC', 'DNA');
    equal(seqJS.ss.predict(s), '()', 'secondary structure incorrect');
});
test('Test ss', function(){
    var s = new seqJS.Seq('GAC', 'DNA');
    equal(seqJS.ss.predict(s), '(.)', 'secondary structure incorrect');
});

test('Test ss', function(){
    var s = new seqJS.Seq('GGGAAATCC', 'DNA');
    equal(seqJS.ss.predict(s), '((.(..)))', 'secondary structure incorrect');
});
test('Test ss', function(){
    var s = new seqJS.Seq('GGAAACCACCAAAGGA', 'DNA');
    equal(seqJS.ss.predict(s), '((...)).((...)).', 'secondary structure incorrect');
});

}());


