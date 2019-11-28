import { queryJson } from './query';

describe('query selector', () => {
  it('should query an object from a json doc', () => {
    const json = {
      people: [
        { first: 'James', last: 'd' },
        { first: 'Jacob', last: 'e' },
        { first: 'Jayden', last: 'f' },
        { missing: 'different' },
      ],
      foo: { bar: 'baz' },
    };
    expect(queryJson(json, 'people[:2].first')).toEqual(['James', 'Jacob']);
  });

  it('should query an array from a json doc', () => {
    const json = {
      pageContent: [
        {
          id: 300016114,
          sectionHeadline:
            'Voluptates magni expedita quasi in aut incidunt modi aut quos.',
          sectionIntro: 'Omnis eos quas et molestiae ipsa sint omnis et.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'https://santos.info',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:16:07.137390Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:16:07.137390Z',
          caption:
            'Load testing: Maiores amet numquam id est nobis est. @ 2019-11-19T02:14:07.625Z',
          href:
            'gs://content-store-stanhope-7370-load-test/c134cdbe-b281-45b5-ba84-2e07b08ce1ba',
          description: 'Corrupti qui assumenda voluptatum et consectetur.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'ullam-iure-qui',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016113,
          sectionHeadline: 'Voluptates nihil reprehenderit ut.',
          sectionIntro: 'Eveniet consequatur qui mollitia consequuntur.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'https://minerva.com',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:16:05.748628Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:16:05.748628Z',
          caption:
            'Load testing: Consequatur itaque maxime libero. @ 2019-11-19T02:14:10.226Z',
          href:
            'gs://content-store-stanhope-7370-load-test/bbe0b6d5-cccd-45ac-bd81-171f373e50ac',
          description: 'Rerum doloribus est quo laborum et.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'saepe-eaque-unde',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016110,
          sectionHeadline: 'Sed eos cupiditate ad qui facere repellendus.',
          sectionIntro:
            'Quia esse non aut est recusandae veritatis qui adipisci porro.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'http://chasity.org',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:15:20.943873Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:15:20.943873Z',
          caption:
            'Load testing: Voluptates dolor repellendus rerum nesciunt libero harum aliquam occaecati. @ 2019-11-19T02:13:22.733Z',
          href:
            'gs://content-store-stanhope-7370-load-test/acff9ce6-79ff-4548-aba7-ebf779e72e80',
          description: 'Consequuntur dolorem numquam nisi et earum libero.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'deserunt-corporis-qui',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016107,
          sectionHeadline: 'Vero magni et sit repellat.',
          sectionIntro:
            'Et eligendi sed alias sequi consequatur ut repellendus ut.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'http://carmela.net',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:14:54.360666Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:14:54.360666Z',
          caption:
            'Load testing: Placeat iusto et animi quasi dolorem dignissimos autem. @ 2019-11-19T02:12:53.869Z',
          href:
            'gs://content-store-stanhope-7370-load-test/c8ae7da6-13c1-469b-8c05-100ed1f4d8b5',
          description:
            'Dolor ipsa voluptatem nisi aut ad est repellat ullam voluptates.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'debitis-inventore-nostrum',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016106,
          sectionHeadline:
            'Et aliquid rem sed iusto occaecati ipsum blanditiis.',
          sectionIntro:
            'Pariatur tempore quia fuga perspiciatis maiores vitae minus.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'http://rachel.net',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:14:41.911878Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:14:41.911878Z',
          caption:
            'Load testing: Quam deserunt rerum eaque ducimus quis dolorem doloribus sint vero. @ 2019-11-19T02:12:36.480Z',
          href:
            'gs://content-store-stanhope-7370-load-test/a052cfb2-fc59-4e25-8eca-f5506acf73e6',
          description:
            'Quis et tenetur consequatur voluptatem et rerum cupiditate.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'eos-eius-delectus',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016100,
          sectionHeadline: 'Sunt eos aut sequi atque autem iste dicta.',
          sectionIntro:
            'Omnis vel consequatur et repellendus sed provident sint dolores.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'http://brielle.name',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:14:07.000204Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:14:07.000204Z',
          caption:
            'Load testing: Placeat distinctio sed aut unde perspiciatis voluptas delectus cumque. @ 2019-11-19T02:12:04.809Z',
          href:
            'gs://content-store-stanhope-7370-load-test/6ecf1e2b-42b2-475b-9b06-9235a0a1c928',
          description: 'Eveniet vero tempore ut labore sint.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'totam-sint-voluptate',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016098,
          sectionHeadline: 'Dignissimos ut magni.',
          sectionIntro: 'Quod sit impedit sint.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'https://alex.name',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:14:04.816378Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:14:04.816378Z',
          caption:
            'Load testing: Aperiam quia pariatur provident voluptate in quos nulla nam. @ 2019-11-19T02:11:55.813Z',
          href:
            'gs://content-store-stanhope-7370-load-test/9afd9e94-46e4-418b-b3b0-72f1b53d7e53',
          description:
            'Sint et ut possimus eaque quia placeat similique itaque aperiam.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'minus-ipsam-mollitia',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016093,
          sectionHeadline: 'Amet sed distinctio vero.',
          sectionIntro:
            'Harum sed sunt assumenda similique est aliquam excepturi aut qui.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'https://christophe.name',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:13:53.247394Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:13:53.247394Z',
          caption:
            'Load testing: Et aut dolorem ad dolor repellat assumenda harum nisi. @ 2019-11-19T02:11:54.018Z',
          href:
            'gs://content-store-stanhope-7370-load-test/c734cd3a-3c7a-41e9-a557-3620943d9ad8',
          description: 'Accusamus ipsam corporis quia.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'incidunt-dolores-iure',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016092,
          sectionHeadline:
            'Hic exercitationem iste perferendis assumenda dolorum nostrum a sed nostrum.',
          sectionIntro: 'Dicta est quam consequuntur alias qui.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'http://hettie.name',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:13:50.332103Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:13:50.332104Z',
          caption:
            'Load testing: Consequatur consectetur et ad aut. @ 2019-11-19T02:11:55.111Z',
          href:
            'gs://content-store-stanhope-7370-load-test/3311ee7e-e1fd-411d-9f1b-82c18bce732d',
          description: 'Animi ut odio sed quo illum velit voluptates.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'voluptatem-et-asperiores',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
        {
          id: 300016090,
          sectionHeadline: 'Esse et impedit in.',
          sectionIntro: 'Quo possimus earum.',
          assetSubType: 'photograph',
          source: 'Los-Angeles-Times',
          openToComment: false,
          excludeFromSeo: false,
          canonicalUrl: 'https://julio.com',
          adExclusions: ['FINANCIAL', 'AUTOMOTIVE_INCIDENT', 'TRAVEL_INCIDENT'],
          primaryTopic: 446,
          secondaryTopics: [468],
          lastUpdated: '2019-11-19T02:13:46.935633Z',
          status: 'DRAFT',
          createdBy: 'smoke test',
          createdDate: '2019-11-19T02:13:46.935633Z',
          caption:
            'Load testing: Ea laboriosam corrupti unde consequatur dolore dolorem. @ 2019-11-19T02:11:41.222Z',
          href:
            'gs://content-store-stanhope-7370-load-test/8604be40-10c9-4f16-afd3-9877aaad8d34',
          description: 'Voluptatem sapiente expedita quae voluptatem.',
          photographer: {
            authors: [
              {
                email: 'aston.wooller@fairfaxmedia.co.nz',
                name: 'Aston Wooller',
              },
            ],
          },
          newslinkId: 'nostrum-sit-rem',
          focalPointX: 0,
          focalPointY: 0,
          height: 467,
          width: 600,
        },
      ],
      total: 8119,
      query: {
        pageIndex: 1,
        pageSize: 10,
        query: null,
        sortConditions: [
          {
            field: 'lastUpdated',
            direction: 'DESC',
          },
        ],
      },
    };
  });
});
