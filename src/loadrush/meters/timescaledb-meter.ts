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
      host: config.timescaledb?.host,
      port: config.timescaledb?.port,
      database: 'loadrush',
      user: 'postgres',
      password: 'password',
      min: 50,
    });
    this.pool.query('select 1').catch((error) => {
      console.error('\n\nTimescaleDB connection failed');
      process.exit(-1);
    });
  }

  private query(sql: string, values: any[]) {
    const onFinish = (err: Error, res: QueryResult) => {
      if (err) {
        this.logger.log(err.message, sql.trim());
      }
    };
    // this.logger.log(`query timescaledb: `, sql.trim());
    this.pool.query(sql, values, onFinish);
  }

  publish(
    measurement: Measurement,
    fields: Fields,
    timestamp?: number,
    tags?: KV,
  ) {
    // this.logger.log('publish', measurement, fields);
    const ts = new Date();
    switch (measurement) {
      case Measurement.VU:
        const vuFields = fields as VUFields;
        this.query(
          `
            INSERT INTO virtual_user (dataset, time, active) VALUES ('', $1, '${vuFields.active}')
          `,
          [ts],
        );
        break;
      case Measurement.REQUEST:
        const requestFields = fields as RequestFields;
        this.query(
          `
          INSERT INTO request (dataset, time, trace, scenario, action, virtual_user, method, url)
          VALUES ('', $1, '${requestFields.rid}', '', '', ${requestFields.vu}, '${requestFields.method}', '${requestFields.url}')
        `,
          [ts],
        );
        break;
      case Measurement.RESPONSE:
        const responseFields = fields as ResponseFields;
        this.query(
          `
          INSERT INTO response (dataset, time, trace, method, url, timing_wait, timing_dns, timing_tcp, timing_tls, timing_request, timing_first_byte, timing_download, timing_total, status_code)
          VALUES ('', $1, '${responseFields.rid}', '${responseFields.method}', '${responseFields.url}', ${responseFields.wait}, ${responseFields.dns}, ${responseFields.tcp}, ${responseFields.tls}, ${responseFields.request}, ${responseFields.firstByte}, ${responseFields.download}, ${responseFields.total}, ${responseFields.status_code})
        `,
          [ts],
        );
        break;
      case Measurement.SUCCESS:
        const successFields = fields as SuccessFields;
        this.query(
          `
          INSERT INTO response_success (dataset, time, trace, success) VALUES ('', $1, '${successFields.rid}', 'true')
        `,
          [ts],
        );
        break;
      case Measurement.FAILURE:
        const failureFields = fields as SuccessFields;
        this.query(
          `
          INSERT INTO response_failure (dataset, time, trace, failure) VALUES ('', $1, '${failureFields.rid}', 'true')
        `,
          [ts],
        );
        break;
      case Measurement.ERROR:
        const errorFields = fields as ErrorFields;
        this.query(
          `
          INSERT INTO error (dataset, time, trace, method, url, error)
          VALUES ('', $1, '', '${errorFields.method}', '${errorFields.url}', '${errorFields.error}')
        `,
          [ts],
        );
        break;
      default:
        this.logger.log(`Illegal Measurement: `, measurement);
    }
  }

  dashboard(): string {
    return 'http://localhost:3000/d/loadrush/loadrush-dashboard';
  }

  async stat(since: number): Promise<Stat> {
    const ts = new Date(since);
    const results = await Promise.all([
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM request where time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(request.trace)) stat FROM request
        LEFT JOIN response ON (request.trace = response.trace)
        WHERE response.trace IS NULL AND request.time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM response WHERE time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM response_success
        WHERE success = 'true' AND time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM response_failure where failure = 'true' AND time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(response.trace)) stat FROM response
        LEFT JOIN response_success on (response.trace = response_success.trace)
        LEFT JOIN response_failure on (response.trace = response_failure.trace)
        WHERE response_success.trace IS NULL and response_failure.trace IS NULL AND response.time > $1`,
        [ts],
      ),
      this.pool.query(
        `SELECT COUNT(DISTINCT(trace)) stat FROM error where time > $1`,
        [ts],
      ),
    ]);
    const [
      request,
      inflight,
      response,
      success,
      failure,
      unknown,
      error,
    ] = results.map((result) => parseInt(result.rows[0].stat, 10));
    return {
      duration: Math.round((Date.now() - since) / 1000), // seconds
      request,
      inflight,
      response,
      success,
      failure,
      unknown,
      error,
    };
  }
}
