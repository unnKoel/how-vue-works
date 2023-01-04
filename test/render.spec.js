/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */
import { render } from '../src/render';

afterEach(() => {
  document.body.innerHTML = "";
});

test('render normal template without directives', () => {
  const template = `
    <div class="root">
      <a href="www.google.com">Navtigate to Google</a>
    </div>`;

  render(template, document.body);
  expect(document.body.innerHTML).toBe('<div class="root"><a href="www.google.com">Navtigate to Google</a></div>')
});

test('render template with mustache braces', () => {
  const templete = `
    <div class="root">
      <a href="www.google.com">Navtigate to {{site}}</a>
    </div>`;
  const data = {
    site: 'Google',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe('<div class="root"><a href="www.google.com">Navtigate to Google</a></div>');
});


test('render template with v-bind directive', () => {
  const templete = `
    <div class="root">
      <a href="www.google.com" v-bind:title="title">Navtigate to {{site}}</a>
    </div>`;
  const data = {
    site: 'Google',
    title: 'Navigate to Google',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe('<div class="root"><a href="www.google.com" title="Navigate to Google">Navtigate to Google</a></div>');
});


test('render template with v-if directive', () => {

});
