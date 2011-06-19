/**
 * <p><b>MODULE: remove</b></p>
 * 
 * <p>Provides functions to remove single files or whole directories recursively.</p>
 * 
 * @version 0.1.0
 */
var fs = require('fs'),
    collectErr = require('./collectErr');
    

function remove(abspath, callback) {
    var errors = [];
    
    function recursiveRemove(abspath, callback) {
        var pending,
            itemRemoved;
        
        itemRemoved = function itemRemoved() {
            pending--;
            if (pending === 0) {
                fs.rmdir(abspath, callback);
            }
        }
        
        function onLstat(err, stat) {
            if (err) {
                errors.push(err);
                callback();
            } else {
                if (stat.isFile() || stat.isSymbolicLink()) {
                    fs.unlink(abspath, callback);
                } else if (stat.isDirectory()) {
                    fs.readdir(abspath, walkDir);
                }
            }
        }
    
        function walkDir(err, items) {
            var i,
                item;
            
            if (err) {
                errors.push(err);
                callback();
            } else if(items.length > 0) {
                pending = items.length;
                for (i = 0; i < items.length; i++) {
                    item = items[i];
                    recursiveRemove(abspath + '/' + item, itemRemoved);
                }
            } else {
                fs.rmdir(abspath, callback);
            }
        }
        
        fs.lstat(abspath, onLstat);
    }
    
    function finished(err) {
        callback(errors);
    }
    
    finished = collectErr(finished, errors);
    
    recursiveRemove(abspath, finished);
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