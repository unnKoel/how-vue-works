import { createOn, createEmit, createBroadcast, createDispatch } from '../src/events';
import LinkedList from '../src/linked-list';

test('test create event `on` function as event register on component node', () => {
  const componentNode = {};
  createOn(componentNode);
  expect(componentNode.$on).toBeInstanceOf(Function);
  const mockEventHandler = jest.fn((...args) => args);
  componentNode.$on('msg', mockEventHandler);
  expect(componentNode._events['msg']).toHaveLength(1);
  expect(componentNode._events['msg'][0]).toBe(mockEventHandler);
});

describe('test broadcase', () => {
  test('test create broadcast function on component node', () => {
    const componentNode = {};
    createBroadcast(componentNode);
    expect(componentNode.$broadcast).toBeInstanceOf(Function);
  });

  test('broadcast an event that has been enrolled repeatedly', () => {
    const componentNode = {};
    const childComponentNode = {};
    componentNode._children = LinkedList();
    childComponentNode._children = LinkedList();
    componentNode._children.add(childComponentNode);

    createOn(componentNode);
    createBroadcast(componentNode);
    createOn(childComponentNode);
    createBroadcast(childComponentNode);

    const mockEventHandler = jest.fn();
    const mockEventHandler2 = jest.fn();
    childComponentNode.$on('msg', mockEventHandler);
    childComponentNode.$on('msg', mockEventHandler2);

    componentNode.$broadcast('msg', '1', '2');
    expect(mockEventHandler.mock.calls).toHaveLength(1);
    expect(mockEventHandler.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler.mock.calls[0][1]).toBe('2');

    expect(mockEventHandler2.mock.calls).toHaveLength(1);
    expect(mockEventHandler2.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler2.mock.calls[0][1]).toBe('2');
  });

  test('broadcast an event that propagates downward to all descendants', () => {
    const componentNode = {};
    const childComponentNode = {};
    const descendantComponentNode = {};
    componentNode._children = LinkedList();
    componentNode._children.add(childComponentNode);
    childComponentNode._children = LinkedList();
    childComponentNode._children.add(descendantComponentNode);
    descendantComponentNode._children = LinkedList();
    createOn(componentNode);
    createBroadcast(componentNode);
    createOn(childComponentNode);
    createBroadcast(childComponentNode);
    createOn(descendantComponentNode);
    createBroadcast(descendantComponentNode);

    const mockEventHandler = jest.fn();
    const mockEventHandler2 = jest.fn();
    childComponentNode.$on('msg', mockEventHandler);
    descendantComponentNode.$on('msg', mockEventHandler2);

    componentNode.$broadcast('msg', '1', '2');
    expect(mockEventHandler.mock.calls).toHaveLength(1);
    expect(mockEventHandler.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler.mock.calls[0][1]).toBe('2');

    expect(mockEventHandler2.mock.calls).toHaveLength(1);
    expect(mockEventHandler2.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler2.mock.calls[0][1]).toBe('2');
  });

  test('stop propagation when first listener returnes true at broadcasting events that propagates downward to all descendants', () => {
    const componentNode = {};
    const childComponentNode = {};
    const descendantComponentNode = {};
    componentNode._children = LinkedList();
    componentNode._children.add(childComponentNode);
    childComponentNode._children = LinkedList();
    childComponentNode._children.add(descendantComponentNode);
    descendantComponentNode._children = LinkedList();
    createOn(componentNode);
    createBroadcast(componentNode);
    createOn(childComponentNode);
    createBroadcast(childComponentNode);
    createOn(descendantComponentNode);
    createBroadcast(descendantComponentNode);

    const mockEventHandler = jest.fn(() => true);
    const mockEventHandler2 = jest.fn();
    childComponentNode.$on('msg', mockEventHandler);
    descendantComponentNode.$on('msg', mockEventHandler2);

    componentNode.$broadcast('msg', '1', '2');
    expect(mockEventHandler.mock.calls).toHaveLength(1);
    expect(mockEventHandler.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler.mock.calls[0][1]).toBe('2');

    expect(mockEventHandler2.mock.calls).toHaveLength(0);
  });
});

