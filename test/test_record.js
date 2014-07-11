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

    test('extract feature sequence', function() {

        var s = new seqJS.Seq(
            'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
            'DNA');

        var f = new seqJS.Feature('gene', '10..20');
        equal(s.extract(f).seq(), "ATATCGATCGA", '10..20');

        f = new seqJS.Feature('gene', 'complement(10..20)');
        equal(s.extract(f).seq(), "TCGATCGATAT", 'complement(10..20)');

        f = new seqJS.Feature('gene', 'join(10..20,30..40)');
        equal(s.extract(f).seq(), "ATATCGATCGATAGCTAGTCGA", 'join(10..20,30..40)');

        f = new seqJS.Feature('gene', 'join(10..20,complement(30..40))');
        equal(s.extract(f).seq(), "ATATCGATCGATCGACTAGCTA", 'join(10..20,complement(30..40))');

    });

    test('extract feature sequence with features', function() {

        var s = new seqJS.Seq(
            'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
            'DNA',
            [
                new seqJS.Feature('one', '11..19'),
                new seqJS.Feature('two', 'complement(5..15)'),
                new seqJS.Feature('three', '15..25')
            ]);
        var s2 = new seqJS.Seq(
            'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
            'DNA',
            [
                new seqJS.Feature('one', '1..46')
            ]);

        //Test simple feature extraction
        var f = new seqJS.Feature('gene', '10..20');
        var o = s.extract(f, true);
        equal(o.seq(), "ATATCGATCGA", '10..20');
        equal(o.features().length, 3, 'Incorrect number of features');
        equal(o.features()[0].location().toString(), '2..10');
        equal(o.features()[1].location().toString(), 'complement(1..6)');
        equal(o.features()[2].location().toString(), '6..10');

        f = new seqJS.Feature('gene', 'complement(10..20)');
        o = s.extract(f, true);
        equal(o.seq(), "TCGATCGATAT", 'complement(10..20)');
        equal(o.features().length, 3, 'Incorrect number of features');
        equal(o.features()[0].location().toString(), 'complement(2..10)');
        equal(o.features()[1].location().toString(), '6..11)');
        equal(o.features()[2].location().toString(), 'complement(1..6)');

        //Test multi span extraction
        f = new seqJS.Feature('gene', 'join(10..19,20..29)');
        o = s2.extract(f, true);
        equal(o.seq(), "ATATCGATCGATGAGCTAGG", 'join(10..19,20..29)');
        equal(o.features().length, 1, 'Incorrect number of features');
        equal(o.features()[0].location().toString(), 'order(1..10,11..20)');
        
        //Test complex feature extraction
        f = new seqJS.Feature('gene', 'join(2..7,20..30,complement(12..17))');
        o = s.extract(f, true);
        equal(o.seq(), "CTAGTCATGAGCTAGGTATCGAT", 
              'join(2..7,20..30,complement(12..17))');
        equal(o.features().length, 3, 'Incorrect number of features');
        equal(o.features()[0].location().toString(), '18..23');
        equal(o.features()[1].location().toString(), 'order(4..6,complement(20..23))');
        equal(o.features()[2].location().toString(), 'order(complement(18..20),7..12)');
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
        equal(f.length, 1, 'wrong number of features returned');
        equal(f[0].location().toString(), '13..17');

        //test intersection
        f = s.features(9,17,true);
        equal(f.length, 3, 'wrong number of features returned');
        equal(f[0].location().toString(), 'join(5..10,20..25)');
        equal(f[1].location().toString(), 'complement(7..15)');
        equal(f[2].location().toString(), '13..17');

    });


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
        location_eq(l, 5, '.', 7);
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
        l.add(5);
        location_eq(l, 14, '');

        l = new seqJS.Location('<10');
        l.add(6);
        location_eq(l, 15, '<');

        l = new seqJS.Location('>10');
        l.add(6);
        location_eq(l, 15, '>');

        l = new seqJS.Location('5.10');
        l.add(6);
        location_eq(l, 10, '.', 15);

        l = new seqJS.Location('50');
        l.add(-40);
        location_eq(l, 9, '');
    });

    test('reverse', function() {
        var l;

        l = new seqJS.Location('5');
        l.reverse(100);
        location_eq(l, 95, '');

        l = new seqJS.Location('<5');
        l.reverse(100);
        location_eq(l, 95, '>');

        l = new seqJS.Location('>5');
        l.reverse(100);
        location_eq(l, 95, '<');

        l = new seqJS.Location('5.10');
        l.reverse(100);
        location_eq(l, 90, '.', 95);
    });
        


