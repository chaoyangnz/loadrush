import { Volunteers } from './vu';

describe('VU', () => {
  let volunteers: Volunteers;

  beforeEach(() => {
    volunteers = new Volunteers();
  });

  it('should be initialised as all 0', () => {
    expect(volunteers.bitset.size()).toEqual(0);
    expect(volunteers.active).toEqual(0);
    for (let i = 0; i < 1000; ++i) {
      expect(volunteers.bitset.has(i)).toEqual(false);
    }
  });

  it('should check in a new user', () => {
    const vu = volunteers.checkin();
    expect(vu).toBeGreaterThanOrEqual(1);
    expect(vu).toBeLessThanOrEqual(Number.MAX_VALUE);
    expect(volunteers.bitset.has(vu)).toBe(true);
    expect(volunteers.bitset.size()).toEqual(1);
    expect(volunteers.active).toBe(1);
  });

  it('should checkout an existing user', () => {
    const vu = volunteers.checkin();
    volunteers.checkout(vu);
    expect(volunteers.bitset.has(vu)).toBe(false);
    expect(volunteers.bitset.size()).toEqual(0);
    expect(volunteers.active).toBe(0);
  });

  it('should do nothing when checking out a non-existing user', () => {
    const vu = 100;
    volunteers.checkout(vu);
    expect(volunteers.bitset.has(vu)).toBe(false);
    expect(volunteers.bitset.size()).toEqual(0);
    expect(volunteers.active).toBe(0);
  });
});
