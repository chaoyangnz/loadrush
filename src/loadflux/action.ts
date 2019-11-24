import { Context } from './context';

export enum ActionType {
  STEP = 'step',
  BEFORE = 'before',
  AFTER = 'after',
}
export interface Action {
  type: ActionType;
  title: string;
  run: (context: Context) => Promise<void>;
}
