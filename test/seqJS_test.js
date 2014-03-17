/*global seqJS:true  */

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
        var l = new seqJS.Seq("ATcGAT", seqJS.ALPH_PROT);
        equal(l.seq(), "ATCGAT");
        equal(l.length(), 6);
        equal(l.alphabet(), seqJS.ALPH_PROT);
    });

    test('require an alphabet', function(){
        expect(1);
        throws(function() {new seqJS.Seq("ATcGAT");},
               'Argument alphabet is required');
    });

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


    module('seqJS#location');

    test('setting implicit exact', function(){
        expect(3);
        var l = new seqJS.Location(5);
        equal(l.location(), 5);
        equal(typeof l.location(), 'number');
        equal(l.operator(), '');
    });

    test('setting explicit before', function(){
        expect(3);
        var l = new seqJS.Location(6, '<');
        equal(l.location(), 6);
        equal(typeof l.location(), 'number');
        equal(l.operator(), '<');
    });

    test('setting explicit range', function(){
        expect(5);
        var l = new seqJS.Location(6, '.', 8);
        equal(l.location(), 6);
        equal(typeof l.location(), 'number');
        equal(l.operator(), '.');
        equal(l.location2(), 8);
        equal(typeof l.location2(), 'number');
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
        expect(4);
        var l = new seqJS.Location('6');
        equal(l.location(), 6);
        equal(typeof l.location(), 'number');
        equal(l.operator(), '');
        equal(l.location2(), undefined);
    });

    test('before location from string', function(){
        expect(4);
        var l = new seqJS.Location('<6');
        equal(l.location(), 6);
        equal(typeof l.location(), 'number');
        equal(l.operator(), '<');
        equal(l.location2(), undefined);
    });
    test('after location from string', function(){
        expect(4);
        var l = new seqJS.Location('>6');
        equal(l.location(), 6);
        equal(typeof l.location(), 'number');
        equal(l.operator(), '>');
        equal(l.location2(), undefined);
    });
    test('range location from string', function(){
        expect(5);
        var l = new seqJS.Location('6.8');
        equal(l.location(), 6);
        equal(typeof l.location(), 'number');
        equal(l.operator(), '.');
        equal(l.location2(), 8);
        equal(typeof l.location2(), 'number');
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

    module('seqJS.Span');

    test('span from string A', function(){
        expect(8);
        var s = new seqJS.Span('100..150');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '');
        equal(s.location1().location2(), undefined);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '');
        equal(s.location2().location2(), undefined);

        equal(s.isComplement(), false);
        equal(s.toString(), '100..150');
    });

    test('span from string B', function(){
        expect(8);
        var s = new seqJS.Span('<100..>150');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '<');
        equal(s.location1().location2(), undefined);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '>');
        equal(s.location2().location2(), undefined);

        equal(s.isComplement(), false);
        equal(s.toString(), '<100..>150');
    });

    test('span from string C', function(){
        expect(8);
        var s = new seqJS.Span('100.105..150');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '.');
        equal(s.location1().location2(), 105);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '');
        equal(s.location2().location2(), undefined);

        equal(s.isComplement(), false);
        equal(s.toString(), '100.105..150');
    });

    test('span from string D', function(){
        expect(8);
        var s = new seqJS.Span('100..150.160');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '');
        equal(s.location1().location2(), undefined);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '.');
        equal(s.location2().location2(), 160);

        equal(s.isComplement(), false);

        equal(s.toString(), '100..150.160');
    });

    test('span from string E', function(){
        expect(8);
        var s = new seqJS.Span('complement(<100..>150)');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '<');
        equal(s.location1().location2(), undefined);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '>');
        equal(s.location2().location2(), undefined);

        equal(s.isComplement(), true);

        equal(s.toString(), 'complement(<100..>150)');
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
        expect(1);
        var l = new seqJS.FeatureLocation('100..200');

        equal(l.toString(), '100..200');
    });

    test('parse <A..B', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('<100..200');

        equal(l.toString(), '<100..200');
    });

    test('parse A.B..C', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('100.102..200');

        equal(l.toString(), '100.102..200');
    });

    test('parse complement(A..B)', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('complement(100..200)');

        equal(l.toString(), 'complement(100..200)');
    });

    test('parse join(A..B,C..D)', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('join(100..200,300..400)');

        equal(l.toString(), 'join(100..200,300..400)');
    });

    test('parse order(A..B,C..D)', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('order(100..200,300..400)');

        equal(l.toString(), 'order(100..200,300..400)');
    });

    test('parse complement(join(A..B,C..D))', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('complement(join(100..200,300..400))');

        equal(l.toString(), 'complement(join(100..200,300..400))');
    });

    test('parse join(complement(C..D),complement(A..B))', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('join(complement(300..400),complement(100..200))');

        equal(l.toString(), 'join(complement(300..400),complement(100..200))');
    });

    test('parse join(A..B,complement(join(E..F,C..D)))', function(){
        expect(1);
        var l = new seqJS.FeatureLocation('join(100..200,complement(join(500..600,300..400)))');

        equal(l.toString(), 'join(100..200,complement(join(500..600,300..400)))');
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
            new seqJS.FeatureLocation('join(100..200,order(300..400,500..600))');
        });
    });


    /*
    module('seqJS#parser_genbank', {
        setup: function() {
            this.parser = seqJS.getParser('genbank');
            this.data = TEST_DATA.parser_genbank;
        }
    });

    test('parse valid 0', function(){
        expect(1);
        deepEqual(this.parser.parse(this.data.valid[0].string),
                  this.data.valid[0].object);
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
*/
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
