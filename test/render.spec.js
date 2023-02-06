/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */
import render, { componentStack, rootComponentNodeRef } from '../src/render';
import {
  useComponents,
  useData,
  useEvents,
  useMethods,
  useProps,
  useRef,
} from '../src/hooks';

beforeEach(() => {
  document.body.innerHTML = '';
  while (!componentStack.isEmpty()) {
    componentStack.pop();
  }
});

test('render normal template without directives', () => {
  const component = () => `
    <div class="root">
      <a href="http://www.google.com">Navigate to Google</a>
    </div>`;

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

  render(component, {}, document.body);
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

test('render template with v-for directive working in array contains premitive type', () => {
  const component = () => {
    useData({
      list: [1, 2, 3],
    });

    return `
      <div class="list">
        <ul>
          <li v-for="item in list">{{item}}</li>
        </ul>
      </div>`;
  };

  render(component, {}, document.body);
  expect(document.body.innerHTML).toBe(
    '<div class="list"><ul><li>1</li><li>2</li><li>3</li></ul></div>'
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

  const { componentNode } = render(component, {}, document.body);

  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );

  expect(componentNode._unsubsriptionEvents).toHaveLength(4);
});

test('trigger event on template with v-on directive', () => {
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
      onClick: jest.fn(),
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

  const { componentNode, rootRef } = render(component, {}, document.body);

  expect(document.body.innerHTML).toBe(
    '<div class="root"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div>'
  );

  const event = new Event('click');
  rootRef.dispatchEvent(event);
  expect(componentNode.methods['onClick']).toHaveBeenCalledTimes(1);
  rootRef.querySelectorAll('a[href]').forEach((a) => a.dispatchEvent(event));
  expect(componentNode.methods['onClick']).toHaveBeenCalledTimes(4);
});

test('render template with parent and child components', () => {
  const componentB = () => {
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
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b></component-b>
        <p>{{description}}</p>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    '<div id="root"><h3>what do you want to search?</h3><div class="search-box"><span>Search for Vue</span><div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div><div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div><div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div><p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p></div><p>search for whatever you prefer without any doubt</p></div>'
  );
  expect(rootComponentNodeRef.component).toBe(componentA);
  expect(rootComponentNodeRef._children.elementAt(0).component).toBe(
    componentB
  );
});

test('render template with parent and multiple child components', () => {
  const componentB = () => {
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
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  const componentC = () => {
    useData({
      list: [1, 2, 3],
    });

    return `
      <div class="list">
        <ul>
          <li v-for="item in list">{{item}}</li>
        </ul>
      </div>
    `;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
      'component-c': componentC,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b></component-b>
        <component-c></component-c>
        <p>{{description}}</p>
        <component-c></component-c>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `<div id="root">
      <h3>what do you want to search?</h3>
      <div class="search-box">
        <span>Search for Vue</span>
        <div>
            <a href="www.google.com" title="Navigate to Google">Navigate to Google</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a>
        </div>
        <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
      </div>
      <div class="list">
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>  
      </div>
      <p>search for whatever you prefer without any doubt</p>
      <div class="list">
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>  
      </div>
    </div>`
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
  expect(rootComponentNodeRef.component).toBe(componentA);
  expect(componentStack.items).toHaveLength(1);
  expect(rootComponentNodeRef._children.sizeOf()).toBe(3);
  expect(rootComponentNodeRef._children.elementAt(0).component).toBe(
    componentB
  );
  expect(rootComponentNodeRef._children.elementAt(1).component).toBe(
    componentC
  );
  expect(rootComponentNodeRef._children.elementAt(2).component).toBe(
    componentC
  );
});

test.skip('render template with in-depth descendant components', () => {
  const componentB = () => {
    useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
      something: 'Vue',
      text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
    });

    useComponents({
      'component-c': componentC,
    });

    useMethods({
      onClick: jest.fn((event) => event),
    });

    return `
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
        <component-c></component-c>
      </div>`;
  };

  const componentC = () => {
    useData({
      list: [1, 2, 3],
    });

    return `
      <div class="list">
        <ul>
          <li v-for="item in list">{{item}}</li>
        </ul>
      </div>
    `;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b></component-b>
        <p>{{description}}</p>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
    <div id="root">
      <h3>what do you want to search?</h3>
      <div class="search-box">
        <span>Search for Vue</span>
        <div>
            <a href="www.google.com" title="Navigate to Google">Navigate to Google</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a>
        </div>
        <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
        <div class="list">
          <ul>
            <li>1</li>
            <li>2</li>
            <li>3</li>
          </ul>  
        </div>
      </div>
      <p>search for whatever you prefer without any doubt</p>
    </div>  
    `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );

  expect(rootComponentNodeRef.component).toBe(componentA);
  expect(componentStack.items).toHaveLength(1);
  expect(rootComponentNodeRef._children.sizeOf()).toBe(1);
  expect(rootComponentNodeRef._children.elementAt(0).component).toBe(
    componentB
  );
  expect(
    rootComponentNodeRef._children.elementAt(0)._children.elementAt(0).component
  ).toBe(componentC);
});

test('render template with multiple components while data changes', () => {
  const componentB = () => {
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
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
      </div>`;
  };

  const data = { list: [1, 2, 3] };
  const componentC = () => {
    useData(data);

    return `
      <div class="list">
        <ul>
          <li v-for="item in list">{{item}}</li>
        </ul>
      </div>
    `;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
      'component-c': componentC,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b></component-b>
        <component-c></component-c>
        <p>{{description}}</p>
        <component-c></component-c>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `<div id="root">
      <h3>what do you want to search?</h3>
      <div class="search-box">
        <span>Search for Vue</span>
        <div>
            <a href="www.google.com" title="Navigate to Google">Navigate to Google</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a>
        </div>
        <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
      </div>
      <div class="list">
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>  
      </div>
      <p>search for whatever you prefer without any doubt</p>
      <div class="list">
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
        </ul>  
      </div>
    </div>`
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );

  data.list.push(4);
  expect(document.body.innerHTML).toBe(
    `<div id="root">
      <h3>what do you want to search?</h3>
      <div class="search-box">
        <span>Search for Vue</span>
        <div>
            <a href="www.google.com" title="Navigate to Google">Navigate to Google</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a>
        </div>
        <div>
            <a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a>
        </div>
        <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
      </div>
      <div class="list">
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
        </ul>  
      </div>
      <p>search for whatever you prefer without any doubt</p>
      <div class="list">
        <ul>
          <li>1</li>
          <li>2</li>
          <li>3</li>
          <li>4</li>
        </ul>  
      </div>
    </div>`
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
});

test('render child component with props passed by parent component', () => {
  const componentB = () => {
    useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
      something: 'Vue',
      text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
    });

    useProps(['descriptionDetail', 'static']);

    useMethods({
      onClick: jest.fn((event) => event),
    });

    return `
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <span>{{static}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
        <p>{{descriptionDetail}}</p>
      </div>`;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b static="hi" v-bind:description-detail="description"></component-b>
        <p>{{description}}</p>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
  <div id="root">
    <h3>what do you want to search?</h3>
    <div class="search-box">
      <span>Search for Vue</span>
      <span>hi</span>
      <div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div>
      <div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div>
      <div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div>
      <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
      <p>search for whatever you prefer without any doubt</p>
    </div>
    <p>search for whatever you prefer without any doubt</p>
  </div>
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
});

test('propogate events between parent and child components', () => {
  const componentB = () => {
    const ref = useRef();

    useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
      something: 'Vue',
      text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
    });

    useProps(['descriptionDetail', 'static']);

    useMethods({
      onClick: jest.fn(() => {
        ref.$emit('message', ref.data.something);
      }),
    });

    return `
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <span>{{static}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
        <p>{{descriptionDetail}}</p>
      </div>`;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b static="hi" v-bind:description-detail="description"></component-b>
        <p>{{description}}</p>
      </div>
    `;
  };

  const mockEventReceive = jest.fn((message) => message);

  const componentC = () => {
    const ref = useRef();

    ref.$on('message', mockEventReceive);

    useComponents({
      'component-a': componentA,
    });

    return `
      <div class="c">
        <component-a></component-a>
      </div>
    `;
  };

  const { rootRef } = render(componentC, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
  <div class="c">  
    <div id="root">
      <h3>what do you want to search?</h3>
      <div class="search-box">
        <span>Search for Vue</span>
        <span>hi</span>
        <div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div>
        <div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div>
        <div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div>
        <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
        <p>search for whatever you prefer without any doubt</p>
      </div>
      <p>search for whatever you prefer without any doubt</p>
    </div>
  </div>  
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );

  rootRef.querySelector('.search-box').dispatchEvent(new Event('click'));
  expect(mockEventReceive).toHaveBeenCalledTimes(1);
  expect(mockEventReceive.mock.results[0].value).toBe('Vue');
});

test('propogate events between parent and child components via enrolling by declarative way', () => {
  const componentB = () => {
    const ref = useRef();

    const data = useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
      something: 'Vue',
      text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
    });

    useProps(['descriptionDetail', 'static']);

    useMethods({
      onClick: jest.fn(() => {
        ref.$emit('message', data.something);
      }),
    });

    return `
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <span>{{static}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
        <p>{{descriptionDetail}}</p>
      </div>`;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b static="hi" v-bind:description-detail="description"></component-b>
        <p>{{description}}</p>
      </div>
    `;
  };

  const mockEventReceive = jest.fn((message) => message);

  const componentC = () => {
    useEvents({
      onMessage: mockEventReceive,
    });

    useComponents({
      'component-a': componentA,
    });

    return `
      <div class="c">
        <component-a v-on:message="onMessage"></component-a>
      </div>
    `;
  };

  const { rootRef } = render(componentC, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
  <div class="c">  
    <div id="root">
      <h3>what do you want to search?</h3>
      <div class="search-box">
        <span>Search for Vue</span>
        <span>hi</span>
        <div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div>
        <div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div>
        <div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div>
        <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
        <p>search for whatever you prefer without any doubt</p>
      </div>
      <p>search for whatever you prefer without any doubt</p>
    </div>
  </div>  
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );

  rootRef.querySelector('.search-box').dispatchEvent(new Event('click'));
  expect(mockEventReceive).toHaveBeenCalledTimes(1);
  expect(mockEventReceive.mock.results[0].value).toBe('Vue');
});

test('destruture sub-tree components and execute unmount lifecycle in v-if block', () => {
  const componentB = () => {
    const ref = useRef();

    useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
      something: 'Vue',
      text: 'keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.',
    });

    useProps(['descriptionDetail', 'static']);

    useMethods({
      onClick: jest.fn(() => {
        ref.$emit('message', ref.data.something);
      }),
    });

    return `
      <div class="search-box" v-on:click="onClick">
        <span>Search for {{something}}</span>
        <span>{{static}}</span>
        <div v-for="item in array" track-by="site">
          <a href="www.google.com" v-bind:title="item.title" v-on:click="onClick">Navigate to {{item.site}}</a>
        </div>
        <p>{{text}}</p>
        <p>{{descriptionDetail}}</p>
      </div>`;
  };

  const componentA = () => {
    useData({
      title: 'what do you want to search?',
      description: 'search for whatever you prefer without any doubt',
    });

    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <h3>{{title}}</h3>
        <component-b static="hi" v-bind:description-detail="description"></component-b>
        <p>{{description}}</p>
      </div>
    `;
  };

  const mockEventReceive = jest.fn((message) => message);

  const componentC = () => {
    const data = useData({
      display: true,
    });

    useEvents({
      onMessage: mockEventReceive,
    });

    useComponents({
      'component-a': componentA,
    });

    useMethods({
      hide: () => {
        data.display = false;
      },
    });

    return `
      <div class="c">
        <div v-if="display" v-on:click="hide" id="c-if">
          <component-a v-on:message="onMessage"></component-a>
        </div>
      </div>
    `;
  };

  const { rootRef } = render(componentC, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
  <div class="c"> 
    <div id="c-if">
      <div id="root">
        <h3>what do you want to search?</h3>
        <div class="search-box">
          <span>Search for Vue</span>
          <span>hi</span>
          <div><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></div>
          <div><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></div>
          <div><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></div>
          <p>keep in mind catching and cherishing the subtle and fleeting feeling just right when you achieve something challenges youself.</p>
          <p>search for whatever you prefer without any doubt</p>
        </div>
        <p>search for whatever you prefer without any doubt</p>
      </div>
    </div>
  </div>
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
  expect(
    rootComponentNodeRef._children.elementAt(0)._children.elementAt(0).component
  ).toBe(componentA);
  expect(
    rootComponentNodeRef._children
      .elementAt(0)
      ._children.elementAt(0)
      ._children.elementAt(0).component
  ).toBe(componentB);

  rootRef.querySelector('#c-if').dispatchEvent(new Event('click'));
  expect(document.body.innerHTML).toBe(
    `
  <div class="c">
  </div>
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
  // expect(mockEventReceive).toHaveBeenCalledTimes(1);
  // expect(mockEventReceive.mock.results[0].value).toBe('Vue');
});

test('', () => {});
