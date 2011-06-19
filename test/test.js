var reporter = require('nodeunit').reporters.default;
    
reporter.run(
    [
        'resolve/resolve.js',
        'Reader/Reader.js',
        'wrap/wrap.js',
        'collectErr/collectErr.js',
        'dir/dir.js',
        'dir/dirSync.js'
    ]
);