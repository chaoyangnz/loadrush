import { cloneDeep, isFunction } from 'lodash';
import FormData from 'form-data';
import { Action, ActionType, Callable } from '../action';
import { ActionContext, Context } from '../context';
import { Request, Response } from '../http-client';
import { Logger } from '../log';
import { mimeExtension } from '../mime';
import { queryHtml, queryJson } from '../query';
import { Template } from '../template';
import { expectFunc, ExpectFunction } from '../expect';

export interface RequestSpec extends Request {
  url: Template;
  data?: any | FormData | Callable<any>;
  cookie?: { [key: string]: Template };
  authorization?: string;
  expect?: ExpectSpec | ExpectCallable;
  capture?: CaptureSpec[];
  beforeRequest?: BeforeRequestCallback;
  afterResponse?: AfterResponseCallback;
}

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
  status?: number;
  mime?: 'json' | 'html' | 'bin';
}

export type ExpectCallable = (
  expect: ExpectFunction,
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
    run: async (context: ActionContext) => {
      const logger = new Logger('loadflux:action:http');
      const spec = cloneDeep(requestSpec);

      const method = spec.method;
      const headers = spec.headers || {};

      // handle URL if it is a template
      const url = context.renderTemplate(spec.url);

      // -----------------------------------------------------------------
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
      // -------------------- hook before response ----------------------

      // handle cookie
      if (spec.cookie) {
        Object.entries(spec.cookie).forEach(([name, value]) => {
          context.$http.cookie(name, context.renderTemplate(value));
        });
      }

      // handle authorization
      if (spec.authorization) {
        headers.Authorization = spec.authorization;
      }

      // handle data if it is a function
      let data = spec.data;
      if (spec.data && isFunction(spec.data)) {
        data = await (spec.data as Callable<any>)(context);
      }

      // populate request config
      const request: Request = {
        url,
        method,
        data,
        headers,
        baseURL: context.$runner.baseUrl,
        timeout: spec.timeout,
      };

      // before sending request, publish request metric
      context.$meter.publishHttpReq(request, context.$runner.vus.active);

      // start sending request
      let response!: Response<any>;
      try {
        logger.log(method!, url);
        response = await context.$http.request({
          ...request,
          ...{
            // extra config in AxiosRequestConfig
          },
        });
      } catch (e) {
        err(e, request, context);
      }

      context.$meter.publishHttpRes(response, context.$runner.vus.active);

      // ~~~~~~ handle expect and assertion ~~~~~~~
      await handleExpect(response, spec.expect, context);

      // ~~~~~~ handle capture and variable extraction ~~~~~~~~~
      if (spec.capture) {
        spec.capture.forEach((captureSpec: CaptureSpec) => {
          try {
            handleCapture(response, captureSpec, context);
          } catch (e) {
            fail(
              `Error occurred when capturing variable as ${captureSpec.as} / ${e.message}`,
              response,
              context,
            );
          }
        });
      }

      // -------------------- hook after response ----------------------
      if (spec.afterResponse) {
        try {
          await spec.afterResponse(spec, response, context);
        } catch (e) {
          // don't send metrics
          logger.log(
            `Error occurred in afterResponse of ${context.$scenario.name} -> ${spec.method} ${spec.url} / ${e.message}`,
            e,
          );
          throw e;
        }
      }
      // -----------------------------------------------------------------
    },
  };
}

export function get(spec: Omit<RequestSpec, 'data' | 'method'>): Action {
  return request({ ...spec, method: 'GET' });
}

export function post(spec: Omit<RequestSpec, 'method'>): Action {
  return request({ ...spec, method: 'POST' });
}

export function put(spec: Omit<RequestSpec, 'method'>): Action {
  return request({ ...spec, method: 'PUT' });
}

function handleCapture(
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

async function handleExpect(
  response: Response<any>,
  expect: ExpectSpec | ExpectCallable | undefined,
  context: ActionContext,
) {
  if (expect) {
    if (isFunction(expect)) {
      try {
        await expect(expectFunc, response, context);
      } catch (e) {
        fail(e, response, context);
      }
    } else {
      // if assert status
      if (expect.status !== undefined) {
        if (response.status !== expect.status) {
          fail(
            `assert failure: expect status ${expect.status} but got ${response.status}`,
            response,
            context,
          );
        }
      }
      // if assert mime type
      if (expect.mime) {
        const contentType = response.headers['Content-Type'];
        const mime = mimeExtension(contentType);

        if (mime !== expect.mime) {
          fail(
            `assert failure: expect content type ${expect.mime} but got ${mime}`,
            response,
            context,
          );
        }
      }
    }
    context.$meter.publishHttpOk(response);
  } else {
    // default 2xx, 3xx are regarded as success
    if (response.status < 400) {
      succeed(response, context);
    } else {
      fail(`not 2xx / 3xx: ${response.status}`, response, context);
    }
  }
}

function err(e: Error, request: Request, context: ActionContext) {
  context.$meter.publishHttpErr(request, e);
  throw e;
}

function fail(
  e: string | Error,
  response: Response<any>,
  context: ActionContext,
) {
  const err = e instanceof Error ? e : new Error(e);
  context.$meter.publishHttpKo(response, err);
  throw err;
}

function succeed(response: Response<any>, context: ActionContext) {
  context.$meter.publishHttpOk(response);
}
