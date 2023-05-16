import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';
import { createComponent, filterPropsByDeclaration } from './components';
import { assign } from './observe';
import { construct } from './lifecycle';

let rootComponentNodeRef = null;
const componentStack = Stack();

const render = (component, { props = {}, slot }, container) => {
  const componentNode = createComponent(component, slot);
  componentStack.push(componentNode);
  let { dynamicProps = {}, staticProps = {} } = props;

  const { template = '', data = {}, _propsDeclaration = {} } = componentNode;

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
    combinedDataAndProps,
    componentNode
  );

  directiveQueue.getItems().forEach((directive) => directive.handle(combinedDataAndProps));

  if (container) {
    (typeof container === 'string' ? document.querySelector(container) : container).append(rootRef);

    rootComponentNodeRef = componentNode;
  }

  componentNode.$el = rootRef;
  construct(componentNode);

  return { rootRef, componentNode };
};

export default render;

export { rootComponentNodeRef, componentStack };
