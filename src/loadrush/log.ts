import debug, { Debugger } from 'debug';
import { redirectStdout } from './stdout';
import ora, { Ora } from 'ora';

// `debug` is sending to stdout; report (ora) is sending to stderr
debug.log = console.info.bind(console);
// we only want to show report logs in tty otherwise the console will be messy
// (could be an issue of ora implementation which memorise the cursor and update periodically),
// so we redirect the Logger logs to a file
if (process.env.LOG_TO_FILE !== 'true') {
  redirectStdout();
}

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

export type SpinnerOptions = ora.Options;

export class Spinner {
  spinner: Ora;
  constructor(text: string | SpinnerOptions) {
    this.spinner = ora(text);
  }

  start() {
    this.spinner.start();
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
