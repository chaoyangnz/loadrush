export class Bitset {
  words: number[];

  constructor(iterable?: Iterable<number> | number[]) {
    this.words = [];

    if (iterable) {
      if (
        Symbol &&
        Symbol.iterator &&
        iterable[Symbol.iterator] !== undefined
      ) {
        const iterator = iterable[Symbol.iterator]();
        let current = iterator.next();
        while (!current.done) {
          this.add(current.value);
          current = iterator.next();
        }
      } else {
        const arr = iterable as number[];
        for (let i = 0; i < arr.length; i++) {
          this.add(arr[i]);
        }
      }
    }
  }

  // Add the value (Set the bit at index to true)
  add(index: number) {
    this.resize(index);
    this.words[index >>> 5] |= 1 << index;
  }

  // If the value was not in the set, add it, otherwise remove it (flip bit at index)
  flip(index: number) {
    this.resize(index);
    this.words[index >>> 5] ^= 1 << index;
  }

  // Remove all values, reset memory usage
  clear() {
    this.words = [];
  }

  // Set the bit at index to false
  remove(index: number) {
    this.resize(index);
    this.words[index >>> 5] &= ~(1 << index);
  }

  // Return true if no bit is set
  isEmpty(index: number) {
    const c = this.words.length;
    for (let i = 0; i < c; i++) {
      if (this.words[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  // Is the value contained in the set? Is the bit at index true or false? Returns a boolean
  has(index: number) {
    return (this.words[index >>> 5] & (1 << index)) !== 0;
  }

  // Tries to add the value (Set the bit at index to true), return 1 if the
  // value was added, return 0 if the value was already present
  checkedAdd(index: number) {
    this.resize(index);
    const word = this.words[index >>> 5];
    const newword = word | (1 << index);
    this.words[index >>> 5] = newword;
    return (newword ^ word) >>> index;
  }

  // Reduce the memory usage to a minimum
  trim(index: number) {
    let nl = this.words.length;
    while (nl > 0 && this.words[nl - 1] === 0) {
      nl--;
    }
    this.words = this.words.slice(0, nl);
  }

  // Resize the bitset so that we can write a value at index
  resize(index: number) {
    const count = (index + 32) >>> 5; // just what is needed
    for (let i = this.words.length; i < count; i++) {
      this.words[i] = 0;
    }
  }

  // fast function to compute the Hamming weight of a 32-bit unsigned integer
  hammingWeight(v: number) {
    v -= (v >>> 1) & 0x55555555; // works with signed or unsigned shifts
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    return (((v + (v >>> 4)) & 0xf0f0f0f) * 0x1010101) >>> 24;
  }

  // How many values stored in the set? How many set bits?
  size() {
    let answer = 0;
    const c = this.words.length;
    const w = this.words;
    let i = 0;
    for (; i < c; i++) {
      answer += this.hammingWeight(w[i]);
    }
    return answer;
  }

  // Return an array with the set bit locations (values)
  array() {
    const answer = new Array(this.size());
    let pos = 0 | 0;
    const c = this.words.length;
    for (let k = 0; k < c; ++k) {
      let w = this.words[k];
      while (w !== 0) {
        const t = w & -w;
        answer[pos++] = (k << 5) + this.hammingWeight((t - 1) | 0);
        w ^= t;
      }
    }
    return answer;
  }

  // Return an array with the set bit locations (values)
  forEach(func: (item: number) => void) {
    const c = this.words.length;
    for (let k = 0; k < c; ++k) {
      let w = this.words[k];
      while (w !== 0) {
        const t = w & -w;
        func((k << 5) + this.hammingWeight((t - 1) | 0));
        w ^= t;
      }
    }
  }

  // Creates a copy of this bitmap
  clone() {
    // @ts-ignore
    const clone = Object.create(this.prototype);
    clone.words = this.words.slice();
    return clone;
  }
}
