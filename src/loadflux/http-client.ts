import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
// @ts-ignore
import { XMLHttpRequest } from 'xmlhttprequest';

export interface Request {
  url?: string;
  method?: Method;
  baseURL?: string;
  // transformRequest?: AxiosTransformer | AxiosTransformer[];
  // transformResponse?: AxiosTransformer | AxiosTransformer[];
  headers?: any;
  params?: any;
  // paramsSerializer?: (params: any) => string;
  data?: any;
  timeout?: number;
  // withCredentials?: boolean;
  // adapter?: AxiosAdapter;
  // auth?: AxiosBasicCredentials;
  // responseType?: ResponseType;
  // xsrfCookieName?: string;
  // xsrfHeaderName?: string;
  // onUploadProgress?: (progressEvent: any) => void;
  // onDownloadProgress?: (progressEvent: any) => void;
  // maxContentLength?: number;
  // validateStatus?: (status: number) => boolean;
  // maxRedirects?: number;
  // socketPath?: string | null;
  // httpAgent?: any;
  // httpsAgent?: any;
  // proxy?: AxiosProxyConfig | false;
  // cancelToken?: CancelToken;
}
export interface Response<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
  request: Request;
  xhr?: XMLHttpRequest;
}

export class HttpClient {
  instance: AxiosInstance;

  constructor() {
    const instance = axios.create();
    // disable status validation by default
    instance.defaults.validateStatus = (status) => true;
    instance.defaults.withCredentials = true;

    this.instance = instance;
  }

  async request(requestConfig: AxiosRequestConfig): Promise<Response<any>> {
    const response = await this.instance.request(requestConfig);
    // transform response
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      request: response.config,
      xhr: response.request,
    };
  }

  cookie(name: string, value: string) {
    this.instance.defaults.headers.Cookie = `${name}=${value}`;
  }
}
