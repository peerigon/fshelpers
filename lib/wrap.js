function wrap(fn, ignoreError) {
    return function wrapper() {
        var callback = arguments[arguments.length - 1],
            initArgs = arguments;

        function callbackWrapper() {
            var cbArgs = [],
                i,
                offset;
            
            if(arguments[0]) {
                if(!ignoreError) {
                    cbArgs[0] = arguments[0];
                } else if(typeof ignoreError === 'array'
                    || ignoreError instanceof Array) {
                    ignoreError.push(arguments[0]);
                }
                offset = callback.length - initArgs.length;
                offset = Math.max(offset, 1);
                for (i = offset; i < callback.length; i++) {
                    cbArgs[i] = initArgs[i - offset];
                }
            } else {
                arguments = Array.prototype.slice.call(arguments, 0);
                cbArgs = arguments.concat(initArgs);
            }
            callback.apply(wrapper.caller, cbArgs);
        }
        
        if(typeof callback === 'function' || callback instanceof Function) {
            arguments[arguments.length - 1] = callbackWrapper;
            initArgs = Array.prototype.slice.call(arguments, 0, arguments.length-1);
        }
        fn.apply(undefined, arguments);
    };
}

module.exports = wrap;