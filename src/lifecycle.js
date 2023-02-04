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

export {
  executeLifeCycleDidMounted,
  executeLifeCycleBeforeUnmounted,
  destoryComponent,
  destoryChildComponentTree,
  unsubsriptionEvents,
};
