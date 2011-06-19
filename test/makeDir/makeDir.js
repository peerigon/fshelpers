var testCase = require('nodeunit').testCase,
    pathUtil = require('path'),
    fs = require('fs'),
    makeDir = require('../../lib').makeDir,
    makeDirSync = require('../../lib').makeDirSync;
    
///////////////////////////////////////////////////////////////////////////////////////

function ignoreErr(fn, arg) {
    var args = Array.prototype.slice.call(arguments, 1);
    
    try {
        fn.apply(fs, args);
    } catch(err) {

    }
}

function setup(type) {
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/file1.js');
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/folder1/file2.txt');
    ignoreErr(fs.unlinkSync, __dirname + '/' + type + '/folder/folder2/file3.html');     
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder1');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2');
    ignoreErr(fs.rmdirSync, __dirname + '/' + type + '/folder/folder2/folder3');
}

///////////////////////////////////////////////////////////////////////////////////////

exports.makeDir = testCase({
    setUp: function(callback) {
        setup('async');
        callback();
    },
    makeDir: function(test) { 
        var times = 0;
        
        function finished() {
            times++;
            test.equals(arguments.length, 0);   // ensure that there is no error
            if(times === 2) {
                test.ok(pathUtil.existsSync(__dirname + '/async/folder'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder1'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2'));
                test.ok(pathUtil.existsSync(__dirname + '/async/folder/folder2/folder3'));
                test.done();
            }
        }
        
        test.expect(6);
        makeDir(__dirname, '/async/folder/folder2/folder3', finished);
        makeDir(__dirname, '/async/folder/folder1', 0755, finished);
    }
});

exports.makeDirSync = testCase({
    setUp: function(callback) {
        setup('sync');
        callback();
    },
    makeDir: function(test) {
        makeDirSync(__dirname, '/sync/folder/folder2/folder3');
        makeDirSync(__dirname, '/sync/folder/folder1', 0755);
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder1'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2'));
        test.ok(pathUtil.existsSync(__dirname + '/sync/folder/folder2/folder3'));
        test.done();        
    }
});