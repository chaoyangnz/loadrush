import mustache from 'mustache';

mustache.escape = (text) => {
  return text;
};

export function render(template: Template, context: any) {
  return mustache.render(template, context);
}

export type Template = string;
