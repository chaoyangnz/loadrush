import 'core-js/features/promise/finally';
import dotenv from 'dotenv';
import debug, { Debugger } from 'debug';
import { Action } from './action';
import { getEnv } from './util';
import { Pool } from './vu';
import { Context } from './context';
import { Scenario } from './scenario';
import { sample } from 'lodash';
import EventEmitter from 'eventemitter3';
import ora from 'ora';

// load .env env vars
dotenv.config();

export class Runner {
  target = getEnv('LOADFLUX_BASE_URL', '');
  poolSize = getEnv<number>('LOADFLUX_VU_POOL_SIZE', 10_000);

  scenarios: Scenario[] = [];
  vus: Pool = new Pool(this.poolSize);
  emitter: EventEmitter = new EventEmitter();
  duration = getEnv<number>('LOADFLUX_DURATION', 600);

  logger: Debugger = debug('loadflux:trace');

  constructor() {}

  // attach a vu to a scenario
  private async executeScenario() {
    const vu = this.vus.in();
    const scenario = sample(this.scenarios);
    if (vu === undefined) {
      console.warn('VU pool is too small or you set too high load');
      process.exit(-1);
    }
    if (scenario === undefined) {
      console.warn('You should import at least one of your scenario definitions');
      process.exit(-1);
    }
    const context: Context = new Context(runner, vu, scenario);

    const spinner = ora(`∷∷ Scenario: ${scenario.name} 👤 ${vu} 🕐 ${Date.now()}`).start();
    try {
      await waterfall([...scenario.before, ...scenario.steps, ...scenario.after], context);
    } catch (e) {
      spinner.fail();
    } finally {
      this.vus.out(vu);
    }
    spinner.succeed();
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
    setTimeout(() => {
      this.arrive(rate);
    }, 1_000);
  }
}

export async function waterfall(actions: Action[], context: Context) {
  for (const action of actions) {
    const spinner = ora({ text: action.title, prefixText: '  ' });
    spinner.start();
    try {
      await action.run(context);
    } catch (e) {
      context.$logger(e);
      spinner.fail();
    }
    spinner.succeed();
  }
}

export const runner = new Runner();
