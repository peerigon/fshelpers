var reporter = require('nodeunit').reporters.default;
    
reporter.run(
    [
        //'resolve/resolve.js',
        //'Reader/Reader.js',
        'Writer/Writer.js'
    ]
);