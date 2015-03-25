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

module('seqJS.align');

test('Altschil&Erickson example', function(){

    var results = seqJS.align.SS2('AGT',
                                  'TGAGTT',
                                  seqJS.align.simple_cost,
                                  {'v': 1, 'u': 1});
    deepEqual(results.R.size(), {'N': 7, 'M': 4}, "Returned size is wrong");

    var P_data = [Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,
        2,4,5,6,7,8,9,3,3,5,5,7,8,9,4,4,3,5,5,7,8];
    var Q_data = [Infinity,2,3,4,5,6,7,Infinity,4,3,4,5,6,7,Infinity,5,5,3,4,5,6,
        Infinity,6,5,5,4,5,5];
    var R_data = [0,2,3,4,5,6,7,2,1,3,3,5,6,7,3,3,1,3,3,5,6,4,3,3,2,4,3,5,];
    var P = new seqJS.utils.rarray(4,7);
    var Q = new seqJS.utils.rarray(4,7);
    var R = new seqJS.utils.rarray(4,7);
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 7; j++){
            P.set(i,j,P_data[i*7+j]);
            Q.set(i,j,Q_data[i*7+j]);
            R.set(i,j,R_data[i*7+j]);
        }
    }

    deepEqual(results.P.toString(), P.toString(), 'P is incorrect');
    deepEqual(results.Q.toString(), Q.toString(), 'Q is incorrect');
    deepEqual(results.R.toString(), R.toString(), 'R is incorrect');
});

}());


