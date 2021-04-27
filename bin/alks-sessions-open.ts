#!/usr/bin/env node

process.title = 'ALKS';

import program from 'commander';
import _ from 'underscore';
import config from '../package.json';
import * as utils from '../lib/utils';
import * as Keys from '../lib/keys';
import * as Developer from '../lib/developer';
import * as Sessions from '../lib/sessions';
import * as Iam from '../lib/iam';
import { checkForUpdate } from '../lib/checkForUpdate';

const outputValues = utils.getOutputValues();

program
  .version(config.version)
  .description('creates or resumes a session')
  .option('-a, --account [alksAccount]', 'alks account to use')
  .option('-r, --role [alksRole]', 'alks role to use')
  .option('-i, --iam', 'create an IAM session')
  .option('-p, --password [password]', 'my password')
  .option(
    '-o, --output [format]',
    'output format (' + outputValues.join(', ') + ')'
  )
  .option(
    '-n, --namedProfile [profile]',
    'if output is set to creds, use this profile, default: default'
  )
  .option(
    '-f, --force',
    'if output is set to creds, force overwriting of AWS credentials'
  )
  .option('-F, --favorites', 'filters favorite accounts')
  .option('-N, --newSession', 'forces a new session to be generated')
  .option(
    '-d, --default',
    'uses your default account from "alks developer configure"'
  )
  .option('-v, --verbose', 'be verbose')
  .parse(process.argv);

let alksAccount = program.account;
let alksRole = program.role;
const forceNewSession = program.newSession;
const useDefaultAcct = program.default;
const output = program.output;
const filterFaves = program.favorites || false;
const logger = 'sessions-open';

if (!_.isUndefined(alksAccount) && _.isUndefined(alksRole)) {
  utils.log(program, logger, 'trying to extract role from account');
  alksRole = utils.tryToExtractRole(alksAccount);
}

(async function () {
  let developer;
  try {
    developer = await Developer.getDeveloper();
  } catch (err) {
    return utils.errorAndExit('Unable to load default account!', err);
  }

  if (useDefaultAcct) {
    alksAccount = developer.alksAccount;
    alksRole = developer.alksRole;
  }

  let key;
  try {
    if (_.isUndefined(program.iam)) {
      key = await Sessions.getSessionKey(
        program,
        logger,
        alksAccount,
        alksRole,
        false,
        forceNewSession,
        filterFaves
      );
    } else {
      key = await Iam.getIAMKey(
        program,
        logger,
        alksAccount,
        alksRole,
        forceNewSession,
        filterFaves
      );
    }
  } catch (err) {
    return utils.errorAndExit(err);
  }

  console.log(
    Keys.getKeyOutput(
      output || developer.outputFormat,
      key,
      program.namedProfile,
      program.force
    )
  );

  utils.log(program, logger, 'checking for updates');
  await checkForUpdate();
  await Developer.trackActivity(logger);
})().catch((err) => utils.errorAndExit(err.message, err));
