import axios, { AxiosInstance } from 'axios';
import { Debugger } from 'debug';
import { Meter } from './meter';
import { Runner } from './runner';
import { Scenario } from './scenario';
import { VU } from './vu';

export class Context {
  env: { [key: string]: string | number };
  vars: { [key: string]: any };
  $scenario: Scenario;
  $runner: Runner;
  $vu: VU;
  $meter: Meter;
  $logger: Debugger;
  $axios: AxiosInstance;

  constructor(runner: Runner, vu: VU, scenario: Scenario) {
    this.env = runner.env;
    this.vars = {};
    this.$vu = vu;
    this.$scenario = scenario;
    this.$runner = runner;
    this.$meter = runner.meter;
    this.$logger = runner.logger;
    this.$axios = this.getAxiosInstance();
  }

  getAxiosInstance() {
    const instance = axios.create();
    instance.defaults.validateStatus = (status) => true;
    instance.defaults.withCredentials = true;
    return instance;
  }
}
