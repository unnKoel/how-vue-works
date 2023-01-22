/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */
import render from '../src/render';
import { useData, useMethods } from '../src/hooks';

beforeEach(() => {
  document.body.innerHTML = '';
});

test('render normal template without directives', () => {
  const component = () => `
    <div class="root">
      <a href="http://www.google.com">Navigate to Google</a>
    </div>`;

  render(component, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="http://www.google.com">Navigate to Google</a></div>'
  );
});

test('render template with mustache braces', () => {
  const component = () => {
    useData({
      site: 'Google',
    });

    return `
      <div class="root">
        <a href="www.google.com">Navtigate to {{site}}</a>
      </div>`;
  };

  render(component, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.google.com">Navtigate to Google</a></div>'
  );
});

test('render template with mustache braces that reacts to data change', () => {
  const data = {
    site: 'Google',
    url: 'www.google.com',
  };

  const component = () => {
    useData(data);

    return `
      <div class="root">
        <a v-bind:href="url">Navigate to {{site}}</a>
      </div>`;
  };

  render(component, document.body);
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
  const component = () => {
    useData({
      site: 'Google',
      title: 'Navigate to Google',
    });

    return `
      <div class="root">
        <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
      </div>
    `;
  };

  render(component, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div>'
  );
});

test('render template with v-bind directive that reacts to data change', () => {
  const data = {
    site: 'Google',
    title: 'Navigate to Google',
    url: 'www.google.com',
  };

  const component = () => {
    useData(data);

    return `
      <div class="root">
        <a v-bind:href="url" v-bind:title="title">Navigate to {{site}}</a>
      </div>`;
  };

  render(component, document.body);
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
  const component = () => {
    useData({
      show: false,
      site: 'Google',
      title: 'Navigate to Google',
    });

    return `
      <div class="root">
        <div v-if="show">
          <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
        </div>
      </div>`;
  };

  render(component, document.body);
  expect(document.body.innerHTML).toBe('<div class="root"></div>');
});

test('render template with v-if=true directive', () => {
  const data = {
    show: true,
    site: 'Google',
    title: 'Navigate to Google',
    something: 'Vue',
    text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
  };

  const component = () => {
    useData(data);

    return `
      <div class="root">
        <span>Search for {{something}}</span>
        <div v-if="show">
          <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  render(component, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
});

test('render template with v-if directive that reacts to data change', () => {
  const data = {
    show: true,
    site: 'Google',
    title: 'Navigate to Google',
    something: 'Vue',
    text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
  };

  const component = () => {
    useData(data);

    return `
      <div class="root">
        <span>Search for {{something}}</span>
        <div v-if="show">
          <a href="www.google.com" v-bind:title="title">Navigate to {{site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  render(component, document.body);
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
  const component = () => {
    useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
      something: 'Vue',
      text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
    });

    return `
      <div class="root">
        <span>Search for {{something}}</span>
        <div v-for="item in array">
          <a href="www.google.com" v-bind:title="item.title">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  render(component, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
});

test('render template with v-for directive that reacts to data change', () => {
  const data = {
    array: [
      { title: 'Navigate to Google', site: 'Google' },
      { title: 'Navigate to Microsoft', site: 'Microsoft' },
      { title: 'Navigate to Apple', site: 'Apple' },
    ],
    something: 'Vue',
    text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
  };

  const component = () => {
    useData(data);

    return `
      <div class="root">
        <span>Search for {{something}}</span>
        <div v-for="item in array">
          <a href="www.google.com" v-bind:title="item.title">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  render(component, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );

  data.array.push({ title: 'Navigate to Alibaba', site: 'alibaba' });
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><div><a href="www.google.com" title="Navigate to Alibaba">Navigate to alibaba</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );

  data.array.splice(1, 1);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><div><a href="www.google.com" title="Navigate to Alibaba">Navigate to alibaba</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
});

test('render template with v-for directive along with track-by that reacts to data change', () => {
  const data = {
    array: [
      { title: 'Navigate to Google', site: 'Google' },
      { title: 'Navigate to Microsoft', site: 'Microsoft' },
      { title: 'Navigate to Apple', site: 'Apple' },
    ],
    something: 'Vue',
    text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
  };

  const component = () => {
    useData(data);

    return `
      <div class="root">
        <span>Search for {{something}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  render(component, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );

  data.array.push({ title: 'Navigate to Alibaba', site: 'alibaba' });
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><div><a href="www.google.com" title="Navigate to Alibaba">Navigate to alibaba</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );

  data.array.splice(1, 1);
  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><div><a href="www.google.com" title="Navigate to Alibaba">Navigate to alibaba</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );
});

test('render template with v-on directive to bind event', () => {
  const component = () => {
    useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
      something: 'Vue',
      text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
    });

    useMethods({
      onClick: jest.fn((event) => event),
    });

    return `
      <div class="root" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  const { componentNode } = render(component, document.body);

  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );

  expect(componentNode._unsubsriptionEvents).toHaveLength(4);
});
