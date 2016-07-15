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
    init: function (complete) {

        if(fs.existsSync(configFilePath))
        {
            fs.unlink(configFilePath);
        }

        var tplData = fs.readFileSync(__dirname + "/res/fesrcb-config_tpl.json", "utf8");
        tplData = tplData.replace("_PROJECT_PATH_", env.PWD);

        readlineInterface.question("请输入fe-src路径: " + env.PWD + "/", function (answer) {
            tplData = tplData.replace("_FESRC_PATH_", answer);
            fs.writeFileSync(configFilePath, tplData, "utf8");
            readlineInterface.close();
            complete && complete();
        });

    },
    cmd: function (cmd) {

        if(fs.existsSync(configFilePath) == false)
        {
            fesrcb.init(function () {
                fesrcb.cmd(cmd);
            });
            return;
        }

        commander
            .option("-m, --mode [name]", "fis发布模式")
            .option("-w, --watch", "工程改动后自动编译")
            .parse(cmd);

        fesrcb.buildRJS();
        fesrcb.clean();
        fesrcb.fisRelease(commander.mode, commander.watch);

    },
    fisRelease: function (mode, watch) {

        var config = getConfig();

        var fesrcPath = config.projectPath + "/" + config.fesrcPath;

        var fis3ReleaseCMD = [
            "fis3 release"
        ];

        if(mode)
        {
            fis3ReleaseCMD.push(mode);
        }

        if(watch)
        {
            fis3ReleaseCMD.push("-w");
        }

        fis3ReleaseCMD = fis3ReleaseCMD.join(" ");

        console.log("fis3: "+ fis3ReleaseCMD)

        var fis3ReleaseProcess = childProcess.exec(fis3ReleaseCMD);

        fis3ReleaseProcess.on("close", function () {
            fesrcb.cleanTmpFiles();
            process.exit(1);
        });

        readlineInterface.question("按下\"q\"结束fesrcb\n", function (answer) {
            if(answer == "q")
            {
                fis3ReleaseProcess.kill();
            }
        });

    },
    cleanTmpFiles: function () {
        console.log("清理临时文件。。。");

        var config = getConfig();

        var fesrcPath = config.projectPath + "/" + config.fesrcPath;
        var staticPath = fesrcPath + "/static";
        var jsPath = staticPath + "/js";
        var bootDir = jsPath + "/app/boot";

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
                    fs.unlink(appBootPath + "/boot_aio.js");
                    fs.unlink(appBootPath + "/version.js");
                }
            }

        }
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

                    console.log(childProcess.execSync("r.js -o rjsbuild.txt out=boot_aio.js optimize=none", {
                        cwd: jsPath
                    }).toString());

                    fs.writeFileSync(appBootPath + "/boot_aio.js", fs.readFileSync(jsPath + "/boot_aio.js", "utf8"), "utf8");
                    fs.unlink(jsPath + "/boot_aio.js");
                    fs.unlink(jsPath + "/boot.js");
                }
            }

        }

        fs.unlink(jsPath + "/rjsbuild.txt");

        console.log("完成打包requirejs");

    },
    clean: function () {

        console.log("删除老文件。。。");

        var config = getConfig();

        var clean = config.clean;

        var projectPath = config.projectPath;

        for(var i = 0, l = clean.length; i < l; ++ i)
        {
            var cleanPath = projectPath + "/" + clean[i];
            fs.unlink(cleanPath);
        }
    }
};

module.exports = fesrcb;