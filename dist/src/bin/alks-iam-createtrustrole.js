#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
process.title = 'ALKS';
var commander_1 = tslib_1.__importDefault(require("commander"));
var underscore_1 = tslib_1.__importDefault(require("underscore"));
var cli_color_1 = tslib_1.__importDefault(require("cli-color"));
var alks_js_1 = tslib_1.__importDefault(require("alks.js"));
var package_json_1 = tslib_1.__importDefault(require("../../package.json"));
var checkForUpdate_1 = require("../lib/checkForUpdate");
var getAlks_1 = require("../lib/getAlks");
var errorAndExit_1 = require("../lib/errorAndExit");
var getAlksAccount_1 = require("../lib/getAlksAccount");
var getAuth_1 = require("../lib/getAuth");
var getDeveloper_1 = require("../lib/getDeveloper");
var log_1 = require("../lib/log");
var tractActivity_1 = require("../lib/tractActivity");
var tryToExtractRole_1 = require("../lib/tryToExtractRole");
var logger = 'iam-createtrustrole';
var roleNameDesc = 'alphanumeric including @+=._-';
var trustArnDesc = 'arn:aws|aws-us-gov:iam::d{12}:role/TestRole';
commander_1.default
    .version(package_json_1.default.version)
    .description('creates a new IAM Trust role')
    .option('-n, --rolename [rolename]', 'the name of the role, ' + roleNameDesc)
    .option('-t, --roletype [roletype]', 'the role type: Cross Account or Inner Account')
    .option('-T, --trustarn [trustarn]', 'trust arn, ' + trustArnDesc)
    .option('-e, --enableAlksAccess', 'enable alks access (MI), default: false', false)
    .option('-a, --account [alksAccount]', 'alks account to use')
    .option('-r, --role [alksRole]', 'alks role to use')
    .option('-F, --favorites', 'filters favorite accounts')
    .option('-v, --verbose', 'be verbose')
    .parse(process.argv);
var options = commander_1.default.opts();
var ROLE_NAME_REGEX = /^[a-zA-Z0-9!@+=._-]+$/g;
var TRUST_ARN_REGEX = /arn:(aws|aws-us-gov):iam::\d{12}:role\/?[a-zA-Z_0-9+=,.@-_/]+/g;
var roleName = options.rolename;
var roleType = options.roletype;
var trustArn = options.trustarn;
var enableAlksAccess = options.enableAlksAccess;
var alksAccount = options.account;
var alksRole = options.role;
var filterFavorites = options.favorites || false;
log_1.log(commander_1.default, logger, 'validating role name: ' + roleName);
if (underscore_1.default.isEmpty(roleName) || !ROLE_NAME_REGEX.test(roleName)) {
    errorAndExit_1.errorAndExit('The role name provided contains illegal characters. It must be ' +
        roleNameDesc);
}
log_1.log(commander_1.default, logger, 'validating role type: ' + roleType);
if (underscore_1.default.isEmpty(roleType) ||
    (roleType !== 'Cross Account' && roleType !== 'Inner Account')) {
    errorAndExit_1.errorAndExit('The role type is required');
}
log_1.log(commander_1.default, logger, 'validating trust arn: ' + trustArn);
if (underscore_1.default.isEmpty(trustArn) || !TRUST_ARN_REGEX.test(trustArn)) {
    errorAndExit_1.errorAndExit('The trust arn provided contains illegal characters. It must be ' +
        trustArnDesc);
}
if (!underscore_1.default.isUndefined(alksAccount) && underscore_1.default.isUndefined(alksRole)) {
    log_1.log(commander_1.default, logger, 'trying to extract role from account');
    alksRole = tryToExtractRole_1.tryToExtractRole(alksAccount);
}
(function () {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var developer, auth, alks, role, err_1;
        var _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(underscore_1.default.isEmpty(alksAccount) || underscore_1.default.isEmpty(alksRole))) return [3 /*break*/, 2];
                    log_1.log(commander_1.default, logger, 'getting accounts');
                    return [4 /*yield*/, getAlksAccount_1.getAlksAccount(commander_1.default, {
                            iamOnly: true,
                            filterFavorites: filterFavorites,
                        })];
                case 1:
                    (_a = _b.sent(), alksAccount = _a.alksAccount, alksRole = _a.alksRole);
                    return [3 /*break*/, 3];
                case 2:
                    log_1.log(commander_1.default, logger, 'using provided account/role');
                    _b.label = 3;
                case 3: return [4 /*yield*/, getDeveloper_1.getDeveloper()];
                case 4:
                    developer = _b.sent();
                    return [4 /*yield*/, getAuth_1.getAuth(commander_1.default)];
                case 5:
                    auth = _b.sent();
                    log_1.log(commander_1.default, logger, 'calling api to create trust role: ' + roleName);
                    return [4 /*yield*/, getAlks_1.getAlks(tslib_1.__assign({ baseUrl: developer.server }, auth))];
                case 6:
                    alks = _b.sent();
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, alks.createNonServiceRole({
                            account: alksAccount,
                            role: alksRole,
                            roleName: roleName,
                            roleType: roleType,
                            trustArn: trustArn,
                            enableAlksAccess: enableAlksAccess,
                            includeDefaultPolicy: alks_js_1.default.PseudoBoolean.False,
                        })];
                case 8:
                    role = _b.sent();
                    return [3 /*break*/, 10];
                case 9:
                    err_1 = _b.sent();
                    return [2 /*return*/, errorAndExit_1.errorAndExit(err_1)];
                case 10:
                    console.log(cli_color_1.default.white(['The role: ', roleName, ' was created with the ARN: '].join('')) + cli_color_1.default.white.underline(role.roleArn));
                    if (role.instanceProfileArn) {
                        console.log(cli_color_1.default.white(['An instance profile was also created with the ARN: '].join('')) + cli_color_1.default.white.underline(role.instanceProfileArn));
                    }
                    log_1.log(commander_1.default, logger, 'checking for updates');
                    return [4 /*yield*/, checkForUpdate_1.checkForUpdate()];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, tractActivity_1.trackActivity(logger)];
                case 12:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
})().catch(function (err) { return errorAndExit_1.errorAndExit(err.message, err); });
//# sourceMappingURL=alks-iam-createtrustrole.js.map