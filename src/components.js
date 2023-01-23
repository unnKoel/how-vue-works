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

export {
  curComponentNodeRef,
  getComponent,
  createComponent,
  registerComponent,
};
