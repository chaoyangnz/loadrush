import { queryJson } from './query';

describe('query selector', () => {
  it('should query an object from a json doc', () => {
    const json = {
      people: [
        { first: 'James', last: 'd' },
        { first: 'Jacob', last: 'e' },
        { first: 'Jayden', last: 'f' },
        { missing: 'different' },
      ],
      foo: { bar: 'baz' },
    };
    expect(queryJson(json, 'people[:2].first')).toEqual(['James', 'Jacob']);
  });
});
