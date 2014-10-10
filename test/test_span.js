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

var str_args = function(args){
    var r = [];
    args.forEach(function(a){
        if(typeof(a) === 'string' || a instanceof String){
            r.push('\''+a+'\'');
        }
        else {
            r.push(a);
        }
    });
    return r.join(', ');
};

var span_from_args = function(l, r){
    return new seqJS.Span(new seqJS.Location(l[0], l[1], l[2]),
                          new seqJS.Location(r[0], r[1], r[2]));
};

var test_span_init = function(args, e_str){
    test('seqJS.Span(\''+str_args(args)+'\')', function(){
        expect(1);
        var s = new seqJS.Span(args[0], args[1]);
        equal(s.toString(-1), e_str);
    });
};

test_span_init(['100..150'], 'S(+,L(99):L(150))');
test_span_init(['<100..>150'], 'S(+,L(<99):L(>150))');
test_span_init(['100.105..150'], 'S(+,L(99.105):L(150))');
test_span_init(['100..150.160'], 'S(+,L(99):L(150.161))');

test_span_init([new seqJS.Location(99), new seqJS.Location(150)], 
               'S(+,L(99):L(150))');
test_span_init([new seqJS.Location(99, '<'), new seqJS.Location(150, '>')], 
               'S(+,L(<99):L(>150))');
test_span_init([new seqJS.Location(99,'.',105), new seqJS.Location(150)], 
               'S(+,L(99.105):L(150))');
test_span_init([new seqJS.Location(99), new seqJS.Location(150, '.', 161)], 
               'S(+,L(99):L(150.161))');

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


var test_span_crop = function(span_left, span_right, start, end, expected_str){
    test('Span('+str_args(span_left)+','+str_args(span_right)+').crop('+start+', '+end+')', function(){
        var span = span_from_args(span_left, span_right);
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

var test_span_length = function(span_left, span_right, expected_length){
    test('Span(Location('+str_args(span_left)+'), Location('+str_args(span_right)+')).length()', function(){
        var sp = span_from_args(span_left, span_right);
        var o = sp.toString(-1);
        equal(sp.length(), expected_length, 'Length failed');
        equal(sp.toString(-1), o, 'Length changed original span');
    });
};

test_span_length([10], [20], 10);
test_span_length([10, '<'], [20], 10);
test_span_length([10, '>'], [20], 10);
test_span_length([10], [20, '<'], 10);
test_span_length([10], [20, '>'], 10);
test_span_length([10, '>'], [20, '>'], 10);
test_span_length([10, '<'], [20, '>'], 10);
test_span_length([10, '<'], [20, '<'], 10);
test_span_length([10, '>'], [20, '<'], 10);
test_span_length([10, '.', 15], [20], 10);
test_span_length([10], [20, '.', 25], 15);
test_span_length([10, '.', 15], [20, '.', 25], 15);

var test_span_left_right = function(span_left, span_right, e_left, e_right){
    test('Span(('+str_args(span_left)+'), ('+str_args(span_right)+')) left() & right()', function() {
        var s = span_from_args(span_left, span_right);
        var o = s.toString(-1);
        equal(s.left().toString(-1), e_left, 'left failed');
        equal(s.right().toString(-1), e_right, 'right failed');
        equal(s.toString(-1), o, 'left or right changed original');
    });
};
test_span_left_right([5], [36], "L(5)", "L(36)");

var test_span_overlaps = function(lhs_l, lhs_r, rhs_l, rhs_r, expected){
    test('Span.overlaps: (('+str_args(lhs_l)+'),('+str_args(lhs_r)+')) - (('+str_args(rhs_l)+'),('+str_args(rhs_r)+'))', function(){
        var l = span_from_args(lhs_l, lhs_r),
            r = span_from_args(rhs_l, rhs_r);

        var lo = l.toString(-1),
            ro = r.toString(-1);

        equal(l.overlaps(r), expected, 'lhs.overlaps(rhs) failed');
        equal(r.overlaps(l), expected, 'rhs.overlaps(lhs) failed');
        equal(l.toString(-1), lo, 'lhs changed by overlaps call');
        equal(r.toString(-1), ro, 'rhs changed by overlaps call');
    });
};
test_span_overlaps([0], [5], [5], [10], false);
test_span_overlaps([0], [5, '<'], [5], [10], false);
test_span_overlaps([0], [5, '<'], [5, '<'], [10], false);
test_span_overlaps([0], [3,'.',5], [5], [10], false);
test_span_overlaps([0], [5], [5, '.', 6], [10], false);

test_span_overlaps([0], [6], [5], [10], true);
test_span_overlaps([0], [5], [4], [10], true);
test_span_overlaps([0], [5, '.', 6], [5], [10], true);
test_span_overlaps([0], [5], [4, '.', 5], [10], true);

var test_span_offset = function(lhs_l, lhs_r, offset, e_str){
    test('Span(('+str_args(lhs_l)+'),('+str_args(lhs_r)+')).offset('+offset+')', function(){
        var l = span_from_args(lhs_l, lhs_r);

        var lo = l.toString(-1);

        equal(l.offset(offset).toString(-1), e_str, 'span.offset failed');
        equal(l.toString(-1), lo, 'span changed by offset call');
    });
};
test_span_offset([0],[5], 5, 'S(+,L(5):L(10))');
test_span_offset([5],[10], -5, 'S(+,L(0):L(5))');
test_span_offset([0, '>'],[5], 5, 'S(+,L(>5):L(10))');
test_span_offset([0],[5, '<'], 5, 'S(+,L(5):L(<10))');
        

var test_span_offset_fail = function(lhs_l, lhs_r, offset){
    test('Span(('+str_args(lhs_l)+'),('+str_args(lhs_r)+')).offset('+offset+') fails', function(){
        throws(function(){
            span_from_args(lhs_l, lhs_r).offset(offset);
        });
    });
};
test_span_offset_fail([10], [15], -11);

var test_span_togenbankstring = function(gbstr){
    test('Span(\''+gbstr+'\').toGenbankString()', function(){
        var s = new seqJS.Span(gbstr);
        var o = s.toString(-1);
        equal(s.toGenbankString(), gbstr, 'span.toGenbankString() failed');
        equal(s.toString(-1), o, 'span.toGenbankString() changed span');
    });
};
test_span_togenbankstring('10..50');
test_span_togenbankstring('<10..50');
test_span_togenbankstring('>10..50');
test_span_togenbankstring('10..<50');
test_span_togenbankstring('10..>50');
test_span_togenbankstring('<10..<50');
test_span_togenbankstring('<10..>50');
test_span_togenbankstring('>10..<50');
test_span_togenbankstring('>10..>50');
test_span_togenbankstring('10.14..50');
test_span_togenbankstring('10..50.56');
test_span_togenbankstring('10.14..50.56');

test('Span.isComplement() & Span.setParent()', function(){
    var s = new seqJS.Span('10..50'),
        pf = {isComplement: function() {return false;}},
        pt = {isComplement: function() {return true;}};

    equal(s.isComplement(), false, 'Should be on the forward strand by default');

    s.setParent(pf);
    equal(s.isComplement(), false, 'Should be on the forward if the parent is');

    s.setParent(pt);
    equal(s.isComplement(), true, 'Should be on reverse strand if the parent is');

    s.setParent(null);
    equal(s.isComplement(), false, 'setting parent as null should revert forward');
});


    

}());
