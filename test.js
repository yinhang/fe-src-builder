var childProcess = require("child_process");

childProcess.exec("r.js -o rjsbuild.txt out=boot_aio.js optimize=none", {
    cwd: "/Users/yinhang/Public/dev/fe-src-builder-test/fe-src/static/js"
}, function (err, stdout, stdin) {
    console.log(stdout)
});