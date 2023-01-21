import { curCompoentNodeRef } from './components';
import observe from './observe';

/**
 * data hook to offer data of reative type.
 */
const useData = (data = {}) => {
  curCompoentNodeRef.data = observe(data);
};

/**
 * methods hook to offer functions as event handlers.
 */
const useMethods = (methods = {}) => {
  const methodsBoundComponentNodeRef = Object.keys(methods).reduce(
    (acc, methodName) => {
      const methodFunc = methods[methodName];
      if (typeof methodFunc !== 'function')
        throw new Error('method must be a function');

      acc[methodName] = methodFunc.bind(curCompoentNodeRef);
      return acc;
    },
    {}
  );

  curCompoentNodeRef.methods = methodsBoundComponentNodeRef;
};

/**
 * events hook to offer functions as listeners
 * that respond event fires from child components.
 */
const useEvents = (eventListeners = {}) => {
  const eventListnersBoundComponentNodeRef = Object.keys(eventListeners).reduce(
    (acc, eventName) => {
      const methodFunc = eventListeners[eventName];
      if (typeof methodFunc !== 'function')
        throw new Error('method must be a function');

      acc[eventName] = methodFunc.bind(curCompoentNodeRef);
      return acc;
    },
    {}
  );

  curCompoentNodeRef.events = eventListnersBoundComponentNodeRef;
};

/**
 * components hook used to register component locally.
 */
const useComponents = (components = {}) => {
  curCompoentNodeRef.components = components;
};

export { useMethods, useEvents, useData, useComponents };
