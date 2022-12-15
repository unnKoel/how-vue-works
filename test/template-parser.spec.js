/* eslint-disable no-undef */
import { abstractTag, abstractAttributes } from '../src/template-parser';

test('abstract tag from html template', () => {
  const template = '<strong>progressive framework</strong>';
  const { tag, index }= abstractTag(template, 0);
  expect(tag).toBe('strong');
  expect(index).toBe(7);
});


test('abstract attributes from tag', () => {
  const template = 'g>progressive framework</strong>';
  const { attributes, index }= abstractAttributes(template, 0);
  console.log(attributes, index);
});

/**
test('abstract text node from html template', () => {

});

test('', () => {

});

*/