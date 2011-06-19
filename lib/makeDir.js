/**
 * <p><b>MODULE: makeDir</b></p>
 * 
 * <p>Provides some functions to create directories recursively.</p>
 * 
 * @version 0.1.0
 */
var fs = require('fs'),
    fs2 = require('./fs'),
    pathUtil = require('path'),
    resolve = require('./resolve'),
    wrap = require('./wrap'),
    collectErr = require('./collectErr'),
    async = require('async');

function getPathArr(path) {
    path = path.replace(/^\//, '');     // deletes the first slash
    path = path.replace(/\/$/, '');     // deletes the last slash
    return path.split('/');
}

function makeDir(base, path, mode, callback) {
    var pathArr = getPathArr(path),
        i = 0;
    
    if (typeof mode === 'function' && arguments.length === 3) {
        callback = mode;
        mode = undefined;
    }
    if (!mode) {
        mode = 0755;
    }
    base = base.replace(/\/$/, '');     // deletes the last slash (if it exists)
    path = base;
    async.whilst(
        function whilst() {
            path += '/' + pathArr[i];
            return i++ < pathArr.length;
        },
        function makeDir(callback) {
            function dirMade(err) {
                if (!err || err.code === 'EEXIST') {
                    callback();
                } else {
                    callback(err);
                }
            }
            
            fs.mkdir(path, mode, dirMade);
        },
        callback
    );
}

function makeDirSync(base, path, mode) {
    var pathArr = getPathArr(path),
        i = 0;
    
    if (!mode) {
        mode = 0755;
    }
    base = base.replace(/\/$/, '');     // deletes the last slash (if it exists)
    path = base;
    for (i; i < pathArr.length; i++) {
        path += '/' + pathArr[i];
        try {
            fs.mkdirSync(path, mode);
        } catch(err) {
            if (!err || err.code === 'EEXIST') {
                continue;
            } else {
                throw err;
            }
        }
    }
}


exports.makeDir = makeDir;
exports.makeDirSync = makeDirSync;    