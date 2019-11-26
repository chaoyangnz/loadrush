// @ts-ignore
import { Stopwatch as Stopwatch_ } from 'statman-stopwatch';

const MILLISECONDS_PER_SECOND = 1e3;
const NANOSECONDS_PER_SECOND = 1e9;

export class Stopwatch {
  private stopwatch: Stopwatch_;

  constructor() {
    this.stopwatch = new Stopwatch_(true);
  }

  milliseconds() {
    return this.stopwatch.stop();
  }

  seconds() {
    return this.milliseconds() / MILLISECONDS_PER_SECOND;
  }
}
