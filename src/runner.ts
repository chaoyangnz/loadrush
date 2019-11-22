import 'core-js/features/promise/finally';

import debug, { Debugger } from 'debug';
import Listr from 'listr';
import { Bitmap } from './bitmap';
import { Action, Context, Scenario } from './scenario';
import { sample } from 'lodash';
import EventEmitter from 'eventemitter3';

export class Runner {
  vuPoolSize = parseInt(process.env.LOADRAMP_VU_POOL_SIZE || '10000', 10);

  scenarios: Scenario[] = [];
  vus: Bitmap = new Bitmap(this.vuPoolSize);
  emitter: EventEmitter = new EventEmitter();
  duration = parseInt(process.env.LOADRAMP_DURATION || '600', 10);

  logger: Debugger = debug('loadramp:trace');

  // attach a vu to a scenario
  private async run() {
    const vu = this.vus.in();
    const scenario = sample(this.scenarios);
    if (vu === undefined) {
      console.warn('VU pool is too small or you set too high load');
      process.exit(-1);
    }
    if (scenario === undefined) {
      console.warn('You should import your scenario definition');
      process.exit(-1);
    }
    const context: Context = {
      vars: {},
      $vu: vu,
      $scenario: scenario,
      $runner: runner,
      $emitter: runner.emitter,
      $logger: runner.logger,
    };
    const promises = [...scenario.before, ...scenario.actions, ...scenario.after].map((action: Action) => ({
      message: action.message,
      promise: action(context),
    }));
    const listrTasks = [
      { title: `∵ Scenario: ${scenario.name} ${Date.now()}`, task: () => {} },
      ...promises.map((item) => ({
        title: item.message,
        task: () => item.promise,
      })),
    ];
    new Listr(listrTasks).run();
    return Promise.all(promises.map((item) => item.promise)).finally(() => {
      this.vus.out(vu);
    });
  }

  // a vu exits and another continues
  private relay() {
    this.run().finally(() => {
      this.relay();
    });
  }

  // arrive multiple vus together
  private arrive(size: number) {
    for (let i = 0; i < size; ++i) {
      this.run();
    }
  }

  // constant load at one time
  constantLoad(size: number) {
    for (let i = 0; i < size; ++i) {
      this.relay();
    }
  }

  // ramp up
  rampLoad(rate: number) {
    setTimeout(() => {
      this.arrive(rate);
    }, 1_000);
  }
}

export const runner = new Runner();
