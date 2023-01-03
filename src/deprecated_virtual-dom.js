import { createParser } from './template-parser';

const createElement = ({ tag, attributes }) => ({ tag, attributes, children: [] });

const linkParentChild = (parentRef, childRef) => parentRef.children.push(childRef);

const virtualDomParser = createParser(createElement, linkParentChild);

export {
  virtualDomParser,
}
