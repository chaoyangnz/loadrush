import { KV } from './util';

export enum Metrics {
  SUCCESS = 'http_ok',
  FAILURE = 'http_ko',
  REQUEST = 'http_req',
  RESPONSE = 'http_res',
  ERROR = 'http_err',
  VU = 'vu',
}

interface CommonHttpFields {
  count: number;
  method: string;
  url: string;
  rid: string;
}

interface TimingsFields {
  wait: number;
  dns: number;
  tcp: number;
  total: number;
}

export interface RequestFields extends CommonHttpFields {
  vu: number;
}

export interface ResponseFields extends CommonHttpFields, TimingsFields {
  status_code: number;
}

export interface ErrorFields extends CommonHttpFields {
  error: string;
}

export interface SuccessFields extends CommonHttpFields {
  status_code: number;
}

export interface FailureFields extends CommonHttpFields {
  status_code: number;
  error: string;
}

export interface VUFields {
  vu: number;
}

export type Fields =
  | RequestFields
  | ResponseFields
  | ErrorFields
  | SuccessFields
  | FailureFields
  | VUFields
  | KV;
