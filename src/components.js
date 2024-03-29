import { VBindDirective } from './directives';
import { DIRECTIVES } from './template-parser';
import LinkedList from './linked-list';
import { assign } from './observe';
import { camelCase } from 'lodash';
import { createOn, createEmit, createBroadcast, createDispatch } from './events';

const DIRECTIVES_SUPPORTED = ['v-on'];

const globalComponents = {};
let curComponentNodeRef = null;

const registerComponent = (tag, component) => {
  globalComponents[tag] = component;
};

const createComponent = (component = () => {}, slot) => {
  const componentNode = Object.create(Object.prototype);
  curComponentNodeRef = componentNode;
  componentNode.component = component;

  createOn(componentNode);
  createEmit(componentNode);
  createBroadcast(componentNode);
  createDispatch(componentNode);

  componentNode._unsubsriptionEvents = [];
  componentNode._subscribeEvents = [];
  componentNode._parent = null;
  componentNode._children = LinkedList();
  componentNode.$el = null;
  componentNode.data = {};
  componentNode.methods = {};
  componentNode.events = {};
  componentNode.components = {};
  componentNode._propsDeclaration = [];
  componentNode._mounted = false;
  componentNode._eventBind = false;
  componentNode._slot = slot;

  const template = component();
  componentNode.template = template;

  return componentNode;
};

const extendComponent = (component = () => {}, prototype) => {
  const componentNode = createComponent(component);
  componentNode.data = prototype.data;
  componentNode.methods = prototype.methods;
  componentNode.events = prototype.events;
  componentNode.components = prototype.components;
  componentNode._propsDeclaration = prototype._propsDeclaration;

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
    attributeKey = camelCase(attributeKey);
    assign(acc, data, attributeKey, path);
    return acc;
  }, {});
};

const getStaticProps = (attributes) => {
  const staticProps = {};
  for (let attrName in attributes) {
    if (!DIRECTIVES.some((directive) => new RegExp(directive).test(attrName))) {
      staticProps[camelCase(attrName)] = attributes[attrName];
    }
  }

  return staticProps;
};

const filterPropsByDeclaration = (props, declaration) => {
  if (Array.isArray(declaration)) {
    declaration = declaration.reduce((acc, value) => ({ ...acc, [value]: value }), {});
  }

  const filteredProps = {};
  Object.entries(props).forEach(([propKey, propValue]) => {
    const propDeclaration = declaration[propKey];
    if (typeof propDeclaration === 'string') {
      assign(filteredProps, props, propKey);
      return;
    }

    let { type, default: defaultBlock, validator } = propDeclaration ?? {};

    let valid = false;
    if (type) {
      type = Array.isArray(type) ? type : [type];
      valid = type.some((t) => Object.prototype.toString.call(propValue) === `[object ${t.name}]`);
    }
    if (validator) {
      valid = validator(propValue);
    }
    if (valid) {
      assign(filteredProps, props, propKey);
      if (!propValue) {
        filteredProps[propKey] = typeof defaultBlock === 'function' ? defaultBlock() : defaultBlock;
      }
    }
  });

  return filteredProps;
};

const filterDirectiveSupported = (attributes) => {
  const directiveSupported = {};
  for (let attrName in attributes) {
    if (DIRECTIVES_SUPPORTED.some((directive) => new RegExp(directive).test(attrName))) {
      directiveSupported[attrName] = attributes[attrName];
    }
  }

  return directiveSupported;
};

export {
  curComponentNodeRef,
  getComponent,
  createComponent,
  extendComponent,
  registerComponent,
  getDynamicProps,
  getStaticProps,
  filterPropsByDeclaration,
  filterDirectiveSupported,
};
