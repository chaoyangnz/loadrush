import {
  get,
  log,
  post,
  think,
  scenario,
  put,
  loop,
  before,
  Context,
} from '../../src';
import { getCookie } from './auth';
import { createStoryPayload, updateStoryPayload } from './fixtures/story';

scenario(
  {
    name: 'Story flow',
    weight: 1,
  },
  before(async (context: Context) => {
    context.cookie('M_J_R_S', await getCookie(context));
  }),
  get({
    url: '/',
  }),
  log('Logged in the landing page'),
  think(2000),
  get({
    url: '/api/stories?sort=-lastUpdated&pageSize=10&pageIndex=1',
    capture: [
      {
        json: 'pageContent[*].thumbnailImage.{id:id,href:href}',
        as: 'thumbnails',
      },
    ],
  }),
  log('List top 10 story assets'),
  loop({ over: 'thumbnails', parallel: false }, [
    get({
      url:
        '/api/images/{{ $loopElement.id }}/blob?href={{ $loopElement.href }}',
    }),
  ]),
  think(2000),
  post({
    url: '/api/stories',
    json: createStoryPayload(),
    capture: [
      {
        json: '$',
        as: 'story',
      },
    ],
  }),
  log('Created a new story'),
  think(1000),
  put({
    url: '/api/stories/{{ story.id }}',
    json: updateStoryPayload,
  }),
  log('Updated a story'),
  get({
    url: '/workflow/assets/{{ story.id }}/transitions/story',
  }),
  log('Get the transitions of a story'),
  think(500),
  post({
    url: '/api/stories/{{ story.id }}/versions/REVIEW',
  }),
  log('Transition to REVIEW status of a story'),
  think(500),
  post({
    url: '/api/stories/{{ story.id }}/versions/PUBLISHED',
  }),
  log('Transition to PUBLISHED status of a story'),
  think(1000),
  get({
    url:
      '/api/stories?q=(_search=in=%22loadinflux%22%20and%20lastUpdated%3E%3D2019-09-29T22:39:10Z)&sort=-lastUpdated&pageSize=10&pageIndex=0',
  }),
  log('Search a list of stories'),
  think(2000),
);
