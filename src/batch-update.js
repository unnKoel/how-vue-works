const batchQueue = (() => {
  let watcherId = 0;
  let waiting = false;
  let flushing = false;
  let index = 0;
  let has = {};
  const queue = [];

  const generateWatcherId = () => watcherId++;

  const queueWatcher = (watcher) => {
    const id = watcher.id;
    if (!has[id]) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        let i = queue.length - 1;
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }

      if (!waiting) {
        waiting = true;
        nextTick(flushSchedulerQueue);
      }
    }
  };

  const flushSchedulerQueue = () => {
    if (index > queue.length - 1) {
      queue.length = 0;
      index = 0;
      waiting = false;
      flushing = false;
      return;
    }

    if (index === 0) {
      flushing = true;
    }

    const watcher = queue[index];
    watcher();
    has[watcher.id] = false;
    index++;
    nextTick(flushSchedulerQueue);
  };

  const nextTick = (flushSchedulerQueue) => {
    Promise.resolve()
      .then(flushSchedulerQueue)
      .catch((err) => console.error(err));
  };

  return {
    generateWatcherId,
    queueWatcher,
  };
})();

export default batchQueue;
