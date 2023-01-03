/**
 * This is a tool to parse html tag and produce vitual dom or a render function
 * which creates real dom structure. 
 */
import Queue from './queue';
import Stack from './stack';
import { MustacheDirective, VBindDirective, VIfDirective } from './directives';

const abstractTag = (template, index) => {
  if (template.at(index) !== '<') {
    throw new Error("Syntax error: tag should be started with '<'");
  }

  let tag = [];
  let char = '';

  // for types such as <a> | <br/> | <a href="">
  while (char !== ' ' && char !== '>' && char !== '/') {
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

  while (char !== '>' && char !== '/') {
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

  while (char !== '<' && char !== undefined) {
    text.push(char);
    char = template.at(++index);
  }

  return {
    text: text.join('').trim(),
    index,
  }
}

const structureTree = (linkParentChild, htmlParseStack) => {
  const { element: child, tag: childTag } = htmlParseStack.pop();

  let { element: parentRef } = htmlParseStack.peek() ?? {};
  if (parentRef) {
    linkParentChild(parentRef, child);
    // parentRef.children.push(child)
  } else {
    parentRef = child;
  }

  return { parentRef, childTag };
}

const createElement = ({ tag, attributes }) => {
  const element = document.createElement(tag);

  for (let attrName in attributes) {
    element.setAttribute(attrName, attributes[attrName]);
  }

  return element;
}

const linkParentChild = (parentRef, childRef) => {
  parentRef.append(childRef);
}

const parse = (template, htmlParseStack, directiveQueue) => {
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
        const element = createElement({ tag, attributes });

        const vBindDirective = VBindDirective(element, attributes);
        vBindDirective.isVBind() && directiveQueue.enqueue(vBindDirective);
        const vIfDirective = VIfDirective(element, attributes);
        if (vIfDirective.isVIf()) {
          const vIfTemplateParseStack = Stack();
          const vIfTemplateDirectiveQueue = Queue();

          tag.vIf = true;
          vIfTemplateParseStack.push({ element, tag });
          const { rootRef: vIfTemplateRef, index: vIfTemplateEndIndex } = parse(template.substring(index), vIfTemplateParseStack, vIfTemplateDirectiveQueue);
          vIfDirective.setVIfTemplateDirectiveQueue(vIfTemplateDirectiveQueue);
          vIfDirective.setVIfTemplateRef(vIfTemplateRef);
          directiveQueue.enqueue(vIfDirective);
          index = vIfTemplateEndIndex;
        }

        htmlParseStack.push({ element, tag });
        rootRef = htmlParseStack.peek().element;
      } else {
        // current char is the ending of tag.
        const { parentRef, childTag } = structureTree(linkParentChild);
        index += childTag.length + 1;
        rootRef = parentRef;
        if (childTag.vIf) {
          return { rootRef, index };
        }
      }
    } else if (char === '>' && template.at(index + 1) !== '<') {  // text
      const { text, index: indexOfText } = abstractText(template, index);
      index = indexOfText - 1;
      if (text !== '') {
        const textNode = document.createTextNode(text);
        linkParentChild(rootRef, textNode);
        const mustacheInstance = MustacheDirective(textNode, text);
        mustacheInstance.isMustache() && directiveQueue.enqueue(mustacheInstance);
      }
    } else if (char === '/' && template.at(index + 1) === '>') {  // <br /> or <br/>
      const { parentRef } = structureTree(linkParentChild);
      rootRef = parentRef;
    }
  }

  return { rootRef, index };
}

export {
  abstractTag,
  abstractAttributes,
  abstractText,
  parse,
}
