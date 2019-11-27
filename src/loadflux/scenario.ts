import { Action, ActionType } from './action';
import { runner, RunnerImpl } from './runner';

export interface ScenarioSpec {
  name: string;
  weight: number;
}

interface Flow {
  before: Action[];
  after: Action[];
  steps: Action[];
}

export class Scenario {
  name: string;
  weight: number;
  actions: Action[];

  constructor(spec: ScenarioSpec, actions: Action[]) {
    this.name = spec.name;
    this.weight = spec.weight;
    const flow: Flow = { before: [], after: [], steps: [] };
    flow.steps = actions.filter((action) => action.type === ActionType.STEP);
    flow.before = actions.filter((action) => action.type === ActionType.BEFORE);
    flow.after = actions.filter((action) => action.type === ActionType.AFTER);
    this.actions = [...flow.before, ...flow.steps, ...flow.after];
  }
}

// register a scenario
export function scenario(spec: ScenarioSpec, ...flow: Action[]) {
  const scenario = new Scenario(spec, flow);
  (runner as RunnerImpl).scenarios.push(scenario);
}
