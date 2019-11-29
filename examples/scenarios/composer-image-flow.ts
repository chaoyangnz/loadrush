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
import { createImagePayload, updateImagePayload } from './fixtures/image';

scenario(
  {
    name: 'Image flow',
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
    url: '/api/images?sort=-lastUpdated&pageSize=10&pageIndex=1',
    capture: [
      {
        json: 'pageContent[*].{id:id,href:href}',
        as: 'thumbnails',
      },
    ],
  }),
  log('List top 10 image assets'),
  loop({ over: 'thumbnails', parallel: false }, [
    get({
      url:
        '/api/images/{{ $loopElement.id }}/blob?href={{ $loopElement.href }}',
    }),
  ]),
  log('Request thumbnail images'),
  think(2000),
  post({
    url: '/api/images',
    data: createImagePayload(),
    capture: [
      {
        json: '$',
        as: 'image',
      },
    ],
  }),
  log('Created a new image asset'),
  think(1000),
  put({
    url: '/api/images/{{ image.id }}',
    data: updateImagePayload,
  }),
  log('Updated an image asset'),
  get({
    url: '/workflow/assets/{{ image.id }}/transitions/image',
  }),
  log('Get the transitions of an image asset'),
  think(500),
  post({
    url: '/api/images/{{ image.id }}/versions/REVIEW',
  }),
  log('Transition to REVIEW status of an image asset'),
  think(500),
  post({
    url: '/api/images/{{ image.id }}/versions/PUBLISHED',
  }),
  log('Transition to PUBLISHED status of an image asset'),
  think(1000),
  get({
    url:
      '/api/images?q=(_search=in=%22loadinflux%22%20and%20lastUpdated%3E%3D2019-09-29T22:39:10Z)&sort=-lastUpdated&pageSize=10&pageIndex=0',
  }),
  log('Search a list of image assets'),
  think(2000),
);
