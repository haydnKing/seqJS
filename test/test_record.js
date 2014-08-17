/*global seqJS:true  */
/*global location_eq:true, span_eq:true, featureloc_eq:true */
/*global feature_eq:true */

(function($) {
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

var to_str = function(a){
    if(a){
        return a.toString(-1);
    }
    return 'null';
};

module('seqJS#seq');

    test('setting and get data', function(){
        expect(3);
        var l = new seqJS.Seq("ATcGAT", 'PROT');
        equal(l.seq(), "ATCGAT");
        equal(l.length(), 6);
        equal(l.alphabet(), 'PROT');
    });

    test('require an alphabet', function(){
        expect(1);
        throws(function() {new seqJS.Seq("ATcGAT");},
               'Argument alphabet is required');
    });

    test('unknown alphabet', function(){
        expect(1);
        throws(function() {new seqJS.Seq("ATcGAT", 'var');},
               'Unknown Alphabet');
    });

    test('reverse complement', function() {
        var s = new seqJS.Seq("ATCGTC", 'DNA');
        equal(s.reverseComplement().seq(), 'GACGAT', 'even length R.C.');

        s = new seqJS.Seq("ATCGTCA", 'DNA');
        equal(s.reverseComplement().seq(), 'TGACGAT', 'odd length R.C.');
    });

    test('test get features within range', function() {
        var s = new seqJS.Seq(
            'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
            'DNA',
            [
                new seqJS.Feature('one', 'join(5..10,20..25)'),
                new seqJS.Feature('two', '13..17'),
                new seqJS.Feature('three', 'complement(7..15)')
            ]);

        //test subset
        var f = s.features(9,17);
        equal(feats2string(f), 'two=13..17', 
             'Contained: returned features do not match');

        //test intersection
        f = s.features(9,17,true);
        equal(feats2string(f), 
              'one=join(5..10,20..25)|three=complement(7..15)|two=13..17', 
             'Intersection: Returned features do not match expectations');

    });
  /*  
module('seqJS.Seq.extract', {
    setup: function(){
        this.s = new seqJS.Seq(
                'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
                'DNA',
                [
                    new seqJS.Feature('one', '11..19'),
                    new seqJS.Feature('two', 'complement(5..15)'),
                    new seqJS.Feature('three', '15..25')
                ]);
        this.s2 = new seqJS.Seq(
            'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
            'DNA',
            [
                new seqJS.Feature('one', '1..46')
            ]);
    }
});
*/
var feats2string = function(feats){
    return feats.map(function(x){return x.type() + '=' + x.location().toGenbankString();}).join('|');
};
/*
    test('extract 10..20 no features', function() {
        var f = new seqJS.Feature('gene', '10..20');
        var s = this.s.extract(f);
        equal(s.seq(), "ATATCGATCGA", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });
    test('extract complement(10..20) no features', function() {
        var f = new seqJS.Feature('gene', 'complement(10..20)');
        var s = this.s.extract(f);
        equal(s.seq(), "TCGATCGATAT", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });
    test('extract join(10..20,30..40) no features', function() {
        var f = new seqJS.Feature('gene', 'join(10..20,30..40)');
        var s = this.s.extract(f);
        equal(s.seq(), "ATATCGATCGATAGCTAGTCGA", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });
    test('extract join(10..20,complement(30..40)) no features', function() {
        var f = new seqJS.Feature('gene', 'join(10..20,complement(30..40))');
        var s = this.s.extract(f);
        equal(s.seq(), "ATATCGATCGATCGACTAGCTA", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });


    test('extract 10..20  with features', function() {
        var f = new seqJS.Feature('gene', '10..20');
        var o = this.s.extract(f, true);
        equal(o.seq(), "ATATCGATCGA", 'Incorrect sequence');
        equal(o.features().length, 3, 'Incorrect number of features');
        equal(feats2string(o.features()),
             'two=complement(1..6)|one=2..10|three=6..11',
             'incorrect features returned');
    });
    test('extract complement(10..20)  with features', function() {
        var f = new seqJS.Feature('gene', 'complement(10..20)');
        var o = this.s.extract(f, true);
        equal(o.seq(), "TCGATCGATAT", 'Incorrect sequence');
        equal(feats2string(o.features()),
             'three=complement(1..6)|one=complement(2..10)|two=6..11',
             'incorrect features returned');
    });
    test('extract join(10..19,20..29) with features', function() {
        //Test multi span extraction
        var f = new seqJS.Feature('gene', 'join(10..19,20..29)');
        var o = this.s2.extract(f, true);
        equal(o.seq(), "ATATCGATCGATGAGCTAGG", 'Incorrect sequence');
        equal(feats2string(o.features()),
             'one=order(1..10,11..20)',
             'incorrect features returned');
    });
    test('extract join(2..7,20..30,complement(12..17)) with features', function() {       
        //Test complex feature extraction
        var f = new seqJS.Feature('gene', 'join(2..7,20..30,complement(12..17))');
        var o = this.s.extract(f, true);
        equal(o.seq(), "CTAGTCATGAGCTAGGTATCGAT", 'Incorrect sequence');
        equal(feats2string(o.features()),
             'two=join(complement(4..6),20..23)|three=join(7..12,complement(18..20))|one=complement(18..23)',
             'incorrect features returned');
    });
*/

module('seqJS#location');

    test('invalid operator', function(){
        expect(1);
        throws(function(){
            new seqJS.Location(4, -1);
        }, "Invalid location operator '-1'");
    });

    test('invalid location', function(){
        expect(1);
        throws(function(){
            new seqJS.Location(-1);
        }, "Invalid location '-1'");
    });

    test('setting implicit exact', function(){
        var l = new seqJS.Location(5);
        location_eq(l, 5, '');
    });

    test('setting explicit before', function(){
        var l = new seqJS.Location(6, '<');
        location_eq(l, 6, '<');
    });

    test('setting explicit range', function(){
        var l = new seqJS.Location(6, '.', 8);
        location_eq(l, 6, '.', 8);
    });

    test('set invalid range', function(){
        expect(1);
        throws(function() {
            new seqJS.Location(8, '.', 6);
        });
    });

    test('invalid operator', function(){
        expect(1);
        throws(function(){
            new seqJS.Location(4, '!');
        }, "Invalid location operator '!'");
    });

    test('invalid location', function(){
        expect(1);
        throws(function(){
            new seqJS.Location(-1);
        }, "Invalid location '-1'");
    });

    test('fixed location from string', function(){
        var l = new seqJS.Location('6');
        location_eq(l, 5, '');
    });

    test('before location from string', function(){
        var l = new seqJS.Location('<6');
        location_eq(l, 5, '<');
    });
    test('after location from string', function(){
        var l = new seqJS.Location('>6');
        location_eq(l, 5, '>');
    });
    test('range location from string', function(){
        var l = new seqJS.Location('6.8');
        location_eq(l, 5, '.', 8);
    });
    test('invalid location string format', function(){
        expect(1);
        throws(function(){
            new seqJS.Location('!6');
        }, "Invalid location format '!6'");
    });
    test('invalid location string format 2', function(){
        expect(1);
        throws(function(){
            new seqJS.Location('67sds');
        }, "Invalid location format '67sds'");
    });

    test('invalid location range string', function(){
        expect(1);
        throws(function(){
            new seqJS.Location('8.6');
        });
    });

    test('add', function(){
        var l;

        l = new seqJS.Location('10');
        location_eq(l.add(5), 14, '');
        location_eq(l, 9, '');

        l = new seqJS.Location('<10');
        location_eq(l.add(6), 15, '<');
        location_eq(l, 9, '<');

        l = new seqJS.Location('>10');
        location_eq(l.add(6), 15, '>');
        location_eq(l, 9, '>');

        l = new seqJS.Location('5.10');
        location_eq(l.add(6), 10, '.', 16);
        location_eq(l, 4, '.', 10);

        l = new seqJS.Location('50');
        location_eq(l.add(-40), 9, '');
        location_eq(l, 49, '');
    });

    test('invertDatum', function() {
        var l;

        l = new seqJS.Location('5');
        location_eq(l.invertDatum(100), 95, '');
        location_eq(l, 4, '');

        l = new seqJS.Location('<5');
        location_eq(l.invertDatum(100), 95, '>');
        location_eq(l, 4, '<');

        l = new seqJS.Location('>5');
        location_eq(l.invertDatum(100), 95, '<');
        location_eq(l, 4, '>');

        l = new seqJS.Location('5.10');
        location_eq(l.invertDatum(100), 90, '.', 96);
        location_eq(l, 4, '.', 10);
    });
        
module('seqJS.Location.crop');
    var test_location_crop = function(loc, start, end, str){
        var l = new seqJS.Location(loc[0], loc[1], loc[2]);

        test(l.toString() + '.crop('+start+', '+end+')', function() {
            var original = l.toString();
            equal(l.crop(start,end).toString(), str, "crop with integers");
            equal(l.toString(), original, "Original location changed");
            equal(l.crop(new seqJS.Location(start),
                               new seqJS.Location(end)).toString(),
                        str, "crop with seqJS.Locations");
            equal(l.toString(), original, "Original location changed");
        });
    };

        test_location_crop([20], 10, 25, 'Location(10)');
        test_location_crop([20], 30, 45, 'Location(0)');
        test_location_crop([20], 10, 15, 'Location(5)');

        test_location_crop([20, '<'], 10, 25, 'Location(<10)');
        test_location_crop([20, '<'], 30, 45, 'Location(0)');
        test_location_crop([20, '<'], 10, 15, 'Location(<5)');

        test_location_crop([20, '>'], 10, 25, 'Location(>10)');
        test_location_crop([20, '>'], 30, 45, 'Location(>0)');
        test_location_crop([20, '>'], 10, 15, 'Location(5)');

        test_location_crop([20, '.', 30], 10, 35, 'Location(10.20)');
        test_location_crop([20, '.', 30], 25, 45, 'Location(0.5)');
        test_location_crop([20, '.', 30], 10, 25, 'Location(10.15)');
        test_location_crop([20, '.', 30], 35, 45, 'Location(0)');
        test_location_crop([20, '.', 30], 10, 15, 'Location(5)');


module('seqJS.Span');

    test('span from string A', function(){
        var s = new seqJS.Span('100..150');
        span_eq(s, 'Span(Location(99):Location(150))', false);
    });

    test('span from string B', function(){
        var s = new seqJS.Span('<100..>150');
        span_eq(s, 'Span(Location(<99):Location(>150))', false);
    });

    test('span from string C', function(){
        var s = new seqJS.Span('100.105..150');
        span_eq(s, 'Span(Location(99.105):Location(150))', false);
    });

    test('span from string D', function(){
        var s = new seqJS.Span('100..150.160');
        span_eq(s, 'Span(Location(99):Location(150.161))', false);
    });

    test('locations inverted', function(){
        expect(1);
        throws(function(){
            new seqJS.Span('200..100');
        });
    });

    test('bad formating', function(){
        expect(1);
        throws(function(){
            new seqJS.Span('100.200');
        });
    });

    test('invertDatum 5..10', function() {
        var s = new seqJS.Span('5..10');
        
        span_eq(s.invertDatum(100), 'Span(Location(90):Location(96))', true);
        span_eq(s, 'Span(Location(4):Location(10))', false);
    });
    test('invertDatum(11) 6..11', function() {
        var s = new seqJS.Span('6..11');
        
        span_eq(s.invertDatum(11), 'Span(Location(0):Location(6))', true);
        span_eq(s, 'Span(Location(5):Location(11))', false);
    });
    test('invertDatum 4.5..10.11', function() {
        var s = new seqJS.Span('4.5..10.11');
        
        span_eq(s.invertDatum(100), 'Span(Location(89.91):Location(96.98))', true);
        span_eq(s, 'Span(Location(3.5):Location(10.12))', false);
    });
    test('invertDatum <5..>10', function() {
        var s = new seqJS.Span('<5..>10');
        
        span_eq(s.invertDatum(100), 'Span(Location(<90):Location(>96))', true);
        span_eq(s, 'Span(Location(<4):Location(>10))', false);
    });

    test('add', function() {
        var s = new seqJS.Span('5..10');

        span_eq(s.add(5), 'Span(Location(9):Location(15))', false);
        span_eq(s, 'Span(Location(4):Location(10))', false);
    });


module('seqJS.Span.crop');
    var test_span_crop = function(span_left, span_right, start, end, expected_string){
        var span = new seqJS.Span(new seqJS.Location(span_left[0], span_left[1], span_left[2]),
                                  new seqJS.Location(span_right[0], span_right[1], span_right[2]));

        test(span.toString() + '.crop('+start+', '+end+')',
             function(){
            var original = span.toString();

            equal(span.crop(start,end).toString(), 
                  expected_string, 
                  "crop with integers");
            equal(span.toString(), original, "Span changed by crop calls");

            equal(span.crop(new seqJS.Location(start),
                            new seqJS.Location(end)).toString(), 
                  expected_string, 
                  "crop with Locations");

            equal(span.toString(), original, "Span changed by crop calls");
        });
    };

        test_span_crop([20],[30], 10, 40, 'Span(Location(10):Location(20))');
        test_span_crop([20],[30], 25, 40, 'Span(Location(0):Location(5))');
        test_span_crop([20],[30], 10, 25, 'Span(Location(10):Location(15))');

        test_span_crop([20, '<'],[30, '>'], 10, 40, 'Span(Location(<10):Location(>20))');
        test_span_crop([20, '<'],[30, '>'], 25, 40, 'Span(Location(0):Location(>5))');
        test_span_crop([20, '<'],[30, '>'], 10, 25, 'Span(Location(<10):Location(15))');


module('seqJS.SpanOperator.crop');
    var test_spanoperator_crop = function(op, spans, crop_start, crop_end, crop_complement, expected_string){
        var so = new seqJS.SpanOperator(spans.map(function(x){
            return new seqJS.Span(new seqJS.Location(x[0][0], x[0][1], x[0][2]),
                                  new seqJS.Location(x[1][0], x[1][1], x[1][2]));
            }), op);

        test(so.toString(-1)+'.crop(' + crop_start + ', ' + crop_end + ', ' + crop_complement + ')',
             function() {
                 var original = so.toString(-1);
                 equal(to_str(so.crop(crop_start, 
                               crop_end, 
                               crop_complement)), 
                               expected_string,
                               "crop with integers");
                 equal(so.toString(-1), original, "crop changed original");
                 equal(to_str(so.crop(new seqJS.Location(crop_start), 
                               new seqJS.Location(crop_end), 
                               crop_complement)), 
                               expected_string,
                               "crop with seqJS.Locations");
                 equal(so.toString(-1), original, "crop changed original");
        });
    };

    /*
     * SpanOperator with one span
     */

    test_spanoperator_crop('', [[[20], [30]]], 10, 40, false, "SpanOperator('', length=1, [Span(Location(10):Location(20))])");
    test_spanoperator_crop('', [[[20], [30]]], 10, 25, false, "SpanOperator('', length=1, [Span(Location(10):Location(15))])");
    test_spanoperator_crop('', [[[20], [30]]], 25, 40, false, "SpanOperator('', length=1, [Span(Location(0):Location(5))])");

    test_spanoperator_crop('', [[[20], [30]]], 10, 40, true, "SpanOperator('complement', length=1, [Span(Location(10):Location(20))])");
    test_spanoperator_crop('', [[[20], [30]]], 10, 25, true, "SpanOperator('complement', length=1, [Span(Location(0):Location(5))])");
    test_spanoperator_crop('', [[[20], [30]]], 25, 40, true, "SpanOperator('complement', length=1, [Span(Location(10):Location(15))])");
    test_spanoperator_crop('complement', [[[20], [30]]], 10, 40, true, "SpanOperator('', length=1, [Span(Location(10):Location(20))])");
    test_spanoperator_crop('complement', [[[20], [30]]], 10, 25, true, "SpanOperator('', length=1, [Span(Location(0):Location(5))])");
    test_spanoperator_crop('complement', [[[20], [30]]], 25, 40, true, "SpanOperator('', length=1, [Span(Location(10):Location(15))])");

    /*
     * SpanOperator.crop with multiple Spans
     */
    test_spanoperator_crop( 'join', [[[20],[30]], [[40], [50]]], 25, 45, false, 
                           "SpanOperator('join', length=2, [Span(Location(0):Location(5)), Span(Location(15):Location(20))])");
    test_spanoperator_crop('order', [[[20],[30]], [[40], [50]]], 25, 45, false, 
                           "SpanOperator('order', length=2, [Span(Location(0):Location(5)), Span(Location(15):Location(20))])");
    test_spanoperator_crop( 'join', [[[20],[30]], [[40], [50]]], 25, 45, true, 
                           "SpanOperator('complement', length=1, [SpanOperator('join', length=2, [Span(Location(0):Location(5)), Span(Location(15):Location(20))])])");
    test_spanoperator_crop('order', [[[20],[30]], [[40], [50]]], 25, 45, true, 
                           "SpanOperator('complement', length=1, [SpanOperator('order', length=2, [Span(Location(0):Location(5)), Span(Location(15):Location(20))])])");

    /*
     * SpanOperator.crop test dropouts
     */
    test_spanoperator_crop( 'join', [[[20],[30]], [[40], [50]]], 35, 45, false, 
                           "SpanOperator('', length=1, [Span(Location(5):Location(10))])");

    test_spanoperator_crop('order', [[[20],[30]], [[40], [50]]], 35, 45, false, 
                           "SpanOperator('', length=1, [Span(Location(5):Location(10))])");

    test_spanoperator_crop( 'join', [[[20],[30]], [[40], [50]]], 35, 45, true, 
                           "SpanOperator('complement', length=1, [Span(Location(0):Location(5))])");

    test_spanoperator_crop('order', [[[20],[30]], [[40], [50]]], 35, 45, true, 
                           "SpanOperator('complement', length=1, [Span(Location(0):Location(5))])");

    test_spanoperator_crop( 'join', [[[20],[30]], [[40], [50]]], 30, 40, true, 
                           "null");

    test_spanoperator_crop('order', [[[20],[30]], [[40], [50]]], 30, 40, true, 
                           "null");

module('seqJS#FeatureLocation');

    test('parse A..B', function(){
        var l = new seqJS.FeatureLocation('100..200');

        featureloc_eq(l, '100..200');

    });

    test('parse <A..B', function(){
        var l = new seqJS.FeatureLocation('<100..200');

        featureloc_eq(l, '<100..200');
    });

    test('parse A.B..C', function(){
        var l = new seqJS.FeatureLocation('100.102..200');

        featureloc_eq(l, '100.102..200');
    });

    test('parse complement(A..B)', function(){
        var l = new seqJS.FeatureLocation('complement(100..200)');

        featureloc_eq(l, 'complement(100..200)');
    });

    test('parse join(A..B,C..D)', function(){
        var l = new seqJS.FeatureLocation('join(100..200,300..400)');

        featureloc_eq(l, 'join(100..200,300..400)');
    });

    test('parse order(A..B,C..D)', function(){
        var l = new seqJS.FeatureLocation('order(100..200,300..400)');

        featureloc_eq(l, 'order(100..200,300..400)');
    });

    test('parse complement(join(A..B,C..D))', function(){
        var l = new seqJS.FeatureLocation(
            'complement(join(100..200,300..400))');

        featureloc_eq(l, 'complement(join(100..200,300..400))');
    });

    test('parse join(complement(C..D),complement(A..B))', function(){
        var l = new seqJS.FeatureLocation(
            'join(complement(300..400),complement(100..200))');

        featureloc_eq(l, 
            'join(complement(300..400),complement(100..200))');
    });

    test('parse join(A..B,complement(join(E..F,C..D)))', function(){
        var l = new seqJS.FeatureLocation(
            'join(100..200,complement(join(500..600,300..400)))');

        featureloc_eq(l, 
            'join(100..200,complement(join(500..600,300..400)))');
    });

    test('fail complement(B..A)', function(){
        expect(1);

        throws(function(){
            new seqJS.FeatureLocation('complement(200..100)');
        });
    });

    test('fail join(A..B,order(C..D,E..F))', function(){
        expect(1);

        throws(function(){
            new seqJS.FeatureLocation(
                'join(100..200,order(300..400,500..600))');
        });
    });

    test('start and end', function() {

        var f = new seqJS.FeatureLocation('join(10..20,5..6)');
        equal(f.start(), 4);
        equal(f.end(), 20);

        f = new seqJS.FeatureLocation('join(10..20,complement(5..6))');
        equal(f.start(), 4);
        equal(f.end(), 20);

        f = new seqJS.FeatureLocation('order(10..20,5..6)');
        equal(f.start(), 4);
        equal(f.end(), 20);

    });

module('seqJS.FeatureLocation.crop');

    var parse_spanoperator_array = function(rhs){
        //If we have a SpanOperator - ['string', [ list_of_other_things ]]
        if(typeof rhs[0] === 'string' || rhs[0] instanceof String){
            return new seqJS.SpanOperator(rhs[1].map(function(x){return parse_spanoperator_array(x);}),
                                          rhs[0]);
        }
        //otherwise, we have a span - [[a,b,c], [d,e,f]]
        return new seqJS.Span(new seqJS.Location(rhs[0][0], rhs[0][1], rhs[0][2]),
                              new seqJS.Location(rhs[1][0], rhs[1][1], rhs[1][2]));
    };


    var test_featurelocation_crop = function(lhsa, rhsa, expected_string){

        var lhs = new seqJS.FeatureLocation(parse_spanoperator_array(lhsa)),
            rhs = new seqJS.FeatureLocation(parse_spanoperator_array(rhsa));

        test(lhs.toString(-1) + '.crop('+rhs.toString(-1)+')', function(){
            var original = lhs.toString(-1);

            equal(to_str(lhs.crop(rhs)), expected_string, "crop returned incorrectly");
            equal(to_str(lhs), original, "crop changed FeatureLocation");
        });
    };

    /*
     * One on One
     *  Contained
     */

    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['', [ [[10], [40]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(10):Location(20))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['', [ [[10], [40]] ] ],
                              "FeatureLocation(SpanOperator('complement', length=1, [Span(Location(10):Location(20))]))");
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [40]] ] ],
                              "FeatureLocation(SpanOperator('complement', length=1, [Span(Location(10):Location(20))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [40]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(10):Location(20))]))");

    /*
     * One on One
     *  Cropped
     */
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['', [ [[25], [40]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(0):Location(5))]))");
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['', [ [[10], [25]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(10):Location(15))]))");

    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['complement', [ [[25], [40]] ] ],
                              "FeatureLocation(SpanOperator('complement', length=1, [Span(Location(10):Location(15))]))");
    test_featurelocation_crop(['', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [25]] ] ],
                              "FeatureLocation(SpanOperator('complement', length=1, [Span(Location(0):Location(5))]))");

    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['complement', [ [[25], [40]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(10):Location(15))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['complement', [ [[10], [25]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(0):Location(5))]))");

    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['', [ [[25], [40]] ] ],
                              "FeatureLocation(SpanOperator('complement', length=1, [Span(Location(0):Location(5))]))");
    test_featurelocation_crop(['complement', [ [[20], [30]] ] ], 
                              ['', [ [[10], [25]] ] ],
                              "FeatureLocation(SpanOperator('complement', length=1, [Span(Location(10):Location(15))]))");

    test_featurelocation_crop(['', [ [[20], [40]] ] ], 
                              ['', [ [[25], [35]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(0):Location(10))]))");
    test_featurelocation_crop(['complement', [ [[20], [40]] ] ], 
                              ['', [ [[25], [35]] ] ],
                              "FeatureLocation(SpanOperator('complement', length=1, [Span(Location(0):Location(10))]))");
    test_featurelocation_crop(['complement', [ [[20], [40]] ] ], 
                              ['complement', [ [[25], [35]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(0):Location(10))]))");

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
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(0):Location(5))]))");
    test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                              ['join', [ [[10], [20]], [[35], [40]] ] ],
                              "null");
    test_featurelocation_crop(['join', [ [[20], [30]], [[40], [45]] ] ], 
                              ['join', [ [[10], [20]], [[25], [40]] ] ],
                              "FeatureLocation(SpanOperator('', length=1, [Span(Location(0):Location(5))]))");

    /*
     * Multiple output
     *   join
     */
    
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('join', length=2, ["+
                                  "SpanOperator('', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['join', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('join', length=2, ["+
                                  "SpanOperator('', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('complement', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ], 
                              ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('join', length=2, ["+
                                  "SpanOperator('', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('complement', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ]] , 
                              ['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('join', length=2, ["+
                                  "SpanOperator('complement', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['join', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['join', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('join', length=2, ["+
                                  "SpanOperator('complement', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('', length=1, [Span(Location(10):Location(15))])"+
                             "]))");

    /*
     * Multiple output
     *   order
     */
    
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('order', length=2, ["+
                                  "SpanOperator('', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['order', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('order', length=2, ["+
                                  "SpanOperator('', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('complement', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['complement', [[[40], [45]]]] ] ], 
                              ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('order', length=2, ["+
                                  "SpanOperator('', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('complement', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ]] , 
                              ['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('order', length=2, ["+
                                  "SpanOperator('complement', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('', length=1, [Span(Location(10):Location(15))])"+
                             "]))");
    test_featurelocation_crop(['order', [['', [[[20], [30]]]], ['', [[[40], [45]]]] ] ], 
                              ['order', [['complement', [[[20], [30]]]], ['', [[[40], [45]]]] ] ],
                              "FeatureLocation(SpanOperator('order', length=2, ["+
                                  "SpanOperator('complement', length=1, [Span(Location(0):Location(10))]),"+
                                  "SpanOperator('', length=1, [Span(Location(10):Location(15))])"+
                             "]))");


module('seqJS#Feature');

    test('type and location', function(){

        var f = new seqJS.Feature('gene', '100..200');

        feature_eq(f, 'gene', '100..200', []);

        equal(f.type('CDS'), f, "f.type(new) should be chainable");
        equal(f.location('200.202..300'), f, 
              "f.location(new) should be chainable");

        feature_eq(f, 'CDS', '200.202..300', []);
    });

    test('set qualifiers', function(){
        expect(3);

        var f = new seqJS.Feature('gene', '100..200');

        equal(f.qualifier('gene'), undefined);
        equal(f.qualifier('gene', 'GENE'), f);
        equal(f.qualifier('gene'), 'GENE');
    });

    test('clearQualifiers', function(){
        var f = new seqJS.Feature('CDS', '200.202..300', 
                              {q1: 'q1', q2: 'q2', q3: 'q3', q4: 'q4'});

        var qk = f.qualifierKeys();
        equal(qk.length, 4, "wrong number of qualifiers");
        for(var i=0; i< 4; i++){
            equal(qk[i], 'q'+(i+1), 'Item '+i+' is wrong');
        }

        feature_eq(f, 'CDS', '200.202..300', [
            ['q1', 'q1'],
            ['q2', 'q2'],
            ['q3', 'q3'],
            ['q4', 'q4'],
        ]);

        f.clearQualifiers(['q1','q2']);
        feature_eq(f, 'CDS', '200.202..300', [
            ['q3', 'q3'],
            ['q4', 'q4'],
        ]);
        
        f.clearQualifiers('q3');
        feature_eq(f, 'CDS', '200.202..300', [
            ['q4', 'q4'],
        ]);

        f.clearQualifiers();
        feature_eq(f, 'CDS', '200.202..300', []);
    });

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
             


  module('jQuery#seqJS', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.elems.seqJS(), this.elems, 'should be chainable');
  });

  test('is awesome', function() {
    expect(1);
    strictEqual(this.elems.seqJS().text(), 'awesome0awesome1awesome2', 'should be awesome');
  });

  module('jQuery.seqJS');

  test('is awesome', function() {
    expect(2);
    strictEqual($.seqJS(), 'awesome.', 'should be awesome');
    strictEqual($.seqJS({punctuation: '!'}), 'awesome!', 'should be thoroughly awesome');
  });

  module(':seqJS selector', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is awesome', function() {
    expect(1);
    // Use deepEqual & .get() when comparing jQuery objects.
    deepEqual(this.elems.filter(':seqJS').get(), this.elems.last().get(), 'knows awesome when it sees it');
  });

}(jQuery));
