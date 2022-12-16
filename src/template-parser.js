/**
 * This is a tool to parse html tag and produce vitual dom or a render function
 * which creates real dom structure. 
 */
import Stack from './stack';

const stack = Stack();

const abstractTag = (template, index) => {
  let tag = '';
  let char = '';

  while (char !== ' ' && char !== '>') {
    tag += char;
    char = template.at(index++);
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
    char = template.at(index++);

    if (char === '"') {
      quoteFlag = (++quoteFlag) % 2;
      continue;
    }
    if (char === '=') {
      equalFlag = true;
      continue;
    }
    if ((char === ' ' || char === '>') && quoteFlag === 0) {
      equalFlag = false;
      if (key != '') {
        attributes[key] = value === '' ? true : value;
      }
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
    text += char;
    char = template.at(index++);
  }

  return {
    text,
    index,
  }
}

const parse = (template) => {
  template = template.replace(/\n/g, '');
  console.log('template', template);
  let index = -1;
  let rootRef;

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
        stack.push({ tag, attributes, children: [] });
        rootRef = stack.peek();
      } else {
        // current char is the ending of tag.
        const child = stack.pop();
        rootRef = stack.peek();
        rootRef.children.push(child);
      }
    }

    // text node
    if (char === '>' && template.at(index + 1) !== '<') {
      const { text, index: indexOfText } = abstractText(template, index);
      index = indexOfText;
      rootRef.children.push({
        tag: 'textNode',
        attributes: { text }
      });
    }
  }

  return rootRef;
}

export {
  abstractTag,
  abstractAttributes,
  abstractText,
  parse,
}
