import { Action, ActionType } from '../action';
import { Context } from '../context';

export function parallel(actions: Action[]): Action {
  // We don't support before/after actions as sub actions
  actions = actions.filter((action) => action.type === ActionType.STEP);
  return {
    type: ActionType.STEP,
    title: 'parallel',
    run: async (context: Context) => {
      await context.$runner.parallel(actions, context);
    },
  };
}
