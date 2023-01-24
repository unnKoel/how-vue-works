import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import { createComponent } from './components';
import { assign } from 'lodash';

let rootComponentNodeRef = null;
const componentStack = Stack();

const render = (component, props = {}, container) => {
  const componentNode = createComponent(component);
  componentStack.push(componentNode);
  const { dynamicProps = {}, staticProps = {} } = props;

  componentNode.staticProps = staticProps;

  const {
    template = '',
    data = {},
    methods = {},
    components = {},
    _unsubsriptionEvents = [],
  } = componentNode;

  assign(data, dynamicProps, data);

  const directiveQueue = Queue();
  const htmlParseStack = Stack();

  const { rootRef } = parse(
    template,
    htmlParseStack,
    componentStack,
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

  return { rootRef, componentNode };
};

export default render;

export { rootComponentNodeRef, componentStack };
