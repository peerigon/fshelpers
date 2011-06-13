/**
 * <p><b>MODULE: FileWalker</b></p>
 * 
 * <p>Convenient class to walk through directories asynchronously. The given
 * path must be an absolute path.</p>
 * 
 * @version 0.1.0
 */

var fs = require('fs'),
    events = require('events');

function FileWalker() {
    var self = this;
    var eventEmitter = new events.EventEmitter();
    var operationsPending = {};
    var numOfWalks = 0;
    
    var onStat = function onStat(err, stat, basePath, path, depth, encoding) {
        var name;
        
        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, basePath, path, depth, encoding);
            done(basePath);
            
            return;
        }
        if(stat.isSymbolicLink()) {
            done(basePath);
            
            return;
        }
        
        name = path.split('/');
        name = name[name.length-1];
        
        if(stat.isFile()) {
            if(self.fileFilter && self.fileFilter(name) === false) {
                done(basePath);
                
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
                done(basePath);
                
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
        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, basePath, path);
            done(basePath);
            
            return;
        }
        self.emit('fileRead', path, data);
        done(basePath);
    };
    
    var onDirRead = function onDirRead(err, files, basePath, path, depth, encoding) {
        var i,
            file;
        
        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, basePath, path, depth, encoding);
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
        fs.lstat(path, function lstat(err, stat) {
            onStat(err, stat, basePath, path, depth, encoding);
        });
    };
    
    var done = function done(basePath) {
        operationsPending[basePath]--;
        if(operationsPending[basePath] === 0) {
            self.emit('end', basePath);
            self.stop(basePath);
        }
    };
    
    var isWalkAborted = function isWalkAborted(basePath) {
        return operationsPending[basePath] === undefined;
    };
    
    var checkIdle = function checkIdle() {
        if(numOfWalks === 0) {
            self.emit('idle');
        }
    };
    
    this.fileFilter = undefined;
    
    this.dirFilter = undefined;
    
    this.on = this.addListener = function on(type, func) {
        eventEmitter.on(type, func);
        
        if(type === 'idle') {
            checkIdle();
        }
        
        return this;
    };
    
    this.once = function once(type, func) {
        eventEmitter.once(type, func);
        
        if(type === 'idle') {
            checkIdle();
        }
        
        return this;
    };
    
    this.emit = eventEmitter.emit.bind(eventEmitter);
    this.removeListener = eventEmitter.removeListener.bind(eventEmitter);
    this.removeAllListeners = eventEmitter.removeAllListeners.bind(eventEmitter);
    this.setMaxListeners = eventEmitter.setMaxListeners.bind(eventEmitter);
    this.listeners = eventEmitter.listeners.bind(eventEmitter);
    
    this.getNumOfWalks = function getNumOfWalks() {
        return numOfWalks;
    };
    
    this.walk = function walkWrapper(path, depth, encoding) {
        if(depth === undefined) {
            depth = -1;
        }
        if(operationsPending[path] === undefined) {
            operationsPending[path] = 0;
        }
        numOfWalks++;
        walk(path, path, depth, encoding);
    };
    
    this.walkWhenIdle = function walkWhenIdle() {
        var args = arguments;
        
        self.once('idle', function() {
            self.walk.apply(self, args);
        });
    };
    
    this.stop = function stop(path) {
        if(path) {
            delete operationsPending[path];
            numOfWalks--;
        } else {
            operationsPending = {};
            numOfWalks = 0;
        }
        checkIdle();
    };
}

FileWalker.RECURSIVE = -1;

exports.Constructor = FileWalker;