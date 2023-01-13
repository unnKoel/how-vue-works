
/**
 *  create observer for data to watch its change, by defining its set 
 *  and get function by `Object.defineProperty`.
 *  
 *  @todo need to support array type.
 */

const attacheWathers = (value, watchers) => {
  const protoType = Object.getPrototypeOf(value);
  protoType.watchers = watchers;
}

const WatcherWrapper = (initialValue) => {
  const watchers = [];
  let value = initialValue;

  const get = () => {
    attacheWathers(value, watchers);
    return value;
  }

  const set = (newValue) => {
    if (value !== newValue) {
      value = newValue;
      watchers.forEach(watcher => watcher(value));
    }
  }

  return {
    get,
    set,
  }
}

const observe = (data = {}) => {
  Object.keys(data).forEach(key => {
    const value = data[key];

    Object.defineProperty(data, key, WatcherWrapper(value));

    if (typeof value === 'object' && value !== null) {
      return observe(value);
    }
  });
};

export default observe;
