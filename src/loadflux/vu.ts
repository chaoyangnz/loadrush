export type VU = number;

export class Volunteers {
  cols: number;
  shift: number;
  rows: number;
  bin: Uint8Array;

  active = 0;

  constructor(size: number) {
    this.cols = 8;
    this.shift = 3;
    this.rows = (size >> this.shift) + 1;
    const buf: ArrayBuffer = new ArrayBuffer(this.rows);
    this.bin = new Uint8Array(buf);
    // set all available
    this.clear();
  }

  checkin(): VU {
    for (let i = 1; i < this.bin.byteLength * 8; ++i) {
      if (this.available(i)) {
        this.flip(i);
        this.active += 1;
        return i;
      }
    }
    console.warn('VU pool is too small or you set too high load');
    process.exit(-1);
  }

  checkout(vu: VU) {
    if (this.busy(vu)) {
      this.flip(vu);
      this.active -= 1;
    }
  }

  available(vu: VU) {
    return !this.busy(vu);
  }

  busy(vu: VU) {
    return this.get(vu);
  }

  private get(offset: number) {
    const row = offset >> this.shift;
    const col = offset % this.cols;
    const bit = 1 << col;
    return (this.bin[row] & bit) > 0;
  }

  private set(offset: number, bool: boolean) {
    const row = offset >> this.shift;
    const col = offset % this.cols;
    let bit = 1 << col;
    if (bool) {
      this.bin[row] |= bit;
    } else {
      bit = 255 ^ bit;
      this.bin[row] &= bit;
    }
  }

  private flip(offset: number) {
    const row = Math.floor(offset / this.cols);
    const col = offset % this.cols;
    const bit = 1 << col;
    this.bin[row] ^= bit;
  }

  private fill() {
    for (let i = 0; i < this.rows; i++) {
      this.bin[i] = 255;
    }
  }

  private clear() {
    for (let i = 0; i < this.rows; i++) {
      this.bin[i] = 0;
    }
  }
}
