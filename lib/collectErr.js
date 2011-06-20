/**
 * <p><b>MODULE: collectErr</b></p>
 * 
 * <p>Provides a callback wrapper that collects all errors.</p>
 * 
 * @version 0.1.0
 */

/**
 * <p>Apply this to a callback function an all errors are collected instead of
 * passed to the callback.</p>
 * 
 * <p>Example:<br />
 * var errors = []; // receives all error objects<br/>
 * callback = collectErr(callback, errors);<br/>
 * fs.readFile('bla', 'utf8', callback); // no error will be passed<br/>
 * 
 * @param {Function} callback the callback that is supposed to hide the error parameter.
 * @param {Array} errors an array that receives the error if one occurs.
 * 
 * @returns {Function} the wrapped callback.
 */
function collectErr(callback, errors) {
    var callbackWrapper = function callbackWrapper(err) {
        var args = Array.prototype.slice.call(arguments, 0);

        if(err) {
            errors.push(err);
        }
        args[0] = undefined;
        callback.apply(collectErr.caller, args);
    };
    
    if (callback) {
        if (callback === callbackWrapper) {
            console.log('collectErr warning: collectErr is wrapping itself. Maybe you accidently applied it twice.');
        }
        return callbackWrapper;
    } else {
        return undefined;
    }
}

module.exports = collectErr;