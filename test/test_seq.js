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

var SEQ_ARGS = ['seq','alphabet','features','topology','length_unit','strand_type','residue_type'],
    SEQ_GETS = ['seq','alphabet','features','topology','lengthUnit', 'strandType', 'residueType'];

var str_args = function(args){
    var s = [];
    SEQ_ARGS.forEach(function(v){
        if(args[v] !== undefined){
            if(typeof(args[v]) === 'string' || args[v] instanceof String){
                s.push('\''+args[v]+'\'');
            } else {
                s.push(args[v]);
            }
        }
    });
    return s.join(', ');
};

var seq_from_args = function(a){
    return new seqJS.Seq(a['seq'],a['alphabet'],a['features'],a['topology'],a['length_unit'],a['strand_type'],a['residue_type']);
};
     

var test_seq_init = function(args, expected, elen){
    test('Seq('+str_args(args)+')', function(){
        var s = seq_from_args(args),
            i,e,
            o = s.toString(-1);

        for(i=0;i < SEQ_ARGS.length; i++){
            e = expected[SEQ_ARGS[i]];
            e = (e===undefined) ? '' : e;
            equal(s[SEQ_GETS[i]](), e, SEQ_GETS[i] + ' failed');
        }
        equal(s.length(), elen, 'length failed');

        equal(s.toString(-1), o, 'gets changed Seq');
    });
};

/*
 * Test alphabets
 */
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA'
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear',
        length_unit: 'bp'
}, 4);
test_seq_init({
        seq: 'ACGTRYSWKMBDHVN',
        alphabet: 'aDNA'
    },{
        seq: 'ACGTRYSWKMBDHVN',
        alphabet: 'aDNA',
        topology: 'linear',
        length_unit: 'bp'
}, 15);
test_seq_init({
        seq: 'ACGU',
        alphabet: 'RNA'
    },{
        seq: 'ACGU',
        alphabet: 'RNA',
        topology: 'linear',
        length_unit: 'bp'
}, 4);
test_seq_init({
        seq: 'ACGURYSWKMBDHVN',
        alphabet: 'aRNA'
    },{
        seq: 'ACGURYSWKMBDHVN',
        alphabet: 'aRNA',
        topology: 'linear',
        length_unit: 'bp'
}, 15);
test_seq_init({
        seq: 'ACDEFGHIKLMNPQRSTVWY',
        alphabet: 'PROT'
    },{
        seq: 'ACDEFGHIKLMNPQRSTVWY',
        alphabet: 'PROT',
        topology: 'linear',
        length_unit: 'aa'
}, 20);
test_seq_init({
        seq: 'ACDEFGHIKLMNPQRSTVWYBXZ',
        alphabet: 'aPROT'
    },{
        seq: 'ACDEFGHIKLMNPQRSTVWYBXZ',
        alphabet: 'aPROT',
        topology: 'linear',
        length_unit: 'aa'
}, 23);

/*
 * Others
 */
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA',
        residue_type: 'can_be_anything'
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear',
        length_unit: 'bp',
        residue_type: 'can_be_anything'
}, 4);
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear'
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear',
        length_unit: 'bp'
}, 4);
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'circular'
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'circular',
        length_unit: 'bp'
}, 4);
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA',
        length_unit: 'rc'
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear',
        length_unit: 'rc'
}, 4);       
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA',
        strand_type: 'ss'
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear',
        length_unit: 'bp',
        strand_type: 'ss'
}, 4);      
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA',
        strand_type: 'ds'
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear',
        length_unit: 'bp',
        strand_type: 'ds'
}, 4);      
test_seq_init({
        seq: 'ACGT',
        alphabet: 'DNA',
        strand_type: ''
    },{
        seq: 'ACGT',
        alphabet: 'DNA',
        topology: 'linear',
        length_unit: 'bp',
        strand_type: ''
}, 4);
     

