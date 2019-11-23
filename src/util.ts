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
