import { before } from './actions/hook';
import { get } from './actions/http';
import { log } from './actions/log';
import { think } from './actions/think';
import { scenario } from './scenario';

scenario({ name: 'story flow', weight: 1 }, [
  before(async (context) => {}),
  get({
    url: 'http://www.mocky.io/v2/5dd7abf43100004e000559e2',
    expect: async (context) => {},
  }),
  think(1000),
  log('list all stories'),
  get({
    url: 'http://www.mocky.io/v2/5dd7c71d3100003900055b21',
    expect: async (context) => {},
  }),
  log('get story details'),
]);
