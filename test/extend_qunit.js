/* jshint unused:false */
/* global seqJS:true */
/*
 * Extensions to QUnit for testing seqJS objects
 */

var location_eq = function(actual, location1, operator, location2, msg) {
    operator = operator || '';
    equal(actual.location(), location1, (msg || '') + "Location1 is wrong");
    equal(typeof actual.location(), 'number', 
          (msg || '') + "location() should return a number");
    equal(actual.operator(), operator, (msg || '') + "Operator is wrong");
    
    if(operator !== '.'){
        equal(actual.location2(), undefined, 
              (msg || '') + "location2() should be undefined for operator \'"+
                  operator+"\'");
    }
    else {
        equal(actual.location2(), location2, (msg || '') + "Location2 is wrong");
        equal(typeof actual.location2(), 'number',
              (msg || '') + "location2() should return a number");
    }
};

var span_eq = function(actual, location1, location2, complement, string){

    location_eq(actual.left(), location1[0], location1[1], location1[2], 'Left: ');
    location_eq(actual.right(), location2[0], location2[1], location2[2], 'Right: ');

    equal(actual.isComplement(), complement, "Complement flag wrong");
    equal(actual.toGenbankString(), string, "span.toGenbankString() is incorrect"); 
};

var featureloc_eq = function(actual, string, spanlist){

    equal(actual.toGenbankString(), string, "toGenbankString() is wrong");

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
    equal(actual.location().toGenbankString(), location_string,
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

    // ============================= Test Metadata ============================
    equal(actual.name(), expected['name'], "Name is wrong");
    equal(actual.id(), expected['id'], "ID is wrong");
    equal(actual.desc(), expected['description'], "Description is wrong");

    // ============================= Test Annotations =========================
    var required_annotations = [
        'data_division',
        'date',
        'source',
        'organism',
        'taxonomy',
        'references'];

    var actual_annotations = {}, i;

    for(i = 0; i < required_annotations.length; i++){
        ok(actual.annotation(required_annotations[i]) !== undefined, 
           "Required annotation " + required_annotations[i] + " is missing");
    }

    var anames = actual.listAnnotations();
    for(i in anames){
        if(anames[i] !== 'references'){
            actual_annotations[anames[i]] = actual.annotation(anames[i]);
        }
    }

    deepEqual(actual_annotations, expected.annotations, "Annotations are incorrect");

    // ============================= Test References ==========================
    for(i = 0; i < expected.references.length; i++){
        var eref = expected.references[i],
            aref = actual.annotation('references')[i];
        deepEqual(aref, eref, "Reference "+i+" is wrong");
    }

    // ============================= Test Features ============================
    var f = actual.seq().features();
    equal(f.length, expected.features.length, 'Wrong number of features');
    for(i = 0; i < expected.features.length; i++)
    {
        var e = expected.features[i];        
        feature_eq(f[i], e[0], e[1], e[2], 'Feature '+i);
    }

    // ============================= Test Sequence ============================
    equal(actual.seq().length(), expected.sequence.length, 'sequence length is wrong');
    equal(actual.seq().lengthUnit(), expected.sequence.length_unit, 'sequence length unit is wrong');
    equal(actual.seq().residueType(), expected.sequence.residue_type, 'sequence residue type is wrong');
    equal(actual.seq().topology(), expected.sequence.topology, 'sequence topology is wrong');
    equal(actual.seq().alphabet(), expected.sequence.alphabet, 'sequence alphabet is wrong');
    equal(actual.seq().seq(), expected.sequence.seq, 'sequence is wrong');

};

