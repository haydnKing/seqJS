/*global seqJS:true  */
/*global to_str:true */
/*global parse_spanoperator_array:true */

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

module('seqJS.SpanOperator');

var test_spanoperator_init = function(args, expected_str){
    test('SpanOperator('+args.join(', ')+')', function(){
        expect(1);
        var so = new seqJS.SpanOperator(args[0], args[1]);
        equal(so.toString(-1), expected_str);
    });
};

    test_spanoperator_init(['10..100'], 'SO(S(L(9):L(100)))');
    test_spanoperator_init(['<10..>100'], 'SO(S(L(<9):L(>100)))');
    test_spanoperator_init(['>10..<100'], 'SO(S(L(>9):L(<100)))');
    test_spanoperator_init(['10.15..100'], 'SO(S(L(9.15):L(100)))');

var test_spanoperator_crop = function(spans, crop_start, crop_end, crop_complement, expected_str){
    var so = parse_spanoperator_array(spans);

    test(so.toString(-1)+'.crop(' + crop_start + ', ' + crop_end + ', ' + crop_complement + ')',
         function() {
             var original = so.toString(-1);
             equal(to_str(so.crop(crop_start, 
                           crop_end, 
                           crop_complement)), 
                           expected_str,
                           "crop with integers");
             equal(so.toString(-1), original, "crop changed original");
             equal(to_str(so.crop(new seqJS.Location(crop_start), 
                           new seqJS.Location(crop_end), 
                           crop_complement)), 
                           expected_str,
                           "crop with seqJS.Locations");
             equal(so.toString(-1), original, "crop changed original");
    });
};

/*
 * SpanOperator with one span
 */

test_spanoperator_crop(['', [[[20], [30]]]], 10, 40, false, "SO('', [S(L(10):L(20))])");
test_spanoperator_crop(['', [[[20], [30]]]], 10, 25, false, "SO('', [S(L(10):L(15))])");
test_spanoperator_crop(['', [[[20], [30]]]], 25, 40, false, "SO('', [S(L(0):L(5))])");
                                          
test_spanoperator_crop(['', [[[20], [30]]]], 10, 40, true, "SO('complement', [S(L(10):L(20))])");
test_spanoperator_crop(['', [[[20], [30]]]], 10, 25, true, "SO('complement', [S(L(0):L(5))])");
test_spanoperator_crop(['', [[[20], [30]]]], 25, 40, true, "SO('complement', [S(L(10):L(15))])");
test_spanoperator_crop(['complement', [[[20], [30]]]], 10, 40, true, "SO('', [S(L(10):L(20))])");
test_spanoperator_crop(['complement', [[[20], [30]]]], 10, 25, true, "SO('', [S(L(0):L(5))])");
test_spanoperator_crop(['complement', [[[20], [30]]]], 25, 40, true, "SO('', [S(L(10):L(15))])");

/*
 * SO.crop with multiple Ss
 */
test_spanoperator_crop(['join', [[[20],[30]], [[40], [50]]]], 25, 45, false, 
                       "SO('merge', [S(L(0):L(5)), S(L(15):L(20))])");
test_spanoperator_crop(['order', [[[20],[30]], [[40], [50]]]], 25, 45, false, 
                       "SO('merge', [S(L(0):L(5)), S(L(15):L(20))])");
test_spanoperator_crop(['join', [[[20],[30]], [[40], [50]]]], 25, 45, true, 
                       "SO('complement', [SO('merge', [S(L(0):L(5)), S(L(15):L(20))])])");
test_spanoperator_crop(['order', [[[20],[30]], [[40], [50]]]], 25, 45, true, 
                       "SO('complement', [SO('merge', [S(L(0):L(5)), S(L(15):L(20))])])");

/*
 * SO.crop test dropouts
 */
test_spanoperator_crop(['join', [[[20],[30]], [[40], [50]]]], 35, 45, false, 
                       "SO('', [S(L(5):L(10))])");

test_spanoperator_crop(['order', [[[20],[30]], [[40], [50]]]], 35, 45, false, 
                       "SO('', [S(L(5):L(10))])");

test_spanoperator_crop(['join', [[[20],[30]], [[40], [50]]]], 35, 45, true, 
                       "SO('complement', [S(L(0):L(5))])");

test_spanoperator_crop(['order', [[[20],[30]], [[40], [50]]]], 35, 45, true, 
                       "SO('complement', [S(L(0):L(5))])");

test_spanoperator_crop(['join', [[[20],[30]], [[40], [50]]]], 30, 40, true, 
                       "null");

test_spanoperator_crop(['order', [[[20],[30]], [[40], [50]]]], 30, 40, true, 
                       "null");

/*
 * Test dropout and tidyup
 */
test_spanoperator_crop(['merge', [ ['', [[[10],[20]]]], ['', [[[40], [50]]]]]], 10, 20, false,
                       "SO('', [S(L(0):L(10))])");

}());
