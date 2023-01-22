const globalComponents = {};
let curComponentNodeRef = null;

const RegisterComponent = (tag, component) => {
  globalComponents[tag] = component;
};

const createComponent = (component) => {
  const componentNode = Object.create(Object.prototype);
  const parentComponentNode = curComponentNodeRef;
  curComponentNodeRef = componentNode;
  const template = component();
  componentNode.template = template;
  componentNode._unsubsriptionEvents = [];

  if (parentComponentNode) {
    const { _childRefs } = parentComponentNode;
    if (!_childRefs) {
      parentComponentNode._children = [];
    }
    parentComponentNode._children.push(componentNode);
  }

  componentNode._parent = parentComponentNode;

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
  RegisterComponent,
};
