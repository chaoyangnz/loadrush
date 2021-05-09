import { Action, ActionType, Runnable } from '../action';
import { ActionContext } from '../context';
import { Logger } from '../log';

export function before(callback: Runnable): Action {
  return {
    type: ActionType.BEFORE,
    title: 'before',
    run: async (context: ActionContext) => {
      try {
        await callback(context);
      } catch (e) {
        new Logger('loadrush:before').log(
          `Error occurred at before hook of ${context.scenario.name}`,
          e,
        );
        throw e;
      }
    },
  };
}

export function after(callback: Runnable): Action {
  return {
    type: ActionType.AFTER,
    title: 'after',
    run: async (context: ActionContext) => {
      try {
        await callback(context);
      } catch (e) {
        new Logger('loadrush:after').log(
          `Error occurred at after hook of ${context.scenario.name}`,
          e,
        );
        throw e;
      }
    },
  };
}
