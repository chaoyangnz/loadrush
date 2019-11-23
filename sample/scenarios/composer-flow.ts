import { before } from '../src/actions/hook';
import { get, post } from '../src/actions/http';
import { log } from '../src/actions/log';
import { think } from '../src/actions/think';
import { Context } from '../src/context';
import { scenario } from '../src/scenario';
import faker from 'faker';

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

function createStoryPayload() {
  return {
    assetSubType: 'generic',
    headline: `Loadflux: ${faker.lorem.sentence(
      4,
    )} @ ${new Date().toLocaleString()}`,
    body: [
      {
        text: {
          type: 'P',
          content: [faker.lorem.paragraph(3)],
        },
        type: 'TEXT',
      },
    ],
    byLine: {
      authors: [
        { name: 'smoke test', email: 'test@fairfaxmedia.co.nz' },
        {
          name: 'Chao Yang',
          email: 'chao.yang@fairfaxmedia.co.nz',
        },
      ],
      otherContributors: [],
    },
    sectionHeadline: faker.lorem.sentence(),
    sectionIntro: faker.lorem.sentence(),
    primaryTopic: 446,
    secondaryTopics: [467],
    flags: [],
    printSlug: faker.lorem.slug(),
    source: 'Los-Angeles-Times',
    canonicalUrl: faker.internet.url(),
    adExclusions: ['TRAVEL_INCIDENT', 'AUTOMOTIVE_INCIDENT', 'FINANCIAL'],
    status: 'DRAFT',
    createdBy: 'load test',
    lockedBy: 'test@fairfaxmedia.co.nz',
  };
}
