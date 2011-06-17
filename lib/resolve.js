var pathUtil = require('path'),
    os = require('os');

/**
 * Replaces ~ with the home dir
 */
function replaceTilde(path) {
    if(path && os.type() === 'Linux') {
        path = path.replace(/^~\//, process.env.HOME + '/');
    }
    
    return path;
}


/**
 * Wrappes the native path.resolve function from nodeJS
 * to add support for the home directory on linux machines.
 * 
 * @param {String} [from=cwd] where to start
 * @param {String} to where to go
 * @returns {String} path an absolute path to the resource
 */
function resolve(from, to) {
    var args = [],
        path,
        i;
    
    for (i = 0; i < arguments.length; i++) {
        path = arguments[i];
        path = replaceTilde(path);
        args.push(path);
    }
    
    return pathUtil.resolve.apply(pathUtil, args);
}

module.exports = resolve;