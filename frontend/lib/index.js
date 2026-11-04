#!/usr/bin/env node
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var jsonfile = require('jsonfile');
var program = require('commander');
var readline = require("readline");
var Replacer = /** @class */ (function () {
    function Replacer(packageFile, ngswConfigFile, description) {
        var _this = this;
        this.packageFile = packageFile;
        this.ngswConfigFile = ngswConfigFile;
        this.description = description;
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        if (!description) {
            this.rl.question("Description: ", function (d) {
                _this.description = d;
                _this.rl.close();
            });
            this.rl.on('close', function () { return _this.run(); });
        }
        else {
            this.run();
        }
    }
    Replacer.prototype.run = function () {
        var _this = this;
        this.version = jsonfile.readFileSync(this.packageFile).version;
        jsonfile.readFile(this.ngswConfigFile)
            .then(function (d) {
            _this.ngsw = d || {};
            _this.ngsw.appData = _this.ngsw.appData ? __assign(__assign({}, _this.ngsw.appData), { version: _this.version }) : { version: _this.version };
            _this.ngsw.appData.description = _this.description;
            jsonfile.writeFile(_this.ngswConfigFile, _this.ngsw, { flag: 'w' })
                .then(function (d) {
                console.log(_this.ngswConfigFile + " successfully updated.");
                process.exit();
            })
            .catch(function (d) { return console.log(d); });
        })
        .catch(function (d) { return console.log(d); });
    };
    return Replacer;
}());
program
    .name('update-service-worker')
    .version('0.2.0')
    .description("CLI to update ngsw-config.json with version from package.json")
    .option('-p, --package <package.json>', 'package.json file path')
    .option('-n, --ngsw <ngsw-config.json>', 'ngsw-config.json file path')
    .option('-d --desc <update description>', 'description of the update')
    .parse(process.argv);
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
else {
    new Replacer(program.package, program.ngsw, program.desc);
}
//# sourceMappingURL=index.js.map