/* eslint-disable no-undef */
import { virtualDomParser } from '../src/virtual-dom';

test('parse templete to become an object tree', () => {
  const objectTree = virtualDomParser(`
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
