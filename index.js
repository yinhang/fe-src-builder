var process = require("process");
var fs = require("fs");

var env = process.env;

var fesrcb = {
    cmd: function (cmd) {
        fesrcb.buildRJS();
    },
    buildRJS: function () {
        console.log("开始打包requirejs");
        var paths = null;
        var bootDir = env.PWD + "/static/js/app/boot/";

        try {
            var paths = fs.readdirSync(bootDir);
        } catch(e)
        {
            console.error("\"" + env.PWD + "\"不是合法的fe-src目录");
            return;
        }

        if(paths && paths.length > 0)
        {
            for(var i = 0, l = paths.length; i < l; ++ i)
            {
                var path = paths[i];
                var stat = fs.statSync(path);
                if(stat.isDirectory())
                {
                    fs.writeFileSync(bootDir + path, new Date().getTime() + "");
                }
            }
        }

        console.log("完成打包requirejs");
    }
};

module.exports = fesrcb;