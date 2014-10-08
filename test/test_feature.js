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
             

}());
