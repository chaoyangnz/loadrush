import { Action, ActionType } from './action';
import { Runner, runner } from './runner';

export interface ScenarioSpec {
  name: string;
  weight: number;
}

export class Scenario {
  name: string;
  weight: number;

  before: Action[] = [];
  after: Action[] = [];
  steps: Action[] = [];

  constructor(spec: ScenarioSpec) {
    this.name = spec.name;
    this.weight = spec.weight;
  }
}

export function scenario(spec: ScenarioSpec, actions: Action[]) {
  const scenario = new Scenario(spec);
  scenario.steps = actions.filter((action) => action.type === ActionType.STEP);
  scenario.before = actions.filter((action) => action.type === ActionType.BEFORE);
  scenario.after = actions.filter((action) => action.type === ActionType.AFTER);
  runner.scenarios.push(scenario);
}
