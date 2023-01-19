import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import observe from './observe';

const directiveQueue = Queue();

const render = (template, container, data, methods) => {
  data = observe(data);
  const htmlParseStack = Stack();
  const unsubsriptionEvents = [];

  const { rootRef } = parse(
    template,
    htmlParseStack,
    directiveQueue,
    unsubsriptionEvents,
    data,
    methods
  );

  (typeof container === 'string'
    ? document.querySelector(container)
    : container
  ).append(rootRef);

  directiveQueue.getItems().forEach((directive) => directive.handle(data));

  return { rootRef, unsubsriptionEvents };
};

export { render, directiveQueue };
