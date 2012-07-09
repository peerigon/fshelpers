/**
 * <p>Little helper function to split a path into pieces. Slashes at the beginning
 * or on the end will be removed.</p>
 * 
 * @param {String} path to split
 * @return {Array} splittedPath
 */
function split(path) {
    path = path.replace(/^\//, "");     // deletes the first slash
    path = path.replace(/[\/\\]$/, "");     // deletes the last slash
    return path.split(/[\/\\]/g);
}

module.exports = split;