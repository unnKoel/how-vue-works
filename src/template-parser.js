/**
 * This is a tool to parse html tag and produce vitual dom or a render function
 * which creates real dom structure. 
 */
import Stack from './stack';

const stack = Stack();

const abstractTag = (template, index) => {
  if (template.at(index) !== '<') {
    throw new Error("Syntax error: tag should be started with '<'");
  }

  let tag = [];
  let char = '';

  while (char !== ' ' && char !== '>') {
    tag.push(char);
    char = template.at(++index);
  }

  return { tag: tag.join(''), index };
}

const abstractAttributes = (template, index) => {
  const attributes = {};
  let char = template.at(index);
  let key = [];
  let value = [];
  let equalFlag = false;
  let quoteFlag = 0;

  while (char !== '>') {
    char = template.at(++index);

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
      if (key.length) {
        attributes[key.join('')] = value.length ? value.join('') : true;
      }
      key = [];
      value = [];
      continue;
    }
    if (!equalFlag) {
      key.push(char);
    } else {
      value.push(char);
    }
  }

  return {
    attributes,
    index,
  }
}

const abstractText = (template, index) => {
  if (template.at(index) !== '>') {
    throw new Error("Syntax error: text should be after '>'");
  }

  let text = [];
  let char = '';

  while (char !== '<') {
    text.push(char);
    char = template.at(++index);
  }

  return {
    text: text.join(''),
    index,
  }
}

const parse = (template) => {
  template = template.replace(/\n/g, '');
  let index = -1;
  let rootRef;

  let char = '';
  while (char !== undefined) {
    char = template.at(++index);
    if (char === '<') {
      const siblingChar = template.at(index + 1);
      // current char is the begining of tag.
      if (siblingChar !== '/') {
        const { tag, index: indexOfStartTagName } = abstractTag(template, index);
        const { attributes, index: indexOfStartTag } = abstractAttributes(template, indexOfStartTagName);
        index = indexOfStartTag - 1;
        stack.push({ tag, attributes, children: [] });
        rootRef = stack.peek();
      } else {
        // current char is the ending of tag.
        const child = stack.pop();
        index = index + child.tag.length + 2;
        rootRef = stack.peek();
        if (rootRef) {
          rootRef.children.push(child)
        } else {
          rootRef = child;
        }
      }
      // text
    } else if (char === '>' && template.at(index + 1) !== '<') {
      const { text, index: indexOfText } = abstractText(template, index);
      index = indexOfText - 1;
      rootRef.children.push(text);
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
