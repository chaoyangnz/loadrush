import 'core-js/features/promise/finally';
import dotenv from 'dotenv';
import { sample } from 'lodash';
import { Action } from './action';
import { Env } from './env';
import { Logger, Reporter } from './log';
import { Meter } from './meter';
import { getEnv } from './util';
import { Volunteers } from './vu';
import { Context, ContextImpl } from './context';
import { Scenario } from './scenario';

export interface Runner {
  sustain(size: number): void;
  ramp(rate: number): void;
}

export class RunnerImpl implements Runner {
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

    this.baseUrl = getEnv(Env.LOADFLUX_BASE_URL, '');
    this.poolSize = getEnv<number>(Env.LOADFLUX_VU_POOL_SIZE, 10_000);
    this.duration = getEnv<number>(Env.LOADFLUX_DURATION, 600);
    this.vus = new Volunteers(this.poolSize);
    this.meter = new Meter();
    for (const [key, value] of Object.entries(process.env)) {
      this.env[key] = getEnv(key, '');
    }
    Object.freeze(this.env);
  }

  // attach a vu to a scenario
  private async go() {
    if (this.scenarios.length === 0) {
      console.error('At least one scenario definition is required');
      process.exit(-1);
    }
    const vu = this.vus.checkin();
    const scenario = sample(this.scenarios) as Scenario;
    const context: Context = new ContextImpl(runner, vu, scenario);

    this.meter.publishVu(this.vus.active);

    const reporter = new Reporter(
      `∷∷ Scenario: ${scenario.name} 👤 ${vu} 🕐 ${Date.now()}`,
    ).start();

    try {
      await this.waterfall(scenario.actions, context);
      reporter.succeed();
    } catch (e) {
      reporter.fail();
    } finally {
      this.vus.checkout(vu);
    }
  }

  // a vu exits and another continues
  private relay() {
    this.go().finally(() => {
      this.relay();
    });
  }

  // arrive multiple vus together
  private flood(size: number) {
    for (let i = 0; i < size; ++i) {
      this.go();
    }
  }

  async waterfall(actions: Action[], context: Context) {
    let ctx = context as ContextImpl;
    for (const action of actions) {
      const reporter = new Reporter({
        text: ctx.renderTemplate(action.title),
        indent: 2,
      }).start();

      try {
        ctx = ctx.clone();
        await action.run(ctx);
        reporter.succeed();
      } catch (e) {
        reporter.fail();
        new Logger('loadflux:action').log(e);
        throw e;
      }
    }
  }

  parallel(actions: Action[], context: Context) {
    return Promise.all(
      actions.map((action) => {
        const ctx = (context as ContextImpl).clone();
        const reporter = new Reporter({
          text: ctx.renderTemplate(action.title),
          prefixText: '  ',
        }).start();
        return action
          .run(ctx)
          .then(() => {
            reporter.succeed();
          })
          .catch((e) => {
            reporter.fail();
            new Logger('loadflux:action').log(e);
            throw e;
          });
      }),
    );
  }

  // constant load at one time
  sustain(size: number) {
    for (let i = 0; i < size; ++i) {
      this.relay();
    }
  }

  // ramp up
  ramp(rate: number) {
    setInterval(() => {
      this.flood(rate);
    }, 1_000);
  }
}

export const runner: Runner = new RunnerImpl();
