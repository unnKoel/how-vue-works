function Queue() {
  let items = [];

  const enqueue = (element) => {
    items.push(element);
  }

  const dequeue = () => {
    return items.shift();
  }

  const peek = () => {
    return items[0];
  }

  const length = () => {
    return items.length - 1;
  }

  const isEmpty = () => {
    return items.length === 0;
  }

  const getItems = () => {
    return items;
  }

  const clear = () => {
    items = [];
  }

  return {
    enqueue,
    dequeue,
    peek,
    length,
    isEmpty,
    getItems,
    clear,
  }
}

export default Queue;