var test_seq_init_fail = function(reason, args){
    test('Seq('+str_args(args)+') - '+reason, function(){
        throws(function(){
            seq_from_args(args);
        });
    });
};
test_seq_init_fail('no alphabet', {
    seq: 'ATGU',
});
test_seq_init_fail('no seq', {
    alphabet: 'DNA',
});
test_seq_init_fail('wrong alphabet', {
    seq: 'AUGCN',
    alphabet: 'DNA'
});
test_seq_init_fail('unknown alphabet', {
    seq: 'ATGC',
    alphabet: 'dDNA'
});
test_seq_init_fail('invalid topology', {
    seq: 'ATGA',
    alphabet: 'DNA',
    topology: 'round'
});
test_seq_init_fail('invalid length unit', {
    seq: 'ATGA',
    alphabet: 'DNA',
    length_unit: 'light_years'
});
test_seq_init_fail('invalid strand type', {
    seq: 'ATGA',
    alphabet: 'DNA',
    strand_type: 'silly_string'
});
        


var test_seq_features = function(start, stop, intersect, expected){
    test('Seq.features('+start+', '+stop+', '+intersect+')', function(){
        var s = new seqJS.Seq(
            'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
            'DNA',
            [
                new seqJS.Feature('one', 'join(5..10,20..25)'),
                new seqJS.Feature('two', '13..17'),
                new seqJS.Feature('three', 'complement(7..15)')
            ]);

        var f = s.features(start,stop,intersect);
        equal(feats2string(f), expected, "Features fail");
    });
};

test_seq_features(9,17,false,'two=13..17');
test_seq_features(9,17,true,'one=join(5..10,20..25)|three=complement(7..15)|two=13..17');

var feats2string = function(feats){
    return feats.map(function(x){
        return x.type() + '=' + x.location().toGenbankString();}).join('|');
};

var test_seq_extract_nof = function(to_extract, expected_sequence){
    test('extract \''+to_extract+'\' no features', function(){
        var oseq = new seqJS.Seq(
                'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
                'DNA',
                [
                    new seqJS.Feature('one', '11..19'),
                    new seqJS.Feature('two', 'complement(5..15)'),
                    new seqJS.Feature('three', '15..25')
                ]);

        var f = new seqJS.Feature('gene', to_extract);
        var s = oseq.extract(f);
        equal(s.seq(), expected_sequence, 'incorrect sequence');
        equal(s.features().length, 0, 'features should not be included by default');
    });
};

test_seq_extract_nof('10..20', "ATATCGATCGA");
test_seq_extract_nof('complement(10..20)', "TCGATCGATAT");
test_seq_extract_nof('join(10..20,30..40)', "ATATCGATCGATAGCTAGTCGA");
test_seq_extract_nof('join(10..20,complement(30..40))', "ATATCGATCGATCGACTAGCTA");


var test_seq_extract_f = function(to_extract, expected_seq, expected_feats){
    test('extract \''+to_extract+'\' with features', function(){
        var oseq = new seqJS.Seq(
                'ACTAGTCGGATATCGATCGATGAGCTAGGTAGCTAGTCGATCGTAG',
                'DNA',
                [
                    new seqJS.Feature('one', '11..19'),
                    new seqJS.Feature('two', 'complement(5..15)'),
                    new seqJS.Feature('three', '15..25')
                ]);

        var f = new seqJS.Feature('gene', to_extract);
        var o = oseq.extract(f, true);
        equal(o.seq(), expected_seq, 'incorrect sequence');
        equal(feats2string(o.features()), expected_feats, 'incorrect features returned');
    });
};
test_seq_extract_f('10..20', "ATATCGATCGA", 
                   'two=complement(1..6)|one=2..10|three=6..11');
test_seq_extract_f('complement(10..20)', "TCGATCGATAT", 
                   'three=complement(1..6)|one=complement(2..10)|two=6..11');
test_seq_extract_f('join(10..19,20..29)', "ATATCGATCGATGAGCTAGG", 
                   'two=complement(1..6)|one=2..10|three=6..10|three=11..16');
test_seq_extract_f('join(2..7,20..30,complement(12..17))', 
                   "CTAGTCATGAGCTAGGTATCGAT", 
                   'two=complement(4..6)|three=7..12|one=complement(18..23)|three=complement(18..20)|two=20..23');


}());


