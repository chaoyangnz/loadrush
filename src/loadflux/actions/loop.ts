import { Action, ActionType } from '../action';
import { Context } from '../context';

export interface LoopSpec {
  over: string;
  parallel: boolean;
}

export function loop(spec: LoopSpec, actions: Action[]): Action {
  // We don't support before/after actions as sub actions
  actions = actions.filter((action) => action.type === ActionType.STEP);
  return {
    type: ActionType.STEP,
    title: `loop over ${spec.over}`,
    run: async (context: Context) => {
      const iterable: any[] = context.vars[spec.over];
      if (!spec.parallel) {
        for (const item of iterable) {
          context.vars.$loopElement = item;
          await context.$runner.waterfall(actions, context);
        }
        delete context.vars.$loopElement;
      } else {
        await Promise.all(
          iterable.map((item) => {
            context.vars.$loopElement = item;
            return context.$runner.waterfall(actions, context);
          }),
        );
      }
    },
  };
}
