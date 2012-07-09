/**
 * <p><b>MODULE: fs</b></p>
 * 
 * <p>Wraps all asynchronous filesystem functions so they call the callback
 * additionally to the result with all parameters that have been passed to them
 * originally.</p>
 * 
 * <p>E.g. a callback from fs.readFile will be called with
 * callback(err, filename, data, encoding);</p>
 * 
 * <p>All other function are should passed through so you dont have to keep
 * two references for both the core-module and this.</p>
 * 
 * @see MODULE: wrap for further explanations
 * @version 0.1.0
 */


var fs = require("fs"),
    wrap = require("./wrap");

var readFile = fs.readFile; // save reference for safety check (see below)

function FsWrapper() {
    var key;

    for (key in fs) {
        if (fs.hasOwnProperty(key)) {
            if (/Sync$/.test(key)) {    // Its a function that ends on Sync. This means that here is an async function that can be wrapped.
                key = key.replace(/Sync$/, "");
                if (this[key] === undefined) {
                    this[key] = wrap(fs[key]);
                }
            }
        }
    }
}

FsWrapper.prototype = fs;

module.exports = new FsWrapper();

// This check is used to make sure that the fs-module is not accidentally changed by this module
if (fs.readFile !== readFile) {
    throw new Error("Prototype inheritance broken");
}