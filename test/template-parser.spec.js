/* eslint-disable no-undef */
import { abstractTag, abstractAttributes, abstractText, parse } from '../src/template-parser';

test('abstract tag from html template', () => {
  const template = '<strong>progressive framework</strong>';
  const { tag, index } = abstractTag(template, 0);
  expect(tag).toBe('strong');
  expect(index).toBe(7);
});


test('abstract attributes from tag', () => {
  const template = '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { tag, index: indexAftertag } = abstractTag(template, 0);
  const { attributes } = abstractAttributes(template, indexAftertag);

  expect(tag).toBe('p');
  expect(attributes).toStrictEqual({ class: 'cat', style: 'color: blue; font-size: 17px' });
});


test('abstract text node from html template', () => {
  const template = '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { index: indexAftertag } = abstractTag(template, 0);
  const { index: indexAfterAttribute } = abstractAttributes(template, indexAftertag);
  const { text } = abstractText(template, indexAfterAttribute);
  expect(text).toBe('progressive framework');
});

test('parse templete to become an object tree', () => {
  const objectTree = parse(`<div class="right"><h2 class="vue">Vue.js</h2></div>`);

  expect(objectTree).toStrictEqual({
    tag: 'div',
    attributes: { class: 'right' },
    children: [
      {
        tag: 'h2',
        attributes: { class: 'vue' },
        children: ['Vue.js']
      }
    ]
  })
});
