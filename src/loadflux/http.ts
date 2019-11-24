import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export type Request = AxiosRequestConfig;
export type Response = AxiosResponse;

export class HttpClient {
  instance: AxiosInstance;

  constructor() {
    const instance = axios.create();
    instance.defaults.validateStatus = (status) => true;
    instance.defaults.withCredentials = true;

    this.instance = instance;
  }

  async request(requestConfig: Request): Promise<Response> {
    return this.instance.request(requestConfig);
  }

  cookie(name: string, value: string) {
    this.instance.defaults.headers.Cookie = `${name}=${value}`;
  }
}
