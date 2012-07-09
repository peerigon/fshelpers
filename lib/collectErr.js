/**
 * Wraps a callback so no error will be passed to it. This function can be useful if you"re using
 * an utility module like async that stops execution if an asynchronous error occured and you want to go on.
 * 
 * The callback function will not be invoked with an error object, even if one occurs.
 * All errors will be pushed to the errors-array.
 *
 * Example:
 *
 * var errors = []; // receives all error objects
 * wrappedCallback = collectErr(callback, errors);
 * fs.readFile("bla", "utf8", wrappedCallback); // no error will be passed to wrappedCallback
 * 
 * @param {!Function} callback the callback that is supposed to hide the error parameter.
 * @param {!Array} errors contains all occurred errors.
 * 
 * @returns {Function} the wrapped callback.
 */
function collectErr(callback, errors) {
    function callbackWrapper(err) {
        var args = Array.prototype.slice.call(arguments, 0);

        if (err) {
            errors.push(err);
        }
        args[0] = undefined;
        callback.apply(null, args);
    }
    
    if (callback) {
        if (callback === callbackWrapper) {
            console.error("collectErr warning: collectErr is wrapping itself. Maybe you accidently applied it twice.");
        }
        return callbackWrapper;
    } else {
        return undefined;
    }
}

module.exports = collectErr;