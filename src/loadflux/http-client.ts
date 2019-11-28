import axios, { Method } from 'axios';
import got from 'got';
import { mimeExtension } from './mime';
import FormData = require('form-data');

export interface Request {
  url?: string;
  method?: Method;
  baseUrl?: string;
  headers?: any;
  query?: any;
  body?: any;
  timeout?: number;
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
  instance: got.GotInstance<got.GotBodyFn<string>>;

  constructor() {
    // @ts-ignore
    this.instance = got.extend({ mutableDefaults: true });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  async request(
    url: string,
    options: got.GotBodyOptions<any>,
  ): Promise<Response<any>> {
    options.headers = options.headers || {};
    if (options.body instanceof FormData) {
      const formData = options.body;
      options.headers = {
        ...options.headers,
        ...formData.getHeaders(),
      };
      options.body = formData.getBuffer();
    } else if (typeof options.body === 'object') {
      options.headers!['content-type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const response: got.Response<any> = await this.instance(url, options);
    // transform response
    return {
      body:
        mimeExtension(response.headers['content-type'] as string) === 'json'
          ? JSON.parse(response.body)
          : response.body,
      status: response.statusCode,
      statusText: response.statusMessage,
      headers: response.headers,
      // @ts-ignore
      request: response.request.gotOptions,
      timings: response.timings.phases,
    };
  }

  cookie(name: string, value: string) {
    // @ts-ignore
    this.instance.defaults.options.headers.Cookie = `${name}=${value}`;
    // @ts-ignore
    this.instance.defaults.options.headers['User-Agent'] = 'Loadflux/Got';
  }
}

// export class HttpClient {
//   instance: AxiosInstance;
//
//   constructor() {
//     const instance = axios.create();
//     // disable status validation by default
//     instance.defaults.validateStatus = (status) => true;
//     instance.defaults.withCredentials = true;
//     // instance.defaults.timeout = 20_000;
//     instance.defaults.maxContentLength = Infinity;
//
//     // addAxiosTiming(this.instance);
//
//     // not validate the self-signed certificate
//     process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
//
//     this.instance = instance;
//   }
//
//   async request(requestConfig: AxiosRequestConfig): Promise<Response<any>> {
//     if (requestConfig.data instanceof FormData) {
//       const formData = requestConfig.data;
//       requestConfig.headers = {
//         ...requestConfig.headers,
//         ...formData.getHeaders(),
//       };
//       requestConfig.data = formData.getBuffer();
//     }
//
//     const response = await this.instance.request(requestConfig);
//     // @ts-ignore
//     response.timings = {
//       socket: 0,
//       lookup: 0,
//       connect: 0,
//       response: 0,
//       end: 0,
//     };
//     // transform response
//     return {
//       data: response.data,
//       status: response.status,
//       statusText: response.statusText,
//       headers: response.headers,
//       request: response.config,
//       // xhr: response.request,
//       // @ts-ignore
//       timings: response.timings,
//     };
//   }
//
//   cookie(name: string, value: string) {
//     this.instance.defaults.headers.Cookie = `${name}=${value}`;
//     this.instance.defaults.headers['User-Agent'] = 'Loadflux/Axios';
//   }
// }
