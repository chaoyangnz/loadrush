import { Pool, QueryResult } from 'pg';
import { Request, Response } from './http';
import { Logger } from './log';
import {
  ErrorFields,
  FailureFields,
  Fields,
  Metrics,
  RequestFields,
  ResponseFields,
  SuccessFields,
  VUFields,
} from './metrics';
import { getEnv, KV } from './util';
import { Env } from './env';

export class Meter {
  logger = new Logger('loadrush:meter');
  pool: Pool;

  verboseMetrics = false;

  constructor() {
    this.pool = new Pool({
      host: getEnv(Env.LOADRUSH_TIMESCALEDB_HOST, 'localhost'),
      port: getEnv(Env.LOADRUSH_TIMESCALEDB_PORT, 5432),
      database: 'loadrush',
      user: 'postgres',
      password: 'password',
    });
  }

  publishHttpReq(request: Request, vu: number) {
    this.publish(Metrics.REQUEST, {
      rid: request.uuid,
      count: 1,
      method: request.method,
      url: request.url,
      vu,
    } as RequestFields);
  }

  publishHttpRes(response: Response<any>, vu: number) {
    this.publish(Metrics.RESPONSE, {
      rid: response.request.uuid,
      count: 1,
      method: response.request.method,
      url: response.request.url,
      dns: response.timings.dns,
      tcp: response.timings.tcp,
      tls: 0,
      wait: response.timings.wait,
      request: response.timings.request,
      firstByte: response.timings.firstByte,
      download: response.timings.download,
      total: response.timings.total,
      status_code: response.status,
    } as ResponseFields);
  }

  publishHttpOk(response: Response<any>) {
    this.publish(Metrics.SUCCESS, {
      rid: response.request.uuid,
      count: 1,
      method: response.request.method,
      url: response.request.url,
      status_code: response.status,
    } as SuccessFields);
  }

  publishHttpKo(response: Response<any>, e: Error) {
    this.publish(Metrics.FAILURE, {
      rid: response.request.uuid,
      count: 1,
      method: response.request.method,
      url: response.request.url,
      status_code: response.status,
      error: e.message,
    } as FailureFields);
  }

  publishHttpErr(request: Request, e: Error) {
    this.publish(Metrics.ERROR, {
      rid: request.uuid,
      count: 1,
      method: request.method,
      url: request.url,
      error: e.message,
    } as ErrorFields);
  }

  publishVu(vu: number) {
    this.publish(Metrics.VU, { active: vu } as VUFields);
  }

  private write(sql: string) {
    const onFinish = (err: Error, res: QueryResult) => {
      if (err) {
        this.logger.log(err.message, sql.trim());
      }
    };
    // this.logger.log(`write timescaledb: `, sql.trim());
    this.pool.query(sql, onFinish);
  }

  private publish(
    measurement: Metrics,
    fields: Fields,
    timestamp?: number,
    tags?: KV,
  ) {
    // this.logger.log('publish', measurement, fields);
    switch (measurement) {
      case Metrics.VU:
        const vuFields = fields as VUFields;
        this.write(
          `
            INSERT into virtual_user (dataset, time, active) values ('', now(), '${vuFields.active}')
          `,
        );
        break;
      case Metrics.REQUEST:
        const requestFields = fields as RequestFields;
        this.write(
          `
          INSERT into request (dataset, time, trace, scenario, action, virtual_user, method, url)
          values ('', now(), '${requestFields.rid}', '', '', ${requestFields.vu}, '${requestFields.method}', '${requestFields.url}')
        `,
        );
        break;
      case Metrics.RESPONSE:
        const responseFields = fields as ResponseFields;
        this.write(
          `
          INSERT into response (dataset, time, trace, method, url, timing_wait, timing_dns, timing_tcp, timing_tls, timing_request, timing_first_byte, timing_download, timing_total, status_code)
          values ('', now(), '${responseFields.rid}', '${responseFields.method}', '${responseFields.url}', ${responseFields.wait}, ${responseFields.dns}, ${responseFields.tcp}, ${responseFields.tls}, ${responseFields.request}, ${responseFields.firstByte}, ${responseFields.download}, ${responseFields.total}, ${responseFields.status_code})
        `,
        );
        break;
      case Metrics.SUCCESS:
        const successFields = fields as SuccessFields;
        this.write(
          `
          UPDATE response SET (success, time_success) = ('true', now()) WHERE trace = '${successFields.rid}'
        `,
        );
        break;
      case Metrics.FAILURE:
        const failureFields = fields as SuccessFields;
        this.write(
          `
          UPDATE response SET (failure, time_failure) = ('true', now()) WHERE trace = '${failureFields.rid}'
        `,
        );
        break;
      case Metrics.ERROR:
        const errorFields = fields as ErrorFields;
        this.write(
          `
          INSERT into error (dataset, time, trace, method, url, error)
          values ('', now(), '', '${errorFields.method}', '${errorFields.url}', '${errorFields.error}')
        `,
        );
        break;
      default:
        this.logger.log(`Illegal metric: `, measurement);
    }
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
}
