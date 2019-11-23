import { HttpClient } from './http';
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
  $http: HttpClient;

  constructor(runner: Runner, vu: VU, scenario: Scenario) {
    this.env = runner.env;
    this.vars = {};
    this.$vu = vu;
    this.$scenario = scenario;
    this.$runner = runner;
    this.$meter = runner.meter;
    this.$http = new HttpClient();
  }
}
