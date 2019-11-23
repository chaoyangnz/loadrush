import debug, { Debugger } from 'debug';
import ora, { Ora } from 'ora';

debug.log = console.info.bind(console);

export class Logger {
  debugger: Debugger;
  constructor(namespace: string) {
    this.debugger = debug(namespace);
  }

  log(message: string, ...args: any[]) {
    this.debugger(`message`, args);
  }
}

export type ReporterOptions = ora.Options;

export class Reporter {
  spinner: Ora;
  constructor(text: string | ReporterOptions) {
    this.spinner = ora(text);
  }

  start() {
    this.spinner.start();
    return this;
  }

  stop() {
    this.spinner.stop();
    return this;
  }

  succeed() {
    this.spinner.succeed();
    return this;
  }

  fail() {
    this.spinner.fail();
    return this;
  }
}
