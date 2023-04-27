import LinkedList from './linked-list';

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

const destoryComponent = (componentNodeRef, clean = false) => {
  destoryChildComponentTree(componentNodeRef);
  deconstruct(componentNodeRef);

  if (clean) {
    const parentComponentNodeRef = componentNodeRef._parent;
    parentComponentNodeRef?._children.removeElement(componentNodeRef);
  }
};

const destoryChildComponentTree = (
  componentNodeRef,
  deep = 0,
  clean = false
) => {
  const { _children } = componentNodeRef;
  for (let child of _children) {
    destoryChildComponentTree(child, ++deep);
    deconstruct(child);
  }

  if (clean && --deep === 0) {
    componentNodeRef._children = LinkedList();
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
    construct(child);
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
};
