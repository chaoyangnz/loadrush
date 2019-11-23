import 'core-js/features/promise/finally';
import dotenv from 'dotenv';
import { Action } from './action';
import { Logger, Reporter } from './log';
import { Meter } from './meter';
import { getEnv } from './util';
import { Volunteers } from './vu';
import { Context } from './context';
import { Scenario } from './scenario';
import { sample } from 'lodash';

export class Runner {
  baseUrl: string;
  poolSize: number;
  env: { [key: string]: string | number } = {};

  scenarios: Scenario[] = [];
  vus: Volunteers;
  meter: Meter;
  duration: number;

  constructor() {
    // load .env env vars
    dotenv.config();

    this.baseUrl = getEnv('LOADFLUX_BASE_URL', '');
    this.poolSize = getEnv<number>('LOADFLUX_VU_POOL_SIZE', 10_000);
    this.duration = getEnv<number>('LOADFLUX_DURATION', 600);
    this.vus = new Volunteers(this.poolSize);
    this.meter = new Meter();
    for (const [key, value] of Object.entries(process.env)) {
      this.env[key] = getEnv(key, '');
    }
  }

  // attach a vu to a scenario
  private async fly() {
    const vu = this.vus.checkin();
    const scenario = sample(this.scenarios) as Scenario;
    const context: Context = new Context(runner, vu, scenario);

    this.meter.publish('vu', { active: this.vus.active });

    const reporter = new Reporter(
      `∷∷ Scenario: ${scenario.name} 👤 ${vu} 🕐 ${Date.now()}`,
    ).start();

    try {
      await waterfall(scenario.actions, context);
      reporter.succeed();
    } catch (e) {
      reporter.fail();
    } finally {
      this.vus.checkout(vu);
    }
  }

  // a vu exits and another continues
  private relay() {
    this.fly().finally(() => {
      this.relay();
    });
  }

  // arrive multiple vus together
  private arrive(size: number) {
    for (let i = 0; i < size; ++i) {
      this.fly();
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
    const reporter = new Reporter({
      text: action.title,
      prefixText: '  ',
    }).start();

    try {
      await action.run(context);
      reporter.succeed();
    } catch (e) {
      reporter.fail();
      new Logger('loadflux:action').log(e);
      throw e;
    }
  }
}

export const runner = new Runner();
