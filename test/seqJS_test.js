/*global seqJS:true  */

(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
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
        expect(2);
        var l = new seqJS.Location(5);
        equal(l.location(), 5);
        equal(l.operator(), '');
    });

    test('setting explicit before', function(){
        expect(2);
        var l = new seqJS.Location(6, '<');
        equal(l.location(), 6);
        equal(l.operator(), '<');
    });

    test('setting explicit range', function(){
        expect(3);
        var l = new seqJS.Location(6, '.', 8);
        equal(l.location(), 6);
        equal(l.operator(), '.');
        equal(l.location2(), 8);
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
        expect(3);
        var l = new seqJS.Location('6');
        equal(l.location(), 6);
        equal(l.operator(), '');
        equal(l.location2(), undefined);
    });

    test('before location from string', function(){
        expect(3);
        var l = new seqJS.Location('<6');
        equal(l.location(), 6);
        equal(l.operator(), '<');
        equal(l.location2(), undefined);
    });
    test('after location from string', function(){
        expect(3);
        var l = new seqJS.Location('>6');
        equal(l.location(), 6);
        equal(l.operator(), '>');
        equal(l.location2(), undefined);
    });
    test('range location from string', function(){
        expect(3);
        var l = new seqJS.Location('6.8');
        equal(l.location(), 6);
        equal(l.operator(), '.');
        equal(l.location2(), 8);
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
        expect(7);
        var s = new seqJS.Span('100..150');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '');
        equal(s.location1().location2(), undefined);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '');
        equal(s.location2().location2(), undefined);

        equal(s.toString(), '100..150');
    });

    test('span from string B', function(){
        expect(7);
        var s = new seqJS.Span('<100..>150');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '<');
        equal(s.location1().location2(), undefined);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '>');
        equal(s.location2().location2(), undefined);

        equal(s.toString(), '<100..>150');
    });

    test('span from string C', function(){
        expect(7);
        var s = new seqJS.Span('100.105..150');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '.');
        equal(s.location1().location2(), 105);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '');
        equal(s.location2().location2(), undefined);

        equal(s.toString(), '100.105..150');
    });

    test('span from string D', function(){
        expect(7);
        var s = new seqJS.Span('100..150.160');
        equal(s.location1().location(), 100);
        equal(s.location1().operator(), '');
        equal(s.location1().location2(), undefined);

        equal(s.location2().location(), 150);
        equal(s.location2().operator(), '.');
        equal(s.location2().location2(), 160);

        equal(s.toString(), '100..150.160');
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
