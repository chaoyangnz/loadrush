import { cloneDeep } from 'lodash';
import { HttpClient } from './http-client';
import { Meter } from './meter';
import { Runner } from './runner';
import { Scenario } from './scenario';
import { render, Temptable } from './temptable';
import { VU } from './vu';

/**
 * Context is used for sharing data between actions within the scope of a scenario,
 * at the same time, it also provides the facility of action-local variables
 */
export class Context {
  vars: { [key: string]: any };
  $env: { [key: string]: string | number };
  $vu: VU;
  $scenario: Scenario;
  $runner: Runner;

  $meter: Meter;
  $http: HttpClient;

  constructor(
    runner: Runner,
    vu: VU,
    scenario: Scenario,
    http: HttpClient = new HttpClient(),
  ) {
    // who and what
    this.$vu = vu;
    this.$scenario = scenario;

    // populate from runner
    this.$runner = runner;
    this.$meter = runner.meter;
    this.$env = runner.env;

    this.$http = http;

    // action local, but could be shared to next action for non-parallel actions
    this.vars = {};
  }

  /**
   * we have to clone vars to fit the parallel actions
   */
  clone() {
    const clone = new Context(
      this.$runner,
      this.$vu,
      this.$scenario,
      this.$http,
    );
    clone.vars = cloneDeep(this.vars);
    return clone;
  }

  renderTemplate(template: Temptable) {
    const model = { ...this.vars, $env: this.$env };
    return render(template, model);
  }
}
