import { Action, ActionType } from '../action';
import { ActionContext } from '../context';
import { Template } from '../template';

export function log(message: Template): Action {
  return {
    type: ActionType.STEP,
    title: message,
    run: async (context: ActionContext) => {},
  };
}
