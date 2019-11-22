import { Action, Context } from '../scenario';

export type Callback = (context: Context) => Promise<void>;

export function before(callback: Callback): Action {
  const action: Action = async (context: Context) => {
    await callback(context);
  };
  action.type = 'before';
  action.message = 'before';
  return action;
}

export function after(callback: Callback): Action {
  const action: Action = async (context: Context) => {
    try {
      await callback(context);
    } catch (e) {
      context.$logger(`Error occurred at after hook of ${context.$scenario.name}`, e);
    }
  };
  action.type = 'after';
  action.message = 'after';
  return action;
}
