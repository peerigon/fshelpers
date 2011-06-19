function collectErr(callback, errors) {
    if(callback) {
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