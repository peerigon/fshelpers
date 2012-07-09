"use strict";

var testCase = require("nodeunit").testCase,
    rewire = require("rewire");

///////////////////////////////////////////////////////////////////////////////////////

module.exports = testCase({
    unifyLinuxFilename: function(test) {
        var unify = rewire("../../lib/unify.js");

        unify.__set__("process", {
            platform: "linux"
        });
        test.equal(unify("aaa/bbb//../ccc/file.js"), "/aaa/ccc/file.js");
        test.done();
    },
    unifyLinuxDirname: function(test) {
        var unify = rewire("../../lib/unify.js");

        unify.__set__("process", {
            platform: "linux"
        });
        test.equal(unify("aaa/bbb//./ccc/"), "/aaa/bbb/ccc");
        test.done();
    },
    unifyWinFilename: function(test) {
        var unify = rewire("../../lib/unify.js");

        unify.__set__("process", {
            platform: "win32"
        });
        test.equal(unify("aaa\\bbb\\..\\ccc\\file.js"), "c:/aaa/ccc/file.js");
        test.equal(unify("C:\\aaa\\bbb\\..\\ccc\\file.js"), "c:/aaa/ccc/file.js");
        test.done();
    },
    unifyWinDirname: function(test) {
        var unify = rewire("../../lib/unify.js");

        unify.__set__("process", {
            platform: "win32"
        });
        test.equal(unify("aaa\\bbb\\.\\ccc\\"), "c:/aaa/bbb/ccc");
        test.equal(unify("/c:/"), "c:/");
        test.equal(unify("\\c:/"), "c:/");
        test.done();
    },
    unifyEmptyString: function(test) {
        var unify = rewire("../../lib/unify.js");

        unify.__set__("process", {
            platform: "linux"
        });
        test.equal(unify(""), "/");

        unify = rewire("../../lib/unify.js");

        unify.__set__("process", {
            platform: "win"
        });
        test.equal(unify(""), "c:/");

        test.done();
    }
});