import { before } from '../../src/actions/hook';
import { get } from '../../src/actions/http';
import { log } from '../../src/actions/log';
import { think } from '../../src/actions/think';
import { scenario } from '../../src/scenario';

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
