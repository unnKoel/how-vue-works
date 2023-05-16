/* eslint-disable no-undef */
import { extractTag, extractAttributes, extractText, extractTagEnd } from '../src/template-parser';

test('extract tag from html template', () => {
  const template = '<strong>progressive framework</strong>';
  const { tag, index } = extractTag(template, 0);
  expect(tag).toBe('strong');
  expect(index).toBe(7);
});

test('extract attributes from tag', () => {
  const template = '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { tag, index: indexAftertag } = extractTag(template, 0);
  const { attributes } = extractAttributes(template, indexAftertag);

  expect(tag).toBe('p');
  expect(attributes).toStrictEqual({
    class: 'cat',
    style: 'color: blue; font-size: 17px',
  });
});

test('extract text node from html template', () => {
  const template = '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { index: indexAftertag } = extractTag(template, 0);
  const { index: indexAfterAttribute } = extractAttributes(template, indexAftertag);
  const { text } = extractText(template, indexAfterAttribute);
  expect(text).toBe('progressive framework');
});

test('extract tag end from html template', () => {
  const template = '<p class="cat" style="color: blue; font-size: 17px">progressive framework</p>';
  const { tag, index: indexAftertag } = extractTag(template, 0);
  const { attributes, index: indexAfterAttribute } = extractAttributes(template, indexAftertag);
  const { text, index } = extractText(template, indexAfterAttribute);
  const { tagEnd, index: tagEndIndex } = extractTagEnd(template, index);

  expect(tag).toBe('p');
  expect(text).toBe('progressive framework');
  expect(attributes).toStrictEqual({
    class: 'cat',
    style: 'color: blue; font-size: 17px',
  });
  expect(tagEnd).toBe('p');
  expect(template[tagEndIndex]).toBe('>');
});

test('extract text node with spaces at both begining and end', () => {
  const template =
    '<p class="cat" style="color: blue; font-size: 17px">   progressive framework   </p>';
  const { index: indexAftertag } = extractTag(template, 0);
  const { index: indexAfterAttribute } = extractAttributes(template, indexAftertag);
  const { text } = extractText(template, indexAfterAttribute);
  expect(text).toBe('progressive framework');
});

test('extract "br" tag from html template', () => {
  let template = '<br>progressive framework';
  expect(extractTag(template, 0).tag).toBe('br');
  template = '<br />progressive framework';
  expect(extractTag(template, 0).tag).toBe('br');
  template = '<br/>progressive framework';
  expect(extractTag(template, 0).tag).toBe('br');
});
