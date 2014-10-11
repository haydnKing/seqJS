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




module('seqJS.Feature');

var test_feature_init = function(type_str, loc_str, expected_str){
    test('seqJS.Feature(\'' + type_str + '\', \''+ loc_str + '\')', 
         function(){
             var f = new seqJS.Feature(type_str, loc_str);
             equal(f.toString(-1), expected_str);
         });
};

test_feature_init('gene', '100..200', 'F(\'gene\', FL(\'join\', SO(\'\', [S(+,L(99):L(200))])))');
test_feature_init('gene', 'complement(100..200)', 'F(\'gene\', FL(\'join\', SO(\'complement\', [S(-,L(99):L(200))])))');

var test_feature_invertdatum = function(type_str, loc_str, len, expected_str){
    test('seqJS.Feature(\''+type_str+'\', \'' + loc_str + '\').invertDatum('+len+')', function(){
        var f = new seqJS.Feature(type_str, loc_str);
        var o = f.toString(-1);

        equal(f.invertDatum(len).toString(-1), expected_str, "InvertDatum failed");
        equal(f.toString(-1), o, "InvertDatum changed original");
    });
};

test_feature_invertdatum('gene', '1..3', 6, 
                         'F(\'gene\', FL(\'join\', SO(\'complement\', [S(-,L(3):L(6))])))');

test('feature - overlaps', function() {
    var a = new seqJS.Feature('gene', '100..200'),
        b = new seqJS.Feature('gene', '150..250'),
        c = new seqJS.Feature('gene', 'join(1..99,201..300)');

    //Test feature
    ok(a.overlaps(b), '100..200 should overlap with 150..250');
    ok(!a.overlaps(c), '100..200 should not overlap with join(1..99,201..300)');
    ok(b.overlaps(c), '150..250 should overlap with join(1..99,201..300)');

    //test numbers
    ok(a.overlaps(149,250), '100..200 should overlap with 149,250');
    ok(!a.overlaps(200,250), '100..200 should not overlap with 200,250');
    ok(!c.overlaps(99,200), '99,200 should not overlap with join(1..99,201..300)');

});

var test_feature_crop = function(to_crop, start, end, complement, expected){
    test('Feature(\'gene\', \''+to_crop+'\').crop('+start+', '+end+', '+complement+')', function(){

        var f = new seqJS.Feature('gene', to_crop);
        var orig = f.toString(-1);

        equal(f.crop(start,end,complement).toString(-1), expected);
        equal(f.toString(-1), orig, 'crop changed original');
    });
};

test_feature_crop('1..10', 0,5,false, 
                'F(\'gene\', FL(\'join\', SO(\'\', [S(+,L(0):L(5))])))');
test_feature_crop('1..10', 0, 5, true, 
                'F(\'gene\', FL(\'join\', SO(\'complement\', [S(-,L(0):L(5))])))');
test_feature_crop('complement(1..10)', 0,5,false, 
                'F(\'gene\', FL(\'join\', SO(\'complement\', [S(-,L(0):L(5))])))');
test_feature_crop('join(1..10,15..20)', 5, 20,false, 
                'F(\'gene\', FL(\'join\', SO(\'merge\', [S(+,L(0):L(5)), S(+,L(9):L(15))])))');
             
test('Feature.type', function(){
    var f = new seqJS.Feature('sometype', '10..20');

    equal(f.type(), 'sometype', 'type failed');
    equal(f.type('newtype'), f, 'type failed');
    equal(f.type(), 'newtype', 'type failed');

});

test('Feature qualifiers', function(){
    var qs = [['one', 1], ['two', '2'], ['three', {key: 'value'}]];
    var i;
    var f = new seqJS.Feature('type', '1..10');

    deepEqual(f.qualifierKeys(), [], 'qualifier keys should be empty to start');

    for(i=0; i<qs.length; i++){
        equal(f.qualifier(qs[i][0], qs[i][1]), f, 'qualifier should return this when setting a qualifier');
    }

    deepEqual(f.qualifierKeys(), ['one','two','three']);

    for(i=0; i<qs.length; i++){
        equal(f.qualifier(qs[i][0]), qs[i][1], 'qualifier set incorrectly');
    }

    equal(f.clearQualifiers(), f, 'clearQualifiers should return this');
    deepEqual(f.qualifierKeys(), [], 'clearQualifiers didn\'t remove all qualifiers');
});



}());
