import mustache from 'mustache';
import { Context } from './context';

mustache.escape = (text) => {
  return text;
};

export class Template {
  render(template: string, context: Context) {
    return mustache.render(template, context.vars);
  }
}
