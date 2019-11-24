import debug, { Debugger } from 'debug';
import ora, { Ora } from 'ora';
import { redirectStdout } from './stdout';

// `debug` is sending to stdout; report (ora) is sending to stderr
debug.log = console.info.bind(console);
// we only want to show report logs in tty otherwise the console will be messy
// (could be an issue of ora implementation which memorise the cursor and update periodically),
// so we redirect the Logger logs to a file
redirectStdout();

export class Logger {
  debugger: Debugger;
  queue: Array<{
    message: string;
    args: any[];
  }> = [];

  constructor(namespace: string) {
    this.debugger = debug(namespace);
  }

  log(message: string, ...args: any[]) {
    this.queue.push({
      message,
      args,
    });
    // if (reporters === 1) {
    this.queue.forEach(({ message, args }) => {
      this.debugger(message, args);
    });
    this.queue = [];
    // }
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
