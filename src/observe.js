/**
 *  create observer for data to watch its change, by defining its set
 *  and get function by `Object.defineProperty`.
 *
 *  @todo how to reuse dom while array has been sorted or reversed.
 */

const ARRAY_REDEFINE_FUNS = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

const attacheWathers = (value, watchers) => {
  if (typeof value === "object") {
    return Object.defineProperty(value, "watch", {
      value: function (watcher) {
        watchers.push(watcher);
      },
      configurable: true,
    });
  }

  const protoType = Object.getPrototypeOf(value);
  return Object.defineProperty(protoType, "watch", {
    value: function (watcher) {
      watchers.push(watcher);
    },
    configurable: true,
  });
};

const wrapperReactiveArray = (value, watchers) => {
  const arrayPrototype = Object.getPrototypeOf(value);
  ARRAY_REDEFINE_FUNS.forEach((funcName) => {
    Object.defineProperty(value, funcName, {
      value: function (...args) {
        if (funcName === "push" || funcName === "unshift") {
          const addedItems = args;
          addedItems.forEach((addedItem) => observe(addedItem));
        }

        const result = arrayPrototype[funcName].bind(value)(...args);
        watchers.forEach((watcher) => watcher(value));
        return result;
      },
      configurable: true,
    });
  });
};

// const convertPrimitiveToObject = (value) => {
//   if(typeof value === 'object') return value;
//   return Object.prototype.valueOf.call(value);
// }

const WatcherWrapper = (initialValue) => {
  const watchers = [];
  let value = initialValue;

  const get = () => {
    attacheWathers(value, watchers);
    if (Array.isArray(value)) {
      wrapperReactiveArray(value, watchers);
    }

    return value;
  };

  const set = (newValue) => {
    if (value !== newValue) {
      value = newValue;
      watchers.forEach((watcher) => watcher(value));
    }
  };

  return {
    get,
    set,
  };
};

const observe = (data = {}) => {
  if (typeof data !== "object") return;

  Object.keys(data).forEach((key) => {
    const value = data[key];

    Object.defineProperty(data, key, WatcherWrapper(value));

    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return value.forEach((item) => observe(item));
      }

      return observe(value);
    }
  });

  return data;
};

export default observe;
