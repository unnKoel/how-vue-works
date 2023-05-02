/**
 * This is a tool to parse html tag and produce vitual dom or a render function
 * which creates real dom structure.
 */
import { MustacheDirective, VBindDirective, VIfDirective, VForDirective, VOnDirective } from './directives';

import { getComponent, getDynamicProps, getStaticProps, filterDirectiveSupported } from './components';
import render from './render';
import { HtmlSytaxError } from './errors';

const DIRECTIVES = ['v-bind', 'v-if', 'v-for', 'v-on', 'v-model', 'track-by'];

const abstractTag = (template, index) => {
  if (template.at(index) !== '<') {
    throw new HtmlSytaxError("tag should be started with '<'");
  }

  const tag = [];
  let char = '';

  // for types such as <a> | <br/> | <a href="">
  while (char !== ' ' && char !== '>' && char !== '/') {
    tag.push(char);
    char = template.at(++index);
  }

  return { tag: tag.join(''), index };
};

const abstractTagEnd = (template, index) => {
  if (template.at(index) !== '<' && template.at(index + 1) !== '/') {
    throw new HtmlSytaxError("tag-end should be started with '/'");
  }

  const tagEnd = [];
  let char = '';
  index++; // skip char '/'
  while (char !== '>') {
    tagEnd.push(char);
    char = template.at(++index);
  }

  return { tagEnd: tagEnd.join(''), index };
};

