import { before } from '../../src/actions/hook';
import { get, post } from '../../src/actions/http';
import { log } from '../../src/actions/log';
import { think } from '../../src/actions/think';
import { Context } from '../../src/context';
import { scenario } from '../../src/scenario';
import { createStoryPayload } from './fixtures/create-story';

scenario(
  {
    name: 'Story flow',
    weight: 1,
  },
  [
    before(async (context: Context) => {
      context.$axios.defaults.headers.Cookie = `M_J_R_S=${context.env.COMPOSER_COOKIE}`;
    }),
    get({
      url: '/',
    }),
    log('Logged in the landing page'),
    think(2000),
    post({
      url: '/api/stories',
      data: createStoryPayload(),
      afterResponse: async (req, res, context) => {
        // console.log(res.data);
      },
    }),
    log('Created a new story'),
  ],
);
