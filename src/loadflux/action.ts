import { Context } from './context';
import { Temptable } from './temptable';

export enum ActionType {
  STEP = 'step',
  BEFORE = 'before',
  AFTER = 'after',
}

type Runnable = (context: Context) => Promise<void>;

export interface Action {
  type: ActionType;
  title: Temptable;
  run: Runnable;
}
