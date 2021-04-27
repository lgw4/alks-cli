#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
process.title = 'ALKS';
var commander_1 = tslib_1.__importDefault(require("commander"));
var cli_color_1 = tslib_1.__importDefault(require("cli-color"));
var package_json_1 = tslib_1.__importDefault(require("../package.json"));
var utils = tslib_1.__importStar(require("../lib/utils"));
var Developer = tslib_1.__importStar(require("../lib/developer"));
var checkForUpdate_1 = require("../lib/checkForUpdate");
commander_1.default
    .version(package_json_1.default.version)
    .description('stores password')
    .option('-v, --verbose', 'be verbose')
    .parse(process.argv);
var logger = 'dev-login';
(function () {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var password, err_1;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Developer.getPasswordFromPrompt()];
                case 1:
                    password = _a.sent();
                    utils.log(commander_1.default, logger, 'saving password');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, Developer.storePassword(password)];
                case 3:
                    _a.sent();
                    console.error(cli_color_1.default.white('Password saved!'));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    utils.log(commander_1.default, logger, 'error saving password! ' + err_1.message);
                    utils.passwordSaveErrorHandler(err_1);
                    return [3 /*break*/, 5];
                case 5:
                    utils.log(commander_1.default, logger, 'checking for updates');
                    return [4 /*yield*/, checkForUpdate_1.checkForUpdate()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, Developer.trackActivity(logger)];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
})().catch(function (err) { return utils.errorAndExit(err.message, err); });
//# sourceMappingURL=alks-developer-login.js.map