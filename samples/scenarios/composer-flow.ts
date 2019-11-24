import { before, get, log, post, think, Context, scenario } from '../../src';
import { loop } from '../../src/loadflux/actions/loop';
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
    get({
      url: '/api/images?sort=-lastUpdated&pageSize=10&pageIndex=1',
      capture: [
        {
          from: 'body',
          jmespath: 'pageContent[*].{id:id,href:href}', // 'pageContent[*].thumbnailImage.[id,href]',
          as: 'thumbnails',
        },
      ],
    }),
    log('List top 10 stories'),
    loop({ over: 'thumbnails', parallel: false }, [
      get({
        url:
          '/api/images/{{ $loopElement.id }}/blob?href={{ $loopElement.href }}',
      }),
    ]),
    post({
      url: '/api/stories',
      data: createStoryPayload(),
      afterResponse: async (req, res, context) => {
        // console.log(res.data);
      },
    }),
    log('Created a new story'),
    think(1000),
  ],
);
