import { getDeveloper, updateDeveloper } from './developer';
import program from '../program';
import { log } from '../log';
import { isEmpty } from 'underscore';

export async function getUserId() {
  const userIdOption = program.opts().userid;
  if (userIdOption) {
    log('using userid from CLI arg');
    return userIdOption;
  }

  const userIdFromEnv = process.env.ALKS_USERID;
  if (!isEmpty(userIdFromEnv)) {
    log('using userid from environment variable');
    return userIdFromEnv;
  }

  const developer = await getDeveloper();
  if (developer.userid) {
    log('using stored userid');
    return developer.userid;
  }

  throw new Error('No userid was configured');
}

export async function setUserId(userId: string) {
  await updateDeveloper({ userid: userId });
}
