function collectErr(callback, errors) {
    if (callback) {
        if (callback === collectErr) {
            console.log('collectErr warning: collectErr is wrapping itself. Maybe you accidently applied it twice.');
        }
        return function callbackWrapper(err) {
            var args = Array.prototype.slice.call(arguments, 0);
            
            if(err) {
                errors.push(err);
            }
            args[0] = undefined;
            callback.apply(collectErr.caller, args);
        }
    } else {
        return undefined;
    }
}

module.exports = collectErr;