import { Bitset } from './bitset';

describe('Bitset', () => {
  let bitset: Bitset;

  beforeEach(() => {
    bitset = new Bitset();
  });

  it('should create an empty bitset', () => {
    expect(bitset.isEmpty()).toBeTruthy();
  });

  it('should create a bitset with provided items', () => {
    const iter = [1, 4, 9];
    bitset = new Bitset(iter);
    expect(bitset.isEmpty()).toBeFalsy();
    expect(bitset.size()).toBe(iter.length);
    iter.forEach((item) => {
      expect(bitset.has(item)).toBeTruthy();
    });
  });

  it('should add and remove the specified item correctly', () => {
    const item = 189;
    bitset.add(item);
    expect(bitset.size()).toBe(1);
    expect(bitset.has(item)).toBeTruthy();

    bitset.remove(item);
    expect(bitset.size()).toBe(0);
    expect(bitset.has(item)).toBeFalsy();
  });

  it('should add and flip the specified item correctly', () => {
    const item = 189;
    bitset.add(item);
    expect(bitset.size()).toBe(1);
    expect(bitset.has(item)).toBeTruthy();

    bitset.flip(item);
    expect(bitset.size()).toBe(0);
    expect(bitset.has(item)).toBeFalsy();

    bitset.flip(item);
    expect(bitset.size()).toBe(1);
    expect(bitset.has(item)).toBeTruthy();
  });
});
