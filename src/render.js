import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';

const htmlParseStack = Stack();
const directiveQueue = Queue();

const render = (template, container, data) => {
  const domTree = parse(template, htmlParseStack, directiveQueue);
  (typeof container === 'string' ? document.querySelector(container) : container).append(domTree);

  while (!directiveQueue.isEmpty()) {
    const directive = directiveQueue.dequeue();
    directive.handle(data);
  }
}

export {
  render,
}
