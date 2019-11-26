import { cloneDeep } from 'lodash';
import { Action, ActionType, Callable } from '../action';
import { Context } from '../context';
import { Request, Response } from '../http-client';
import { Logger } from '../log';
import { queryHtml, queryJson } from '../query';
import { Template } from '../template';

export type RequestSpec = {
  url: Template;
  data?: any | Callable<any>;
  cookie?: { [key: string]: Template };
  expect?: ExpectSpec | ExpectCallable;
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

export interface ExpectSpec {
  status: number;
  contentType: 'json' | 'html';
}

export type ExpectCallable = (
  response: Response<any>,
  context: Context,
) => Promise<void>;

export type BeforeRequestCallback = (
  request: Request,
  context: Context,
) => Promise<void>;

export type AfterResponseCallback = (
  request: Request,
  response: Response<any>,
  context: Context,
) => Promise<void>;

export function request(requestSpec: RequestSpec): Action {
  return {
    type: ActionType.STEP,
    title: `${requestSpec.method} ${requestSpec.url}`,
    run: async (context: Context) => {
      const logger = new Logger('loadflux:http');
      const spec = cloneDeep(requestSpec);

      const method = spec.method;
      const headers = spec.headers;

      // handle URL if it is a template
      const url = context.renderTemplate(spec.url);
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
        data = await (spec.data as Callable<any>)(context);
      }

      const request: Request = {
        url,
        method,
        data,
        headers,
        baseURL: context.$runner.baseUrl,
      };
      // before sending request, publish request metric
      context.$meter.publishHttpReq({
        ...request,
        ...{
          // extra config in AxiosRequestConfig
        },
      });

      // start sending request
      let response: Response<any>;
      try {
        console.log(method, url);
        response = await context.$http.request(request);
      } catch (e) {
        // when error, publish error metric
        context.$meter.publishHttpErr(request, e);
        throw e;
      }

      // received response
      await expect(response, spec.expect, context);

      // handle capture and variable extraction
      if (spec.capture) {
        spec.capture.forEach((captureSpec: CaptureSpec) => {
          try {
            capture(response, captureSpec, context);
          } catch (e) {
            // ignore error, don't rethrow
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

function capture(
  response: Response<any>,
  capture: CaptureSpec,
  context: Context,
) {
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

const contentTypes = {
  json: ['application/json'],
  html: ['text/html'],
  text: ['text/plain'],
};

async function expect(
  response: Response<any>,
  expect: ExpectSpec | ExpectCallable | undefined,
  context: Context,
) {
  if (expect) {
    if (typeof expect === 'function') {
      try {
        await expect(response, context);
      } catch (e) {
        context.$meter.publishHttpKo(response);
        throw e;
      }
    } else {
      if (response.status !== expect.status) {
        context.$meter.publishHttpKo(response);
        throw new Error(
          `assert failure: expect status ${expect.status} but got ${response.status}`,
        );
      }
      const contentType = response.headers['Content-Type'];
      if (!contentTypes[expect.contentType].includes(contentType)) {
        context.$meter.publishHttpKo(response);
        throw new Error(
          `assert failure: expect content type ${expect.contentType} but got ${contentType}`,
        );
      }
    }
    context.$meter.publishHttpOk(response);
  } else {
    // default 2xx, 3xx are regarded as success
    if (response.status < 400) {
      context.$meter.publishHttpOk(response);
    } else {
      context.$meter.publishHttpKo(response);
      throw new Error(`not 2xx / 3xx: ${response.status}`);
    }
  }
}
