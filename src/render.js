import { createParser } from './template-parser';
// const internalDirectives = ['v-bind', 'v-if', 'v-for', 'v-on', 'v-model'];

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

const realDomParser = createParser(createElement, linkParentChild);

const render = (template, container) => {
  const domTree = realDomParser(template);
  (typeof container === 'string' ? document.querySelector(container) : container).append(domTree);
}

export {
  render,
}
