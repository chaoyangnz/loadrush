import { Runner, runner } from './runner';
import { Debugger } from 'debug';
import EventEmitter from 'eventemitter3';
import Listr from 'listr';

export interface ScenarioSpec {
  name: string;
  weight: number;
}
export interface Context {
  vars: { [key: string]: any };
  $scenario: Scenario;
  $runner: Runner;
  $vu: number;
  $emitter: EventEmitter;
  $logger: Debugger;
}
export type Action = ((context: Context) => Promise<void>) & { type: 'action' | 'before' | 'after'; message: string };

export class Scenario {
  name: string;
  weight: number;

  before: Action[] = [];
  after: Action[] = [];
  actions: Action[] = [];

  constructor(spec: ScenarioSpec) {
    this.name = spec.name;
    this.weight = spec.weight;
  }
}
export function scenario(spec: ScenarioSpec, actions: Action[]) {
  const scenario = new Scenario(spec);
  scenario.actions = actions.filter((action) => action.type === 'action');
  scenario.before = actions.filter((action) => action.type === 'before');
  scenario.after = actions.filter((action) => action.type === 'after');
  runner.scenarios.push(scenario);
}
