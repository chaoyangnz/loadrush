import got, { Got, Options, Method } from 'got';
import { mimeExtension } from './actions/http/mime';
import { Template } from './template';
import { Readable } from 'stream';
import FormData = require('form-data');

export interface Request {
  url: string | Template;
  method?: Method;
  prefixUrl?: string;
  headers?: any;
  query?: any;
  responseType?: 'default' | 'json' | 'text';
  timeout?: number;
  body?: string | Buffer | Readable;
  json?: {
    [key: string]: any;
  };
  form?: { [key: string]: any };
}

export interface Response<T> {
  body: T;
  status: number;
  statusText: string;
  headers: any;
  request: Request;
  // xhr?: XMLHttpRequest;
  timings: {
    wait: number;
    dns: number;
    tcp: number;
    request: number;
    firstByte: number;
    download: number;
    total: number;
  };
}

export class HttpClient {
  instance: Got;

  constructor() {
    this.instance = got.extend({
      mutableDefaults: true,
      rejectUnauthorized: false,
    });
  }

  async request(options: Options): Promise<Response<any>> {
    if (options.body && options.body instanceof FormData) {
      const formData = options.body;
      options.headers = {
        ...options.headers,
        ...formData.getHeaders(),
      };
      options.body = formData.getBuffer();
    }

    // @ts-ignore
    const response: got.Response = await this.instance({
      ...options,
      responseType: options.responseType || 'text',
    });
    // transform response
    return {
      body:
        options.responseType ||
        mimeExtension(response.headers['content-type'] || '') !== 'json'
          ? response.body
          : JSON.parse(response.body),
      status: response.statusCode,
      statusText: response.statusMessage,
      headers: response.headers,
      request: response.request.options,
      timings: response.timings.phases,
    };
  }

  cookie(name: string, value: string) {
    this.instance.defaults.options.headers.Cookie = `${name}=${value}`;
    this.instance.defaults.options.headers['User-Agent'] = 'Loadflux/Got';
  }
}
