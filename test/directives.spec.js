/**
 * @jest-environment jsdom
 */
/* eslint-disable no-undef */
import {
  MustacheDirective,
  VBindDirective,
  VIfDirective,
  VForDirective,
  VOnDirective,
} from '../src/directives';
import observe from '../src/observe';
import { createComponent } from '../src/components';
import { useEvents, useMethods } from '../src/hooks';
import { linkParentChildComponent } from '../src/template-parser';
import Stack from '../src/stack';
import { subscribeEvents, unsubsriptionEvents } from '../src/lifecycle';

describe('mustache directive', () => {
  test("check if it's a mustache braces", () => {
    const data = observe({
      name: 'Addy',
      field: 'directive',
    });
    const text = "hello, {{name}}. Welcome to {{ field }}'s world";
    const textNode = document.createTextNode(text);

    const mustacheDirective = MustacheDirective(textNode, text, data);
    const isMustache = mustacheDirective.isMustache();
    expect(isMustache).toBe(true);

    const text2 = 'hello, Welcome to world';
    const textNode2 = document.createTextNode(text2);

    const mustacheDirective2 = MustacheDirective(textNode2, text2, data);
    const isMustache2 = mustacheDirective2.isMustache();
    expect(isMustache2).toBe(false);
  });

  test('test interpolate value in mustache braces', () => {
    const text = "hello, {{ name  }}. Welcome to {{field}}'s world";
    const textNode = document.createTextNode(text);

    const data = observe({
      name: 'Addy',
      field: 'directive',
    });
    const mustacheDirective = MustacheDirective(textNode, text, data);

    mustacheDirective.handle(data);
    expect(textNode.nodeValue).toBe(
      "hello, Addy. Welcome to directive's world"
    );
  });

  test('test template with mustache braces react to data change', () => {
    const text = "hello, {{ name  }}. Welcome to {{field}}'s world";
    const textNode = document.createTextNode(text);

    const data = observe({
      name: 'Addy',
      field: 'directive',
    });
    const mustacheDirective = MustacheDirective(textNode, text, data);

    mustacheDirective.handle(data);
    expect(textNode.nodeValue).toBe(
      "hello, Addy. Welcome to directive's world"
    );

    data.field = 'vue';
    expect(textNode.nodeValue).toBe("hello, Addy. Welcome to vue's world");
    data.name = 'common';
    expect(textNode.nodeValue).toBe("hello, common. Welcome to vue's world");
  });
});

describe('v-bind directive', () => {
  test("check if it's a v-bind directive", () => {
    const node = document.createElement('span');
    const attributes = {
      'v-bind : title ': 'title',
      class: 'bind-example',
      'v-bind:p': 'p',
    };

    const vBindDirective = VBindDirective(node, attributes);
    const isVBind = vBindDirective.isVBind();
    expect(isVBind).toBe(true);
    expect(vBindDirective.vBindAttributes).toStrictEqual([
      {
        attributeKey: 'title',
        path: 'title',
      },
      {
        attributeKey: 'p',
        path: 'p',
      },
    ]);
  });

  test('set attributes bound at node', () => {
    const node = document.createElement('span');
    const attributes = {
      'v-bind : title ': 'article.title',
      class: 'bind-example',
    };

    const vBindDirective = VBindDirective(node, attributes);
    const data = {
      article: {
        title: 'how to create a node',
      },
    };
    vBindDirective.handle(data);
    expect(node.getAttribute('title')).toBe('how to create a node');
  });

  test('test attributes bound react to data change', () => {
    const node = document.createElement('span');
    const attributes = {
      'v-bind : title ': 'article.title',
      class: 'bind-example',
    };
    const data = observe({
      article: {
        title: 'how to create a node',
      },
    });

    const vBindDirective = VBindDirective(node, attributes, data);
    vBindDirective.handle(data);
    expect(node.getAttribute('title')).toBe('how to create a node');
    data.article.title = 'how to create a reactive node to data change';
    expect(node.getAttribute('title')).toBe(
      'how to create a reactive node to data change'
    );
  });
});

