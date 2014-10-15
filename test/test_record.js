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

test('seqJS.Record().id', function(){
    var r = new seqJS.Record(new seqJS.Seq('ATG','DNA'), 10);

    equal(r.id(), 10, 'set id from constructor');
    equal(r.id(12), r, 'id(v) should return this');
    equal(r.id(), 12, 'set id after construction');
});

test('seqJS.Record().id', function(){
    var r = new seqJS.Record(new seqJS.Seq('ATG','DNA'), 10, 'name');

    equal(r.name(), 'name', 'set name from constructor');
    equal(r.name('new name'), r, 'name(v) should return this');
    equal(r.name(), 'new name', 'set name after construction');
});

test('seqJS.Record().id', function(){
    var r = new seqJS.Record(new seqJS.Seq('ATG','DNA'), 10, 'name', 'desc');

    equal(r.desc(), 'desc', 'set description from constructor');
    equal(r.desc('new desc'), r, 'desc(v) should return this');
    equal(r.desc(), 'new desc', 'set description after construction');
});

test('seqJS.Record() annotations', function(){
    var r = new seqJS.Record(new seqJS.Seq('ATG','DNA'), 10, 'name', 'desc');

    equal(r.annotation('key', 'value'), r, 'annotation(k,v) should return this');
    equal(r.annotation('key'), 'value', 'annotations should be returned');
    equal(r.annotation('not a key'), undefined, 'unknown key');

    deepEqual(r.listAnnotations(), ['key'], 'listAnnotations');

    equal(r.removeAnnotation('key'), r, 'removeAnnotation() should return this');

    deepEqual(r.listAnnotations(), [], 'annotation should have been removed');
    equal(r.annotation('key'), undefined, 'key should have been removed');
});

    

}());
