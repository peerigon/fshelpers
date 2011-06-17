var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    resolve = require('../../lib/resolve');
    
///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    oneArg: function(test) {
        var expectedResult = pathUtil.resolve('./test'),
            result = resolve('./test');
        
        test.equal(expectedResult, result);
        test.done();
    },
    moreArgs: function(test) {
        var expectedResult = pathUtil.resolve('someDir/', '/anotherDir/', '../../test', './test'),
            result = resolve('someDir/', '/anotherDir/', '../../test', './test');
        
        test.equal(expectedResult, result);
        test.done();        
    },
    oneArgWithTilde: function(test) {
        var expectedResult = process.env.HOME + '/someDir',
            result = resolve('~/someDir');
        
        test.equal(expectedResult, result);
        test.done();        
    },
    moreArgsWithTilde: function(test) {
        var expectedResult = process.env.HOME + '/someDir/someDir2',
            result = resolve('../blabla', 'anotherDir/', '~/someDir', 'someDir2');
        
        test.equal(expectedResult, result);
        test.done();        
    }
});