module('seqJS.Span');

    test('span from string A', function(){
        var s = new seqJS.Span('100..150');
        span_eq(s, [99, ''], [149, ''], false, '100..150');
    });

    test('span from string B', function(){
        var s = new seqJS.Span('<100..>150');
        span_eq(s, [99, '<'], [149, '>'], false, '<100..>150');
    });

    test('span from string C', function(){
        var s = new seqJS.Span('100.105..150');
        span_eq(s, [99, '.', 104], [149, ''], false, '100.105..150');
    });

    test('span from string D', function(){
        var s = new seqJS.Span('100..150.160');
        span_eq(s, [99, ''], [149, '.', 159], false, '100..150.160');
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


module('seqJS#FeatureLocation');

    test('parse A..B', function(){
        var l = new seqJS.FeatureLocation('100..200');

        featureloc_eq(l, '100..200', '', [
                      [[99],[199],false,'100..200']
        ]);

    });

    test('parse <A..B', function(){
        var l = new seqJS.FeatureLocation('<100..200');

        featureloc_eq(l, '<100..200', '', [
                      [[99, '<'],[199],false,'<100..200']
        ]);
    });

    test('parse A.B..C', function(){
        var l = new seqJS.FeatureLocation('100.102..200');

        featureloc_eq(l, '100.102..200', '', [
                      [[99, '.', 101],[199],false,'100.102..200']
        ]);
    });

    test('parse complement(A..B)', function(){
        var l = new seqJS.FeatureLocation('complement(100..200)');

        featureloc_eq(l, 'complement(100..200)', '', [
                      [[99],[199],true,'100..200']
        ]);
    });

    test('parse join(A..B,C..D)', function(){
        var l = new seqJS.FeatureLocation('join(100..200,300..400)');

        featureloc_eq(l, 'join(100..200,300..400)', 'join', [
                      [[99],[199],false,'100..200'],
                      [[299],[399],false,'300..400']
        ]);
    });

    test('parse order(A..B,C..D)', function(){
        var l = new seqJS.FeatureLocation('order(100..200,300..400)');

        featureloc_eq(l, 'order(100..200,300..400)', 'order', [
                      [[99],[199],false,'100..200'],
                      [[299],[399],false,'300..400']
        ]);
    });

    test('parse complement(join(A..B,C..D))', function(){
        var l = new seqJS.FeatureLocation(
            'complement(join(100..200,300..400))');

        featureloc_eq(l, 'complement(join(100..200,300..400))', 'join', [
                      [[299],[399],true,'300..400'],
                      [[99],[199],true,'100..200']
        ]);
    });

    test('parse join(complement(C..D),complement(A..B))', function(){
        var l = new seqJS.FeatureLocation(
            'join(complement(300..400),complement(100..200))');

        featureloc_eq(l, 
            'join(complement(300..400),complement(100..200))', 'join', [
                      [[299],[399],true,'300..400'],
                      [[99],[199],true,'100..200']
        ]);
    });

    test('parse join(A..B,complement(join(E..F,C..D)))', function(){
        var l = new seqJS.FeatureLocation(
            'join(100..200,complement(join(500..600,300..400)))');

        featureloc_eq(l, 
            'join(100..200,complement(join(500..600,300..400)))', 
            'join', [
                      [[99],[199],false,'100..200'],
                      [[299],[399],true,'300..400'],
                      [[499],[599],true,'500..600']
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
        equal(f.end(), 19);

        f = new seqJS.FeatureLocation('join(10..20,complement(5..6))');
        equal(f.start(), 4);
        equal(f.end(), 19);

        f = new seqJS.FeatureLocation('order(10..20,5..6)');
        equal(f.start(), 4);
        equal(f.end(), 19);

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
        ok(!a.overlaps(c), '100..200 shouldi not overlap with join(1..99,201..300)');
        ok(b.overlaps(c), '150..250 should overlap with join(1..99,201..300)');

        //test numbers
        ok(a.overlaps(149,249), '100..200 should overlap with 149,249');
        ok(!a.overlaps(200,249), '100..200 should not overlap with 200,249');

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
