const createOn = (componentNode) => {
  // listen to an event
  const on = (event, eventListener) => {
    if (typeof event !== 'string' || typeof eventListener !== 'function') {
      throw new TypeError(
        'event has to be a string and event handler has to be a function'
      );
    }

    if (!componentNode._events) {
      componentNode._events = {};
    }

    if (!componentNode._events[event]) {
      componentNode._events[event] = [];
    }

    const listeners = componentNode._events[event];
    const has = listeners.find((listener) => listener === eventListener);
    !has && listeners.push(eventListener);
  };

  const off = (event, eventListener) => {
    const listeners = componentNode?._events?.[event];
    const index = listeners?.findIndex(
      (listener) => listener === eventListener
    );
    listeners.splice(index, 1);
  };

  componentNode.$on = on;
  componentNode.$off = off;
  return componentNode;
};

const dispatch = (curComponentNode, event, args) => {
  while (curComponentNode) {
    const { _events = {} } = curComponentNode;
    const eventListeners = _events[event] ?? [];
    for (let eventListener of eventListeners) {
      const returnedValue = eventListener(...args);
      if (returnedValue) return;
    }

    curComponentNode = curComponentNode._parent;
  }
};

const createDispatch = (componentNode) => {
  // trigger an event
  componentNode.$dispatch = (event, ...args) => {
    dispatch(componentNode, event, args);
  };

  return componentNode;
};

const broadcase = (curComponentNode, event, args) => {
  const { _children } = curComponentNode;
  if (_children) {
    for (let child of _children) {
      const { _events = {} } = child;
      const eventListeners = _events[event] ?? [];
      for (let eventListener of eventListeners) {
        const returnedValue = eventListener(...args);
        if (returnedValue) return;
      }

      broadcase(child, event, args);
    }
  }
};

const createBroadcast = (componentNode) => {
  // trigger an event
  componentNode.$broadcast = (event, ...args) => {
    broadcase(componentNode, event, args);
  };

  return componentNode;
};

const createEmit = (componentNode) => {
  // trigger an event
  componentNode.$emit = (event, ...args) => {
    dispatch(componentNode, event, args);
    broadcase(componentNode, event, args);
  };

  return componentNode;
};

export { createOn, createEmit, createBroadcast, createDispatch };
