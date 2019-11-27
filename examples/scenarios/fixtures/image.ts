import faker from 'faker';
import FormData from 'form-data';
import * as fs from 'fs';
import { cloneDeep } from 'lodash';
import { Context } from '../../../src';

export function createImagePayload(): FormData {
  const imageToCreate = {
    assetSubType: 'photograph',
    caption: `Load testing: ${faker.lorem.sentence(
      5,
    )} @ ${new Date().toLocaleString()}`,
    description: faker.lorem.sentence(),
    photographer: {
      authors: [
        {
          name: 'Chao Yang',
          email: 'chao.yang@fairfaxmedia.co.nz',
        },
      ],
      otherContributors: [],
    },
    source: 'Los-Angeles-Times',
    canonicalUrl: faker.internet.url(),
    adExclusions: ['TRAVEL_INCIDENT', 'AUTOMOTIVE_INCIDENT', 'FINANCIAL'],
    sectionHeadline: faker.lorem.sentence(),
    sectionIntro: faker.lorem.sentence(),
    primaryTopic: 446,
    secondaryTopics: [468],
    flags: [],
    newslinkId: 'a-corrupti-occaecati',
    focalPointX: 0,
    focalPointY: 0,
    width: 5072,
    height: 6761,
    status: 'DRAFT',
    createdBy: 'load test',
    lockedBy: 'test@fairfaxmedia.co.nz',
  };
  const formData = new FormData({ maxDataSize: 10 * 1024 * 1024 });
  const file = `${__dirname}/images/sample_5mb.jpg`;
  formData.append('image', fs.readFileSync(file), {
    filename: 'blob',
    contentType: 'image/jpeg',
  });
  const jsonData = JSON.stringify(imageToCreate);
  formData.append('imageDto', jsonData, {
    filename: 'blob',
    contentType: 'application/json',
  });
  return formData;
}

export function updateImagePayload(context: Context) {
  const image = context.vars.image;
  const imageUpdated = cloneDeep(image);
  image.assetSubType = 'illustration';
  image.caption = `Load testing: ${faker.lorem.sentence(
    5,
  )} @ ${new Date().toLocaleString()} - updated`;
  return imageUpdated;
}
