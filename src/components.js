const globalComponents = {};
let curCompoentNodeRef = null;

const RegisterComponent = (tag, component) => {
  globalComponents[tag] = component;
};

const createComponent = (component) => {
  const componentNode = Object.create(Object.prototype);
  const parentComponentNode = curCompoentNodeRef;
  curCompoentNodeRef = componentNode;
  const template = component();
  componentNode.template = template;
  componentNode.__unsubsriptionEvents = [];

  const { _childRefs } = parentComponentNode;
  if (!_childRefs) {
    parentComponentNode._children = [];
  }
  parentComponentNode._children.push(componentNode);
  componentNode._parent = parentComponentNode;

  return componentNode;
};

const getComponent = (localEnrolledIncomponents = {}, tag) => {
  let component = localEnrolledIncomponents[tag];
  if (component) return component;

  component = globalComponents[tag];
  return component;
};

export { curCompoentNodeRef, getComponent, createComponent, RegisterComponent };
