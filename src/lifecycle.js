const executeLifeCycleDidMounted = (componentNodeRef) => {
  componentNodeRef._beforeUnmounted =
    componentNodeRef._didMounted && componentNodeRef._didMounted();
};

const executeLifeCycleBeforeUnmounted = (componentNodeRef) => {
  componentNodeRef._beforeUnmounted && componentNodeRef._beforeUnmounted();
};

const unsubsriptionEvents = (componentNodeRef) => {
  const { _unsubsriptionEvents = [] } = componentNodeRef;
  _unsubsriptionEvents.forEach((unsubsriptionEvent) => unsubsriptionEvent());
  componentNodeRef._unsubsriptionEvents = [];
};

const subscribeEvents = (componentNodeRef) => {
  const { _subscribeEvents = [] } = componentNodeRef;
  _subscribeEvents.forEach((subscribeEvents) => subscribeEvents());
};

const deconstruct = (componentNodeRef) => {
  unsubsriptionEvents(componentNodeRef);
  executeLifeCycleBeforeUnmounted(componentNodeRef);
};

const destoryComponent = (componentNodeRef) => {
  destoryChildComponentTree(componentNodeRef);
  deconstruct(componentNodeRef);

  const parentComponentNodeRef = componentNodeRef._parent;
  parentComponentNodeRef?._children.removeElement(componentNodeRef);
};

const destoryChildComponentTree = (componentNodeRef) => {
  const { _children } = componentNodeRef;
  for (let child of _children) {
    destoryChildComponentTree(child);
    deconstruct(child);
  }
};

const construct = (componentNodeRef) => {
  subscribeEvents(componentNodeRef);
  executeLifeCycleDidMounted(componentNodeRef);
};

const activateComponent = (componentNodeRef) => {
  construct(componentNodeRef);

  const { _children } = componentNodeRef;
  for (let child of _children) {
    activateComponent(child);
  }
};

export {
  executeLifeCycleDidMounted,
  executeLifeCycleBeforeUnmounted,
  destoryComponent,
  destoryChildComponentTree,
  unsubsriptionEvents,
  subscribeEvents,
  activateComponent,
  construct,
};
