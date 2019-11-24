import { cloneDeep } from 'lodash';
import jmespath from 'jmespath';
import { Action, ActionType } from '../action';
import { Context } from '../context';
import { Request, Response } from '../http';
import { Logger } from '../log';
import {
  ErrorFields,
  FailureFields,
  Metrics,
  RequestFields,
  SuccessFields,
} from '../metrics';

export type RequestSpec = {
  url: string;
  expect?: ExpectCallback;
  capture?: CaptureSpec[];
  beforeRequest?: BeforeRequestCallback;
  afterResponse?: AfterResponseCallback;
} & Request;

export interface JsonBodyCapture {
  from: 'body';
  jmespath: string;
  as: string;
}

export interface HeaderCapture {
  from: 'header';
  name: string;
  as: string;
}

export interface HtmlBodyCapture {
  from: 'body';
  xpath: string;
  as: string;
}

export type CaptureSpec = JsonBodyCapture | HtmlBodyCapture | HeaderCapture;

// export type CaptureCallback = (response: AxiosResponse, context: Context) => Promise<void>;

export type ExpectCallback = (
  response: Response,
  context: Context,
) => Promise<void>;

export type BeforeRequestCallback = (
  request: Request,
  context: Context,
) => Promise<void>;

export type AfterResponseCallback = (
  request: Request,
  response: Response,
  context: Context,
) => Promise<void>;

export function request(requestSpec: RequestSpec): Action {
  return {
    type: ActionType.STEP,
    title: `${requestSpec.method} ${requestSpec.url}`,
    run: async (context: Context) => {
      const logger = new Logger('loadflux:http');
      const spec = cloneDeep(requestSpec);
      if (!/https?:\/\//.test(spec.url)) {
        // interpolate the variables in URL
        spec.url = context.renderTemplate(spec.url);
        spec.url = context.$runner.baseUrl + spec.url;
      }
      if (spec.beforeRequest) {
        try {
          await spec.beforeRequest(spec, context);
        } catch (e) {
          logger.log(
            `Error occurred in beforeRequest of ${context.$scenario.name} -> ${spec.method} / ${spec.url}`,
            e,
          );
          throw e;
        }
      }
      let response: Response;
      try {
        context.$meter.publish(Metrics.REQUEST, {
          c: 1,
          m: requestSpec.method as string,
          u: requestSpec.url,
        } as RequestFields);
        console.log(spec.method, spec.url);
        response = await context.$http.request({
          url: spec.url,
          method: spec.method,
          data: spec.data,
          headers: spec.headers,
        });
      } catch (e) {
        context.$meter.publish(Metrics.ERROR, {
          c: 1,
          m: requestSpec.method as string,
          u: requestSpec.url,
          e: e.message,
        } as ErrorFields);
        throw e;
      }
      // received response
      if (response) {
        if (spec.expect) {
          try {
            await spec.expect(response, context);
            context.$meter.publish(Metrics.SUCCESS, {
              c: 1,
              m: requestSpec.method as string,
              u: requestSpec.url,
              s: response.status,
            } as SuccessFields);
          } catch (e) {
            context.$meter.publish(Metrics.FAILURE, {
              c: 1,
              m: requestSpec.method as string,
              u: requestSpec.url,
              s: response.status,
              e: 'assertion failure',
            } as FailureFields);
            throw e;
          }
        } else {
          if (response.status < 400) {
            context.$meter.publish(Metrics.SUCCESS, {
              c: 1,
              m: requestSpec.method as string,
              u: requestSpec.url,
              s: response.status,
            } as SuccessFields);
          } else {
            context.$meter.publish(Metrics.FAILURE, {
              c: 1,
              m: requestSpec.method as string,
              u: requestSpec.url,
              s: response.status,
              e: 'non 2xx / 3xx',
            } as FailureFields);
            throw new Error(`not 2xx / 3xx: ${response.status}`);
          }
        }
        if (spec.capture) {
          spec.capture.forEach((captureSpec: CaptureSpec) => {
            if (captureSpec.from === 'body') {
              const body = response.data;
              // TODO CHECK content-type
              let bodyCapture:
                | JsonBodyCapture
                | HtmlBodyCapture = captureSpec as JsonBodyCapture;
              if (bodyCapture.jmespath) {
                let value;
                if (bodyCapture.jmespath === '$') {
                  value = response.data;
                } else {
                  value = jmespath.search(body, bodyCapture.jmespath);
                }
                context.vars[captureSpec.as] = value;
              }
              bodyCapture = captureSpec as HtmlBodyCapture;
              if (bodyCapture.xpath) {
                // TODO
              }
            }

            if (captureSpec.from === 'header') {
              context.vars[captureSpec.as] = response.headers[captureSpec.name];
            }
          });
        }
        if (spec.afterResponse) {
          try {
            await spec.afterResponse(spec, response, context);
          } catch (e) {
            logger.log(
              `Error occurred in afterResponse of ${context.$scenario.name} -> ${spec.method} / ${spec.url}`,
              e,
            );
            throw e;
          }
        }
      }
    },
  };
}

export function get(spec: Omit<RequestSpec, 'data'>): Action {
  spec.method = 'GET';
  return request(spec);
}

export function post(spec: RequestSpec): Action {
  spec.method = 'POST';
  return request(spec);
}

export function put(spec: RequestSpec): Action {
  spec.method = 'PUT';
  return request(spec);
}
