import { KV } from './meter';

export enum Metrics {
  SUCCESS = 'http_ok',
  FAILURE = 'http_ko',
  REQUEST = 'http_req',
  RESPONSE = 'http_res',
  ERROR = 'http_err',
  VU = 'vu',
}

interface CommonHttpFields {
  c: number;
  m: string;
  u: string;
}

interface TimingsFields {
  st: number;
  lt: number;
  ct: number;
  rt: number;
}

export interface RequestFields extends CommonHttpFields {
  vu: number;
}

export interface ResponseFields extends CommonHttpFields, TimingsFields {
  s: number;
}

export interface ErrorFields extends CommonHttpFields {
  e: string;
}

export interface SuccessFields extends CommonHttpFields {
  s: number;
}

export interface FailureFields extends CommonHttpFields {
  s: number;
  e: string;
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
