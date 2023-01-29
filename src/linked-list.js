const Node = (initialElement) => {
  const element = initialElement;
  let next = null;

  return {
    element,
    next,
  };
};

const LinkedList = () => {
  let head = null;
  let size = 0;

  // adds an element at the end of list
  const add = (element) => {
    const node = Node(element);

    let current;

    // if list is Empty add the element and make it head
    if (head == null) head = node;
    else {
      current = head;

      while (current.next) {
        current = current.next;
      }

      current.next = node;
    }

    size++;
  };

  // insert element at the position index of the list
  const insertAt = (element, index) => {
    if (index < 0 || index > size)
      throw new RangeError('Please enter a valid index.');

    const node = Node(element);
    let curr, prev;

    curr = head;

    // add the element to the first index
    if (index == 0) {
      node.next = head;
      head = node;
    } else {
      curr = head;
      let it = 0;

      while (it < index) {
        it++;
        prev = curr;
        curr = curr.next;
      }

      node.next = curr;
      prev.next = node;
    }
    size++;
  };

  const elementAt = (index) => {
    if (index < 0 || index > size)
      throw new RangeError('Please enter a valid index.');

    let curr;
    curr = head;

    if (index == 0) {
      return head && head.element;
    }

    let it = 0;
    while (it < index) {
      it++;
      curr = curr.next;
    }

    return curr.element;
  };

  // removes an element from the specified location
  const removeFrom = (index) => {
    if (index < 0 || index >= size)
      throw new RangeError('Please enter a valid index.');
    let curr,
      prev,
      it = 0;
    curr = head;
    prev = curr;

    // deleting first element
    if (index === 0) {
      head = curr.next;
    } else {
      while (it < index) {
        it++;
        prev = curr;
        curr = curr.next;
      }

      prev.next = curr.next;
    }

    size--;
    return curr.element;
  };

  // removes a given element from the list
  const removeElement = (element) => {
    let current = head;
    let prev = null;

    while (current != null) {
      if (current.element === element) {
        if (prev == null) {
          head = current.next;
        } else {
          prev.next = current.next;
        }
        size--;
        return current.element;
      }
      prev = current;
      current = current.next;
    }

    return -1;
  };

  // finds the index of element
  const indexOf = (element) => {
    let count = 0;
    let current = head;

    while (current != null) {
      if (current.element === element) return count;
      count++;
      current = current.next;
    }

    return -1;
  };

  // checks the list for empty
  const isEmpty = () => {
    return size === 0;
  };

  // gives the size of the list
  const sizeOf = () => {
    return size;
  };

  const iterator = () => {
    let curr = head;
    return {
      next() {
        if (curr) {
          const result = { value: curr.element, done: false };
          curr = curr.next;

          return result;
        }

        return { value: undefined, done: true };
      },
    };
  };
  return {
    elementAt,
    add,
    insertAt,
    removeFrom,
    removeElement,
    indexOf,
    isEmpty,
    sizeOf,
    [Symbol.iterator]: iterator,
  };
};

export default LinkedList;
