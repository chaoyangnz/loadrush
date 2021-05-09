import { render, Template } from './template';

describe('Template', () => {
  it('should render template with variables', () => {
    const template = 'hello {{var}}';
    const context = {
      vars: {
        var: 'world',
      },
    };
    expect(render(template, context.vars)).toBe('hello world');
  });

  it('should render template normally if the variable in context does not exist', () => {
    const template = 'hello {{var}}';
    let context = {
      vars: {},
    };
    expect(render(template, context.vars)).toBe('hello ');
    context = {
      vars: {
        var: undefined,
      },
    };
    expect(render(template, context.vars)).toBe('hello ');
    context = {
      vars: {
        var: null,
      },
    };
    expect(render(template, context.vars)).toBe('hello ');
  });
});
