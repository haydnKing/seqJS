/*global seqJS:true  */
/*global location_eq:true  */

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
        location_eq(l.offset(5), 14, '');
        location_eq(l, 9, '');

        l = new seqJS.Location('<10');
        location_eq(l.offset(6), 15, '<');
        location_eq(l, 9, '<');

        l = new seqJS.Location('>10');
        location_eq(l.offset(6), 15, '>');
        location_eq(l, 9, '>');

        l = new seqJS.Location('5.10');
        location_eq(l.offset(6), 10, '.', 16);
        location_eq(l, 4, '.', 10);

        l = new seqJS.Location('50');
        location_eq(l.offset(-40), 9, '');
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
            var original = l.toString(-1);
            equal(l.crop(start,end).toString(-1), str, "crop with integers");
            equal(l.toString(-1), original, "Original location changed");
            equal(l.crop(new seqJS.Location(start),
                               new seqJS.Location(end)).toString(-1),
                        str, "crop with seqJS.Locations");
            equal(l.toString(-1), original, "Original location changed");
        });
    };

        test_location_crop([20], 10, 25, 'L(10)');
        test_location_crop([20], 30, 45, 'L(0)');
        test_location_crop([20], 10, 15, 'L(5)');

        test_location_crop([20, '<'], 10, 25, 'L(<10)');
        test_location_crop([20, '<'], 30, 45, 'L(0)');
        test_location_crop([20, '<'], 10, 15, 'L(<5)');

        test_location_crop([20, '>'], 10, 25, 'L(>10)');
        test_location_crop([20, '>'], 30, 45, 'L(>0)');
        test_location_crop([20, '>'], 10, 15, 'L(5)');

        test_location_crop([20, '.', 30], 10, 35, 'L(10.20)');
        test_location_crop([20, '.', 30], 25, 45, 'L(0.5)');
        test_location_crop([20, '.', 30], 10, 25, 'L(10.15)');
        test_location_crop([20, '.', 30], 35, 45, 'L(0)');
        test_location_crop([20, '.', 30], 10, 15, 'L(5)');


}());
