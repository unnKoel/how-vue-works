/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */
import { render } from '../src/render';

afterEach(() => {
  document.body.innerHTML = "";
});

test('render template as real dom', () => {
  const template = '<div class="root"><a href="www.google.com">Navtigate to Google</a></div>'

  render(template, document.body);
  expect(document.body.innerHTML).toBe('<div class="root"><a href="www.google.com">Navtigate to Google</a></div>')
});
