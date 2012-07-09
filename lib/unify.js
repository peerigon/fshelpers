"use strict"; // run code in ES5 strict mode

var pathUtil = require("path");

/**
 * Unifies a path to alleviate working with paths on different platforms. It
 *
 * - makes all paths absolute (adds a preceding "/" or "c:/" if necessary)
 * - normalizes the path
 * - applies linux-style path separators "/"
 * - removes a trailing slash
 *
 * @param {!String} path
 * @throws {TypeError}
 * @return {String}
 */
function unify(path) {
    var isWindows = process.platform.search("win") !== -1;

    if (typeof path !== "string") {
        throw new TypeError("(fshelpers) The path must be a string. Instead saw '" + typeof path + "'");
    }

    // Make path absolute depending on platform
    if (isWindows) {
        path = path.replace(/^[\/\\]/, ""); // trim leading slash if present
        if (/^[a-z]\:/i.test(path) === false) {
            path = "c:/" + path;    // fallback: we"re assuming that we"re on drive C:
        } else {
            path = path.charAt(0).toLowerCase() + path.substr(1);
        }
    } else {
        path = "/" + path;
    }

    path = pathUtil.normalize(path);

    // Turn all path separators to linux-style
    if (pathUtil.sep !== "/") {
        path = path.replace(new RegExp("\\" + pathUtil.sep, "g"), "/");
    }

    // Remove trailing slash
    if ((isWindows === false && path.length > 1) || (isWindows && path.length > 3)) {
        if (path.charAt(path.length - 1) === "/") {
            path = path.substr(0, path.length - 1);
        }
    }

    return path;
}

module.exports = unify;