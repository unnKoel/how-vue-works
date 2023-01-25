import { VBindDirective } from './directives';
import { DIRECTIVES } from './template-parser';
import { assign } from './observe';

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

  return vBindAttributes.reduce((acc, { attributeKey, key }) => {
    assign(acc, data, attributeKey, key);
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

const filterPropsByDeclaration = (props, declaration) => {
  if (Array.isArray(declaration)) {
    declaration = declaration.reduce(
      (acc, value) => ({ ...acc, [value]: value }),
      {}
    );
  }

  const filteredProps = {};
  Object.entries(props).forEach(([propKey, propValue]) => {
    const propDeclaration = declaration[propKey];
    if (typeof propDeclaration === 'string') {
      assign(filteredProps, props, propKey);
      return;
    }

    let { type, default: defaultFunc, validator } = propDeclaration ?? {};

    let valid = false;
    propValue = propValue ?? defaultFunc();

    if (type) {
      type = Array.isArray(type) ? type : [type];
      valid = type.some(
        (t) => Object.prototype.toString.call(propValue) === `[object ${t}]`
      );
    }
    if (validator) {
      valid = validator(propValue);
    }
    if (valid) {
      assign(filteredProps, props, propKey);
      filteredProps[propKey] = propValue;
    }
  });

  return filteredProps;
};

export {
  curComponentNodeRef,
  getComponent,
  createComponent,
  registerComponent,
  getDynamicProps,
  getStaticProps,
  filterPropsByDeclaration,
};