const abstractAttributes = (template, index) => {
  const attributes = {};
  let char = template.at(index);
  let key = [];
  let value = [];
  let equalFlag = false;
  let quoteFlag = 0;

  while (quoteFlag === 1 || (char !== '>' && char !== '/')) {
    char = template.at(++index);

    if (char === '"') {
      quoteFlag = ++quoteFlag % 2;
      continue;
    }
    if (char === '=') {
      equalFlag = true;
      continue;
    }
    if ((char === ' ' || char === '>' || char === '/') && quoteFlag === 0) {
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
  };
};

const abstractText = (template, index) => {
  if (template.at(index) !== '>') {
    throw new HtmlSytaxError("text should be after '>'");
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
  };
};

const structureTree = (linkParentChild, htmlParseStack, tagEnd) => {
  const { element: child, label } = htmlParseStack.pop();
  const { tag: tagStart } = label;

  if (tagStart !== tagEnd) {
    throw new HtmlSytaxError('The start and end of tag should be same.');
  }

  let { element: parentRef } = htmlParseStack.peek() ?? {};
  if (parentRef) {
    linkParentChild(parentRef, child);
  } else {
    parentRef = child;
  }

  return { parentRef, label };
};

const linkParentChildComponent = (parentComponentNode, componentNode) => {
  if (componentNode._parent === parentComponentNode) return;

  if (parentComponentNode) {
    parentComponentNode._children.add(componentNode);
  }

  componentNode._parent = parentComponentNode;
};

const structureComponentTree = (componentStack, curComponentNodeRef) => {
  let childComponentNode = null;

  while (childComponentNode !== curComponentNodeRef) {
    childComponentNode = componentStack.pop();
    console.log(childComponentNode);
    let parentComponentNode = componentStack.peek();
    // if (childComponentNode === undefined) break;
    if (parentComponentNode) {
      linkParentChildComponent(parentComponentNode, childComponentNode);
    } else {
      parentComponentNode = childComponentNode;
    }
  }
};

const createElement = ({ tag, attributes }) => {
  const element = document.createElement(tag);

  for (let attrName in attributes) {
    if (!DIRECTIVES.some((directive) => new RegExp(directive).test(attrName))) {
      element.setAttribute(attrName, attributes[attrName]);
    }
  }

  return element;
};

const linkParentChild = (parentRef, childRef) => {
  parentRef.append(childRef);
};

/**
 * parse html template.
 * @todo abstract the end mark of tag to validate correctness of html.
 */
const parse = (template = '', htmlParseStack, componentStack, directiveQueue, data = {}, curComponentNodeRef = {}) => {
  const { components: localEnrolledIncomponents = {} } = curComponentNodeRef;

  template = template.replace(/\n/g, '');
  let index = -1;
  let rootRef = htmlParseStack.peek()?.element ?? null;

  let char = '';
  while (char !== undefined) {
    char = template.at(++index);
    if (char === '<') {
      const siblingChar = template.at(index + 1);
      // current char is the begining of tag.
      if (siblingChar !== '/') {
        const { tag, index: indexOfStartTagName } = abstractTag(template, index);
        let { attributes, index: indexOfStartTag } = abstractAttributes(template, indexOfStartTagName);
        index = indexOfStartTag - 1;
        let element = null;
        const component = getComponent(localEnrolledIncomponents, tag);
        if (component) {
          component.tag = tag;
          const allProps = {
            dynamicProps: getDynamicProps(attributes, data),
            staticProps: getStaticProps(attributes),
          };
          const { rootRef } = render(component, allProps);
          element = rootRef;
          attributes = filterDirectiveSupported(attributes);
        } else {
          element = createElement({ tag, attributes });
        }

        if (Object.keys(attributes).length) {
          const vBindDirective = VBindDirective(element, attributes, data, curComponentNodeRef);
          vBindDirective.isVBind() && directiveQueue.enqueue(vBindDirective);

          const vIfDirective = VIfDirective(element, attributes, data, curComponentNodeRef, componentStack);
          if (vIfDirective.isVIf()) {
            const { vIfTemplateEndIndex, vIfTemplateRef } = vIfDirective.parseChildTemplate(
              template.substring(++index),
              {
                tag,
                vIf: true,
              }
            );
            directiveQueue.enqueue(vIfDirective);
            index += vIfTemplateEndIndex;
            element = vIfTemplateRef;
          }

          const vForDirective = VForDirective(
            element,
            attributes,
            data,
            {
              tag,
              vFor: true,
            },
            curComponentNodeRef,
            componentStack
          );
          if (vForDirective.isVFor()) {
            const { vForTemplateEndIndex, vForPlaceholderRef } = vForDirective.parseChildTemplate(
              template.substring(++index)
            );
            directiveQueue.enqueue(vForDirective);
            index += vForTemplateEndIndex;
            element = vForPlaceholderRef;
          }

          VOnDirective(element, attributes, !!component, curComponentNodeRef);
        }

        htmlParseStack.push({ element, label: { tag } });
        rootRef = htmlParseStack.peek().element;
      } else {
        const { tagEnd, index: tagEndIndex } = abstractTagEnd(template, index);
        // current char is the ending of tag.
        const { parentRef, label } = structureTree(linkParentChild, htmlParseStack, tagEnd);
        rootRef = parentRef;

        const component = getComponent(localEnrolledIncomponents, tagEnd);
        if (component || label?.vIf || label?.vFor) {
          structureComponentTree(componentStack, curComponentNodeRef);
        }

        if (label?.vIf || label?.vFor || label?.vItemOfFor) {
          return { rootRef, index: index - 1 };
        }
        index = tagEndIndex - 1;
      }
    } else if (char === '>' && template.at(index + 1) !== '<') {
      // text
      const { text, index: indexOfText } = abstractText(template, index);
      index = indexOfText - 1;
      if (text !== '') {
        const textNode = document.createTextNode(text);
        linkParentChild(rootRef, textNode);
        const mustacheInstance = MustacheDirective(textNode, text, data, curComponentNodeRef);
        mustacheInstance.isMustache() && directiveQueue.enqueue(mustacheInstance);
      }
    } else if (char === '/' && template.at(index + 1) === '>') {
      // <br /> or <br/>
      const { parentRef } = structureTree(linkParentChild, htmlParseStack);
      rootRef = parentRef;
    }
  }

  return { rootRef, index };
};

export { abstractTag, abstractAttributes, abstractText, abstractTagEnd, linkParentChildComponent, parse, DIRECTIVES };
