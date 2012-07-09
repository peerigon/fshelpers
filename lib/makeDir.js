var fs = require("fs"),
    async = require("async"),
    split = require("./split"),
    paths2obj = require("./paths2obj"),
    unify = require("./unify.js");

/**
 * Creates a dir at the specified path. Additionally all dirs are created
 * on the way. So if you call this function with "folder1/folder2/folder3" and
 * none of these exist, all are created.
 *
 * If the folder already exists, no error is passed to the callback. So you
 * can use this function to ensure, that a specific folder exists. On every other
 * error the callback is called with callback(err)
 *
 * @param {String} path the path that will be created.
 * @param {Integer} [mode=0755] chmod for the folders that will be created.
 * If no folder is created (because they already exist) the chmod is not changed.
 * @param {Function} callback.
 */
function makeDir(path, mode, callback) {
    function iterativeMakeDir() {
        var dirsToCreate = [],
            pathArr = split(path),
            reverse = true;

        dirsToCreate.push(pathArr.pop());
        async.whilst(
            function whilst() {
                return dirsToCreate.length > 0 && pathArr.length > 0;
            },
            function makeDir(callback) {
                function dirMade(err) {
                    if(reverse && (!err || err.code === "ENOENT" || err.code === "EEXIST")) {
                        if (err && err.code === "ENOENT") {
                            dirsToCreate.push(pathArr.pop());
                            err = undefined;
                        } else {
                            if(err) {
                                err = undefined;
                            }
                            reverse = false;
                        }
                    }
                    callback(err);
                }

                if(!reverse) {
                    pathArr.push(dirsToCreate.pop());
                }
                path = unify(pathArr.join("/"));
                fs.mkdir(path, mode, dirMade);
            },
            function finished(err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            }
        );
    }

    if (typeof mode === "function" && arguments.length === 2) {
        callback = mode;
        mode = undefined;
    }
    if (!mode) {
        mode = 0755;
    }

    path = unify(path);

    // First we check, if the path already exists.
    fs.exists(path, function(result) {
        if(result) {
            callback(null);
        } else {
            iterativeMakeDir();
        }
    });
}



/**
 * The synchronous version of makeDir.
 *
 * If the folder already exists, no error is thrown. So you
 * can use this function to ensure, that a specific folder exists.
 *
 * @param {String} path the path that will be created.
 * @param {Integer} [mode=0755] chmod for the folders that will be created.
 * If no folder is created (because they exist already) the chmod is not changed.
 * @throws Error every error whose code equals not EEXIST.
 */
function makeDirSync(path, mode) {
    var pathExists,
        pathArr,
        dirsToCreate = [],
        reverse = true;

    if (!mode) {
        mode = 0755;
    }
    path = unify(path);
    pathExists = fs.existsSync(path);
    if(pathExists) {
        return;
    }
    pathArr = split(path);
    dirsToCreate.push(pathArr.pop());
    while(dirsToCreate.length > 0 && pathArr.length > 0) {
        if(!reverse) {
            pathArr.push(dirsToCreate.pop());
        }
        path = unify(pathArr.join("/"));
        try {
            fs.mkdirSync(path, mode);
            reverse = false;
        } catch(err) {
            if (reverse && err.code === "EEXIST") {
                reverse = false;
                continue;
            }
            if (reverse && err.code === "ENOENT") {
                dirsToCreate.push(pathArr.pop());
                continue;
            } else if(err) {
                throw err;
            }

        }
    }
}



/**
 * Useful to create a bunch of directories at once or to ensure, that they all
 * exist. Works just like makeDir but with the dir parameter being an array of paths.
 *
 * Furthermore the order of creation is optimized so no useless fs.mkdir-calls
 * are started.
 *
 * If an error occurs, the error is stored and after all an errors-array is
 * passed to the callback.
 *
 * @param {Array} dirs an array with all paths to create.
 * @param {String} [base=""] an absolute path pointing to the location where the other dirs start
 * @param {Integer} [mode=0755] chmod for the folders that will be created.
 * If no folder is created (because they already exist) the chmod is not changed.
 * @param {Function} callback.
 */
function makeDirs(dirs, base, mode, callback) {
    var obj,
        errors = [];

    function finished() {
        if (errors.length > 0) {
            callback(errors);
        } else {
            callback(null);
        }
    }

    function recursiveMakeDirs(path, obj, callback) {
        var dirs = Object.keys(obj);

        function makeEachDir(dirName, callback) {
            makeDir(path + "/" + dirName, mode, callback);
        }

        function recursiveCall(dirName, callback) {
            var dir = obj[dirName];

            if (typeof dir === "object") {
                recursiveMakeDirs(path + "/" + dirName, dir, callback);
            } else {
                callback();
            }
        }

        async.series([
            async.apply(async.forEach, dirs, makeEachDir),
            async.apply(async.forEach, dirs, recursiveCall)
        ], callback);
    }

    if (arguments.length === 2) {
        callback = base;
        base = undefined;
        mode = undefined;
    } else if(arguments.length === 3) {
        if (typeof base === "string") {
            callback = mode;
            mode = undefined;
        } else if (typeof base === "number") {
            callback = mode;
            mode = base;
            base = undefined;
        }
    }

    if (typeof base === "string") {
        base = unify(base);
    } else {
        base = "";
    }

    // path2obj creates a nested object structured like the folder hierachy in dirs.
    // Thus we can walk through this object recursively and create every folder
    // only one time instead of trying to re-create it with every path.
    obj = paths2obj(dirs);
    recursiveMakeDirs(base, obj, finished); // start the recursive call
}



/**
 * Synchronous version of makeDirs.
 *
 * This function does not throw an error. It stores all occuring errors
 * in an array and returns it. If no error occured, null is returned.
 *
 * @param {String} dirs an array with all paths to create.
 * @param {String} [base=""] an absolute path pointing to the location where the dirs begin.
 * @param {Integer} [mode=0755] chmod for the folders that will be created.
 * If no folder is created (because they exist already) the chmod is not changed.
 * @return {Mixed} errors all errors, that occured. Can be null.
 */
function makeDirsSync(dirs, base, mode) {
    var obj,
        errors = [];

    function recursiveMakeDirsSync(path, obj) {
        var dirName,
            dir;

        for (dirName in obj) {
            if (obj.hasOwnProperty(dirName)) {
                try {
                    makeDirSync(path + "/" + dirName, mode);
                    dir = obj[dirName];
                    if (typeof dir === "object") {
                        recursiveMakeDirsSync(path + "/" + dirName, dir);
                    }
                } catch(err) {
                    errors.push(err);
                }
            }
        }
    }

    if (arguments.length === 2) {
        if (typeof base === "string") {
            mode = undefined;
        } else if (typeof base === "number") {
            mode = base;
            base = "";
        }
    }

    if (!base) {
        base = "";
    }

    obj = paths2obj(dirs);
    recursiveMakeDirsSync(base, obj);

    if(errors.length > 0) {
        return errors;
    } else {
        return null;
    }
}

exports.makeDir = makeDir;
exports.makeDirSync = makeDirSync;
exports.makeDirs = makeDirs;
exports.makeDirsSync = makeDirsSync;