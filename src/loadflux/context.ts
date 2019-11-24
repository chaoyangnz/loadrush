import { cloneDeep } from 'lodash';
import { HttpClient } from './http';
import { Meter } from './meter';
import { Runner } from './runner';
import { Scenario } from './scenario';
import { Template } from './template';
import { VU } from './vu';

export class Context {
  env: { [key: string]: string | number };
  vars: { [key: string]: any };
  $scenario: Scenario;
  $runner: Runner;
  $vu: VU;
  $meter: Meter;
  $template: Template;
  $http: HttpClient;

  constructor(runner: Runner, vu: VU, scenario: Scenario) {
    // populate from runner
    this.$runner = runner;
    this.$meter = runner.meter;
    this.$template = runner.template;
    this.env = runner.env;

    // who and what
    this.$vu = vu;
    this.$scenario = scenario;

    // scenario shared
    this.vars = {};
    this.$http = new HttpClient();
  }

  /**
   * we have to clone vars to fit the parallel actions
   */
  clone() {
    const clone = new Context(this.$runner, this.$vu, this.$scenario);
    clone.vars = cloneDeep(this.vars);
    clone.$http = this.$http;
    return clone;
  }

  renderTemplate(template: string) {
    return this.$template.render(template, this);
  }
}
