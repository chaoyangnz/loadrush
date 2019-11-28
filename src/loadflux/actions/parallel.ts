import { Action, ActionType } from '../action';
import { ActionContext } from '../context';

export function parallel(actions: Action[]): Action {
  // We don't support before/after actions as sub actions
  actions = actions.filter((action) => action.type === ActionType.STEP);
  return {
    type: ActionType.STEP,
    title: 'parallel',
    run: async (context: ActionContext) => {
      await context.$runner.parallel(actions, context);
    },
  };
}
