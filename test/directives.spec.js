/**
 * @jest-environment jsdom
 */
/* eslint-disable no-undef */
import { MustacheDirective } from '../src/directives';

test('check out mustache symbol', () => {
  const text = 'hello, {{name}}. Welcome to {{ field }}\'s world';
  const textNode = document.createTextNode(text);

  const mustacheDirective = MustacheDirective(textNode, text);
  const isMustache = mustacheDirective.isMustache();
  expect(isMustache).toBe(true);

  const text2 = 'hello, Welcome to world';
  const textNode2 = document.createTextNode(text2);

  const mustacheDirective2 = MustacheDirective(textNode2, text2);
  const isMustache2 = mustacheDirective2.isMustache();
  expect(isMustache2).toBe(false);
});

test('test interpolate value in mustache symbol', () => {
  const text = 'hello, {{ name  }}. Welcome to {{field}}\'s world';
  const textNode = document.createTextNode(text);

  const mustacheDirective = MustacheDirective(textNode, text);
  const data = {
    name: 'Addy',
    field: 'directive'
  };

  mustacheDirective.handle(data);
  expect(textNode.nodeValue).toBe('hello, Addy. Welcome to directive\'s world');
});
