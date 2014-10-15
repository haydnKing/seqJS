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

test('seqJS.Record defaults', function(){
    var r = new seqJS.Record(new seqJS.Seq('ATG','DNA'));

    equal(r.id(), '<unknown ID>', 'Default ID incorrect');
    equal(r.name(), '<unnamed>', 'Default name incorrect');
    equal(r.desc(), '', 'Default description incorrect');
    deepEqual(r.listAnnotations(), [], 'Default annotations incorrect');
});

}());
