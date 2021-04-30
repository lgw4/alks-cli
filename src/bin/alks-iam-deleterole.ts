#!/usr/bin/env node

process.title = 'ALKS';

import program from 'commander';
import clc from 'cli-color';
import _ from 'underscore';
import config from '../../package.json';
import { checkForUpdate } from '../lib/checkForUpdate';
import { getAlks } from '../lib/getAlks';
import { errorAndExit } from '../lib/errorAndExit';
import { getAlksAccount } from '../lib/getAlksAccount';
import { getAuth } from '../lib/getAuth';
import { getDeveloper } from '../lib/getDeveloper';
import { log } from '../lib/log';
import { trackActivity } from '../lib/tractActivity';
import { tryToExtractRole } from '../lib/tryToExtractRole';

const logger = 'iam-delete';

program
  .version(config.version)
  .description('remove an IAM role')
  .option('-n, --rolename [rolename]', 'the name of the role to delete')
  .option('-a, --account [alksAccount]', 'alks account to use')
  .option('-r, --role [alksRole]', 'alks role to use')
  .option('-F, --favorites', 'filters favorite accounts')
  .option('-v, --verbose', 'be verbose')
  .parse(process.argv);

const options = program.opts();
const roleName = options.rolename;
let alksAccount = options.account;
let alksRole = options.role;
const filterFavorites = options.favorites || false;

log(program, logger, 'validating role name: ' + roleName);
if (_.isEmpty(roleName)) {
  errorAndExit('The role name must be provided.');
}

if (!_.isUndefined(alksAccount) && _.isUndefined(alksRole)) {
  log(program, logger, 'trying to extract role from account');
  alksRole = tryToExtractRole(alksAccount);
}

(async function () {
  if (_.isEmpty(alksAccount) || _.isEmpty(alksRole)) {
    log(program, logger, 'getting accounts');
    ({ alksAccount, alksRole } = await getAlksAccount(program, {
      iamOnly: true,
      filterFavorites,
    }));
  } else {
    log(program, logger, 'using provided account/role');
  }

  const developer = await getDeveloper();

  const auth = await getAuth(program);

  log(program, logger, 'calling api to delete role: ' + roleName);

  const alks = await getAlks({
    baseUrl: developer.server,
    ...auth,
  });

  try {
    await alks.deleteRole({
      account: alksAccount,
      role: alksRole,
      roleName,
    });
  } catch (err) {
    return errorAndExit(err);
  }

  console.log(clc.white(['The role ', roleName, ' was deleted'].join('')));
  log(program, logger, 'checking for updates');
  await checkForUpdate();
  await trackActivity(logger);
})().catch((err) => errorAndExit(err.message, err));
