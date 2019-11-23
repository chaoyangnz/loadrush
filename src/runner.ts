import 'core-js/features/promise/finally';
import dotenv from 'dotenv';
import debug, { Debugger } from 'debug';
import { Action } from './action';
import { Meter } from './meter';
import { getEnv } from './util';
import { Pool } from './vu';
import { Context } from './context';
import { Scenario } from './scenario';
import { sample } from 'lodash';
import ora from 'ora';

// load .env env vars
dotenv.config();

export class Runner {
  baseUrl: string;
  poolSize: number;
  env: { [key: string]: string | number } = {};

  scenarios: Scenario[] = [];
  vus: Pool;
  meter: Meter;
  duration: number;

  logger: Debugger = debug('loadflux:trace');

  constructor() {
    this.baseUrl = getEnv('LOADFLUX_BASE_URL', '');
    this.poolSize = getEnv<number>('LOADFLUX_VU_POOL_SIZE', 10_000);
    this.duration = getEnv<number>('LOADFLUX_DURATION', 600);
    this.vus = new Pool(this.poolSize);
    this.meter = new Meter();
    for (const [key, value] of Object.entries(process.env)) {
      this.env[key] = getEnv(key, '');
    }
  }

  // attach a vu to a scenario
  private async executeScenario() {
    const vu = this.vus.in();
    const scenario = sample(this.scenarios) as Scenario;
    const context: Context = new Context(runner, vu, scenario);

    const spinner = ora(
      `∷∷ Scenario: ${scenario.name} 👤 ${vu} 🕐 ${Date.now()}`,
    ).start();
    try {
      await waterfall(
        [...scenario.before, ...scenario.steps, ...scenario.after],
        context,
      );
      spinner.succeed();
    } catch (e) {
      spinner.fail();
    } finally {
      this.vus.out(vu);
    }
  }

  // a vu exits and another continues
  private relay() {
    this.executeScenario().finally(() => {
      this.relay();
    });
  }

  // arrive multiple vus together
  private arrive(size: number) {
    for (let i = 0; i < size; ++i) {
      this.executeScenario();
    }
  }

  // constant load at one time
  sustain(size: number) {
    for (let i = 0; i < size; ++i) {
      this.relay();
    }
  }

  // ramp up
  rampUp(rate: number) {
    setInterval(() => {
      this.arrive(rate);
    }, 1_000);
  }
}

export async function waterfall(actions: Action[], context: Context) {
  for (const action of actions) {
    const spinner = ora({ text: action.title, prefixText: '  ' }).start();
    try {
      await action.run(context);
      spinner.succeed();
    } catch (e) {
      context.$logger(e);
      spinner.fail();
      throw e;
    }
  }
}

export const runner = new Runner();
