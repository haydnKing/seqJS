/* jshint unused:false */
/* global seqJS:true */
/*
 * Extensions to QUnit for testing seqJS objects
 */

var location_eq = function(actual, location1, operator, location2) {
    operator = operator || '';
    equal(actual.location(), location1, "First location is wrong");
    equal(typeof actual.location(), 'number', 
          "location() should return a number");
    equal(actual.operator(), operator, "Operator is wrong");
    
    if(operator !== '.'){
        equal(actual.location2(), undefined, 
              "location2() should be undefined for operator \'"+
                  operator+"\'");
    }
    else {
        equal(actual.location2(), location2, "Location2 is wrong");
        equal(typeof actual.location2(), 'number',
              "location2() should return a number");
    }
};

var span_eq = function(actual, location1, location2, complement, string){

    location_eq(actual.location1(), location1[0], location1[1], location1[2]);
    location_eq(actual.location2(), location2[0], location2[1], location2[2]);

    equal(actual.isComplement(), complement, "Complement flag wrong");
    equal(actual.toString(), string, "toString() is incorrect"); 
};

var featureloc_eq = function(actual, string, merge, spanlist){

    equal(actual.toString(), string, "toString() is wrong");

    equal(actual.getMergeOperator(), merge, "getMergeOperator() is wrong");

    var s = actual.getSpans(), j;
    equal(s.length, spanlist.length, "Wrong number of spans returned");
    for(var i = 0; i < spanlist.length; i++){
        j = spanlist[i];
        span_eq(s[i], j[0], j[1], j[2], j[3]);
    }
};

var feature_eq = function(actual, type, location_string, qualifiers, feat_name){

    var m = function(msg){
        if(feat_name){
            return feat_name + ': ' + msg;
        }
        return msg;
    };

    ok(actual instanceof seqJS.Feature, m("Didn't get a seqJS.Feature"));

    equal(actual.type(), type, m("feature type is wrong"));
    equal(actual.location().toString(), location_string,
          m('location is wrong'));
    ok(actual.location() instanceof seqJS.FeatureLocation,
       m('feature.location() should be from FeatureLocation, not \"' + 
      actual.location().constructor.name + '"'));

    qualifiers = qualifiers || [];
    equal(actual.qualifierKeys().length, qualifiers.length, 
         m('qualifier length is wrong'));
    for(var i =0; i< qualifiers.length; i++){
        equal(actual.qualifier(qualifiers[i][0]), qualifiers[i][1],
              m("qualifier " + i + " incorrect"));
    }
};

var gbrecord_eq = function(actual, expected){
    var an_keys = [
        'residue_type',
        'topology',
        'data_division',
        'date',
        'accession',
        'version',
        'gi',
        'source',
        'organism'];

    equal(actual.name, expected['name'], "Name is wrong");
    equal(actual.desc, expected['description'], "Description is wrong");
    equal(actual.length(), expected['length']);

    for(var i = 0; i < an_keys.length; i++){
        equal(actual.annotations[an_keys[i]], expected[an_keys[i]], an_keys[i] + " is wrong");
    }

    deepEqual(actual.annotations.taxonomy, expected.taxonomy,
          'taxonomy is wrong');

    for(i = 0; i < expected.references.length; i++){
        var eref = expected.references[i],
            aref = actual.annotations.references[i];
        deepEqual(aref, eref, "Reference "+i+" is wrong");
    }

    var f = actual.seq.features();
    equal(f.length, expected.features.length, 'Wrong number of features');
    for(i = 0; i < expected.features.length; i++)
    {
        var e = expected.features[i];        
        feature_eq(f[i], e[0], e[1], e[2], 'Feature '+i);
    }

    equal(actual.seq.alphabet(), expected.alphabet, 'alphabet is wrong');
    equal(actual.seq.seq(), expected.seq, 'seq is wrong');

};

