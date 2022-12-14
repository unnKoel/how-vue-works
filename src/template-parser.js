/**
 * This is a tool to parse html tag and produce vitual dom or a render function
 * which creates real dom structure. 
 */
import Stack from './stack';

const stack = Stack();

const abstractTag = (template, index) => {
  let tag = '';
  let char = '';

  while (char !== ' ') {
    let char = template.at(++index);
    tag += char;
    index += 1;
  }

  return { tag, index };
}

const abstractAttributes = (template, index) => {
  const attributes = {};
  let char = '';
  let key = '';
  let value = '';
  let equalFlag = false;
  let quoteFlag = 0;

  while (char !== '>') {
    let char = template.at(++index);
    if (char === '"') {
      quoteFlag = ++quoteFlag % 2;
      continue;
    }
    if (char === '=') {
      equalFlag = true;
      continue;
    }
    if (char === ' ' && quoteFlag === 0) {
      equalFlag = false;
      attributes[key] = value === '' ? true : value;
      key = '';
      value = '';
      continue;
    }
    if (!equalFlag) {
      key += char;
    } else {
      value += char;
    }
  }

  return {
    attributes,
    index,
  }
}

const abstractText = (template, index) => {
  let text = '';
  let char = '';

  while (char !== '<') {
    let char = template.at(++index);
    text += char;
    index += 1;
  }

  return {
    text,
    index,
  }
}

const parse = (template) => {
  template  = template.replace(/\n/g, '');
  let index = -1;

  let char = '';
  while (char !== undefined) {
    index += 1;
    char = template.at(index);

    if (char === '<') {
      const siblingChar = template.at(index + 1);
      // current char is the begining of tag.
      if (siblingChar !== '/') {
        const { tag, index: indexOfStartTagName } = abstractTag(template, index);
        const { attributes, index: indexOfStartTag } = abstractAttributes(template, indexOfStartTagName);
        index = indexOfStartTag;
        stack.push({ tag, attributes });
      } else {
        // current char is the ending of tag.

      }
    }

    // it's text node
    if(char === '>' && template.at(index + 1)!== '<') {
      const { text, index: indexOfText } = abstractText(template, index);
      index = indexOfText;
    }
  }
}

export {
  parse,
}
