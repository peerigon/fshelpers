var util = require('util'),
    fs = require('fs'),
    events = require('events');

function FileWalker() {
    var self = this;
    var operationsPending = {};
    
    var onStat = function onStat(err, stat, basePath, path, depth, encoding) {
        var name;
        
        if(err) {
            self.emit('err', err, basePath, path, depth, encoding);
            done(basePath);
            
            return;
        }
        
        name = path.split('/');
        name = name[name.length-1];
        
        if(stat.isFile()) {
            if(self.fileFilter && self.fileFilter(name) === false) {
                return;
            }
            self.emit('file', path, stat, depth);
            if(encoding) {
                operationsPending[basePath]++;
                fs.readFile(path, encoding, function readFile(err, data) {
                    onFileRead(err, data, basePath, path);
                });
            }
        } else if(stat.isDirectory()) {
            if(self.dirFilter && self.dirFilter(name) === false) {
                return;
            }
            self.emit('dir', path, stat, depth);
            if(depth !== 0) {
                depth--;
                operationsPending[basePath]++;
                fs.readdir(path, function readDir(err, files) {
                    onDirRead(err, files, basePath, path, depth, encoding);
                });
            }
        }
        self.emit('fileOrDir', path, stat, depth);
        done(basePath);
    };
    
    var onFileRead = function onFileRead(err, data, basePath, path) {
        if(err) {
            self.emit('fileReadErr', err, path);
            self.emit('err', err, path);
            done(basePath);
            
            return;
        }
        self.emit('fileRead', path, data);
        done(basePath);
    };
    
    var onDirRead = function onDirRead(err, files, basePath, path, depth, encoding) {
        var i,
            file;
        
        if(err) {
            self.emit('dirReadErr', err, path, depth, encoding);
            self.emit('err', err, path, depth, encoding);
            done(basePath);
            
            return;
        }
        
        self.emit('dirRead', path, files);
        
        for(i=0; i<files.length; i++) {
            file = files[i];
            walk(basePath, path + '/' + file, depth, encoding);
        }
        done(basePath);
    };
    
    var walk = function walk(basePath, path, depth, encoding) {
        operationsPending[basePath]++;
        fs.stat(path, function stat(err, stat) {
            onStat(err, stat, basePath, path, depth, encoding);
        });
    };
    
    var done = function(basePath) {
        operationsPending[basePath]--;
        if(operationsPending[basePath] === 0) {
            self.emit('end', basePath);
            delete operationsPending[basePath];
        }
    };
    
    this.fileFilter = undefined;
    
    this.dirFilter = undefined;
    
    this.walk = function walkWrapper(path, depth, encoding) {
        if(depth === undefined) {
            depth = -1;
        }
        if(operationsPending[path] === undefined) {
            operationsPending[path] = 0;
        }
        walk(path, path, depth, encoding);
    };
}

util.inherits(FileWalker, events.EventEmitter);

module.exports = FileWalker;