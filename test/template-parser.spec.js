/* eslint-disable no-undef */
import {
  abstractTag,
  abstractAttributes,
  abstractText,
  abstractTagEnd,
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

test('abstract tag end from html template', () => {
  const template =
    '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { tag, index: indexAftertag } = abstractTag(template, 0);
  const { attributes, index: indexAfterAttribute } = abstractAttributes(
    template,
    indexAftertag
  );
  const { text, index } = abstractText(template, indexAfterAttribute);
  const { tagEnd, index: tagEndIndex } = abstractTagEnd(template, index);

  expect(tag).toBe('p');
  expect(text).toBe('progressive framework');
  expect(attributes).toStrictEqual({
    class: 'cat',
    style: 'color: blue; font-size: 17px',
  });
  expect(tagEnd).toBe('p');
  expect(template[tagEndIndex]).toBe('>');
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
