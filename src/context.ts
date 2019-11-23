import axios, { AxiosInstance } from 'axios';
import { Debugger } from 'debug';
import EventEmitter from 'eventemitter3';
import { runner, Runner } from './runner';
import { Scenario } from './scenario';
import { getEnv } from './util';
import { VU } from './vu';

export class Context {
  env: { [key: string]: string | number };
  vars: { [key: string]: any };
  $scenario: Scenario;
  $runner: Runner;
  $vu: number;
  $emitter: EventEmitter;
  $logger: Debugger;
  $axios: AxiosInstance;

  constructor(runner: Runner, vu: VU, scenario: Scenario) {
    this.env = {};
    for (const [key, value] of Object.entries(process.env)) {
      this.env[key] = getEnv(key, '');
    }
    this.vars = {};
    this.$vu = vu;
    this.$scenario = scenario;
    this.$runner = runner;
    this.$emitter = runner.emitter;
    this.$logger = runner.logger;
    this.$axios = axios;
  }
}
