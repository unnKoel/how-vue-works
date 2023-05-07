/* eslint-disable no-undef */
import {
  executeLifeCycleDidMounted,
  executeLifeCycleBeforeUnmounted,
  unsubsriptionEvents,
  destoryComponent,
  destoryChildComponentTree,
} from '../src/lifecycle';
import { createComponent } from '../src/components';
import { linkParentChildComponent } from '../src/template-parser';

describe('test function executeLifeCycleDidMounted', () => {
  test("for the case that doesn't offer _didMounted lifecycle function through useEffect", () => {
    const componentNodeRef = {};
    executeLifeCycleDidMounted(componentNodeRef);
    expect(componentNodeRef._beforeUnmounted).toBeUndefined();
  });

  test('for the case that offer _didMounted lifecycle function through useEffect', () => {
    const mockBeforeUnmounted = jest.fn();

    const componentNodeRef = {
      _didMounted: jest.fn(() => mockBeforeUnmounted),
    };
    executeLifeCycleDidMounted(componentNodeRef);
    expect(componentNodeRef._didMounted.mock.calls).toHaveLength(1);
    expect(componentNodeRef._beforeUnmounted).toBe(mockBeforeUnmounted);
  });
});

test('test executeLifeCycleBeforeUnmounted', () => {
  const componentNodeRef = {
    _beforeUnmounted: jest.fn(),
  };

  executeLifeCycleBeforeUnmounted(componentNodeRef);
  expect(componentNodeRef._beforeUnmounted.mock.calls).toHaveLength(1);
});

test('test unsubsriptionEvents', () => {
  const componentNodeRef = {
    _unsubsriptionEvents: [jest.fn(), jest.fn()],
  };
  unsubsriptionEvents(componentNodeRef);
  expect(componentNodeRef._unsubsriptionEvents).toHaveLength(0);
});

test('test destory component', () => {
  const parentComponentNode = createComponent();
  const childComponentNode = createComponent();
  const descendantCompnentNode = createComponent();
  const lastCompnentNode = createComponent();

  const mockBeforeUnmounted = jest.fn();
  childComponentNode._beforeUnmounted = mockBeforeUnmounted;
  const mockUnsubscription1 = jest.fn();
  const mockUnsubscription2 = jest.fn();
  childComponentNode._unsubsriptionEvents = [mockUnsubscription1, mockUnsubscription2];

  descendantCompnentNode._beforeUnmounted = mockBeforeUnmounted;
  descendantCompnentNode._unsubsriptionEvents = [mockUnsubscription1, mockUnsubscription2];

  lastCompnentNode._beforeUnmounted = mockBeforeUnmounted;
  lastCompnentNode._unsubsriptionEvents = [mockUnsubscription1, mockUnsubscription2];

  linkParentChildComponent(parentComponentNode, childComponentNode);
  linkParentChildComponent(childComponentNode, descendantCompnentNode);
  linkParentChildComponent(descendantCompnentNode, lastCompnentNode);

  expect(parentComponentNode._children.elementAt(0)).toBe(childComponentNode);
  expect(parentComponentNode._children.sizeOf()).toBe(1);
  destoryComponent(childComponentNode);
  expect(mockBeforeUnmounted.mock.calls).toHaveLength(3);
  expect(mockUnsubscription1.mock.calls).toHaveLength(3);
  expect(mockUnsubscription2.mock.calls).toHaveLength(3);
  expect(parentComponentNode._children.sizeOf()).toBe(0);
  expect(parentComponentNode._children.elementAt(0)).toBe(null);
});

test('test destory the tree of child Component', () => {
  const parentComponentNode = createComponent();
  const childComponentNode = createComponent();
  const descendantCompnentNode = createComponent();
  const lastCompnentNode = createComponent();
  const destoryOrder = [];
  childComponentNode._beforeUnmounted = jest.fn(() => destoryOrder.push(1));
  descendantCompnentNode._beforeUnmounted = jest.fn(() => destoryOrder.push(2));
  lastCompnentNode._beforeUnmounted = jest.fn(() => destoryOrder.push(3));

  linkParentChildComponent(parentComponentNode, childComponentNode);
  linkParentChildComponent(childComponentNode, descendantCompnentNode);
  linkParentChildComponent(descendantCompnentNode, lastCompnentNode);

  destoryChildComponentTree(parentComponentNode);
  expect(childComponentNode._beforeUnmounted.mock.calls).toHaveLength(1);
  expect(descendantCompnentNode._beforeUnmounted.mock.calls).toHaveLength(1);
  expect(lastCompnentNode._beforeUnmounted.mock.calls).toHaveLength(1);
  expect(parentComponentNode._children.sizeOf()).toBe(1);
  expect(childComponentNode._children.sizeOf()).toBe(1);
  expect(descendantCompnentNode._children.sizeOf()).toBe(1);

  expect(destoryOrder).toEqual([3, 2, 1]);
});
