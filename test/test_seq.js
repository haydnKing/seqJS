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

module('seqJS.seq');

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

        equal(n.seq(), 'GACGAT', 'ReverseComplement failed');
        equal(s.features()[0].toString(-1), o_str, "Original seqJS.Seq changed");
        equal(n.features()[0].toString(-1), 
              'F(\'gene\', FL(\'join\', SO(\'complement\', [S(L(3):L(6))])))', "ReverseComplement Failed");
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

var test_seq_extract_nof = function(to_extract, expected_sequence){
    test('extract \''+to_extract+'\' no features', function(){
        var f = new seqJS.Feature('gene', to_extract);
        var s = this.s.extract(f);
        equal(s.seq(), expected_sequence, 'incorrect sequence');
        equal(s.features().length, 0, 'features should not be included by default');
    });
};

test_seq_extract_nof('10..20', "ATATCGATCGA");
test_seq_extract_nof('complement(10..20)', "TCGATCGATAT");
test_seq_extract_nof('join(10..20,30..40)', "ATATCGATCGATAGCTAGTCGA");
test_seq_extract_nof('join(10..20,complement(30..40))', "ATATCGATCGATCGACTAGCTA");

/*
var test_seq_extract_f = function(to_extract, expected_seq, expected_feats){
    test('extract \''+to_extract+'\' with features', function(){
        var f = new seqJS.Feature('gene', to_extract);
        var o = this.s.extract(f, true);
        equal(o.seq(), expected_seq, 'incorrect sequence');
        equal(feats2string(o.features()), expected_feats, 'incorrect features returned');
    });
};
test_seq_extract_f('10..20', "ATATCGATCGA", 
                   'two=complement(1..6)|one=2..10|three=6..11');
test_seq_extract_f('complement(10..20)', "TCGATCGATAT", 
                   'three=complement(1..6)|one=complement(2..10)|two=6..11');
test_seq_extract_f('join(10..19,20..29)', "ATATCGATCGATGAGCTAGG", 
                   'one=order(1..10,11..20)');
test_seq_extract_f('join(2..7,20..30,complement(12..17))', 
                   "CTAGTCATGAGCTAGGTATCGAT", 
                   'two=join(complement(4..6),20..23)|three=join(7..12,complement(18..20))|one=complement(18..23)');
*/

}());