describe('v-if directive', () => {
  test("check if it's a v-if directive", () => {
    const vIfRootNode = document.createElement('div');
    const attributes = {
      'v-if': 'show',
    };
    const data = observe({ show: false });
    const vIfDirective = VIfDirective(vIfRootNode, attributes, data, {});
    expect(vIfDirective.isVIf()).toBe(true);
  });

  test('show or hide some element using v-if', () => {
    const parentNode = document.createElement('div');
    const vIfRootNode = document.createElement('div');
    vIfRootNode.setAttribute('class', 'a-is');
    parentNode.appendChild(vIfRootNode);

    const attributes = {
      'v-if': 'show',
    };
    const data = observe({
      show: true,
      directive: 'v-if',
    });

    const componentNode = createComponent();
    const componentStack = Stack();
    const vIfDirective = VIfDirective(
      vIfRootNode,
      attributes,
      data,
      componentNode,
      componentStack
    );

    const template = `<span>hello welcome to {{directive}}</span>`;
    const label = { tag: 'div', vIf: true };

    vIfDirective.parseChildTemplate(template, label);

    vIfDirective.handle(data);
    expect(parentNode.innerHTML).toBe(
      '<div class="a-is"><span>hello welcome to v-if</span></div>'
    );
  });

  test('test v-if template reacts to data change', () => {
    const parentNode = document.createElement('div');
    const vIfRootNode = document.createElement('div');
    vIfRootNode.setAttribute('class', 'a-is');
    parentNode.appendChild(vIfRootNode);

    const attributes = {
      'v-if': 'show',
    };
    const data = observe({
      show: true,
      directive: 'v-if',
    });

    const componentNode = createComponent();
    const componentStack = Stack();
    const vIfDirective = VIfDirective(
      vIfRootNode,
      attributes,
      data,
      componentNode,
      componentStack
    );

    const template = `<span>hello welcome to {{directive}}</span>`;
    const label = { tag: 'div', vIf: true };

    vIfDirective.parseChildTemplate(template, label);

    vIfDirective.handle(data);
    expect(parentNode.innerHTML).toBe(
      '<div class="a-is"><span>hello welcome to v-if</span></div>'
    );
    data.show = false;
    expect(parentNode.innerHTML).toBe('');
    data.show = true;
    data.directive = 'vue-if';
    expect(parentNode.innerHTML).toBe(
      '<div class="a-is"><span>hello welcome to vue-if</span></div>'
    );
  });
});

describe('v-for directive', () => {
  test("check if it's a v-for directive", () => {
    const vForRootNode = document.createElement('div');
    const attributes = {
      'v-for': 'item in array',
    };

    const data = observe([]);
    const componentNode = createComponent();
    const componentStack = Stack();
    const vForDirective = VForDirective(
      vForRootNode,
      attributes,
      data,
      {},
      componentNode,
      componentStack
    );
    expect(vForDirective.isVFor()).toBe(true);
  });

  test('loop over an array to render each item inside it using v-for', () => {
    const parentNode = document.createElement('div');
    const vForRootNode = document.createElement('div');
    parentNode.appendChild(vForRootNode);

    const attributes = {
      'v-for': 'item in array',
    };

    const data = observe({
      array: [
        { name: 'vue', character: 'template' },
        { name: 'react', character: 'virtual dom' },
        { name: 'svelte', character: 'no virtual dom' },
      ],
    });

    const label = { tag: 'div', vFor: true };
    const componentNodeRef = createComponent();
    const componentStack = Stack();
    const vForDirective = VForDirective(
      vForRootNode,
      attributes,
      data,
      label,
      componentNodeRef,
      componentStack
    );

    const template = `<span>Hi,{{item.name}}. your character is {{item.character}}</span>`;

    const { vForPlaceholderRef } = vForDirective.parseChildTemplate(template);
    parentNode.appendChild(vForPlaceholderRef);
    vForDirective.handle(data);

    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,react. your character is virtual dom</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div>'
    );
  });

  test('test v-for template reacts to data change', () => {
    const parentNode = document.createElement('div');
    const vForRootNode = document.createElement('div');
    parentNode.appendChild(vForRootNode);

    const attributes = {
      'v-for': 'item in array',
    };

    const data = observe({
      array: [
        { name: 'vue', character: 'template' },
        { name: 'react', character: 'virtual dom' },
        { name: 'svelte', character: 'no virtual dom' },
      ],
    });

    const label = { tag: 'div', vFor: true };

    const componentNode = createComponent();
    const componentStack = Stack();
    const vForDirective = VForDirective(
      vForRootNode,
      attributes,
      data,
      label,
      componentNode,
      componentStack
    );

    const template = `<span>Hi,{{item.name}}. your character is {{item.character}}</span>`;

    const { vForPlaceholderRef } = vForDirective.parseChildTemplate(template);
    parentNode.appendChild(vForPlaceholderRef);
    vForDirective.handle(data);

    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,react. your character is virtual dom</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory).toHaveLength(3);

    data.array.push({
      name: 'solid.js',
      character: 'react syntax with compliation',
    });
    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,react. your character is virtual dom</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div><div><span>Hi,solid.js. your character is react syntax with compliation</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory).toHaveLength(4);

    data.array.splice(1, 1);
    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div><div><span>Hi,solid.js. your character is react syntax with compliation</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory).toHaveLength(3);
  });

  test('test track-by works with v-for on data changing', () => {
    const parentNode = document.createElement('div');
    const vForRootNode = document.createElement('div');
    parentNode.appendChild(vForRootNode);

    const attributes = {
      'v-for': 'item in array',
      'track-by': 'name',
    };

    const data = observe({
      array: [
        { name: 'vue', character: 'template' },
        { name: 'react', character: 'virtual dom' },
        { name: 'svelte', character: 'no virtual dom' },
      ],
    });

    const label = { tag: 'div', vFor: true };
    const componentNode = createComponent();
    const componentStack = Stack();
    const vForDirective = VForDirective(
      vForRootNode,
      attributes,
      data,
      label,
      componentNode,
      componentStack
    );

    const template = `<span>Hi,{{item.name}}. your character is {{item.character}}</span>`;

    const { vForPlaceholderRef } = vForDirective.parseChildTemplate(template);
    parentNode.appendChild(vForPlaceholderRef);
    vForDirective.handle(data);

    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,react. your character is virtual dom</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory).toHaveLength(3);
    const svelte = vForDirective.vForTemplateParsedArtifactMemory[2];

    data.array.push({
      name: 'solid.js',
      character: 'react syntax with compliation',
    });
    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,react. your character is virtual dom</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div><div><span>Hi,solid.js. your character is react syntax with compliation</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory).toHaveLength(4);
    expect(vForDirective.vForTemplateParsedArtifactMemory[2] === svelte).toBe(
      true
    );
    const solidJs = vForDirective.vForTemplateParsedArtifactMemory[3];

    data.array.splice(1, 1);
    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div><div><span>Hi,solid.js. your character is react syntax with compliation</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory).toHaveLength(3);
    expect(vForDirective.vForTemplateParsedArtifactMemory[1] === svelte).toBe(
      true
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory[2] === solidJs).toBe(
      true
    );

    data.array.push({ name: 'react', character: 'virtual dom' });
    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,svelte. your character is no virtual dom</span></div><div><span>Hi,solid.js. your character is react syntax with compliation</span></div><div><span>Hi,react. your character is virtual dom</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory[1] === svelte).toBe(
      true
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory[2] === solidJs).toBe(
      true
    );

    const react = vForDirective.vForTemplateParsedArtifactMemory[3];
    data.array.splice(1, 2);
    expect(parentNode.innerHTML).toBe(
      '<div><span>Hi,vue. your character is template</span></div><div><span>Hi,react. your character is virtual dom</span></div>'
    );
    expect(vForDirective.vForTemplateParsedArtifactMemory[1] === react).toBe(
      true
    );
  });
});

