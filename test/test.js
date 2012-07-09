var reporter = require("nodeunit").reporters.default,
    pathUtil = require("path"),
    basePath = pathUtil.relative(process.cwd(), __dirname);

reporter.run(
    [
        basePath + "/Finder/Finder.test.js",
        basePath + "/wrap/wrap.test.js",
        basePath + "/collectErr/collectErr.test.js",
        basePath + "/remove/remove.test.js",
        basePath + "/makeDir/makeDir.test.js",
        basePath + "/paths2obj/paths2obj.test.js",
        basePath + "/write/write.test.js",
        basePath + "/unify/unify.test.js"
    ]
);