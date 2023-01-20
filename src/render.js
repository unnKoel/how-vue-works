import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import observe from './observe';

const render = (componentNode, container) => {
  const { template = '', data = {}, methods = {} } = componentNode;
  observe(data);
  const directiveQueue = Queue();
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

  directiveQueue.getItems().forEach((directive) => directive.handle(data));

  if (container) {
    (typeof container === 'string'
      ? document.querySelector(container)
      : container
    ).append(rootRef);
  }

  return { rootRef, unsubsriptionEvents };
};

export { render };
