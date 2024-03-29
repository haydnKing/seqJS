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
    equal(rounded(seqJS.Melt.melt('ATCGATGGCATGCTAGCTGA', {}, 'oligocalc')), 80.6);
    equal(rounded(seqJS.Melt.melt('ATCGATGGCATGCTAGCTGA', {}, 'Allawi1997')), 74.3);
    equal(rounded(seqJS.Melt.melt('ATCGATGG', {}, 'oligocalc')), 31.8);
    equal(rounded(seqJS.Melt.melt('GCTAGCA', {}, 'Allawi1997')), 25.6);
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

test('getSaltCorrection (Mon = 0)', function(){
    var seq = new seqJS.Seq('AAGGCGAGTCAGGCTCAGTG','DNA'),
        params = {Na: 0, Mg: 1.5, Tris: 0, Oligo: 2.0},
        Tm = 76.3 + 273.15;

    equal(rounded(seqJS.Melt.getSaltCorrection(params,seq,Tm)-273.15), 67.9);
});

test('getSaltCorrection (R < 0.22) (R = 0.1)', function(){
    var seq = new seqJS.Seq('AAGGCGAGTCAGGCTCAGTG','DNA'),
        params = {Na: 158.114, Mg: 1.0, Tris: 0.0, Oligo: 2.0},
        Tm = 76.3 + 273.15;

    equal(rounded(seqJS.Melt.getSaltCorrection(params,seq,Tm)-273.15), 69.4);
});

test('getSaltCorrection (0.22 < R < 6) (R = 0.3)', function(){
    var seq = new seqJS.Seq('AAGGCGAGTCAGGCTCAGTG','DNA'),
        params = {Na: 129.0, Mg: 1.5, Tris: 0.0, Oligo: 2.0},
        Tm = 76.3 + 273.15;

    /*
     * a = 4.3195024654938344e-05
     * d = 1.7800762551103776e-05
     * g = 8.054682551646683e-05
     */

    equal(rounded(seqJS.Melt.getSaltCorrection(params,seq,Tm)-273.15), 69.4);
});

test('getSaltCorrection (0.22 < R < 6) (R = 3.9)', function(){
    var seq = new seqJS.Seq('AAGGCGAGTCAGGCTCAGTG','DNA'),
        params = {Na: 5, Mg: 1.5, Tris: 10, Oligo: 2.0},
        Tm = 76.3 + 273.15;

    /*
     * a = 3.9399998029433816e-05
     * d = 1.6007118533281715e-05
     * g = 9.651191641661136e-05
     */

    equal(rounded(seqJS.Melt.getSaltCorrection(params,seq,Tm)-273.15), 67.0);
});

test('getSaltCorrection (R >= 6)', function(){
    var seq = new seqJS.Seq('AAGGCGAGTCAGGCTCAGTG','DNA'),
        params = {Na: 0, Mg: 1.5, Tris: 10, Oligo: 2.0},
        Tm = 76.3 + 273.15;

    equal(rounded(seqJS.Melt.getSaltCorrection(params,seq,Tm)-273.15), 67.9);
});



}());


