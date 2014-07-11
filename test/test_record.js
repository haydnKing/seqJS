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
/*
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
        equal(f.length, 1, 'wrong number of features returned');
        equal(f[0].location().toString(), '13..17');

        //test intersection
        f = s.features(9,17,true);
        equal(f.length, 3, 'wrong number of features returned');
        equal(f[0].location().toString(), 'join(5..10,20..25)');
        equal(f[1].location().toString(), 'complement(7..15)');
        equal(f[2].location().toString(), '13..17');

    });
*/
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
        equal(o.features()[0].location().toString(), 'complement(1..6)', 'Feature 1');
        equal(o.features()[1].location().toString(), '2..10', 'Feature 2');
        equal(o.features()[2].location().toString(), '6..11', 'Feature 3');
    });
    test('extract complement(10..20)  with features', function() {
        var f = new seqJS.Feature('gene', 'complement(10..20)');
        var o = this.s.extract(f, true);
        equal(o.seq(), "TCGATCGATAT", 'Incorrect sequence');
        equal(o.features().length, 3, 'Incorrect number of features');
        equal(o.features()[0].location().toString(), 'complement(2..10)', 'Feature 1');
        equal(o.features()[1].location().toString(), '6..11)', 'Feature 2');
        equal(o.features()[2].location().toString(), 'complement(1..6)', 'Feature 3');
    });
    test('extract join(10..19,20..29) with features', function() {
        //Test multi span extraction
        var f = new seqJS.Feature('gene', 'join(10..19,20..29)');
        var o = this.s2.extract(f, true);
        equal(o.seq(), "ATATCGATCGATGAGCTAGG", 'Incorrect sequence');
        equal(o.features().length, 1, 'Incorrect number of features');
        equal(o.features()[0].location().toString(), 'order(1..10,11..20)', 'Feature 1');
    });
    test('extract join(2..7,20..30,complement(12..17)) with features', function() {       
        //Test complex feature extraction
        var f = new seqJS.Feature('gene', 'join(2..7,20..30,complement(12..17))');
        var o = this.s.extract(f, true);
        equal(o.seq(), "CTAGTCATGAGCTAGGTATCGAT", 'Incorrect sequence');
        equal(o.features().length, 3, 'Incorrect number of features');
        equal(o.features()[0].location().toString(), '18..23', 'Feature 1');
        equal(o.features()[1].location().toString(), 'order(4..6,complement(20..23))', 'Feature 2');
        equal(o.features()[2].location().toString(), 'order(complement(18..20),7..12)', 'Feature 3');
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
        


module('seqJS.Span');

    test('span from string A', function(){
        var s = new seqJS.Span('100..150');
        span_eq(s, [99, ''], [150, ''], false, '100..150');
    });

    test('span from string B', function(){
        var s = new seqJS.Span('<100..>150');
        span_eq(s, [99, '<'], [150, '>'], false, '<100..>150');
    });

    test('span from string C', function(){
        var s = new seqJS.Span('100.105..150');
        span_eq(s, [99, '.', 105], [150, ''], false, '100.105..150');
    });

    test('span from string D', function(){
        var s = new seqJS.Span('100..150.160');
        span_eq(s, [99, ''], [150, '.', 161], false, '100..150.160');
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
        
        span_eq(s.invertDatum(100), [90, ''], [96, ''], true, '91..96');
        span_eq(s, [4], [10], false, '5..10');
    });
    test('invertDatum 4.5..10.11', function() {
        var s = new seqJS.Span('4.5..10.11');
        
        span_eq(s.invertDatum(100), [89, '.', 91], [96, '.', 98], true, '90.91..96.97');
        span_eq(s, [3, '.', 5], [10, '.', 12], false, '4.5..10.11');
    });
    test('invertDatum <5..>10', function() {
        var s = new seqJS.Span('<5..>10');
        
        span_eq(s.invertDatum(100), [90, '<'], [96, '>'], true, '<91..>96');
        span_eq(s, [4, '<'], [10, '>'], false, '<5..>10');
    });

module('seqJS#FeatureLocation');

    test('parse A..B', function(){
        var l = new seqJS.FeatureLocation('100..200');

        featureloc_eq(l, '100..200', '', [
                      [[99],[200],false,'100..200']
        ]);

    });

    test('parse <A..B', function(){
        var l = new seqJS.FeatureLocation('<100..200');

        featureloc_eq(l, '<100..200', '', [
                      [[99, '<'],[200],false,'<100..200']
        ]);
    });

    test('parse A.B..C', function(){
        var l = new seqJS.FeatureLocation('100.102..200');

        featureloc_eq(l, '100.102..200', '', [
                      [[99, '.', 102],[200],false,'100.102..200']
        ]);
    });

    test('parse complement(A..B)', function(){
        var l = new seqJS.FeatureLocation('complement(100..200)');

        featureloc_eq(l, 'complement(100..200)', '', [
                      [[99],[200],true,'100..200']
        ]);
    });

    test('parse join(A..B,C..D)', function(){
        var l = new seqJS.FeatureLocation('join(100..200,300..400)');

        featureloc_eq(l, 'join(100..200,300..400)', 'join', [
                      [[99],[200],false,'100..200'],
                      [[299],[400],false,'300..400']
        ]);
    });

    test('parse order(A..B,C..D)', function(){
        var l = new seqJS.FeatureLocation('order(100..200,300..400)');

        featureloc_eq(l, 'order(100..200,300..400)', 'order', [
                      [[99],[200],false,'100..200'],
                      [[299],[400],false,'300..400']
        ]);
    });

    test('parse complement(join(A..B,C..D))', function(){
        var l = new seqJS.FeatureLocation(
            'complement(join(100..200,300..400))');

        featureloc_eq(l, 'complement(join(100..200,300..400))', 'join', [
                      [[299],[400],true,'300..400'],
                      [[99],[200],true,'100..200']
        ]);
    });

    test('parse join(complement(C..D),complement(A..B))', function(){
        var l = new seqJS.FeatureLocation(
            'join(complement(300..400),complement(100..200))');

        featureloc_eq(l, 
            'join(complement(300..400),complement(100..200))', 'join', [
                      [[299],[400],true,'300..400'],
                      [[99],[200],true,'100..200']
        ]);
    });

    test('parse join(A..B,complement(join(E..F,C..D)))', function(){
        var l = new seqJS.FeatureLocation(
            'join(100..200,complement(join(500..600,300..400)))');

        featureloc_eq(l, 
            'join(100..200,complement(join(500..600,300..400)))', 
            'join', [
                      [[99],[200],false,'100..200'],
                      [[299],[400],true,'300..400'],
                      [[499],[600],true,'500..600']
        ]);
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
