var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    fs = require('fs'),
    dir = require('../../lib').dir;
    
///////////////////////////////////////////////////////////////////////////////////////

function removeFolder(test) {
    var times = 0;
    
    function finished(errors) {
        times++;
        test.ok(typeof errors === 'array' || errors instanceof Array);
        if(times === 2) {
            test.equals(pathUtil.existsSync(__dirname + '/async/folder1'), false);
            test.equals(pathUtil.existsSync(__dirname + '/async/folder2'), false);
            test.done();
        }
    }
    
    test.expect(4);
    dir.remove(__dirname + '/async/folder1', finished);
    dir.remove(__dirname + '/async/folder2', finished);
}

module.exports = testCase({
    removeFolderOnStart: removeFolder,
    make: function make(test) {
        var times = 0;

        function finished(err) {
            times++;
            test.equals(err, undefined);
            if(times === 5) {
                test.ok(pathUtil.existsSync(__dirname + '/async/folder1/folder1'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder1/folder2'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder2/folder1/folder1'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder2/folder1'));
                
                fs.writeFileSync(__dirname + '/async/folder1/folder1/file1.js', 'blabla', 'utf8');
                fs.writeFileSync(__dirname + '/async/folder1/folder1/file2.txt', 'blabla', 'utf8');
                fs.writeFileSync(__dirname + '/async/folder2/folder1/file3.html', 'blabla', 'utf8');
                
                test.done();
            }
        }

        test.expect(9);
        dir.make(__dirname + '/async/folder1/folder1', finished);
        dir.make(__dirname + '/async/folder1/folder2', 0755, finished);
        dir.make(__dirname + '/async/folder2/folder1/folder1', finished);
        dir.make(__dirname + '/async/folder2/folder1', 0755, finished);
        dir.make(__dirname + '/async/folder2/folder1', 0755, finished);
    },
    removeFolderOnEnd: removeFolder
});