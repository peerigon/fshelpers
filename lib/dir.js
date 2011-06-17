/**
 * <p><b>MODULE: dir</b></p>
 * 
 * <p>Provides some functions for directory manipulations.</p>
 * 
 * @version 0.1.0
 */
var fs = require('fs'),
    pathUtil = require('path'),
    resolve = require('./resolve'),
    async = require('async');



function iterativeCreate(abspath, mode, throwEEXIST, isSync, callback) {
    var currentPath = '/',
        pathArr,
        op;
    
    function createDir(callback) {
        fs.mkdir(currentPath, mode, function dirMade(err) {
            handleError(err, callback);
        });
    }

    function createDirSync(callback) {
        try {
            fs.mkdirSync(currentPath, mode);
        } catch(err) {
            handleError(err, callback);
        }
    }
    
    function handleError(err, callback) {
        if (throwEEXIST) {
            callback(err);
        } else {
            if (!err || err.code === 'EEXIST') {
                callback();
            } else {
                callback(err);
            }
        }
    }
    
    if(isSync) {
        op = createDirSync;
    } else {
        op = createDir;
    }
    abspath = abspath.replace(/^\//, '');     // deletes the first slash
    abspath = abspath.replace(/\/$/, '');     // deletes the last slash
    pathArr = path.split('/');
    async.whilst(
        function whilst() {
            currentPath += '/' + pathArr.shift();
            return pathArr.length !== 0;
        },
        op,
        callback
    );
}

/*
function recursiveDelete(abspath, isSync, callback) {
    function removeFile() {
        if (isSync) {
            try {
                fs.unlinkSync(abspath);
                callback();
            } catch(err) {
                callback(err);
            }
        } else {
            fs.unlink(abspath, callback);
        }
    }
    
    function removeDir(err) {
        if(err) {
            callback(err);
            return;
        }
        
    }
    
    function onStat(err, stat) {
        if(err) {
            callback(err);
            return;
        }
        if (stat.isFile() || stat.isSymbolicLink()) {
            removeFile();
        } else if(stat.isDirectory()) {
            readDir();
        }
    }
    
    function readDir() {
        if(isSync) {
            try {
                var files = fs.readdirSync(abspath);
                dirRead(undefined, files);
            } catch(err) {
                dirRead(err);
            }
        } else {
            fs.readdir(abspath, dirRead);
        }
    }
    
    function dirRead(err, files) {
        if(err) {
            callback(err);
            return;
        }
        async.forEach(
            files,
            function(abspath, callback) {
                recursiveDelete(abspath, isSync, callback);
            },
            callback
        );
    }
    
    if(isSync) {
        try {
            var stat = fs.lstatSync(abspath);
            onStat(undefined, stat);
        } catch(err) {
            onStat(err);
        }
    } else {
        fs.lstat(abspath, onStat);
    }
    
}


*/

function create(abspath, mode, callback) {
    if(typeof mode === 'function' && arguments.length === 2) {
        callback = mode;
        mode = undefined;
    }
    if(!mode) {
        mode = 0755;
    }
    recursiveCreate(abspath, mode, true, false, callback);
}

function createSync(abspath, mode, callback) {
    if (typeof mode === 'function' && arguments.length === 2) {
        callback = mode;
        mode = undefined;
    }
    if (!mode) {
        mode = 0755;
    }
    recursiveCreate(abspath, mode, true, true, callback);
}

function ensure(abspath, mode, callback) {
    if (typeof mode === 'function' && arguments.length === 2) {
        callback = mode;
        mode = undefined;
    }
    if (!mode) {
        mode = 0755;
    }
    recursiveCreate(abspath, mode, false, false, callback);
}

function ensureSync(abspath, mode, callback) {
    if (typeof mode === 'function' && arguments.length === 2) {
        callback = mode;
        mode = undefined;
    }
    if (!mode) {
        mode = 0755;
    }
    recursiveCreate(abspath, mode, false, true, callback);
}