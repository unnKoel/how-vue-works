const executeLifeCycleDidMounted = (componentNodeRef) => {
  if (!componentNodeRef._mounted) {
    componentNodeRef._beforeUnmounted =
      componentNodeRef._didMounted && componentNodeRef._didMounted();

    componentNodeRef._mounted = true;
  }
};

const executeLifeCycleBeforeUnmounted = (componentNodeRef) => {
  if (componentNodeRef._mounted) {
    componentNodeRef._beforeUnmounted && componentNodeRef._beforeUnmounted();
    componentNodeRef._mounted = false;
  }
};

const unsubsriptionEvents = (componentNodeRef) => {
  if (componentNodeRef._eventBind) {
    const { _unsubsriptionEvents = [] } = componentNodeRef;
    _unsubsriptionEvents.forEach((unsubsriptionEvent) => unsubsriptionEvent());
    componentNodeRef._unsubsriptionEvents = [];
    componentNodeRef._eventBind = false;
  }
};

const subscribeEvents = (componentNodeRef) => {
  if (!componentNodeRef._eventBind) {
    const { _subscribeEvents = [] } = componentNodeRef;
    _subscribeEvents.forEach((subscribeEvents) => subscribeEvents());
    componentNodeRef._eventBind = true;
  }
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
