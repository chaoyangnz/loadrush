import { Context } from './context';
import { Temptable } from './temptable';

export enum ActionType {
  STEP = 'step',
  BEFORE = 'before',
  AFTER = 'after',
}

export type Runnable = (context: Context) => Promise<void>;

export type Callable<T> = (context: Context) => Promise<T>;

export interface Action {
  type: ActionType;
  title: Temptable;
  run: Runnable;
}
