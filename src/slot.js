import { parse } from './template-parser';
import Stack from './stack';
import Queue from './queue';

const SLOT_TAG_NAME = 'slot';

const Slot = (data, curComponentNodeRef, componentStack) => {
  const wrapperElement = document.createElement('div');
  const directiveQueue = Queue();
  let templateNodes = [];

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

    templateNodes = Array.from(parsedRootRef.childNodes);
    directiveQueue.getItems().forEach((directive) => directive.handle(data));

    return { slotTemplateEndIndex: index };
  };

  const _getSlotName = (element) => element.attributes['name']?.value;

  const _hasSlotName = (element, slotName) => element.attributes['slot']?.value === slotName;

  const parseSlotTag = (element) => {
    if (element.nodeName.toLowerCase() !== SLOT_TAG_NAME) return element;
    const slotName = _getSlotName(element);
    if (slotName) {
      return templateNodes.filter((node) => _hasSlotName(node, slotName));
    }

    return templateNodes.filter((node) => _hasSlotName(node, undefined));
  };

  return {
    parseTemplate,
    parseSlotTag,
  };
};

export default Slot;
