import { Pool, QueryResult } from 'pg';
import { Logger } from '../log';
import {
  ErrorFields,
  Fields,
  Stat,
  RequestFields,
  ResponseFields,
  SuccessFields,
  VUFields,
  Measurement,
} from '../metric';
import { KV } from '../util';
import { Meter } from '../meter';
import { config } from '../config';

export class TimescaledbMeter extends Meter {
  logger = new Logger('loadrush:meters');
  pool: Pool;

  constructor() {
    super();
    this.pool = new Pool({
      host: config.loadrush.timescaledb?.host,
      port: config.loadrush.timescaledb?.port,
      database: 'loadrush',
      user: 'postgres',
      password: 'password',
    });
    this.pool.query('select 1').catch((error) => {
      console.error('\n\nTimescaleDB connection failed');
      process.exit(-1);
    });
  }

  private query(sql: string) {
    const onFinish = (err: Error, res: QueryResult) => {
      if (err) {
        this.logger.log(err.message, sql.trim());
      }
    };
    // this.logger.log(`query timescaledb: `, sql.trim());
    this.pool.query(sql, onFinish);
  }

  publish(
    measurement: Measurement,
    fields: Fields,
    timestamp?: number,
    tags?: KV,
  ) {
    // this.logger.log('publish', measurement, fields);
    switch (measurement) {
      case Measurement.VU:
        const vuFields = fields as VUFields;
        this.query(
          `
            INSERT into virtual_user (dataset, time, active) values ('', now(), '${vuFields.active}')
          `,
        );
        break;
      case Measurement.REQUEST:
        const requestFields = fields as RequestFields;
        this.query(
          `
          INSERT into request (dataset, time, trace, scenario, action, virtual_user, method, url)
          values ('', now(), '${requestFields.rid}', '', '', ${requestFields.vu}, '${requestFields.method}', '${requestFields.url}')
        `,
        );
        break;
      case Measurement.RESPONSE:
        const responseFields = fields as ResponseFields;
        this.query(
          `
          INSERT into response (dataset, time, trace, method, url, timing_wait, timing_dns, timing_tcp, timing_tls, timing_request, timing_first_byte, timing_download, timing_total, status_code)
          values ('', now(), '${responseFields.rid}', '${responseFields.method}', '${responseFields.url}', ${responseFields.wait}, ${responseFields.dns}, ${responseFields.tcp}, ${responseFields.tls}, ${responseFields.request}, ${responseFields.firstByte}, ${responseFields.download}, ${responseFields.total}, ${responseFields.status_code})
        `,
        );
        break;
      case Measurement.SUCCESS:
        const successFields = fields as SuccessFields;
        this.query(
          `
          UPDATE response SET (success, time_success) = ('true', now()) WHERE trace = '${successFields.rid}'
        `,
        );
        break;
      case Measurement.FAILURE:
        const failureFields = fields as SuccessFields;
        this.query(
          `
          UPDATE response SET (failure, time_failure) = ('true', now()) WHERE trace = '${failureFields.rid}'
        `,
        );
        break;
      case Measurement.ERROR:
        const errorFields = fields as ErrorFields;
        this.query(
          `
          INSERT into error (dataset, time, trace, method, url, error)
          values ('', now(), '', '${errorFields.method}', '${errorFields.url}', '${errorFields.error}')
        `,
        );
        break;
      default:
        this.logger.log(`Illegal Measurement: `, measurement);
    }
  }

  dashboard(): string {
    return 'http://localhost:3000';
  }

  async stat(since: number): Promise<Stat> {
    const ts = new Date(since);
    const results = await Promise.all([
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM request where time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(request.trace)) stat FROM request LEFT JOIN response ON (request.trace = response.trace) WHERE response.trace IS NULL AND request.time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM response where success = 'true' AND time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM response where failure = 'true' AND time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM response where success IS NULL and failure IS NULL AND time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM error where time > $1`,
        [ts],
      ),
    ]);
    const [
      total,
      inflight,
      success,
      failure,
      unknown,
      error,
    ] = results.map((result) => parseInt(result.rows[0].stat, 10));
    return {
      duration: Math.round((Date.now() - since) / 1000), // seconds
      total,
      inflight,
      success,
      failure,
      unknown,
      error,
    };
  }
}
