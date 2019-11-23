// @ts-ignore
import { XMLHttpRequest } from 'xmlhttprequest';
import { Client } from '@influxdata/influx';
import { getEnv } from './util';

interface KV {
  [key: string]: string | number;
}

// @ts-ignore
global.XMLHttpRequest = XMLHttpRequest;

export class Meter {
  client: Client;
  org: string;
  bucket: string;
  api: string;

  constructor() {
    this.org = getEnv('LOADFLUX_INFLUXDB_ORG', '');
    this.bucket = getEnv(
      'LOADFLUX_TEST_ID',
      `${process.env.HOST}-${Date.now()}`,
    );
    this.api = getEnv(
      'LOADFLUX_INFLUXDB_API',
      'https://us-west-2-1.aws.cloud2.influxdata.com/api/v2',
    );

    if (!this.org || !this.bucket || !this.api) {
      console.warn(
        'LOADFLUX_INFLUXDB_ORG or LOADFLUX_INFLUXDB_API or LOADFLUX_TEST_ID is not set',
      );
      process.exit(-1);
    }
    this.client = new Client(this.api, getEnv('LOADFLUX_INFLUXDB_TOKEN', ''));
  }

  publish(measurement: string, fields: KV, timestamp?: number, tags?: KV) {
    // const data = 'mem,host=host1 used_percent=23.43234543 1556896326'; // Line protocol string
    const data = this.build(measurement, fields, tags, timestamp);
    console.log(data);
    this.client.write.create(this.org, this.bucket, data).catch((e) => {
      console.warn('Error occurred when sending metrics', e);
    });
  }

  // <measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
  private build(
    measurement: string,
    fields: KV,
    tags?: KV,
    timestamp?: number,
  ) {
    let joinedTags = '';
    if (tags) {
      joinedTags = Object.entries(tags)
        .map(([key, value]) => `${key}=${this.quoteIfNeed(value)}`)
        .join(',');
    }
    const extraTags = getEnv('LOADFLUX_INFLUXDB_TAGS', '');
    if (extraTags) {
      joinedTags += `,${extraTags}`;
    }
    let joinedFields = '';
    if (fields) {
      joinedFields = Object.entries(fields)
        .map(([key, value]) => `${key}=${this.quoteIfNeed(value)}`)
        .join(',');
    }
    const nanotime = `${Date.now()}000000`;
    return `${measurement}${
      joinedTags ? ',' : ''
    }${joinedTags} ${joinedFields} ${timestamp || nanotime}`.trim();
  }

  private quoteIfNeed(value: string | number) {
    // @ts-ignore
    return isNaN(value) ? `"${value}"` : value;
  }
}
