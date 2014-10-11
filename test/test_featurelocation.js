/*global seqJS:true  */
/*global to_str:true */
/*global parse_featurelocation_array:true */

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


module('seqJS.FeatureLocation');

/*
 * test that correct locations parse
 */
var test_featureloc_init = function(str, e_str){
    test('seqJS.FeatureLocation(\''+str+'\')', function(){
        var l = new seqJS.FeatureLocation(str);
        equal(l.toString(-1), e_str, 'FeatureLocation init failed');
    });
};

test_featureloc_init('100..200', 'FL(\'join\', SO(\'\', [S(+,L(99):L(200))]))');
test_featureloc_init('<100..200', 'FL(\'join\', SO(\'\', [S(+,L(<99):L(200))]))');
test_featureloc_init('100.102..200', 'FL(\'join\', SO(\'\', [S(+,L(99.102):L(200))]))');
test_featureloc_init('complement(100..200)', 'FL(\'join\', SO(\'complement\', [S(-,L(99):L(200))]))');
test_featureloc_init('join(100..200,300..400)', 'FL(\'join\', SO(\'merge\', [S(+,L(99):L(200)), S(+,L(299):L(400))]))');
test_featureloc_init('order(100..200,300..400)', 'FL(\'order\', SO(\'merge\', [S(+,L(99):L(200)), S(+,L(299):L(400))]))');
test_featureloc_init('complement(join(100..200,300..400))', 
                     'FL(\'join\', SO(\'complement\', [SO(\'merge\', [S(-,L(99):L(200)), S(-,L(299):L(400))])]))');
test_featureloc_init('join(complement(300..400),complement(100..200))',
                     'FL(\'join\', SO(\'merge\', [SO(\'complement\', [S(-,L(299):L(400))]), SO(\'complement\', [S(-,L(99):L(200))])]))');
test_featureloc_init('join(100..200,complement(join(500..600,300..400)))',
                     'FL(\'join\', SO(\'merge\', [S(+,L(99):L(200)), SO(\'complement\', [SO(\'merge\', [S(-,L(499):L(600)), S(-,L(299):L(400))])])]))');

/*
 * Test that malformed locations fail to parse
 */
var test_featureloc_fail = function(name, string){
    test(name, function(){
        expect(1);

        throws(function(){
            new seqJS.FeatureLocation(string);
        });
    });
};

test_featureloc_fail('fail complement(B..A)', 'complement(200..100)');
test_featureloc_fail('fail join(A..B,order(C..D,E..F))', 'join(100..200,order(300..400,500..600))');

var test_featureloc_start_end = function(name, string, start, end){
    test(name, function(){
        expect(2);
        var f = new seqJS.FeatureLocation(string);
        equal(f.start(), start, "Start failed");
        equal(f.end(), end, "End failed");
    });
};

test_featureloc_start_end("Start and end join(C..D,A..B)", 'join(10..20,5..6)', 4, 20);
test_featureloc_start_end("Start and end join(C..D,c(A..B))", 'join(10..20,complement(5..6))', 4, 20);
test_featureloc_start_end("Start and end order(C..D,A..B)", 'order(10..20,5..6)', 4, 20);

module('seqJS.FeatureLocation.crop');

var test_featurelocation_crop = function(lhsa, rhsa, expected_str){

    var lhs = parse_featurelocation_array(lhsa),
        rhs = parse_featurelocation_array(rhsa);

    test(lhs.toGenbankString() + '.crop('+rhs.toGenbankString()+')', function(){
        var original = lhs.toString(-1);

        equal(to_str(lhs.crop(rhs)), expected_str, "crop returned incorrectly");
        equal(to_str(lhs), original, "crop changed FeatureLocation");
    });
};

/*
 * One on One
 *  Contained
 */

test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['', [ [[10], [40]] ] ],
                          "FL(\'join\', SO('', [S(+,L(10):L(20))]))");
test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                          ['', [ [[10], [40]] ] ],
                          "FL(\'join\', SO('complement', [S(-,L(10):L(20))]))");
test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['complement', [ [[10], [40]] ] ],
                          "FL(\'join\', SO('complement', [S(-,L(10):L(20))]))");
test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                          ['complement', [ [[10], [40]] ] ],
                          "FL(\'join\', SO('', [S(+,L(10):L(20))]))");

/*
 * One on One
 *  Cropped
 */
test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['', [ [[25], [40]] ] ],
                          "FL(\'join\', SO('', [S(+,L(0):L(5))]))");
test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['', [ [[10], [25]] ] ],
                          "FL(\'join\', SO('', [S(+,L(10):L(15))]))");

test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['complement', [ [[25], [40]] ] ],
                          "FL(\'join\', SO('complement', [S(-,L(10):L(15))]))");
test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['complement', [ [[10], [25]] ] ],
                          "FL(\'join\', SO('complement', [S(-,L(0):L(5))]))");

test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                          ['complement', [ [[25], [40]] ] ],
                          "FL(\'join\', SO('', [S(+,L(10):L(15))]))");
test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                          ['complement', [ [[10], [25]] ] ],
                          "FL(\'join\', SO('', [S(+,L(0):L(5))]))");

test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                          ['', [ [[25], [40]] ] ],
                          "FL(\'join\', SO('complement', [S(-,L(0):L(5))]))");
test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                          ['', [ [[10], [25]] ] ],
                          "FL(\'join\', SO('complement', [S(-,L(10):L(15))]))");

test_featurelocation_crop(['', [ [[20], [40]] ] ], 
                          ['', [ [[25], [35]] ] ],
                          "FL(\'join\', SO('', [S(+,L(0):L(10))]))");
