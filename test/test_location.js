/*global seqJS:true  */

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

    var location_from_args = function(args){
        return new seqJS.Location(args[0], args[1], args[2]);
    };
    
    var test_location_init = function(args, exp_str){
        test('seqJS.Location('+args.join(', ')+')', function() {
            expect(1);
            var l = location_from_args(args);
            equal(l.toString(-1), exp_str, "Location init failed");
        });
    };

    test_location_init([5], 'L(5)');
    test_location_init([6, '<'], 'L(<6)');
    test_location_init([6, '.', 8], 'L(6.8)');
    test_location_init(['6'], 'L(5)');
    test_location_init(['<6'], 'L(<5)');
    test_location_init(['>6'], 'L(>5)');
    test_location_init(['6.8'], 'L(5.8)');

    var test_location_init_fail = function(name, a,b,c){
        test(name, function(){
            expect(1);
            throws(function(){
                new seqJS.Location(a,b,c);
            });
        });
    };

    test_location_init_fail('invalid operator', 4, -1);
    test_location_init_fail('invalid location', -1);
    test_location_init_fail('set invalid range', 8, '.', 6);
    test_location_init_fail('invalid operator', 4, '!');
    test_location_init_fail('invalid location', -1);
    test_location_init_fail('invalid location string 1', '!6');
    test_location_init_fail('invalid location string 2', '67sds');
    test_location_init_fail('invalid location string 3', '8.6');

    var test_location_offset = function(args, offset, expected_str){
        test('seqJS.Location('+args.join(', ')+').offset('+offset+')', function() {
            expect(2);
            var l = location_from_args(args);
            var orig = l.toString(-1);

            equal(l.offset(offset).toString(-1), expected_str, "Offset failed");
            equal(l.toString(-1), orig, "Offset changed original");
        });
    };


    test_location_offset(['10'], 5, 'L(14)');
    test_location_offset(['<10'], 5, 'L(<14)');
    test_location_offset(['>10'], 6, 'L(>15)');
    test_location_offset(['5.10'], 6, 'L(10.16)');
    test_location_offset(['50'], -40, 'L(9)');

    var test_location_invertdatum = function(args, len, expected_str){
        test('seqJS.Location('+args.join(', ')+').invertDatum('+len+')', function() {
            expect(2);
            var l = location_from_args(args);
            var orig = l.toString(-1);

            equal(l.invertDatum(len).toString(-1), expected_str, "Invert Datum failed");
            equal(l.toString(-1), orig, "Invert Datum changed original");
        });
    };


    test_location_invertdatum(['5'], 100, 'L(95)');
    test_location_invertdatum(['<5'], 100, 'L(>95)');
    test_location_invertdatum(['>5'], 100, 'L(<95)');
    test_location_invertdatum(['5.10'], 100, 'L(90.96)');
        
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
