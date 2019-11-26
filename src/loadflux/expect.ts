import expect, { Matchers } from 'expect';

export declare type ExpectFunction = <T = unknown>(actual: T) => Matchers<T>;

export const expectFunc: ExpectFunction = expect;
