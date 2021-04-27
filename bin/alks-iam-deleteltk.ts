#!/usr/bin/env node

process.title = 'ALKS';

import program from 'commander';
import _ from 'underscore';
import clc from 'cli-color';
import * as Alks from '../lib/alks';
import * as Iam from '../lib/iam';
import * as utils from '../lib/utils';
import * as Developer from '../lib/developer';
import config from '../package.json';
import { checkForUpdate } from '../lib/checkForUpdate';

const logger = 'iam-deleteltk';

program
  .version(config.version)
  .description('deletes an IAM Longterm Key')
  .option(
    '-n, --iamusername [iamUsername]',
    'the name of the iam user associated with the LTK'
  )
  .option('-a, --account [alksAccount]', 'alks account to use')
  .option('-r, --role [alksRole]', 'alks role to use')
  .option('-F, --favorites', 'filters favorite accounts')
  .option('-v, --verbose', 'be verbose')
  .parse(process.argv);

const iamUsername = program.iamusername;
let alksAccount = program.account;
let alksRole = program.role;
const filterFaves = program.favorites || false;

utils.log(program, logger, 'validating iam user name: ' + iamUsername);
if (_.isEmpty(iamUsername)) {
  utils.errorAndExit('The IAM username is required.');
}

if (!_.isUndefined(alksAccount) && _.isUndefined(alksRole)) {
  utils.log(program, logger, 'trying to extract role from account');
  alksRole = utils.tryToExtractRole(alksAccount);
}

(async function () {
  let iamAccount;
  try {
    iamAccount = await Iam.getIAMAccount(
      program,
      logger,
      alksAccount,
      alksRole,
      filterFaves
    );
  } catch (err) {
    return utils.errorAndExit(err);
  }
  const { developer, auth } = iamAccount;
  ({ account: alksAccount, role: alksRole } = iamAccount);

  const alks = await Alks.getAlks({
    baseUrl: developer.server,
    userid: developer.userid,
    password: auth.password,
    token: auth.token,
  });

  utils.log(program, logger, 'calling api to delete ltk: ' + iamUsername);

  try {
    await alks.deleteIAMUser({
      account: alksAccount,
      role: alksRole,
      iamUserName: iamUsername,
    });
  } catch (err) {
    return utils.errorAndExit(err);
  }

  console.log(clc.white(['LTK deleted for IAM User: ', iamUsername].join('')));

  utils.log(program, logger, 'checking for updates');
  await checkForUpdate();
  await Developer.trackActivity(logger);
})().catch((err) => utils.errorAndExit(err.message, err));
