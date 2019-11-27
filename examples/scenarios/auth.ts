// @ts-ignore
import aes256 from 'aes256';
// @ts-ignore
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Context } from '../../src';

let idToken: string;

export async function getCookie(context: Context) {
  return encrypt(await auth(context));
}

async function auth(context: Context) {
  if (isValid(idToken)) {
    // still valid
    return idToken;
  }
  const res = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
    refresh_token: context.env.COMPOSER_OAUTH_REFRESH_TOKEN,
    client_id: context.env.COMPOSER_OAUTH_CLIENT_ID,
    client_secret: context.env.COMPOSER_OAUTH_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  idToken = res.data.id_token;
  // console.log('Refresh an access token', idToken);
  return idToken;
}

function isValid(idToken: string) {
  if (!idToken) {
    return false;
  }
  const json = jwt.decode(idToken);
  return Math.floor(Date.now() / 1000) < json.exp - 10 * 60;
}

function encrypt(idToken: string): string {
  return aes256.encrypt(process.env.COMPOSER_OAUTH_ENCRYPTION_KEY, idToken);
}
