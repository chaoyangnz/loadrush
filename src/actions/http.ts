import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Action, ActionType } from '../action';
import { Context } from '../context';
import { cloneDeep } from 'lodash';

export type RequestSpec = {
  url: string;
  expect?: ExpectCallback;
  // capture?: CaptureCallback;
  beforeRequest?: BeforeRequestCallback;
  afterResponse?: AfterResponseCallback;
} & AxiosRequestConfig;

// export type CaptureCallback = (response: AxiosResponse, context: Context) => Promise<void>;

export type ExpectCallback = (response: AxiosResponse, context: Context) => Promise<void>;

export type BeforeRequestCallback = (request: AxiosRequestConfig, context: Context) => Promise<void>;

export type AfterResponseCallback = (
  request: AxiosRequestConfig,
  response: AxiosResponse,
  context: Context,
) => Promise<void>;

export function request(requestSpec: RequestSpec): Action {
  return {
    type: ActionType.STEP,
    title: `${requestSpec.method} ${requestSpec.url}`,
    run: async (context: Context) => {
      const spec = cloneDeep(requestSpec);
      if (!/https?:\/\//.test(spec.url)) {
        spec.url = context.$runner.target + spec.url;
      }
      if (spec.beforeRequest) {
        try {
          await spec.beforeRequest(spec, context);
        } catch (e) {
          context.$logger(
            `Error occurred in beforeRequest of ${context.$scenario.name} -> ${spec.method} / ${spec.url}`,
            e,
          );
          throw e;
        }
      }
      let response;
      try {
        response = await axios.request({
          url: spec.url,
          method: spec.method,
          data: spec.data,
          headers: spec.headers,
        });
      } catch (e) {
        context.$emitter.emit('http_err');
        throw e;
      }
      // received response
      if (response) {
        if (spec.expect) {
          try {
            await spec.expect(response, context);
            context.$emitter.emit('http_ok');
          } catch (e) {
            context.$emitter.emit('http_ko');
            throw e;
          }
        } else {
          if (response.status < 400) {
            context.$emitter.emit('http_ok');
          } else {
            context.$emitter.emit('http_ko');
            throw new Error('not 2xx');
          }
        }
        // if (spec.capture) {
        //   await spec.capture(response, context);
        // }
        if (spec.afterResponse) {
          try {
            await spec.afterResponse(spec, response, context);
          } catch (e) {
            context.$logger(
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
