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
    var test_featureloc_init = function(string){
        test('seqJS.FeatureLocation(\''+string+'\')', function(){
            var l = new seqJS.FeatureLocation(string);
            equal(l.toString(-1), string, 'FeatureLocation init failed');
        });
    };
    
    test_featureloc_init('100..200');
    test_featureloc_init('<100..200');
    test_featureloc_init('100.102..200');
    test_featureloc_init('complement(100..200)');
    test_featureloc_init('join(100..200,300..400)');
    test_featureloc_init('order(100..200,300..400)');
    test_featureloc_init('complement(join(100..200,300..400))');
    test_featureloc_init('join(complement(300..400),complement(100..200))');
    test_featureloc_init('join(100..200,complement(join(500..600,300..400)))');

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

        test(lhs.toString(-1) + '.crop('+rhs.toString(-1)+')', function(){
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
                              "FL(SO('', [S(L(10):L(20))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['', [ [[10], [40]] ] ],
                              "FL(SO('complement', [S(L(10):L(20))]))");
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [40]] ] ],
                              "FL(SO('complement', [S(L(10):L(20))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [40]] ] ],
                              "FL(SO('', [S(L(10):L(20))]))");

    /*
     * One on One
     *  Cropped
     */
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['', [ [[25], [40]] ] ],
                              "FL(SO('', [S(L(0):L(5))]))");
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['', [ [[10], [25]] ] ],
                              "FL(SO('', [S(L(10):L(15))]))");

    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['complement', [ [[25], [40]] ] ],
                              "FL(SO('complement', [S(L(10):L(15))]))");
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [25]] ] ],
                              "FL(SO('complement', [S(L(0):L(5))]))");

    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['complement', [ [[25], [40]] ] ],
                              "FL(SO('', [S(L(10):L(15))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [25]] ] ],
                              "FL(SO('', [S(L(0):L(5))]))");

    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['', [ [[25], [40]] ] ],
                              "FL(SO('complement', [S(L(0):L(5))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['', [ [[10], [25]] ] ],
                              "FL(SO('complement', [S(L(10):L(15))]))");

    test_featurelocation_crop(['', [ [[20], [40]] ] ], 
                              ['', [ [[25], [35]] ] ],
                              "FL(SO('', [S(L(0):L(10))]))");
    test_featurelocation_crop(['complement', [ [[20], [40]] ] ], 
                              ['', [ [[25], [35]] ] ],
                              "FL(SO('complement', [S(L(0):L(10))]))");
    test_featurelocation_crop(['complement', [ [[20], [40]] ] ], 
                              ['complement', [ [[25], [35]] ] ],
                              "FL(SO('', [S(L(0):L(10))]))");

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
                              "FL(SO('', [S(L(0):L(5))]))");
    test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                              ['join', [ [[10], [20]], [[35], [40]] ] ],
                              "null");
    test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                              ['join', [ [[10], [20]], [[25], [40]] ] ],
                              "FL(SO('', [S(L(0):L(5))]))");

    /*
     * Multiple output
     *   join
     */
    
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('join', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['join', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ],
                              "FL(SO('join', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('complement', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ], 
                              ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('join', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('complement', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ]] , 
                              ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('join', ["+
                                  "SO('complement', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['join', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('join', ["+
                                  "SO('complement', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");

    /*
     * Multiple output
     *   order
     */
    
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('order', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['order', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ],
                              "FL(SO('order', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('complement', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ], 
                              ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('order', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('complement', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ]] , 
                              ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('order', ["+
                                  "SO('complement', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['order', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('order', ["+
                                  "SO('complement', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");


    /*
     * Multiple output
     *   mixed
     */
    
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('order', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FL(SO('join', ["+
                                  "SO('', [S(L(0):L(10))]), "+
                                  "SO('', [S(L(10):L(15))])"+
                             "]))");

}());
