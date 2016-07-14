var process = require("process");
var fs = require("fs");
var childProcess = require("child_process");
var readline = require("readline");
var commander = require('commander');

var env = process.env;
var configFileName = "fesrcb-config.json";
var configFilePath = env.PWD + "/" + configFileName;

const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getConfig() {
    var config = eval("(" + fs.readFileSync(configFilePath, "utf8") + ")");
    return config;
};

var fesrcb = {
    init: function () {

        if(fs.existsSync(configFilePath))
        {
            fs.unlink(configFilePath);
        }

        var tplData = fs.readFileSync(__dirname + "/res/fesrcb-config_tpl.json", "utf8");
        tplData = tplData.replace("_PROJECT_PATH_", env.PWD);

        readlineInterface.question("请输入fe-src路径: " + env.PWD + "/", function (answer) {
            tplData = tplData.replace("_FESRC_PATH_", answer);

            readlineInterface.question("请输入目标static路径: " + env.PWD + "/", function (answer) {
                tplData = tplData.replace("_STATIC_TARGET_PATH_", answer);

                readlineInterface.question("请输入目标tpl路径: " + env.PWD + "/", function (answer) {
                    tplData = tplData.replace("_TPL_TARGET_PATH_", answer);
                    fs.writeFileSync(configFilePath, tplData, "utf8");
                    readlineInterface.close();
                });

            });

        });

    },
    cmd: function (cmd) {

        if(fs.existsSync(configFilePath) == false)
        {
            fesrcb.init();
        }

        commander
            .option("-d, --dev", "开发模式")
            .option("-w, --watch", "工程改动后自动编译")
            .parse(cmd);

        var config = getConfig();

        console.log(config.projectPath)


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