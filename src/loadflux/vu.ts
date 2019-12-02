import { Bitset } from './bitset';
import { Env } from './env';
import { getEnv } from './util';

export type VU = number;

export class Volunteers {
  bitset: Bitset;

  active = 0;

  constructor() {
    this.bitset = new Bitset();
    // set all available
    this.bitset.clear();
  }

  checkin(): VU {
    let vu = 1;
    while (true) {
      if (!this.bitset.has(vu)) {
        break;
      }
      if (vu === getEnv(Env.LOADFLUX_VU_POOL_SIZE, 10_000)) {
        console.warn('You set too high work load and no user can be available');
        process.exit(-1);
      }
      vu += 1;
    }
    if (vu) {
      this.bitset.flip(vu);
      this.active += 1;
      return vu;
    } else {
      console.warn('Too small pool size or too high load');
      process.exit(-1);
    }
  }

  checkout(vu: VU) {
    if (this.bitset.has(vu)) {
      this.bitset.flip(vu);
      this.active -= 1;
    }
  }
}
