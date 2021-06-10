import { Request, Response } from './http';
import { Logger } from './log';
import {
  ErrorFields,
  FailureFields,
  Fields,
  Stat,
  RequestFields,
  ResponseFields,
  SuccessFields,
  VUFields,
  Measurement,
} from './metric';
import { KV } from './util';

export abstract class Meter {
  logger = new Logger('loadrush:meters');

  publishHttpReq(request: Request, vu: number) {
    this.publish(Measurement.REQUEST, {
      rid: request.uuid,
      count: 1,
      method: request.method,
      url: request.url,
      vu,
    } as RequestFields);
  }

  publishHttpRes(response: Response<any>, vu: number) {
    this.publish(Measurement.RESPONSE, {
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
    this.publish(Measurement.SUCCESS, {
      rid: response.request.uuid,
      count: 1,
      method: response.request.method,
      url: response.request.url,
      status_code: response.status,
    } as SuccessFields);
  }

  publishHttpKo(response: Response<any>, e: Error) {
    this.publish(Measurement.FAILURE, {
      rid: response.request.uuid,
      count: 1,
      method: response.request.method,
      url: response.request.url,
      status_code: response.status,
      error: e.message,
    } as FailureFields);
  }

  publishHttpErr(request: Request, e: Error) {
    this.publish(Measurement.ERROR, {
      rid: request.uuid,
      count: 1,
      method: request.method,
      url: request.url,
      error: e.message,
    } as ErrorFields);
  }

  publishVu(vu: number) {
    this.publish(Measurement.VU, { active: vu } as VUFields);
  }

  abstract publish(
    measurement: Measurement,
    fields: Fields,
    timestamp?: number,
    tags?: KV,
  ): void;

  abstract dashboard(): string;

  abstract stat(since: number): Promise<Stat>;
}
