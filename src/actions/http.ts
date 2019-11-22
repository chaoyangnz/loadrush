import { Action, Context } from '../scenario';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export type HttpSpec = {
  url: string;
  expect?: ExpectCallback;
  // capture?: CaptureCallback;
  beforeRequest?: BeforeRequestCallback;
  afterResponse?: AfterResponseCallback;
} & AxiosRequestConfig;

// export type CaptureCallback = (response: AxiosResponse, context: Context) => Promise<void>;

export type ExpectCallback = (response: AxiosResponse, context: Context) => Promise<void>;

export type BeforeRequestCallback = (request: HttpSpec, context: Context) => Promise<void>;

export type AfterResponseCallback = (request: HttpSpec, response: AxiosResponse, context: Context) => Promise<void>;

function request(spec: HttpSpec): Action {
  const action: Action = async (context: Context) => {
    context.$logger('start action');
    if (spec.beforeRequest) {
      try {
        await spec.beforeRequest(spec, context);
      } catch (e) {
        context.$logger(
          `Error occurred in beforeRequest of ${context.$scenario.name} -> ${spec.method} / ${spec.url}`,
          e,
        );
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
      return;
    }
    // received response
    if (response) {
      if (spec.expect) {
        try {
          await spec.expect(response, context);
          context.$emitter.emit('http_ok');
        } catch (e) {
          context.$emitter.emit('http_ko');
        }
      } else {
        if (response.status < 400) {
          context.$emitter.emit('http_ok');
        } else {
          context.$emitter.emit('http_ko');
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
        }
      }
    }
  };
  action.type = 'action';
  action.message = `${spec.method} ${spec.url}`;
  return action;
}

export function get(spec: Omit<HttpSpec, 'body'>): Action {
  spec.method = 'GET';
  return request(spec);
}

export function post(spec: HttpSpec): Action {
  spec.method = 'POST';
  return request(spec);
}

export function put(spec: HttpSpec): Action {
  spec.method = 'PUT';
  return request(spec);
}
