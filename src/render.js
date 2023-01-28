import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import { createComponent, filterPropsByDeclaration } from './components';
import { assign } from './observe';
import { executeLifeCycleDidMounted } from './lifecycle';

let rootComponentNodeRef = null;
const componentStack = Stack();

const render = (component, props = {}, container) => {
  const componentNode = createComponent(component);
  componentStack.push(componentNode);
  let { dynamicProps = {}, staticProps = {} } = props;

  const {
    template = '',
    data = {},
    methods = {},
    components = {},
    _unsubsriptionEvents = [],
    _propsDeclaration = {},
  } = componentNode;

  dynamicProps = filterPropsByDeclaration(dynamicProps, _propsDeclaration);
  staticProps = filterPropsByDeclaration(staticProps, _propsDeclaration);
  assign(componentNode, staticProps);

  let combinedDataAndProps = assign({}, dynamicProps);
  combinedDataAndProps = assign(combinedDataAndProps, data);

  const directiveQueue = Queue();
  const htmlParseStack = Stack();

  const { rootRef } = parse(
    template,
    htmlParseStack,
    componentStack,
    directiveQueue,
    _unsubsriptionEvents,
    combinedDataAndProps,
    methods,
    components
  );

  directiveQueue
    .getItems()
    .forEach((directive) => directive.handle(combinedDataAndProps));

  if (container) {
    (typeof container === 'string'
      ? document.querySelector(container)
      : container
    ).append(rootRef);

    rootComponentNodeRef = componentNode;
  }

  componentNode.$el = rootRef;
  executeLifeCycleDidMounted(componentNode);

  return { rootRef, componentNode };
};

export default render;

export { rootComponentNodeRef, componentStack };
