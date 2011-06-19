/**
 * <p><b>MODULE: dir</b></p>
 * 
 * <p>Provides some functions for directory manipulations.</p>
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

function getBase(abspath) {
    var match;
    
    match = abspath.match(process.cwd());   // take a shortcut. this works in most cases.
    if (match) {
        return match[0]
    } else {
        return '';
    }
}

function getPathArr(path) {
    path = path.replace(/^\//, '');     // deletes the first slash
    path = path.replace(/\/$/, '');     // deletes the last slash
    return path.split('/');
}


function make(abspath, mode, callback) {
    var base = getBase(abspath),
        path = abspath.substr(base.length),
        pathArr = getPathArr(path),
        i = 0;
    
    if (typeof mode === 'function' && arguments.length === 2) {
        callback = mode;
        mode = undefined;
    }
    if (!mode) {
        mode = 0755;
    }
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

function makeSync(abspath, mode) {
    var base = getBase(abspath),
        path = abspath.substr(base.length),
        pathArr = getPathArr(path),
        i = 0;
    
    if (!mode) {
        mode = 0755;
    }
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

function remove(abspath, callback) {
    var errors = [];

    function checkStat(path, stat, callback) {
        callback = collectErr(callback, errors);
        if (stat) {
            if (stat.isFile() || stat.isSymbolicLink()) {
                fs.unlink(path, callback);
            } else if (stat.isDirectory()) {
                recursiveRemove(path, callback);
            }
        } else {
            callback();
        }
    }
    
    function lstat(file, callback) {
        callback = collectErr(callback, errors);
        fs.lstat(file, callback); 
    }

    function recursiveRemove(abspath, callback) {
        var files;

        function removeDir(err) {
            if (err) {   // IF TRUE: this folder doesnt seem to exist, because only
                        //          openDir() is allowed to abort the waterfall
                errors.push(err);
                callback();
            } else {
                fs.rmdir(abspath, callback);
            }
        }

        callback = collectErr(callback, errors);
        async.waterfall([
            function openDir(callback) {
                // collectErr is missing here to abort the waterfall
                // if there is an error while reading the dir
                fs.readdir(abspath, callback);
            },
            function readDir(items, callback) {
                callback = collectErr(callback, errors);
                files = items;
                async.map(
                    files,
                    function lstatEachFile(file, callback) {
                        lstat(abspath + '/' + file, callback);
                    },
                    callback
                );
            },
            function iterateStats(stats, callback) {
                var i = 0;

                callback = collectErr(callback, errors);
                async.forEach(
                    stats,
                    function eachStat(stat, callback) {
                        var file;
                        
                        if (stat) {
                            file = abspath + '/' + files[i];
                            checkStat(file, stat, callback);
                        }
                        i++;
                    },
                    callback
                );
            },
        ], removeDir);
    }
    
    function lastCallback() {
        callback(errors);
    }
    
    lstat(abspath, function(err, stat) {
        if (err) {
            errors.push(err);
            lastCallback();
        } else {
            checkStat(abspath, stat, lastCallback);
        }
    });
}

function removeSync(abspath) {
    var errors = [];
    
    function tryIt(fn) {
        try {
            fn();
        } catch(err) {
            errors.push(err);
        }
    }
    
    function recursiveRemove(abspath) {
        var stat,
            items,
            item,
            i;
        
        function lstat() {
            stat = fs.lstatSync(abspath);
        }
        
        function removeFile() {
            fs.unlinkSync(abspath);
        }
        
        function removeDir() {
            fs.rmdirSync(abspath);
        }
        
        function readDir() {
            items = fs.readdirSync(abspath);
        }
        
        tryIt(lstat);
        if (stat) {
            if (stat.isFile() || stat.isSymbolicLink()) {
                tryIt(removeFile);
            } else if (stat.isDirectory()) {
                tryIt(readDir);
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    recursiveRemove(abspath + '/' + item);
                }
                tryIt(removeDir);
            }            
        }
    }
    
    recursiveRemove(abspath);
    
    return errors;
}

exports.remove = remove;
exports.removeSync = removeSync;
exports.make = make;
exports.makeSync = makeSync;