import { Action, Context } from '../scenario';

export function log(message: string): Action {
  const action: Action = async (context: Context) => {};
  action.type = 'action';
  action.message = message;
  return action;
}
