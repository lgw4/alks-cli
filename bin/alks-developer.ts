#!/usr/bin/env node

process.title = 'ALKS';

import program from 'commander';
import * as utils from '../lib/utils';
import config from '../package.json';

program
  .version(config.version)
  .command('configure', 'configures developer')
  .command('accounts', 'shows available account/roles')
  .command('favorites', 'configure which accounts are favorites')
  .command('info', 'shows current developer configuration')
  .command('login', 'stores password')
  .command('logout', 'removes password')
  .command('login2fa', 'stores your alks refresh token')
  .command('logout2fa', 'removes your alks refresh token')
  .parse(process.argv);

utils.subcommandSuggestion(program, 'developer');
