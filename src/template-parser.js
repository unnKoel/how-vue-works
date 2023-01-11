/**
 * This is a tool to parse html tag and produce vitual dom or a render function
 * which creates real dom structure. 
 */
import { MustacheDirective, VBindDirective, VIfDirective, VForDirective } from './directives';

const DIRECTIVES = ['v-bind', 'v-if', 'v-for', 'v-on', 'v-model'];

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
  const { element: child, label } = htmlParseStack.pop();

  let { element: parentRef } = htmlParseStack.peek() ?? {};
  if (parentRef) {
    linkParentChild(parentRef, child);
    // parentRef.children.push(child)
  } else {
    parentRef = child;
  }

  return { parentRef, label };
}

const createElement = ({ tag, attributes }) => {
  const element = document.createElement(tag);

  for (let attrName in attributes) {
    if (!DIRECTIVES.some(directive => new RegExp(directive).test(attrName))) {
      element.setAttribute(attrName, attributes[attrName]);
    }
  }

  return element;
}

const linkParentChild = (parentRef, childRef) => {
  parentRef.append(childRef);
}

const parse = (template, htmlParseStack, directiveQueue, data) => {
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
        let element = createElement({ tag, attributes });

        const vBindDirective = VBindDirective(element, attributes);
        vBindDirective.isVBind() && directiveQueue.enqueue(vBindDirective);

        const vIfDirective = VIfDirective(element, attributes);
        if (vIfDirective.isVIf()) {
          const { vIfTemplateEndIndex, vIfTemplateRef } = vIfDirective.parseChildTemplate(template.substring(++index), { tag, vIf: true }, data);
          directiveQueue.enqueue(vIfDirective);
          index += vIfTemplateEndIndex;
          element = vIfTemplateRef;
        }

        const vForDirective = VForDirective(element, attributes);
        if (vForDirective.isVFor()) {
          const { vForTemplateEndIndex, lastVForTemplateRef } = vForDirective.parseChildTemplate(template.substring(++index), { tag, vFor: true }, data);
          directiveQueue.enqueue(vForDirective);
          index += vForTemplateEndIndex;
          element = lastVForTemplateRef;
        }

        htmlParseStack.push({ element, label: { tag } });
        rootRef = htmlParseStack.peek().element;
      } else {
        // current char is the ending of tag.
        const { parentRef, label } = structureTree(linkParentChild, htmlParseStack);
        rootRef = parentRef;
        if (label?.vIf || label?.vFor) {
          return { rootRef, index: index - 1 };
        }
        index += label?.tag?.length + 1;
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
      const { parentRef } = structureTree(linkParentChild, htmlParseStack);
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
