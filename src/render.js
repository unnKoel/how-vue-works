import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import observe from './observe';

const directiveQueue = Queue();

const render = (template, container, data) => {
  data = observe(data);
  const htmlParseStack = Stack();

  const { rootRef } = parse(template, htmlParseStack, directiveQueue, data);
  (typeof container === 'string'
    ? document.querySelector(container)
    : container
  ).append(rootRef);

  directiveQueue.getItems().forEach((directive) => directive.handle(data));
};

export { render, directiveQueue };
