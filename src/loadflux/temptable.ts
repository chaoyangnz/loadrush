import mustache from 'mustache';

mustache.escape = (text) => {
  return text;
};

export function render(template: Temptable, context: any) {
  return mustache.render(template, context);
}

export type Temptable = string;
