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

const destoryComponent = (componentNodeRef) => {
  unsubsriptionEvents(componentNodeRef);
  executeLifeCycleBeforeUnmounted(componentNodeRef);
};

const destoryChildComponentTree = (componentNodeRef) => {
  const { _children = [] } = componentNodeRef;
  _children.forEach((child) => {
    destoryChildComponentTree(child);
    destoryComponent(child);
  });
};

export {
  executeLifeCycleDidMounted,
  executeLifeCycleBeforeUnmounted,
  destoryComponent,
  destoryChildComponentTree,
};
