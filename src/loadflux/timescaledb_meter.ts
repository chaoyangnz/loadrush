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
  logger = new Logger('loadflux:meter');
  pool: Pool;

  verboseMetrics = false;

  constructor() {
    this.pool = new Pool({
      host: getEnv(Env.LOADFLUX_TIMESCALEDB_HOST, 'localhost'),
      port: getEnv(Env.LOADFLUX_TIMESCALEDB_PORT, 5432),
      database: 'loadflux',
      user: 'postgres',
      password: 'password',
    });
  }

  publishHttpReq(request: Request, vu: number) {
    this.publish(Metrics.REQUEST, {
      id: request.uuid,
      c: 1,
      m: request.method,
      u: request.url,
      vu,
    } as RequestFields);
  }

  publishHttpRes(response: Response<any>, vu: number) {
    this.publish(Metrics.RESPONSE, {
      id: response.request.uuid,
      c: 1,
      m: response.request.method,
      u: response.request.url,
      st: response.timings.wait,
      lt: response.timings.dns,
      ct: response.timings.tcp,
      rt: response.timings.total,
      s: response.status,
    } as ResponseFields);
  }

  publishHttpOk(response: Response<any>) {
    this.publish(Metrics.SUCCESS, {
      id: response.request.uuid,
      c: 1,
      m: response.request.method,
      u: response.request.url,
      s: response.status,
    } as SuccessFields);
  }

  publishHttpKo(response: Response<any>, e: Error) {
    this.publish(Metrics.FAILURE, {
      id: response.request.uuid,
      c: 1,
      m: response.request.method,
      u: response.request.url,
      s: response.status,
      e: e.message,
    } as FailureFields);
  }

  publishHttpErr(request: Request, e: Error) {
    this.publish(Metrics.ERROR, {
      id: request.uuid,
      c: 1,
      m: request.method,
      u: request.url,
      e: e.message,
    } as ErrorFields);
  }

  publishVu(vu: number) {
    this.publish(Metrics.VU, { vu } as VUFields);
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
            INSERT into virtual_user (dataset, time, virtual_user) values ('', to_timestamp(${Date.now()} / 1000.0), '${
            vuFields.vu
          }')
          `,
        );
        break;
      case Metrics.REQUEST:
        const requestFields = fields as RequestFields;
        this.write(
          `
          INSERT into request (dataset, time, trace, scenario, action, virtual_user, method, url)
          values ('', to_timestamp(${Date.now()} / 1000.0), '${
            requestFields.id
          }', '', '', ${requestFields.vu}, '${requestFields.m}', '${
            requestFields.u
          }')
        `,
        );
        break;
      case Metrics.RESPONSE:
        const responseFields = fields as ResponseFields;
        this.write(
          `
          INSERT into response (dataset, time, trace, method, url, timing_wait, timing_dns, timing_tcp, timing_total, status_code)
          values ('', to_timestamp(${Date.now()} / 1000.0), '${
            responseFields.id
          }', '${responseFields.m}', '${responseFields.u}', ${
            responseFields.st
          }, ${responseFields.lt}, ${responseFields.ct}, ${
            responseFields.st
          }, ${responseFields.s})
        `,
        );
        break;
      case Metrics.SUCCESS:
        const successFields = fields as SuccessFields;
        this.write(
          `
          INSERT into success (dataset, time, trace, status_code)
          values ('', to_timestamp(${Date.now()} / 1000.0), '${
            successFields.id
          }', ${successFields.s})
        `,
        );
        break;
      case Metrics.FAILURE:
        const failureFields = fields as SuccessFields;
        this.write(
          `
          INSERT into failure (dataset, time, trace, status_code)
          values ('', to_timestamp(${Date.now()} / 1000.0), '${
            failureFields.id
          }', ${failureFields.s})
        `,
        );
        break;
      case Metrics.ERROR:
        const errorFields = fields as ErrorFields;
        this.write(
          `
          INSERT into error (dataset, time, trace, method, url, error)
          values ('', to_timestamp(${Date.now()} / 1000.0), '', '${
            errorFields.m
          }', '${errorFields.u}', '${errorFields.e}')
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
