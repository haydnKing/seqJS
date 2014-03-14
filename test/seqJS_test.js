/*global seqJS:true */

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

    test('setting data 1', function(){
        expect(3);
        var l = new seqJS.Seq("ATcGAT");
        equal(l.seq(), "ATCGAT");
        equal(l.length(), 6);
        equal(l.alphabet(), seqJS.ALPH_DNA);
    });

    test('setting data 2', function(){
        expect(3);
        var l = new seqJS.Seq("ATcGAT", seqJS.ALPH_PROT);
        equal(l.seq(), "ATCGAT");
        equal(l.length(), 6);
        equal(l.alphabet(), seqJS.ALPH_PROT);
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


    module('seqJS#record');

    test('setting data 1', function(){
        expect(2);
        var l = new seqJS.Location(5);
        equal(l.location(), 5);
        equal(l.operator(), seqJS.LOC_EXACT);
    });

    test('setting data 2', function(){
        expect(2);
        var l = new seqJS.Location(6, seqJS.LOC_BEFORE);
        equal(l.location(), 6);
        equal(l.operator(), seqJS.LOC_BEFORE);
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
