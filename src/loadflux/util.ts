export function getEnv<T>(name: string, defaultValue: T): T {
  const value = process.env[name];
  if (!value) {
    return defaultValue;
  }
  // @ts-ignore
  if (!isNaN(value)) {
    // @ts-ignore
    return +value;
  }
  // @ts-ignore
  return value;
}

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;
