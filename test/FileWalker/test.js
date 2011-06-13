var assert = require('assert'),
    FileWalker = require('../../'),
    path = require('path');
    
var fileWalker = new FileWalker(),
    itemsFound = {};

function trimPath(path) {
    return path.substr(__dirname.length);
}

///////////////////////////////////////////////////////////////////////////////////////

fileWalker
    .on('fileOrDir', function(path) {
        path = trimPath(path);
        itemsFound[path] = true;
    })
    .on('end', function(path) {
        path = trimPath(path);
        assert.equal(path, '/folder1');
        assert.deepEqual(
            itemsFound,
            {
                '/folder1': true,
                '/folder1/folder2': true,
                '/folder1/file1.js': true,
                '/folder1/file2.txt': true,
                '/folder1/folder1': true,
                '/folder1/folder1/file1.js': true,
                '/folder1/folder1/folder1': true,
                '/folder1/folder1/folder1/file1.js': true 
            }
        );
    })
    .walk(path.resolve('./folder1'));