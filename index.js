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

        fesrcb.buildRJS();


    },
    buildRJS: function () {
        console.log("开始打包requirejs");

        var config = getConfig();

        var fesrcPath = config.projectPath + "/" + config.fesrcPath;
        var staticPath = fesrcPath + "/static";
        var jsPath = staticPath + "/js";
        var bootDir = jsPath + "/app/boot";

        fs.writeFileSync(jsPath + "/rjsbuild.txt", fs.readFileSync(bootDir + "/rjsbuild.txt", "utf8"), "utf8");

        var paths = null;

        try {
            paths = fs.readdirSync(bootDir);
        } catch(e)
        {
            console.error("\"" + fesrcPath + "\"不是合法的fe-src目录");
            return;
        }

        if(paths && paths.length > 0)
        {
            for(var i = 0, l = paths.length; i < l; ++ i)
            {
                var path = paths[i];
                var appBootPath = bootDir + "/" + path;
                var stat = fs.statSync(appBootPath);
                if(stat.isDirectory())
                {
                    console.log("处理\"" + appBootPath + "\"");
                    fs.writeFileSync(appBootPath + "/version.js", new Date().getTime() + "");
                    fs.writeFileSync(jsPath + "/boot.js", fs.readFileSync(appBootPath + "/boot.js", "utf8"), "utf8");
                    console.log("准备执行r.js在: " + jsPath)
                    childProcess.exec("r.js -o rjsbuild.txt out=boot_aio.js optimize=none", {
                        cwd: jsPath
                    }, function (err, stdout, stdin) {
                        if(err)
                        {
                            console.log(err);
                            return;
                        }
                        console.log(stdout);
                        fs.writeFileSync(appBootPath + "/boot_aio.js", fs.readFileSync(jsPath + "/boot_aio.js", "utf8"), "utf8");
                        fs.unlink(jsPath + "/boot_aio.js");
                    });
                }
            }

        }

        fs.unlink(jsPath + "/rjsbuild.txt");

        console.log("完成打包requirejs");
    }
};

module.exports = fesrcb;