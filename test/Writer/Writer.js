var testCase = require('nodeunit').testCase,
    Writer = require('../../').Writer,
    writer = new Writer();
    pathUtil = require('path'),
    fs = require('fs');
    
function resolve(path) {
    return pathUtil.resolve(__dirname, path);
}
    
///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    setUp: function(callback) {
        try {
            fs.rmdirSync(resolve('./folder1'));
        } catch(e) {
            console.log(e);
        }
        callback();
    },
    firstTest: function(test) {
        var collection = {},
            path;
        
        path = '/folder1/folder2/test1.js';
        collection[path] = path;
        path = '/folder1/folder2/test2.js';
        collection[path] = path;
        path = '/folder2/test3.js';
        collection[path] = path;     
        
        writer.write(__dirname, collection, null, null, function() {
            test.done();
        });
    }
});