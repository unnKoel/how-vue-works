/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */

import render, { rootComponentNodeRef } from '../src/render';
import { useComponents } from '../src/hooks';

const getComponentTree = (componentNodeRef, item) => {
  if (!item) item = {};
  item.component = componentNodeRef.component.name;

  const { _children } = componentNodeRef;
  let i = 0;
  for (let child of _children) {
    if (!item.children) item.children = [];
    item.children[i] = {};
    getComponentTree(child, item.children[i]);
    i++;
  }

  return item;
};

test('create component tree in simple case', () => {
  const componentB = () => {
    useComponents({
      'component-c': componentC,
    });

    return `
      <div class="search-box">
        <component-c></component-c>
      </div>`;
  };

  const componentC = () => {
    return `
      <div class="list">1</div>
    `;
  };

  const componentA = () => {
    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <component-b></component-b>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(getComponentTree(rootComponentNodeRef)).toEqual({
    component: 'componentA',
    children: [
      {
        component: 'componentB',
        children: [
          {
            component: 'componentC',
          },
        ],
      },
    ],
  });
});
