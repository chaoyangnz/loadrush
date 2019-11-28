import { ActionContext, Context } from './context';
import { Template } from './template';

export enum ActionType {
  STEP = 'step',
  BEFORE = 'before',
  AFTER = 'after',
}

export type Runnable = (context: Context) => Promise<void>;

export type Callable<T> = (context: Context) => Promise<T>;

export type ActionRunnable = (context: ActionContext) => Promise<void>;

export interface Action {
  type: ActionType;
  title: Template;
  run: ActionRunnable;
}
