import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import observe from './observe';

let rootComponentNodeRef = null;

const render = (componentNode, container) => {
  const {
    template = '',
    data = {},
    methods = {},
    components = {},
    _unsubsriptionEvents = [],
  } = componentNode;

  observe(data);
  const directiveQueue = Queue();
  const htmlParseStack = Stack();

  const { rootRef } = parse(
    template,
    htmlParseStack,
    directiveQueue,
    _unsubsriptionEvents,
    data,
    methods,
    components
  );

  directiveQueue.getItems().forEach((directive) => directive.handle(data));

  if (container) {
    (typeof container === 'string'
      ? document.querySelector(container)
      : container
    ).append(rootRef);

    rootComponentNodeRef = componentNode;
  }

  return { rootRef };
};

export default render;

export { rootComponentNodeRef };
