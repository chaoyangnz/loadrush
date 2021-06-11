import { sample } from 'lodash';
import { Action } from './action';
import { Logger, Spinner } from './log';
import { Meter } from './meter';
import { Volunteers } from './vu';
import { ActionContext } from './context';
import { Scenario, scenarios } from './scenario';
import { config, initConfig } from './config';
import { getEnv } from './util';
import { TimescaledbMeter } from './meters/timescaledb-meter';
import { Stat } from './metric';

export type OnFinish = (stat: Stat) => any | void;

export interface Runner {
  sustain(size: number): void;
  ramp(rate: number): void;
}

export class DefaultRunner implements Runner {
  baseUrl: string;
  env: { [key: string]: string | number } = {};

  scenarios: Scenario[] = [];
  vus: Volunteers;
  meter: Meter;
  duration: number;

  isScenariosRegistered = false;

  onFinishCallback: OnFinish;
  startTimestamp!: number;

  constructor() {
    initConfig();
    this.baseUrl = config.baseUrl;
    this.duration = config.duration;
    this.vus = new Volunteers();
    this.meter = new TimescaledbMeter();
    for (const [key] of Object.entries(process.env)) {
      this.env[key] = getEnv(key, '');
    }
    Object.freeze(this.env);

    this.onFinish = this.onFinish.bind(this);
    this.onFinishCallback = this.printStat.bind(this);
    console.error(`Dashboard: ${this.meter.dashboard()}`);
    process.on('SIGINT', this.onFinish);
  }

  printStat(stat: Stat) {
    console.error(`\n\n\n`);
    console.error(`Stat`, stat);
  }

  private onFinish() {
    this.meter
      .stat(this.startTimestamp)
      .then((stat) => {
        const result = this.onFinishCallback(stat);
        if (result instanceof Promise) {
          return result.then(() => process.exit(0));
        }
        process.exit(0);
      })
      .catch((e) => {
        console.error(e);
        process.exit(-1);
      });
  }

  private registerScenarios() {
    if (this.isScenariosRegistered) {
      return;
    }
    this.scenarios.push(...scenarios);
    this.isScenariosRegistered = true;
    if (this.scenarios.length === 0) {
      console.error('At least one scenario definition is required');
      process.exit(-1);
    }
  }

  // attach a vu to a scenario
  private async go() {
    if (Date.now() - this.startTimestamp > config.duration * 1000) {
      return this.onFinish();
    }
    this.registerScenarios();
    const vu = this.vus.checkin();
    const scenario = sample(this.scenarios) as Scenario;
    const context = new ActionContext(runner, vu, scenario);

    this.meter.publishVu(this.vus.active);

    const spinner = new Spinner(
      `∷∷ Scenario: ${scenario.name} 👤 ${vu} 🕐 ${Date.now()}`,
    ).start();

    try {
      await this.waterfall(scenario.actions, context);
      spinner.succeed();
    } catch (e) {
      spinner.fail();
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

  async waterfall(actions: Action[], context: ActionContext) {
    let ctx = context;
    for (const action of actions) {
      const spinner = new Spinner({
        text: ctx.renderTemplate(action.title),
        // indent: 2,
      }).start();

      try {
        ctx = ctx.clone();
        await action.run(ctx);
        spinner.succeed();
      } catch (e) {
        spinner.fail();
        new Logger('loadrush:action').log(e);
        throw e;
      }
    }
  }

  parallel(actions: Action[], context: ActionContext) {
    return Promise.all(
      actions.map((action) => {
        const ctx = context.clone();
        const spinner = new Spinner({
          text: ctx.renderTemplate(action.title),
          // indent: 2,
        }).start();
        return action
          .run(ctx)
          .then(() => {
            spinner.succeed();
          })
          .catch((e) => {
            spinner.fail();
            new Logger('loadrush:action').log(e);
            throw e;
          });
      }),
    );
  }

  // constant load at one time
  sustain(size: number, onFinish?: OnFinish) {
    if (onFinish) {
      this.onFinishCallback = onFinish;
    }
    this.startTimestamp = Date.now();

    for (let i = 0; i < size; ++i) {
      this.relay();
    }
  }

  // ramp up
  ramp(rate: number, onFinish?: OnFinish) {
    if (onFinish) {
      this.onFinishCallback = onFinish;
    }
    this.startTimestamp = Date.now();

    setInterval(() => {
      this.flood(rate);
    }, 1_000);
  }
}

export const runner: Runner = new DefaultRunner();
