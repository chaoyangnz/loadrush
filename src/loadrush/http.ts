import got, { Got, Options, Method } from 'got';
import { mimeExtension } from './actions/http/mime';
import { Template } from './template';
import { Readable } from 'stream';
import FormData from 'form-data';
import HttpAgent, { HttpOptions, HttpsAgent } from 'agentkeepalive';
import { config } from './config';

export interface Request {
  url: string | Template;
  method?: Method;
  prefixUrl?: string;
  headers?: any;
  query?: any;
  responseType?: 'json' | 'text' | 'buffer';
  timeout?: number;
  body?: string | Buffer | Readable;
  json?: {
    [key: string]: any;
  };
  form?: { [key: string]: any };
  uuid?: string;
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

export interface Http {
  request(options: Options): Promise<Response<any>>;
  cookie(name: string, value: string): void;
}

export class DefaultHttp implements Http {
  instance: Got;

  constructor() {
    const agentOptions: HttpOptions = {
      keepAlive: true,
      maxSockets: config.loadrush.http.maxSockets,
      timeout: config.loadrush.http.activeSocketTimeout,
      freeSocketTimeout: config.loadrush.http.freeSocketTimeout,
    };
    this.instance = got.extend({
      mutableDefaults: true,
      https: {
        rejectUnauthorized: false,
      },
      agent: {
        http: new HttpAgent(agentOptions),
        https: new HttpsAgent(agentOptions),
      },
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
      // @ts-ignore
      request: { ...response.request.options, uuid: options.uuid },
      timings: response.timings.phases,
    };
  }

  cookie(name: string, value: string) {
    this.instance.defaults.options.headers.Cookie = `${name}=${value}`;
    this.instance.defaults.options.headers['User-Agent'] = 'LOADRUSH';
  }
}
