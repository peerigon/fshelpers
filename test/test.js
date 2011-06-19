var reporter = require('nodeunit').reporters.default;
    
reporter.run(
    [
        'resolve/resolve.js',
        'Reader/Reader.js',
        'wrap/wrap.js',
        'collectErr/collectErr.js',
        'remove/remove.js',
        'makeDir/makeDir.js'
    ]
);