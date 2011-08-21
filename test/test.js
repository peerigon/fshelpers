var reporter = require('nodeunit').reporters.default;

reporter.run(
    [
        'test/Finder/Finder.js',
        'test/wrap/wrap.js',
        'test/collectErr/collectErr.js',
        'test/remove/remove.js',
        'test/makeDir/makeDir.js',
        'test/paths2obj/paths2obj.js',
        'test/write/write.js'
    ]
);