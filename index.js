var process = require("process");
var fs = require("fs");
var childProcess = require("child_process");

var env = process.env;
var configFileName = "fesrcb-config.json";

var fesrcb = {
    init: function () {
        var configFilePath = env.PWD + "/" + configFileName;

        if(fs.existsSync(configFilePath))
        {
            fs.unlink(configFilePath);
        }
        childProcess.stdin
        var tplData = fs.readFileSync(__dirname + "/res/fesrcb-config_tpl");
        tplData = tplData.replace("_PROJCET_PATH_", env.PWD);
        fs.writeFileSync(configFilePath, tplData);

    },
    cmd: function (cmd) {
        fesrcb.init();
        //fesrcb.buildRJS();
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
                var stat = fs.statSync(bootDir + path);
                if(stat.isDirectory())
                {
                    fs.writeFileSync(bootDir + path + "/version.js", new Date().getTime() + "");
                }
            }
        }

        console.log("完成打包requirejs");
    }
};

module.exports = fesrcb;