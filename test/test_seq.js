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

    test('reverse complement with features', function() {
        var s = new seqJS.Seq("ATCGTC", 'DNA', [new seqJS.Feature('gene', '1..3')]);
        var o_str = s.features()[0].toString(-1);
        var n = s.reverseComplement();
        equal(n.seq(), 'GACGAT', 'even length R.C.');
        equal(s.features()[0].toString(-1), o_str, "Original seqJS.Seq changed");
        equal(n.features()[0].toString(-1), 
              'F(\'gene\', FL(SO(\'complement\', [S(L(3):L(6))])))', "ReverseComplement Failed");
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
        equal(feats2string(f), 'two=13..17', 
             'Contained: returned features do not match');

        //test intersection
        f = s.features(9,17,true);
        equal(feats2string(f), 
              'one=join(5..10,20..25)|three=complement(7..15)|two=13..17', 
             'Intersection: Returned features do not match expectations');

    });
  /*  
module('seqJS.Seq.extract', {
    setup: function(){
        this.s = new seqJS.Seq(
                'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
                'DNA',
                [
                    new seqJS.Feature('one', '11..19'),
                    new seqJS.Feature('two', 'complement(5..15)'),
                    new seqJS.Feature('three', '15..25')
                ]);
        this.s2 = new seqJS.Seq(
            'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
            'DNA',
            [
                new seqJS.Feature('one', '1..46')
            ]);
    }
});
*/
var feats2string = function(feats){
    return feats.map(function(x){return x.type() + '=' + x.location().toGenbankString();}).join('|');
};
/*
    test('extract 10..20 no features', function() {
        var f = new seqJS.Feature('gene', '10..20');
        var s = this.s.extract(f);
        equal(s.seq(), "ATATCGATCGA", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });
    test('extract complement(10..20) no features', function() {
        var f = new seqJS.Feature('gene', 'complement(10..20)');
        var s = this.s.extract(f);
        equal(s.seq(), "TCGATCGATAT", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });
    test('extract join(10..20,30..40) no features', function() {
        var f = new seqJS.Feature('gene', 'join(10..20,30..40)');
        var s = this.s.extract(f);
        equal(s.seq(), "ATATCGATCGATAGCTAGTCGA", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });
    test('extract join(10..20,complement(30..40)) no features', function() {
        var f = new seqJS.Feature('gene', 'join(10..20,complement(30..40))');
        var s = this.s.extract(f);
        equal(s.seq(), "ATATCGATCGATCGACTAGCTA", 'incorrect sequence');
        equal(s.features().length, 0, 'Features should not be included by default');
    });


    test('extract 10..20  with features', function() {
        var f = new seqJS.Feature('gene', '10..20');
        var o = this.s.extract(f, true);
        equal(o.seq(), "ATATCGATCGA", 'Incorrect sequence');
        equal(o.features().length, 3, 'Incorrect number of features');
        equal(feats2string(o.features()),
             'two=complement(1..6)|one=2..10|three=6..11',
             'incorrect features returned');
    });
    test('extract complement(10..20)  with features', function() {
        var f = new seqJS.Feature('gene', 'complement(10..20)');
        var o = this.s.extract(f, true);
        equal(o.seq(), "TCGATCGATAT", 'Incorrect sequence');
        equal(feats2string(o.features()),
             'three=complement(1..6)|one=complement(2..10)|two=6..11',
             'incorrect features returned');
    });
    test('extract join(10..19,20..29) with features', function() {
        //Test multi span extraction
        var f = new seqJS.Feature('gene', 'join(10..19,20..29)');
        var o = this.s2.extract(f, true);
        equal(o.seq(), "ATATCGATCGATGAGCTAGG", 'Incorrect sequence');
        equal(feats2string(o.features()),
             'one=order(1..10,11..20)',
             'incorrect features returned');
    });
    test('extract join(2..7,20..30,complement(12..17)) with features', function() {       
        //Test complex feature extraction
        var f = new seqJS.Feature('gene', 'join(2..7,20..30,complement(12..17))');
        var o = this.s.extract(f, true);
        equal(o.seq(), "CTAGTCATGAGCTAGGTATCGAT", 'Incorrect sequence');
        equal(feats2string(o.features()),
             'two=join(complement(4..6),20..23)|three=join(7..12,complement(18..20))|one=complement(18..23)',
             'incorrect features returned');
    });
*/

}());


