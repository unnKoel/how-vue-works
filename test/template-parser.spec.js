/* eslint-disable no-undef */
import {
  abstractTag,
  abstractAttributes,
  abstractText,
  parse,
} from '../src/template-parser';

test('abstract tag from html template', () => {
  const template = '<strong>progressive framework</strong>';
  const { tag, index } = abstractTag(template, 0);
  expect(tag).toBe('strong');
  expect(index).toBe(7);
});

test('abstract attributes from tag', () => {
  const template =
    '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { tag, index: indexAftertag } = abstractTag(template, 0);
  const { attributes } = abstractAttributes(template, indexAftertag);

  expect(tag).toBe('p');
  expect(attributes).toStrictEqual({
    class: 'cat',
    style: 'color: blue; font-size: 17px',
  });
});

test('abstract text node from html template', () => {
  const template =
    '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { index: indexAftertag } = abstractTag(template, 0);
  const { index: indexAfterAttribute } = abstractAttributes(
    template,
    indexAftertag
  );
  const { text } = abstractText(template, indexAfterAttribute);
  expect(text).toBe('progressive framework');
});

test('abstract text node with spaces at both begining and end', () => {
  const template =
    '<p class="cat" style="color: blue; font-size: 17px">   progressive framework   </p>';
  const { index: indexAftertag } = abstractTag(template, 0);
  const { index: indexAfterAttribute } = abstractAttributes(
    template,
    indexAftertag
  );
  const { text } = abstractText(template, indexAfterAttribute);
  expect(text).toBe('progressive framework');
});

test('abstract "br" tag from html template', () => {
  let template = '<br>progressive framework';
  expect(abstractTag(template, 0).tag).toBe('br');
  template = '<br />progressive framework';
  expect(abstractTag(template, 0).tag).toBe('br');
  template = '<br/>progressive framework';
  expect(abstractTag(template, 0).tag).toBe('br');
});

test('parse templete to become an object tree', () => {
  const objectTree = parse(`
  <div class="right">
    <div class="block1">
      <div class="block2" id="youth">
        <h2 class="vue">Vue.js <br /> is an progressive framework.</h2>
        <h2 class="vue">Vue.js <br/> is an progressive framework.</h2>
        <h2 class="vue">Vue.js <br/> is an progressive framework.</h2>
      </div>
    </div>
  </div>`);

  expect(objectTree).toStrictEqual({
    tag: 'div',
    attributes: { class: 'right' },
    children: [
      {
        tag: 'div',
        attributes: { class: 'block1' },
        children: [
          {
            tag: 'div',
            attributes: { class: 'block2', id: 'youth' },
            children: [
              {
                tag: 'h2',
                attributes: { class: 'vue' },
                children: [
                  'Vue.js',
                  {
                    tag: 'br',
                    attributes: {},
                    children: [],
                  },
                  'is an progressive framework.'
                ],
              },
              {
                tag: 'h2',
                attributes: { class: 'vue' },
                children: [
                  'Vue.js',
                  {
                    tag: 'br',
                    attributes: {},
                    children: [],
                  },
                  'is an progressive framework.'
                ],
              },
              {
                tag: 'h2',
                attributes: { class: 'vue' },
                children: [
                  'Vue.js',
                  {
                    tag: 'br',
                    attributes: {},
                    children: [],
                  },
                  'is an progressive framework.'
                ],
              }
            ]
          }
        ]
      }
    ],
  });
});
