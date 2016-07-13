var process = require("process");
var fs = require("fs");

var env = process.env;

var fesrcb = {
    cmd: function (cmd) {
        fesrcb.buildRJS();
    },
    buildRJS: function () {
        console.log("开始打包requirejs");
        console.log(env.PWD + "/static/js/app/boot/");
        try {
            var paths = fs.readdirSync(env.PWD + "/static/js/app/boot/");
        } catch(e)
        {
            console.error("不是合法的fe-src目录");
            return;
        }
        console.log("完成打包requirejs");
    }
};

module.exports = fesrcb;