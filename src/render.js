import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';

const htmlParseStack = Stack();
const directiveQueue = Queue();

const render = (template, container, data) => {
  const { rootRef } = parse(template, htmlParseStack, directiveQueue);
  (typeof container === 'string' ? document.querySelector(container) : container).append(rootRef);

  directiveQueue.getItems().forEach(directive => directive.handle(data));
}

export {
  render,
}
