import faker from 'faker';
import { cloneDeep } from 'lodash';
import { Context } from '../../../src';

export function createStoryPayload() {
  return {
    assetSubType: 'generic',
    headline: `LOADRUSH: ${faker.lorem.sentence(
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
        { name: 'load test', email: 'test@fairfaxmedia.co.nz' },
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

export function updateStoryPayload(context: Context) {
  const story = context.vars.story;
  const storyUpdated = cloneDeep(story);
  storyUpdated.assetSubType = 'opinion';
  storyUpdated.headline = `LOADRUSH: ${faker.lorem.sentence(
    5,
  )} @ ${new Date().toLocaleString()} - updated`;
  return storyUpdated;
}
