import { useMethods, useEvents, useData, useComponents, useRef, useEffect } from '../src/hooks';

import { curComponentNodeRef, clearCurComponentNodeRef } from '../src/components';

jest.mock('../src/components', () => {
  const originalModule = jest.requireActual('../src/components');
  let curComponentNodeRef = {};

  const clearCurComponentNodeRef = () => {
    for (const key in curComponentNodeRef) {
      delete curComponentNodeRef[key];
    }
  };

  return {
    __esModule: true,
    ...originalModule,
    clearCurComponentNodeRef,
    curComponentNodeRef,
  };
});

beforeEach(() => {
  clearCurComponentNodeRef();
});

test('test useData', () => {
  useData({
    name: 'addy',
    company: 'epam',
  });

  expect(curComponentNodeRef.data).toEqual({
    name: 'addy',
    company: 'epam',
  });
});

test('test useEvents', () => {
  const onclickMock = jest.fn();
  const onblurMock = jest.fn();

  useEvents({
    onclick: onclickMock,
    onblur: onblurMock,
  });

  expect(curComponentNodeRef.events).toEqual({
    onclick: onclickMock,
    onblur: onblurMock,
  });
});

test('test useEvents throwing an error while offering no function as event handler', () => {
  expect(() =>
    useEvents({
      onclick: jest.fn(),
      onblur: '',
    })
  ).toThrow(Error);
});

test('test useMethods', () => {
  const onclickMock = jest.fn();
  const onblurMock = jest.fn();

  useMethods({
    onclick: onclickMock,
    onblur: onblurMock,
  });

  expect(curComponentNodeRef.methods).toEqual({
    onclick: onclickMock,
    onblur: onblurMock,
  });
});

test('test useMethods throwing an error while offering no function as method', () => {
  expect(() =>
    useMethods({
      onclick: jest.fn(),
      onblur: '',
    })
  ).toThrow(Error);
});

test('test useRef', () => {
  const ref = useRef();
  expect(ref).toEqual({});
});

test('test useComponents', () => {
  const ComponentA = jest.fn();
  const ComponentB = jest.fn();

  useComponents({
    'c-a': ComponentA,
    'c-b': ComponentB,
  });

  expect(curComponentNodeRef.components).toEqual({
    'c-a': ComponentA,
    'c-b': ComponentB,
  });
});

test('test useEffect', () => {
  expect(() => useEffect(1)).toThrow(TypeError);

  const mockEffectCallback = jest.fn();
  useEffect(mockEffectCallback);
  expect(curComponentNodeRef._didMounted).toBe(mockEffectCallback);
});
