function Queue() {
  const items = [];

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
    return items[items.length - 1];
  }

  const isEmpty = () => {
    return items.length === 0;
  }

  return {
    enqueue,
    dequeue,
    peek,
    length,
    isEmpty,
  }
}

export default Queue;
