/**
 * <p><b>MODULE: Writer</b></p>
 * 
 * <p>Used to write a bunch of files as well sync as async.</p>
 * 
 * @version 0.1.0
 */
var fs = require('fs'),
    pathUtil = require('path'),
    resolve = require('./resolve'),
    async = require('async');

function Writer() {
    var self = this;
    
    var openDir = function(root, path, mode, callback) {
        var currentPath = root,
            pathArr;

        path = path.replace(/^\//, '');     // deletes the first slash
        path = path.replace(/\/$/, '');     // deletes the last slash
        pathArr = path.split('/');
        async.whilst(
            function whilst() {
                currentPath += '/' + pathArr.shift();
                
                return pathArr.length !== 0;
            },
            function createDir(callback) {
                fs.mkdir(currentPath, mode, function dirMade(err) {
                    if (!err || err.code === 'EEXIST') {
                        callback();
                    } else {
                        callback(err);
                    }
                });
            },
            callback
        );
    };
    
    var createDirs = function createDirs(root, paths, mode, callback) {
        async.forEach(
            paths,
            function doOpenDir(path, callback) {
                openDir(root, path, mode, callback);
            },
            callback
        );
    };
    
    var checkDirs = function checkDirs(root, paths, mode, callback) {
        async.reject(
            paths,
            function pathExists(path, callback) {
                pathUtil.exists(root + path, callback);
            },
            function pathExistsFinished(pathesToCreate) {
                createDirs(root, pathesToCreate, mode, callback);
            }
        );
    };
    
    this.writeFile = function writeFile(root, path, encoding, mode)
    
    this.write = function write(root, collection, encoding, mode, callback) {
        var paths;
            
        if (typeof collection === 'string') {
            paths = [collection];
        } else {
            paths = Object.keys(collection);
        }  
        if (!encoding) {
            encoding = 'utf8';
        }
        if (!mode) {
            mode = 0755;
        }
        
        async.series({
            checkDirs: function doCheckDirs(callback) {
                checkDirs(root, paths, mode, callback);
            },
            writeFiles: function doWriteFiles(callback) {
                //writeFiles(collection, encoding, callback)
                callback();
            }
        }, callback);
    };
}

module.exports = Writer;