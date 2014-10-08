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


module('seqJS.Span');

    var test_span_init = function(str, e_str){
        test('seqJS.Span(\''+str+'\')', function(){
            expect(1);
            var s = new seqJS.Span(str);
            equal(s.toString(-1), e_str);
        });
    };

    test_span_init('100..150', 'S(+,L(99):L(150))');
    test_span_init('<100..>150', 'S(+,L(<99):L(>150))');
    test_span_init('100.105..150', 'S(+,L(99.105):L(150))');
    test_span_init('100..150.160', 'S(+,L(99):L(150.161))');

    var test_span_init_fail = function(name, str){
        test(name, function(){
            expect(1);
            throws(function(){
                new seqJS.Span(str);
            });
        });
    };

    test_span_init_fail('locations inverted', '200..100');
    test_span_init_fail('bad formating', '100.200');

    var test_span_invertDatum = function(str, expected_str){
        test('seqJS.Span(\''+str+'\').invertDatum(100)', function(){
            expect(2);
            var s = new seqJS.Span(str);
            var orig = s.toString(-1);

            equal(s.invertDatum(100).toString(-1), expected_str, "InvertDatum failed");
            equal(s.toString(-1), orig, "InvertDatum changed original");
        });
    };

    test_span_invertDatum('5..10', 'S(-,L(90):L(96))');
    test_span_invertDatum('6..11', 'S(-,L(89):L(95))');
    test_span_invertDatum('4.5..10.11', 'S(-,L(89.91):L(96.98))');
    test_span_invertDatum('<5..>10', 'S(-,L(<90):L(>96))');


    var test_span_offset = function(str, offset, expected_str){
        test('seqJS.Span(\''+str+'\').offset('+offset+')', function(){
            expect(2);
            var s = new seqJS.Span(str);
            var orig = s.toString(-1);

            equal(s.offset(offset).toString(-1), expected_str, "Offset failed");
            equal(s.toString(-1), orig, "Offset changed original");
        });
    };

    test_span_offset('5..10', 5, 'S(+,L(9):L(15))');
    test_span_offset('5..10', -2, 'S(+,L(2):L(8))');
    test_span_offset('5..10', 0, 'S(+,L(4):L(10))');


    var test_span_crop = function(span_left, span_right, start, end, expected_str){
        var span = new seqJS.Span(new seqJS.Location(span_left[0], span_left[1], span_left[2]),
                                  new seqJS.Location(span_right[0], span_right[1], span_right[2]));

        test(span.toString(-1) + '.crop('+start+', '+end+')',
             function(){
            var original = span.toString(-1);

            equal(span.crop(start,end).toString(-1), 
                  expected_str, 
                  "crop with integers");
            equal(span.toString(-1), original, "Span changed by crop calls");

            equal(span.crop(new seqJS.Location(start),
                            new seqJS.Location(end)).toString(-1), 
                  expected_str, 
                  "crop with Locations");

            equal(span.toString(-1), original, "Span changed by crop calls");
        });
    };

    test_span_crop([20],[30], 10, 40, 'S(+,L(10):L(20))');
    test_span_crop([20],[30], 25, 40, 'S(+,L(0):L(5))');
    test_span_crop([20],[30], 10, 25, 'S(+,L(10):L(15))');

    test_span_crop([20, '<'],[30, '>'], 10, 40, 'S(+,L(<10):L(>20))');
    test_span_crop([20, '<'],[30, '>'], 25, 40, 'S(+,L(0):L(>5))');
    test_span_crop([20, '<'],[30, '>'], 10, 25, 'S(+,L(<10):L(15))');

}());
