import { Action, ActionType } from '../action';
import { Context } from '../context';
import { Template } from '../template';

export function log(message: Template): Action {
  return {
    type: ActionType.STEP,
    title: message,
    run: async (context: Context) => {},
  };
}
