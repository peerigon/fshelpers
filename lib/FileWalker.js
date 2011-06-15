/**
 * <p><b>MODULE: FileWalker</b></p>
 * 
 * <p>Convenient class to walk through directories asynchronously. The given
 * path must be an absolute path.</p>
 * 
 * @version 0.1.0
 */

var fs = require('fs'),
    pathUtil = require('path'),
    events = require('events');

function FileWalker() {
    var self = this;
    var eventEmitter = new events.EventEmitter();
    var operationsPending = {};
    var collection = {};
    var numOfWalks = 0;
    
    var onStat = function onStat(err, stat, basePath, path, depth, encoding) {
        var name;
        
        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, path, basePath, depth, encoding);
            done(basePath);
            
            return;
        }
        if(stat.isSymbolicLink()) {
            done(basePath);
            
            return;
        }
        
        name = pathUtil.basename(path);
        
        if(stat.isFile()) {
            if(self.fileFilter && self.fileFilter(name) === false) {
                done(basePath);
                
                return;
            }
            self.emit('file', path, stat, basePath, depth, encoding);
            if(encoding) {
                operationsPending[basePath]++;
                fs.readFile(path, encoding, function readFile(err, data) {
                    onFileRead(err, data, basePath, path, depth, encoding);
                });
            } else {
                collect(basePath, path);
            }
        } else if(stat.isDirectory()) {
            if(self.dirFilter && self.dirFilter(name) === false) {
                done(basePath);
                
                return;
            }
            self.emit('dir', path, stat, basePath, depth, encoding);
            if(depth !== 0) {
                depth--;
                operationsPending[basePath]++;
                fs.readdir(path, function readDir(err, files) {
                    onDirRead(err, files, basePath, path, depth, encoding);
                });
            }
        }
        self.emit('fileOrDir', path, stat, basePath, depth, encoding);
        done(basePath);
    };
    
    var onFileRead = function onFileRead(err, data, basePath, path, depth, encoding) {
        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, path, basePath, depth, encoding);
            done(basePath);
            
            return;
        }
        
        collect(basePath, path, data);
        self.emit('fileRead', path, data, basePath, depth, encoding);
        done(basePath);
    };
    
    var onDirRead = function onDirRead(err, files, basePath, path, depth, encoding) {
        var i,
            file;
        
        if(isWalkAborted(basePath)) {
            return;
        }
        if(err) {
            self.emit('error', err, path, basePath, depth, encoding);
            done(basePath);
            
            return;
        }
        
        self.emit('dirRead', path, files, basePath, depth, encoding);
        
        for(i=0; i<files.length; i++) {
            file = files[i];
            walk(basePath, path + '/' + file, depth, encoding);
        }
        done(basePath);
    };
    
    var collect = function collect(basePath, path, data) {
        if(collection[basePath] === undefined) {
            collection[basePath] = data? {}: [];
        }
        if(data) {
            collection[basePath][path] = data;
        } else {
            collection[basePath].push(path);
        }
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
            self.emit('end', basePath, collection[basePath]);
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
    
    this.emit = eventEmitter.emit.bind(eventEmitter);
    this.removeListener = eventEmitter.removeListener.bind(eventEmitter);
    this.removeAllListeners = eventEmitter.removeAllListeners.bind(eventEmitter);
    this.setMaxListeners = eventEmitter.setMaxListeners.bind(eventEmitter);
    this.listeners = eventEmitter.listeners.bind(eventEmitter);
    
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
    
    this.stop = function stop(basePath) {
        if(basePath) {
            delete operationsPending[basePath];
            delete collection[basePath];
            numOfWalks--;
        } else {
            operationsPending = {};
            collection = {};
            numOfWalks = 0;
        }
        checkIdle();
    };
    
    this.readFile = function readFile(path, encoding, callback) {
        function removeListener() {
            self.removeListener('fileRead', callback);
            self.removeListener('error', callback);
        }
        
        self.on('fileRead', function onFileRead(loadedPath, data) {
            if(path === loadedPath) {
                removeListener();
                callback(loadedPath, data);
            }
        });    
        if(operationsPending[path] === undefined) {
            operationsPending[path] = 0;
        }
        operationsPending[path]++;
        numOfWalks++;
        fs.readFile(path, encoding, function readFile(err, data) {
            onFileRead(err, data, path, path);
        });
    };
    
    this.walkSync = function walkSync(basePath, depth, encoding) {
        var errPath;
        
        function doFileSystemAction(action, path, encoding) {
            try {
                return fs[action].call(fs, path, encoding);
            } catch(err) {
                errPath = path;
                
                throw err;
            }
        }
        
        function recursiveWalkSync(path, depth, encoding) {
            var stat,
                name,
                data,
                files,
                file,
                i;
            
            if(isWalkAborted(basePath)) {
                return;
            }
            operationsPending[basePath]++;
            
            stat = doFileSystemAction('lstatSync', path);
            
            if(stat.isSymbolicLink()) {
                done(basePath);
                
                return;
            }

            name = pathUtil.basename(path);
            
            if(stat.isFile()) {
                if(self.fileFilter === undefined
                    || self.fileFilter && self.fileFilter(name) === true) {
                    
                    self.emit('file', path, stat, basePath, depth, encoding);
                    self.emit('fileOrDir', path, stat, basePath, depth, encoding);
                    if(encoding) {
                        data = doFileSystemAction('readFileSync', path, encoding);
                        collect(basePath, path, data);
                        self.emit('fileRead', path, data);
                    } else {
                        collect(basePath, path);
                    }
                }
            } else if(stat.isDirectory()) {
                if(self.dirFilter === undefined
                    || self.dirFilter && self.dirFilter(name) === true) {
                    
                    self.emit('dir', path, stat, basePath, depth, encoding);
                    self.emit('fileOrDir', path, stat, basePath, depth, encoding);                
                    if(depth !== 0) {
                        depth--;
                        files = doFileSystemAction('readdirSync', path);
                        for(i=0; i<files.length; i++) {
                            file = files[i];
                            recursiveWalkSync(path + '/' + file, depth, encoding);
                        }
                    }
                    
                }
            }
            done(basePath);
        }
        
        if(depth === undefined) {
            depth = -1;
        }
        if(operationsPending[basePath] === undefined) {
            operationsPending[basePath] = 0;
        }
        numOfWalks++;
        
        try {
            recursiveWalkSync(basePath, depth, encoding);
        } catch(err) {
            self.emit('error', err, errPath, basePath, depth, encoding);
        }
    };
    
    this.reset = function reset() {
        self.fileFilter = undefined;
        self.dirFilter = undefined;
        self.removeAllListeners('error');
        self.removeAllListeners('fileOrDir');
        self.removeAllListeners('file');
        self.removeAllListeners('dir');
        self.removeAllListeners('fileRead');
        self.removeAllListeners('dirRead');
        self.removeAllListeners('end');
        self.removeAllListeners('idle');
        self.stop();   
    };
}

FileWalker.RECURSIVE = -1;

exports.Constructor = FileWalker;