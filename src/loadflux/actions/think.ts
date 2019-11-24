import { Action, ActionType } from '../action';
import { Context } from '../context';

export function think(ms: number): Action {
  return {
    type: ActionType.STEP,
    title: '.',
    run: async (context: Context) => {
      return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    },
  };
}
