import { Action, Context } from '../scenario';

export function think(ms: number): Action {
  const action: Action = async (context: Context) => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(resolve, ms);
    });
  };
  action.type = 'action';
  action.message = '.';
  return action;
}
