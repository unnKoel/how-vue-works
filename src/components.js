import { VBindDirective } from './directives';
import { DIRECTIVES } from './render';
import { get } from 'lodash';

const globalComponents = {};
let curComponentNodeRef = null;

const registerComponent = (tag, component) => {
  globalComponents[tag] = component;
};

const createComponent = (component) => {
  const componentNode = Object.create(Object.prototype);
  curComponentNodeRef = componentNode;
  const template = component();
  componentNode.template = template;
  componentNode.component = component;
  componentNode._unsubsriptionEvents = [];

  return componentNode;
};

const getComponent = (localEnrolledIncomponents = {}, tag) => {
  let component = localEnrolledIncomponents[tag];
  if (component) return component;

  component = globalComponents[tag];
  return component;
};

const getDynamicProps = (attributes, data) => {
  const vBindAttributes = VBindDirective.getVBindAttributes(attributes);

  return vBindAttributes.reduce((acc, { attributeKey, path }) => {
    acc[attributeKey] = get(data, path);
    return acc;
  }, {});
};

const getStaticProps = (attributes) => {
  const staticProps = {};
  for (let attrName in attributes) {
    if (!DIRECTIVES.some((directive) => new RegExp(directive).test(attrName))) {
      staticProps[attrName] = attributes[attrName];
    }
  }

  return staticProps;
};

export {
  curComponentNodeRef,
  getComponent,
  createComponent,
  registerComponent,
  getDynamicProps,
  getStaticProps,
};
