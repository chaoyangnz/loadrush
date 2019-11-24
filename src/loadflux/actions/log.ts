import { Action, ActionType } from '../action';
import { Context } from '../context';

export function log(message: string): Action {
  return {
    type: ActionType.STEP,
    title: message,
    run: async (context: Context) => {},
  };
}
