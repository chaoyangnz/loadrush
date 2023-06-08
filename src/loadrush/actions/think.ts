import { repeat } from 'lodash';
import { Action, ActionType } from '../action';
import { ActionContext } from '../context';

export function think(ms: number): Action {
  return {
    type: ActionType.STEP,
    title: repeat('.', ms / 1000) || '🤔',
    run: async (context: ActionContext) => {
      return new Promise<void>((resolve, reject) => {
        setTimeout(resolve, ms);
      });
    },
  };
}
