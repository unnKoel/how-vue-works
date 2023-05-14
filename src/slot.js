import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';

const Slot = (data, curComponentNodeRef, componentStack) => {
  const wrapperElement = document.createElement('div');
  const directiveQueue = Queue();
  // eslint-disable-next-line no-unused-vars
  let rootRef = null;

  const parseTemplate = (slotTemplate, label) => {
    const htmlParseStack = Stack();
    htmlParseStack.push({ element: wrapperElement, label });
    const { rootRef: parsedRootRef, index } = parse(
      slotTemplate,
      htmlParseStack,
      componentStack,
      directiveQueue,
      data,
      curComponentNodeRef
    );

    rootRef = parsedRootRef;
    return { slotTemplateEndIndex: index };
  };

  const checkoutSlot = () => {};

  return {
    parseTemplate,
    checkoutSlot,
  };
};

export default Slot;