test_featurelocation_crop(['complement', [ [[20], [40]] ] ], 
                          ['', [ [[25], [35]] ] ],
                          "FL(\'join\', SO('complement', [S(-,L(0):L(10))]))");
test_featurelocation_crop(['complement', [ [[20], [40]] ] ], 
                          ['complement', [ [[25], [35]] ] ],
                          "FL(\'join\', SO('', [S(+,L(0):L(10))]))");

/*
 * Dropout
 */
test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['', [ [[35], [40]] ] ],
                          "null");
test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                          ['', [ [[35], [40]] ] ],
                          "null");
test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                          ['join', [ [[10], [20]], [[35], [40]] ] ],
                          "null");
test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                          ['', [ [[25], [40]] ] ],
                          "FL(\'join\', SO('', [S(+,L(0):L(5))]))");
test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                          ['join', [ [[10], [20]], [[35], [40]] ] ],
                          "null");
test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                          ['join', [ [[10], [20]], [[25], [40]] ] ],
                          "FL(\'join\', SO('', [S(+,L(0):L(5))]))");

/*
 * Multiple output
 *   join
 */

test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'join\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['join', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ],
                          "FL(\'join\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('complement', [S(-,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ], 
                          ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'join\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('complement', [S(-,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['join', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ]] , 
                          ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'join\', SO('merge', ["+
                              "SO('complement', [S(-,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['join', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'join\', SO('merge', ["+
                              "SO('complement', [S(-,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");

/*
 * Multiple output
 *   order
 */

test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'order\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['order', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ],
                          "FL(\'order\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('complement', [S(-,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ], 
                          ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'order\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('complement', [S(-,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['order', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ]] , 
                          ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'order\', SO('merge', ["+
                              "SO('complement', [S(-,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['order', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'order\', SO('merge', ["+
                              "SO('complement', [S(-,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");


/*
 * Multiple output
 *   mixed
 */

test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'order\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");
test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                          ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                          "FL(\'join\', SO('merge', ["+
                              "SO('', [S(+,L(0):L(10))]), "+
                              "SO('', [S(+,L(10):L(15))])"+
                         "]))");


var test_featureloc_invertdatum = function(loc_str, len, expected_str){
    test('seqJS.FeatureLocation(\'' + loc_str + '\').invertDatum('+len+')', function(){
        var f = new seqJS.FeatureLocation(loc_str);
        var o = f.toString(-1);

        equal(f.invertDatum(len).toString(-1), expected_str, "InvertDatum failed");
        equal(f.toString(-1), o, "InvertDatum changed original");
    });
};

test_featureloc_invertdatum('1..3', 6, 
                         'FL(\'join\', SO(\'complement\', [S(-,L(3):L(6))]))');
test_featureloc_invertdatum('complement(1..3)', 6, 
                         'FL(\'join\', SO(\'\', [S(+,L(3):L(6))]))');

var test_featureloc_getmergeoperator = function(loc_str, expected){
    test('seqJS.FeatureLocation(\''+loc_str+'\').getMergeOperator()', function(){
        var fl = new seqJS.FeatureLocation(loc_str);
        var o = fl.toString(-1);
        equal(fl.getMergeOperator(), expected, 'getMergeOperator failed');
        equal(fl.toString(-1), o, 'getMergeOperator changed original');
    });
};
test_featureloc_getmergeoperator('10..20', 'join');
test_featureloc_getmergeoperator('complement(10..20)', 'join');
test_featureloc_getmergeoperator('complement(join(10..20,30..40))', 'join');
test_featureloc_getmergeoperator('join(10..20,complement(30..40))', 'join');
test_featureloc_getmergeoperator('complement(order(10..20,30..40))', 'order');
test_featureloc_getmergeoperator('order(10..20,complement(30..40))', 'order');

var test_featureloc_length = function(loc_str, expected){
    test('seqJS.FeatureLocation(\''+loc_str+'\').length()', function(){
        var fl = new seqJS.FeatureLocation(loc_str);
        var o = fl.toString(-1);
        equal(fl.length(), expected, 'length() failed');
        equal(fl.toString(-1), o, 'length() changed original');
    });
};
test_featureloc_length('10..20', 11);
test_featureloc_length('merge(10..20,30..40)', 22);
test_featureloc_length('merge(10..20,complement(30..40))', 22);
test_featureloc_length('complement(merge(complement(10..20),30..40))', 22);
test_featureloc_length('merge(10..20,30..40,1..2)', 24);

var test_featureloc_getspans = function(loc_str, expected){
    test('seqJS.FeatureLocation(\''+loc_str+'\').getSpans()', function(){
        var fl = new seqJS.FeatureLocation(loc_str);
        var o = fl.toString(-1);
        equal(fl.getSpans().map(function(s){return s.toString(-1);}).join(','), 
              expected, 'getSpans() failed');
        equal(fl.toString(-1), o, 'getSpans() changed original');
    });
};
test_featureloc_getspans('10..20', 'S(+,L(9):L(20))');
test_featureloc_getspans('complement(10..20)', 'S(-,L(9):L(20))');
test_featureloc_getspans('join(1..5,complement(10..20))', 'S(+,L(0):L(5)),S(-,L(9):L(20))');
test_featureloc_getspans('complement(join(1..5,complement(10..20)))', 'S(+,L(9):L(20)),S(-,L(0):L(5))');
test_featureloc_getspans('complement(join(1..5,complement(join(10..20,30..40))))', 'S(+,L(9):L(20)),S(+,L(29):L(40)),S(-,L(0):L(5))');

}());
