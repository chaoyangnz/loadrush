import { Client } from '@influxdata/influx';
import { BucketRetentionRules, IBucket } from '@influxdata/influx/dist';
import { Logger } from '../log';
import { Fields, Measurement, Stat } from '../metric';
import { KV } from '../util';

// ----- This is a hack as InfluxDB client seems to require browser environment ----
// @ts-ignore
import { XMLHttpRequest } from 'xmlhttprequest';
import { Meter } from '../meter';
import { config } from '../config';
// @ts-ignore
global.XMLHttpRequest = XMLHttpRequest;
// --------------------------------------------------------------------------------

export class InfluxdbMeter extends Meter {
  client: Client;
  org: string;
  bucket: string;
  api: string;
  logger = new Logger('loadrush:meters');

  bucketExisted!: Promise<IBucket>;
  verboseMetrics = false;

  constructor() {
    super();
    this.org = config.influxdb?.org;
    this.bucket = config.influxdb?.bucket;
    this.api = config.influxdb?.api;

    if (!this.org || !this.bucket || !this.api) {
      console.warn(
        'LOADRUSH_INFLUXDB_ORG or LOADRUSH_INFLUXDB_API or LOADRUSH_INFLUXDB_BUCKET is not set',
      );
      process.exit(-1);
    }
    this.client = new Client(this.api, config.influxdb.token);
    this.createBucketIfNotExist();
    this.verboseMetrics = config.influxdb.verboseMetrics;
  }

  private createBucketIfNotExist() {
    this.bucketExisted = new Promise<IBucket>((resolve, reject) => {
      const createBucket = () => {
        this.client.buckets
          .create({
            orgID: this.org,
            name: this.bucket,
            retentionRules: [
              {
                type: BucketRetentionRules.TypeEnum.Expire,
                everySeconds: 3 * 24 * 3600,
              },
            ],
          })
          .then((bucket: IBucket) => {
            this.logger.log('created a bucket');
            resolve(bucket);
          })
          .catch((err) => {
            this.logger.log('create bucket failed', err);
            reject();
          });
      };

      this.client.buckets
        .getAll(this.org)
        .then((buckets: IBucket[]) => {
          const bucket = buckets.find((bucket) => bucket.name === this.bucket);
          if (bucket) {
            this.logger.log('bucket exists');
            resolve(bucket);
          } else {
            this.logger.log('bucket does not exist');
            createBucket();
          }
        })
        .catch((err) => {
          this.logger.log('list buckets failed, try to create one');
          createBucket();
        });
    });
  }

  publish(
    measurement: Measurement,
    fields: Fields,
    timestamp?: number,
    tags?: KV,
  ) {
    // 'mem,host=host1 used_percent=23.43234543 1556896326'; // Line protocol string
    this.bucketExisted
      .then(() => {
        const data = this.build(measurement, fields, tags, timestamp);
        this.logger.log(data);
        this.client.write.create(this.org, this.bucket, data).catch((e) => {
          this.logger.log('Error occurred when sending ops', e);
        });
      })
      .catch((e) => {
        this.logger.log('Error when getting or creating a bucket');
      });
  }

  // <measurement>[,<tag_key>=<tag_value>[,<tag_key>=<tag_value>]] <field_key>=<field_value>[,<field_key>=<field_value>] [<timestamp>]
  private build(
    measurement: Measurement,
    fields: Fields,
    tags?: KV,
    timestamp?: number,
  ) {
    let joinedTags = '';
    if (tags) {
      joinedTags = Object.entries(tags)
        .map(([key, value]) => `${key}=${this.quoteIfNeed(value)}`)
        .join(',');
    }
    const extraTags = config.influxdb?.tags;
    if (extraTags) {
      joinedTags += `,${extraTags}`;
    }
    let joinedFields = '';
    if (fields) {
      joinedFields = Object.entries(fields)
        // @ts-ignore
        .filter(([key, value]) => this.isNumeric(value) || this.verboseMetrics)
        // @ts-ignore
        .map(([key, value]) => `${key}=${this.quoteIfNeed(value)}`)
        .join(',');
    }
    return `${measurement}${
      joinedTags ? ',' : ''
    }${joinedTags} ${joinedFields} ${timestamp || this.nanotime()}`.trim();
  }

  private quoteIfNeed(value: string | number) {
    return this.isNumeric(value) ? Number(value) : `"${value}"`;
  }

  // Get the nanoseconds since unix epoch
  private nanotime() {
    if (this.verboseMetrics) {
      // TODO
      return `${Date.now()}000000`;
    }
    return '';
  }

  private isNumeric(value: string | number) {
    // @ts-ignore
    return !isNaN(value);
  }

  stat(since: number): Promise<Stat> {
    throw new Error('Not implemented');
  }

  dashboard(): string {
    return '';
  }
}
