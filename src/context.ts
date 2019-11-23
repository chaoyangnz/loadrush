import axios, { AxiosInstance } from 'axios';
import { Debugger } from 'debug';
import EventEmitter from 'eventemitter3';
import { Runner } from './runner';
import { Scenario } from './scenario';
import { VU } from './vu';

export class Context {
  env: { [key: string]: string | number };
  vars: { [key: string]: any };
  $scenario: Scenario;
  $runner: Runner;
  $vu: VU;
  $emitter: EventEmitter;
  $logger: Debugger;
  $axios: AxiosInstance;

  constructor(runner: Runner, vu: VU, scenario: Scenario) {
    this.env = runner.env;
    this.vars = {};
    this.$vu = vu;
    this.$scenario = scenario;
    this.$runner = runner;
    this.$emitter = runner.emitter;
    this.$logger = runner.logger;
    this.$axios = axios;
  }
}
