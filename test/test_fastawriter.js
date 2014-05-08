/* global seqJS:true, TEST_DATA:true */

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

module('seqJS#FastaWriter', {
    setup: function() {
       this.parser = seqJS.getParser('fasta');
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
        var data = TEST_DATA.parser_fasta.valid[num];
        return function(){
            this.parser.setRecordCb(function(record){
                var output = seqJS.write(record, 'fasta');

                if(data.output !== undefined){
                    compare_file(output, data.output, 'Record['+num+']');
                }
                else {
                    compare_file(output, data.input, 'Record['+num+']');
                }

                start();
            });

            this.parser.parse(data.input);
        };
        
    };

    var test_num;

    for(test_num=0; test_num < TEST_DATA.parser_fasta.valid.length; 
        test_num++)
    {
        asyncTest('parse/write entire record ' + test_num, 
                  test_write(test_num));
    }

}());
