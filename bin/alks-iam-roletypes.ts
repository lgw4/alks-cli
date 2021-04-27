#!/usr/bin/env node

process.title = 'ALKS';

import program from 'commander';
import clc from 'cli-color';
import _ from 'underscore';
import * as Alks from '../lib/alks';
import config from '../package.json';
import * as Developer from '../lib/developer';
import * as utils from '../lib/utils';
import { checkForUpdate } from '../lib/checkForUpdate';

const logger = 'iam-roletypes';
const outputVals = ['list', 'json'];

program
  .version(config.version)
  .description('list the available iam role types')
  .option(
    '-o, --output [format]',
    'output format (' + outputVals.join(', ') + '), default: ' + outputVals[0],
    outputVals[0]
  )
  .option('-v, --verbose', 'be verbose')
  .parse(process.argv);

const output = program.output;

if (!_.contains(outputVals, output)) {
  utils.errorAndExit(
    'The output provided (' +
      output +
      ') is not in the allowed values: ' +
      outputVals.join(', ')
  );
}

(async function () {
  utils.log(program, logger, 'getting developer');
  const developer = await Developer.getDeveloper();

  utils.log(program, logger, 'getting auth');
  const auth = await Developer.getAuth(program);

  const alks = await Alks.getAlks({
    baseUrl: developer.server,
    userid: developer.userid,
    password: auth.password,
    token: auth.token,
  });

  utils.log(program, logger, 'getting list of role types from REST API');
  let roleTypes;
  try {
    roleTypes = await alks.getAllAWSRoleTypes({});
  } catch (err) {
    return utils.errorAndExit(err);
  }

  utils.log(
    program,
    logger,
    'outputting list of ' + (roleTypes ? roleTypes.length : -1) + ' role types'
  );
  console.error(clc.white.underline.bold('\nAvailable IAM Role Types'));

  if (output === 'list') {
    _.each(roleTypes, (roleType, i) => {
      console.log(
        clc.white(
          [i < 9 ? ' ' : '', i + 1, ') ', roleType.roleTypeName].join('')
        )
      );
    });
  } else {
    console.log(
      JSON.stringify(roleTypes.map((roleType) => roleType.roleTypeName))
    );
  }

  utils.log(program, logger, 'checking for updates');
  await checkForUpdate();
  await Developer.trackActivity(logger);
})().catch((err) => utils.errorAndExit(err.message, err));
