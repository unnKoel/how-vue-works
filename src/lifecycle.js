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
};

const deconstruct = (componentNodeRef) => {
  unsubsriptionEvents(componentNodeRef);
  executeLifeCycleBeforeUnmounted(componentNodeRef);
};

const destoryComponent = (componentNodeRef) => {
  deconstruct(componentNodeRef);
  const parentComponentNodeRef = componentNodeRef._parent;
  parentComponentNodeRef?._children.removeElement(componentNodeRef);
};

const destoryChildComponentTree = (componentNodeRef) => {
  const { _children } = componentNodeRef;
  _children.forEach((child) => {
    destoryChildComponentTree(child);
    deconstruct(child);
  });

  delete componentNodeRef._children;
};

export {
  executeLifeCycleDidMounted,
  executeLifeCycleBeforeUnmounted,
  destoryComponent,
  destoryChildComponentTree,
  unsubsriptionEvents,
};
