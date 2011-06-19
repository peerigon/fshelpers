var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    fs = require('fs'),
    dir = require('../../lib').dir;
    
///////////////////////////////////////////////////////////////////////////////////////

function removeFolder(test) {
    var errors = [];
    
    errors.push(dir.removeSync(__dirname + '/sync/folder1'));
    errors.push(dir.removeSync(__dirname + '/sync/folder2'));
    test.equals(errors.length, 2);
    test.equals(pathUtil.existsSync(__dirname + '/sync/folder1'), false);
    test.equals(pathUtil.existsSync(__dirname + '/sync/folder2'), false);
    test.done();    
}

module.exports = testCase({
    removeFolderOnStart: removeFolder,
    make: function make(test) {
        test.expect(4);
        
        dir.makeSync(__dirname + '/sync/folder1/folder1');
        dir.makeSync(__dirname + '/sync/folder1/folder2', 0755);
        dir.makeSync(__dirname + '/sync/folder2/folder1/folder1');
        dir.makeSync(__dirname + '/sync/folder2/folder1', 0755);
        dir.makeSync(__dirname + '/sync/folder2/folder1', 0755);
        
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder1/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder1/folder2'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder2/folder1/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder2/folder1'));

        fs.writeFileSync(__dirname + '/sync/folder1/folder1/file1.js', 'blabla', 'utf8');
        fs.writeFileSync(__dirname + '/sync/folder1/folder1/file2.txt', 'blabla', 'utf8');
        fs.writeFileSync(__dirname + '/sync/folder2/folder1/file3.html', 'blabla', 'utf8');
        
        test.done();
    },
    removeFolderOnEnd: removeFolder
});