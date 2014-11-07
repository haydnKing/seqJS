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

module('seqJS.melt');

var rounded = function(f){
    return Math.round(10 * f) / 10.0;
};

test('simple melting', function(){
    //equal(seqJS.melt('ATCGATGGCATGCTAGCTGA', 'oligocalc'), 89.4);
    //equal(seqJS.melt('ATCGATGG', 'oligocalc'), 50.2);
    equal(rounded(seqJS.Melt.melt('GCTAGC', 'Allawi1997')), 49.1);
    //equal(seqJS.melt('GCTAGC'), 32.6);
});

test('datasets', function(){
    deepEqual(seqJS.Melt.getDatasets().sort(), ['SantaLucia1996', 'Allawi1997', 'oligocalc',].sort());
});

test('default dataset', function(){
    equal(seqJS.Melt.getDefaultDataset(), 'Allawi1997');
});

test('getReactionParameters', function() {
    var d = {
        Na: 1000.0,
        K: 0.0,
        Tris: 0.0,
        Mg: 0.0,
        dNTP: 0.0,
        Oligo: 0.5,
    }, 
    d2 = {
        Na: 1000.0,
        K: 0.0,
        Tris: 0.0,
        Mg: 1.0,
        dNTP: 0.0,
        Oligo: 0.5,
    },
    p = {
        Phusion: {
            Na: 50.0,
            K: 0.0,
            Tris: 0.0,
            Mg: 1.5,
            dNTP: 0.2,
            Oligo: 0.5,
        },
        Q5: {
            Na: 50.0,
            K: 0.0,
            Tris: 0.0,
            Mg: 2.0,
            dNTP: 0.2,
            Oligo: 0.5,
        },
    };
    deepEqual(seqJS.Melt.getReactionParameters(), d);
    deepEqual(seqJS.Melt.getReactionParameters({}), d);
    deepEqual(seqJS.Melt.getReactionParameters({notAsetting: 3.0}), d);
    deepEqual(seqJS.Melt.getReactionParameters({Mg: 1.0}), d2);
    deepEqual(seqJS.Melt.getReactionParameters('Phusion'), p['Phusion']);
    deepEqual(seqJS.Melt.getReactionParameters('Q5'), p['Q5']);

});


}());