describe('test dispatch', () => {
  test('test create dispatch function on component node', () => {
    const componentNode = {};
    createDispatch(componentNode);
    expect(componentNode.$dispatch).toBeInstanceOf(Function);
  });

  test('dispatch an event that has been enrolled repeatedly', () => {
    const componentNode = {};
    const parentComponentNode = {};
    componentNode._parent = parentComponentNode;

    createOn(componentNode);
    createDispatch(componentNode);
    createOn(parentComponentNode);
    createDispatch(parentComponentNode);

    const mockEventHandler = jest.fn();
    const mockEventHandler2 = jest.fn();
    parentComponentNode.$on('msg', mockEventHandler);
    parentComponentNode.$on('msg', mockEventHandler2);

    componentNode.$dispatch('msg', '1', '2');
    expect(mockEventHandler.mock.calls).toHaveLength(1);
    expect(mockEventHandler.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler.mock.calls[0][1]).toBe('2');

    expect(mockEventHandler2.mock.calls).toHaveLength(1);
    expect(mockEventHandler2.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler2.mock.calls[0][1]).toBe('2');
  });

  test('dispatch an event that propagates upward along the parent chain', () => {
    const componentNode = {};
    const parentComponentNode = {};
    const ascendantComponentNode = {};
    componentNode._parent = parentComponentNode;
    parentComponentNode._parent = ascendantComponentNode;
    createOn(componentNode);
    createDispatch(componentNode);
    createOn(parentComponentNode);
    createDispatch(parentComponentNode);
    createOn(ascendantComponentNode);
    createDispatch(ascendantComponentNode);

    const mockEventHandler = jest.fn();
    const mockEventHandler2 = jest.fn();
    parentComponentNode.$on('msg', mockEventHandler);
    ascendantComponentNode.$on('msg', mockEventHandler2);

    componentNode.$dispatch('msg', '1', '2');
    expect(mockEventHandler.mock.calls).toHaveLength(1);
    expect(mockEventHandler.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler.mock.calls[0][1]).toBe('2');

    expect(mockEventHandler2.mock.calls).toHaveLength(1);
    expect(mockEventHandler2.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler2.mock.calls[0][1]).toBe('2');
  });

  test('stop propagation when first listener returnes true at dispatching events that propagates upward along the parent chain', () => {
    const componentNode = {};
    const parentComponentNode = {};
    const ascendantComponentNode = {};
    componentNode._parent = parentComponentNode;
    parentComponentNode._parent = ascendantComponentNode;
    createOn(componentNode);
    createDispatch(componentNode);
    createOn(parentComponentNode);
    createDispatch(parentComponentNode);
    createOn(ascendantComponentNode);
    createDispatch(ascendantComponentNode);

    const mockEventHandler = jest.fn(() => true);
    const mockEventHandler2 = jest.fn();
    parentComponentNode.$on('msg', mockEventHandler);
    ascendantComponentNode.$on('msg', mockEventHandler2);

    componentNode.$dispatch('msg', '1', '2');
    expect(mockEventHandler.mock.calls).toHaveLength(1);
    expect(mockEventHandler.mock.calls[0][0]).toBe('1');
    expect(mockEventHandler.mock.calls[0][1]).toBe('2');

    expect(mockEventHandler2.mock.calls).toHaveLength(0);
  });
});

describe('test emit', () => {
  test('test creating emit function on component node', () => {
    const componentNode = {};
    createEmit(componentNode);
    expect(componentNode.$emit).toBeInstanceOf(Function);
  });

  test('test both dispatching and broadcasting an event while emit is invoked', () => {
    const componentNode = {};
    const parentComponentNode = {};
    const childComponentNode = {};
    componentNode._parent = parentComponentNode;
    componentNode._children = LinkedList();
    componentNode._children.add(childComponentNode);
    childComponentNode._children = LinkedList();

    createOn(componentNode);
    createEmit(componentNode);
    createOn(parentComponentNode);
    createEmit(parentComponentNode);
    createOn(childComponentNode);
    createEmit(childComponentNode);

    const mockParentMsgListener = jest.fn();
    const mockChildMsgListener = jest.fn();
    parentComponentNode.$on('msg', mockParentMsgListener);
    childComponentNode.$on('msg', mockChildMsgListener);

    componentNode.$emit('msg', 'y', 'x');
    expect(mockParentMsgListener.mock.calls).toHaveLength(1);
    expect(mockChildMsgListener.mock.calls).toHaveLength(1);
    expect(mockParentMsgListener.mock.calls[0][0]).toBe('y');
    expect(mockParentMsgListener.mock.calls[0][1]).toBe('x');
    expect(mockChildMsgListener.mock.calls[0][0]).toBe('y');
    expect(mockChildMsgListener.mock.calls[0][1]).toBe('x');
  });
});