describe('v-on directive', () => {
  test('no event binding when no v-on diretive on element', () => {
    const targetNode = document.createElement('div');
    const attributes = {};
    const componentNode = createComponent(() => {
      useMethods({
        onClick: jest.fn((event) => event),
      });
    });

    VOnDirective(targetNode, attributes, false, componentNode);
    expect(componentNode.methods.onClick.mock.calls).toHaveLength(0);
    expect(componentNode._unsubsriptionEvents).toHaveLength(0);
  });

  test('event binding on element when v-on diretive on elelent', () => {
    const targetNode = document.createElement('div');
    const onClick = jest.fn((event) => event);
    const attributes = {
      'v-on:click': 'onClick',
    };

    const componentNode = createComponent(() => {
      useMethods({
        onClick,
      });
    });

    VOnDirective(targetNode, attributes, false, componentNode);
    subscribeEvents(componentNode);
    targetNode.dispatchEvent(new Event('click'));
    expect(onClick.mock.calls).toHaveLength(1);
    expect(componentNode._unsubsriptionEvents).toHaveLength(1);

    unsubsriptionEvents(componentNode);
    targetNode.dispatchEvent(new Event('click'));
    expect(onClick.mock.calls).toHaveLength(1);
  });

  test('event binding on element when v-on diretive on component', () => {
    const targetNode = document.createElement('div');
    const mockEventListener = jest.fn((event) => event);
    const parentComponent = createComponent(() => {
      useEvents({
        onClick: mockEventListener,
      });
    });

    const childComponentNode = createComponent();
    linkParentChildComponent(parentComponent, childComponentNode);

    const attributes = {
      'v-on:click': 'onClick',
    };

    VOnDirective(targetNode, attributes, true, parentComponent);
    subscribeEvents(parentComponent);
    childComponentNode.$emit('click');
    expect(mockEventListener.mock.calls).toHaveLength(1);
    expect(parentComponent._unsubsriptionEvents).toHaveLength(1);
    unsubsriptionEvents(parentComponent);
    childComponentNode.$emit('click');
    expect(mockEventListener.mock.calls).toHaveLength(1);
  });
});
