function Stack() {
  const items = [];

  const push = (element) => {
    items.push(element);
  }

  const pop = () => {
    return items.pop();
  }

  const isEmpty = () => {
    return items.length === 0;
  }

  const peek = () => {
    return items[items.length - 1];
  }

  return {
    push,
    pop,
    isEmpty,
    peek,
  }
}


export default Stack;
