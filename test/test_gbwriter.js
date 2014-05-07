// /* global seqJS:true, TEST_DATA:true */

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
/*
module('seqJS#GenbankWriter', {
    setup: function() {
       this.parser = seqJS.getParser('genbank');
    }
});

    var compare_file = function(actual, expected, name){

        var a = actual.split('\n'),
            e = expected.split('\n');

        var msg = name + ': Number of lines is wrong';
        if(a.length > e.length){
            msg += ' -- extra lines:\n' + a.slice(e.length).join('\n');
        }
        equal(a.length, e.length, msg);

        var t;
        for(var i = 0; i < Math.min(a.length, e.length); i++){
            t = (a[i] === e[i]);
            ok(t, name + ": line "+i+" is wrong\n\tExpected: \""+e[i]+"\"\n\tActual  : \""+a[i]+"\"");
            if(!t) {break;}
        }
    };


    var test_write = function(num){
        return function(){
            this.parser.setRecordCb(function(record){
                var output = seqJS.write(record, 'gb');

                compare_file(output, 
                             TEST_DATA.parser_genbank.valid[num].input,
                     'Record['+num+']');

                start();
            });

            this.parser.parse(TEST_DATA.parser_genbank.valid[num].input);
        };
        
    };

    var test_num;

    for(test_num=0; test_num < TEST_DATA.parser_genbank.valid.length; 
        test_num++)
    {
        asyncTest('parse/write entire record ' + test_num, 
                  test_write(test_num));
    }
*/
}());

