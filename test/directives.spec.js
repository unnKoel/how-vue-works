/**
 * @jest-environment jsdom
 */
/* eslint-disable no-undef */
import { MustacheDirective, VBindDirective, VIfDirective, VForDirective } from '../src/directives';

describe('mustache directive', () => {
  test('check if it\'s a mustache braces', () => {
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

  test('test interpolate value in mustache braces', () => {
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
});

describe('v-bind directive', () => {
  test('check if it\'s a v-bind directive', () => {
    const node = document.createElement('span');
    const attributes = { 'v-bind : title ': 'title', 'class': 'bind-example', 'v-bind:p': 'p' };

    const vBindDirective = VBindDirective(node, attributes);
    const isVBind = vBindDirective.isVBind();
    expect(isVBind).toBe(true);
    expect(vBindDirective.vBindAttributes).toStrictEqual([{
      attributeKey: 'title',
      path: 'title'
    }, {
      attributeKey: "p",
      path: "p"
    }]);
  });

  test('set attributes bound at node', () => {
    const node = document.createElement('span');
    const attributes = { 'v-bind : title ': 'article.title', 'class': 'bind-example' };

    const vBindDirective = VBindDirective(node, attributes);
    const data = {
      article: {
        title: 'how to create a node',
      }
    }
    vBindDirective.handle(data);
    expect(node.getAttribute('title')).toBe('how to create a node');
  });
});

describe.skip('v-if directive', () => {
  test('check if it\'s a v-if directive', () => {
    const vIfRootNode = document.createElement('div');
    const attributes = {
      'v-if': 'show'
    };

    const vIfDirective = VIfDirective(vIfRootNode, attributes);
    expect(vIfDirective.isVIf()).toBe(true);
  });

  test('show or hide some element using v-if', () => {
    const parentNode = document.createElement('div');
    const vIfRootNode = document.createElement('div');
    vIfRootNode.setAttribute('class', 'a-is')
    parentNode.appendChild(vIfRootNode);

    const attributes = {
      'v-if': 'show',
    };
    const vIfDirective = VIfDirective(vIfRootNode, attributes);

    const template = `<span>hello welcome to {{directive}}</span>`;
    const label = { tag: 'div', vIf: true };
    vIfDirective.parseChildTemplate(template, label);

    const data = {
      show: true,
      directive: 'v-if',
    };
    vIfDirective.handle(data);
    expect(parentNode.innerHTML).toBe('<div class="a-is"><span>hello welcome to v-if</span></div>');
  });
});

describe('v-for directive', () => {
  test('check if it\'s a v-for directive', () => {
    const vForRootNode = document.createElement('div');
    const attributes = {
      'v-for': 'item in array'
    };

    const vForDirective = VForDirective(vForRootNode, attributes);
    expect(vForDirective.isVFor()).toBe(true);
  });

  test('loop over an array to render each item inside it using v-for', () => {
    const parentNode = document.createElement('div');
    const vForRootNode = document.createElement('div');
    parentNode.appendChild(vForRootNode);

    const attributes = {
      'v-for': 'item in array'
    };
    const vForDirective = VForDirective(vForRootNode, attributes);

    const template = `<span>Hi,{{item.name}}. your character is {{item.character}}</span>`;
    const label = { tag: 'div', vFor: true };
    const data = {
      array: [
        { name: 'vue', character: 'template' },
        { name: 'react', character: 'virtual dom' },
        { name: 'svelte', character: 'no virtual dom' }
      ],
    };

    const { lastVForTemplateRef } = vForDirective.parseChildTemplate(template, label, data);
    parentNode.appendChild(lastVForTemplateRef);
    vForDirective.handle(data);

    expect(parentNode.innerHTML).toBe('<div></div><div><span>Hi,vue. your character is template</span></div><div><span>Hi,react. your character is virtual dom</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div>')
  })
});
