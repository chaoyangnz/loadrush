import { cloneDeep } from 'lodash';
import { type } from 'os';
import { Action, ActionType } from '../action';
import { Context } from '../context';
import { Request, Response } from '../http-client';
import { Logger } from '../log';
import { queryHtml, queryJson } from '../query';
import { Temptable } from '../temptable';
import { Callback } from './hook';
import {
  ErrorFields,
  FailureFields,
  Metrics,
  RequestFields,
  SuccessFields,
} from '../metrics';

export type RequestSpec = {
  url: Temptable;
  data?: any | Callback;
  cookie?: { [key: string]: Temptable };
  expect?: ExpectCallback;
  capture?: CaptureSpec[];
  beforeRequest?: BeforeRequestCallback;
  afterResponse?: AfterResponseCallback;
} & Request;

export interface JsonBodyCapture {
  json: string;
  as: string;
}

export interface HeaderCapture {
  header: string;
  as: string;
}

export interface HtmlBodyCapture {
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

      // handle URL if it is a template
      spec.url = context.renderTemplate(spec.url);
      // handle relative URL
      if (!/https?:\/\//.test(spec.url)) {
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

      // handle cookie
      if (spec.cookie) {
        Object.entries(spec.cookie).forEach(([name, value]) => {
          context.$http.cookie(name, context.renderTemplate(value));
        });
      }

      // handle data if it is a function
      let data = spec.data;
      if (spec.data && typeof spec.data === 'function') {
        data = (spec.data as Callback)(context);
      }

      // before sending request, publish request metric
      context.$meter.publish(Metrics.REQUEST, {
        c: 1,
        m: requestSpec.method as string,
        u: requestSpec.url,
      } as RequestFields);

      // start sending request
      let response: Response;
      try {
        console.log(spec.method, spec.url);
        response = await context.$http.request({
          url: spec.url,
          method: spec.method,
          data,
          headers: spec.headers,
        });
      } catch (e) {
        // when error, publish error metric
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
              m: spec.method as string,
              u: spec.url,
              s: response.status,
            } as SuccessFields);
          } catch (e) {
            context.$meter.publish(Metrics.FAILURE, {
              c: 1,
              m: spec.method as string,
              u: spec.url,
              s: response.status,
              e: 'assertion failure',
            } as FailureFields);
            throw e;
          }
        } else {
          // default 2xx, 3xx are regarded as success
          if (response.status < 400) {
            context.$meter.publish(Metrics.SUCCESS, {
              c: 1,
              m: spec.method as string,
              u: spec.url,
              s: response.status,
            } as SuccessFields);
          } else {
            context.$meter.publish(Metrics.FAILURE, {
              c: 1,
              m: spec.method as string,
              u: spec.url,
              s: response.status,
              e: 'non 2xx / 3xx',
            } as FailureFields);
            throw new Error(`not 2xx / 3xx: ${response.status}`);
          }
        }

        // handle capture and variable extraction
        if (spec.capture) {
          spec.capture.forEach((captureSpec: CaptureSpec) => {
            try {
              capture(response, captureSpec, context);
            } catch (e) {
              // ignore error
              logger.log(
                `Error occurred when capturing variable as ${captureSpec.as}`,
                e,
              );
            }
          });
        }

        // hook after response
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

function capture(response: Response, capture: CaptureSpec, context: Context) {
  const body = response.data;

  // @ts-ignore
  if (capture.json) {
    const bodyCapture = capture as JsonBodyCapture;
    if (bodyCapture.json) {
      let value;
      if (bodyCapture.json === '$') {
        value = body;
      } else {
        value = queryJson(body, bodyCapture.json);
      }
      context.vars[capture.as] = value;
    }
  }

  // @ts-ignore
  if (capture.xpath) {
    const bodyCapture = capture as HtmlBodyCapture;
    if (bodyCapture.xpath) {
      queryHtml(body, bodyCapture.xpath);
    }
  }

  // @ts-ignore
  if (capture.header) {
    const headerCapture = capture as HeaderCapture;
    context.vars[capture.as] = response.headers[headerCapture.header];
  }
}
