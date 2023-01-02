/**
 * @jest-environment jsdom
 */
/* eslint-disable no-undef */
import { MustacheDirective, VBindDirective } from '../src/directives';

describe('mustache directive', () => {
  test('check out mustache braces', () => {
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
  test('check out v-bind attributes', () => {
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

  test('set attributes bound at node', ()=> {
    const node = document.createElement('span');
    const attributes = { 'v-bind : title ': 'article.title', 'class': 'bind-example'};

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
