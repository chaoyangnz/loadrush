import { KV } from './meter';

export enum Metrics {
  SUCCESS = 'http_ok',
  FAILURE = 'http_ko',
  REQUEST = 'http_req',
  RESPONSE = 'http_res',
  ERROR = 'http_err',
  VU = 'vu',
}

export interface RequestFields {
  c: number;
  m: string;
  u: string;
  vu: number;
}

export interface ResponseFields {
  c: number;
  m: string;
  u: string;
  s: number;
  vu: number;
  st: number;
  lt: number;
  ct: number;
  rt: number;
}

export interface ErrorFields {
  c: number;
  m: string;
  u: string;
  e: string;
  vu: number;
}

export interface SuccessFields {
  c: number;
  r: number;
  m: string;
  u: string;
  s: number;
}

export interface FailureFields {
  c: number;
  r: number;
  m: string;
  u: string;
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
