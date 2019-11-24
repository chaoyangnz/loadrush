import { Action, ActionType } from '../action';
import { Context } from '../context';
import { Logger } from '../log';

export type Callback = (context: Context) => Promise<void>;

export function before(callback: Callback): Action {
  return {
    type: ActionType.BEFORE,
    title: 'before',
    run: async (context: Context) => {
      await callback(context);
    },
  };
}

export function after(callback: Callback): Action {
  return {
    type: ActionType.AFTER,
    title: 'after',
    run: async (context: Context) => {
      try {
        await callback(context);
      } catch (e) {
        new Logger('loadflux:before').log(
          `Error occurred at after hook of ${context.$scenario.name}`,
          e,
        );
      }
    },
  };
}
