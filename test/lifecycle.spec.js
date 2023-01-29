/* eslint-disable no-undef */
import {
  executeLifeCycleDidMounted,
  executeLifeCycleBeforeUnmounted,
  unsubsriptionEvents,
  // destoryComponent,
  // destoryChildComponentTree,
} from '../src/lifecycle';

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
  expect(componentNodeRef._unsubsriptionEvents[0].mock.calls).toHaveLength(1);
  expect(componentNodeRef._unsubsriptionEvents[1].mock.calls).toHaveLength(1);
});
