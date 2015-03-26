/*global seqJS:true  */
/*global console:true  */

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
    var i,j;

    var results = seqJS.align.SS2('AGT',
                                  'TGAGTT',
                                  seqJS.align.simple_cost,
                                  {'v': 1, 'u': 1});

    var P_data = [Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity,
        2,4,5,6,7,8,9,3,3,5,5,7,8,9,4,4,3,5,5,7,8];
    var Q_data = [Infinity,2,3,4,5,6,7,Infinity,4,3,4,5,6,7,Infinity,5,5,3,4,5,6,
        Infinity,6,5,5,4,5,5];
    var R_data = [0,2,3,4,5,6,7,2,1,3,3,5,6,7,3,3,1,3,3,5,6,4,3,3,2,4,3,5,];
    var P = new seqJS.utils.rarray(4,7);
    var Q = new seqJS.utils.rarray(4,7);
    var R = new seqJS.utils.rarray(4,7);
    for(i = 0; i < 4; i++){
        for(j = 0; j < 7; j++){
            P.set(i,j,P_data[i*7+j]);
            Q.set(i,j,Q_data[i*7+j]);
            R.set(i,j,R_data[i*7+j]);
        }
    }
    var a_data = [0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,];
    var b_data = [0,1,1,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,
                  0,0,0,1,1,1,0,0,
                  0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,1,];
    var c_data = [0,0,0,0,0,0,0,0,
                  0,1,0,1,0,0,0,0,
                  0,0,1,0,1,0,0,0,
                  0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,1,1,];
    var a = new seqJS.utils.rarray(5,8);
    var b = new seqJS.utils.rarray(5,8);
    var c = new seqJS.utils.rarray(5,8);
    var f = results.f.copy();
    var g = results.f.copy();
    for(i = 0; i < 5; i++){
        for(j = 0; j < 8; j++){
            a.set(i,j,a_data[i*8+j]);
            b.set(i,j,b_data[i*8+j]);
            c.set(i,j,c_data[i*8+j]);
        }
    }
    //Set the only values of f and g which matter
    f.set(0,1,0);
    f.set(0,2,1);
    f.set(2,3,0);
    f.set(2,4,1);
    f.set(2,5,0);
    f.set(3,6,0);

    g.set(0,1,1);
    g.set(0,2,0);
    g.set(2,3,1);
    g.set(2,4,1);
    g.set(2,5,0);
    g.set(3,6,0);

    deepEqual(results.P.toString(), P.toString(), 'P is incorrect');
    deepEqual(results.Q.toString(), Q.toString(), 'Q is incorrect');
    deepEqual(results.R.toString(), R.toString(), 'R is incorrect');
    deepEqual(results.a.toString(), a.toString(), 'a is incorrect');
    deepEqual(results.b.toString(), b.toString(), 'b is incorrect');
    deepEqual(results.c.toString(), c.toString(), 'c is incorrect');
    deepEqual(results.f.toString(), f.toString(), 'f is incorrect');
    deepEqual(results.g.toString(), g.toString(), 'g is incorrect');

    console.log('\n');
    console.log(seqJS.align.printSS2(results));
});

}());


