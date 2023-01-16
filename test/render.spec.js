/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */
import observe from '../src/observe';
import { render, directiveQueue } from '../src/render';

beforeEach(() => {
  document.body.innerHTML = '';
  directiveQueue.clear();
});

test('render normal template without directives', () => {
  const template = `
    <div class="root">
      <a href="www.google.com">Navigate to Google</a>
    </div>`;

  render(template, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.google.com">Navigate to Google</a></div>'
  );
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
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.google.com">Navtigate to Google</a></div>'
  );
});

test('render template with mustache braces that reacts to data change', () => {
  const templete = `
    <div class="root">
      <a v-bind:href="url">Navigate to {{site}}</a>
    </div>`;

  const data = {
    site: 'Google',
    url: 'www.google.com',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.google.com">Navigate to Google</a></div>'
  );
  data.site = 'Microsoft';
  data.url = 'www.microsoft.com';
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.microsoft.com">Navigate to Microsoft</a></div>'
  );
});

test('render template with v-bind directive', () => {
  const templete = `
    <div class="root">
      <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
    </div>`;

  const data = {
    site: 'Google',
    title: 'Navigate to Google',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div>'
  );
});

test('render template with v-bind directive that reacts to data change', () => {
  const templete = `
    <div class="root">
      <a v-bind:href="url" v-bind:title="title">Navigate to {{site}}</a>
    </div>`;

  const data = {
    site: 'Google',
    title: 'Navigate to Google',
    url: 'www.google.com',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div>'
  );
  data.site = 'Microsoft';
  data.title = 'Navigate to Microsoft';
  data.url = 'www.microsoft.com';
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.microsoft.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div>'
  );
});

test('render template with v-if=false directive', () => {
  const templete = `
    <div class="root">
      <div v-if="show">
        <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
      </div>
    </div>`;

  const data = {
    show: false,
    site: 'Google',
    title: 'Navigate to Google',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe('<div class="root"></div>');
});

test('render template with v-if=true directive', () => {
  const templete = `
    <div class="root">
      <span>Search for {{something}}</span>
      <div v-if="show">
        <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
      </div>
      <p>{{text}}</p>
    </div>`;

  const data = {
    show: true,
    site: 'Google',
    title: 'Navigate to Google',
    something: 'Vue',
    text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
});

test('render template with v-if directive that reacts to data change', () => {
  const templete = `
    <div class="root">
      <span>Search for {{something}}</span>
      <div v-if="show">
        <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
      </div>
      <p>{{text}}</p>
    </div>`;

  const data = {
    show: true,
    site: 'Google',
    title: 'Navigate to Google',
    something: 'Vue',
    text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
  };

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
  data.show = false;
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
  data.show = true;
  data.something = 'React';
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for React</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
});

test('render template with v-for directive', () => {
  const templete = `
    <div class="root">
      <span>Search for {{something}}</span>
      <div v-for="item in array">
        <a href="www.google.com" v-bind:title="item.title">Navigate to {{item.site}}</a>
      </div>
      <p>{{text}}</p>
    </div>`;

  const data = observe({
    array: [
      { title: 'Navigate to Google', site: 'Google' },
      { title: 'Navigate to Microsoft', site: 'Microsoft' },
      { title: 'Navigate to Apple', site: 'Apple' },
    ],
    something: 'Vue',
    text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
  });

  render(templete, document.body, data);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
});
