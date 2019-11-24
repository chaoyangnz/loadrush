import { KV } from './meter';

export enum Metrics {
  SUCCESS = 'http_ok',
  FAILURE = 'http_ko',
  REQUEST = 'http_req',
  ERROR = 'http_err',
}

export interface SuccessFields {
  c: number;
  m: string;
  u: string;
  s: number;
}

export interface FailureFields {
  c: number;
  m: string;
  u: string;
  s: number;
  e: string;
}

export interface RequestFields {
  c: number;
  m: string;
  u: string;
}

export interface ErrorFields {
  c: number;
  m: string;
  u: string;
  e: string;
}

export type Fields =
  | RequestFields
  | SuccessFields
  | FailureFields
  | ErrorFields
  | KV;
