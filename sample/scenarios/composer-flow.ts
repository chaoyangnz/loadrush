import { before, get, log, post, think, Context, scenario } from '../../src';
import { createStoryPayload } from './fixtures/create-story';

scenario(
  {
    name: 'Story flow',
    weight: 1,
  },
  [
    before(async (context: Context) => {
      context.$http.cookie('M_J_R_S', context.env.COMPOSER_COOKIE as string);
    }),
    get({
      url: '/',
    }),
    log('Logged checkin the landing page'),
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
