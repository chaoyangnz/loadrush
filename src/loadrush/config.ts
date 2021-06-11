import {
  forIn,
  isNumber,
  isBoolean,
  isObject,
  isString,
  snakeCase,
  toNumber,
} from 'lodash';
import dotenv from 'dotenv';

export interface Config {
  vuPoolSize: number;
  duration: number;
  baseUrl: string;
  meter: 'timescaledb' | 'influxdb';
  http: {
    maxSockets: number;
    activeSocketTimeout: number;
    freeSocketTimeout: number;
  };
  timescaledb?: {
    host: string;
    port: number;
  };
  influxdb?: {
    org: string;
    bucket: string;
    token: string;
    api: string;
    tags: string;
    verboseMetrics: boolean;
  };
}

const resolve = <T>(obj: T, context: any, prefix = '') => {
  forIn(obj, (value: any, key: string) => {
    const envVarName = `${prefix}${snakeCase(key).toUpperCase()}`;
    // eslint-disable-next-line no-prototype-builtins
    if (context.hasOwnProperty(envVarName)) {
      // check environment variables first
      if (isString(value)) {
        // @ts-ignore
        obj[key] = context[envVarName];
      } else if (isNumber(value)) {
        // @ts-ignore
        obj[key] = toNumber(context[envVarName]);
      } else if (isBoolean(value)) {
        const val = context[envVarName];
        // @ts-ignore
        obj[key] = !(!val || val === 'false' || val === '0');
      } else {
        // tslint:disable-next-line:no-console
        console.warn(
          `Environment variable ${envVarName} is set but the value is not expected as string or number or boolean, skipped`,
        );
      }
    } else if (isString(value)) {
      // @ts-ignore
      obj[key] = value;
    } else if (isObject(value)) {
      // @ts-ignore
      obj[key] = resolve((value as unknown) as T, context, `${envVarName}_`);
    }
  });
  return obj;
};

export let config: Config;

export function initConfig() {
  // load .env env vars
  dotenv.config();
  config = resolve<Config>(
    {
      vuPoolSize: 10_000,
      duration: 600,
      baseUrl: '',
      meter: 'timescaledb',
      http: {
        maxSockets: 1000_000,
        activeSocketTimeout: 60_000,
        freeSocketTimeout: 30_000,
      },
      timescaledb: {
        host: 'localhost',
        port: 5432,
      },
    },
    process.env,
    'LOADRUSH',
  );
}
