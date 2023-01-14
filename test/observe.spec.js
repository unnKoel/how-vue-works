/* eslint-disable no-undef */
import observe from '../src/observe';

test('test if watch works in case of change of primitive data', () => {
  const data = { name: 'addy' };

  observe(data);
  data.name.watch((data) => {
    expect(data).toBe('YanJunZhou');
  });

  expect(data.name).toStrictEqual('addy');
  data.name = 'YanJunZhou';
  expect(data.name).toBe('YanJunZhou');
});

test('test if watch works in case of change of sublayer of data', () => {
  const data = { person: { name: 'addy', tech: 'vue' } };

  observe(data);

  expect(data.person.name).toBe('addy');
  expect(data.person.tech).toBe('vue');

  data.person.name.watch((data) => {
    expect(data).toBe('YanJunZhou');
  });
  data.person.tech.watch((data) => {
    expect(data).toBe('react');
  });

  data.person.name = 'YanJunZhou';
  expect(data.person.name).toBe('YanJunZhou');
  data.person.tech = 'react';
  expect(data.person.tech).toBe('react');
});

test("test if watch works in case of Array's change", () => {
  const data = {
    persons: [{ name: 'addy', tech: 'vue' }],
    groups: [1, 2, 3],
  };

  observe(data);
  data.persons.watch((data) => {
    expect(data).toStrictEqual([
      { name: 'addy', tech: 'vue' },
      { name: 'addy1', tech: 'react' },
    ]);
  });
  data.groups.watch((data) => {
    expect(data).toStrictEqual([1, 2, 3, 4]);
  });

  const persons = data.persons;
  const groups = data.groups;
  persons.push({ name: 'addy1', tech: 'react' });
  groups.push(4);
  expect(groups).toStrictEqual([1, 2, 3, 4]);
  expect(persons).toStrictEqual([
    { name: 'addy', tech: 'vue' },
    { name: 'addy1', tech: 'react' },
  ]);
});

test("test if watch works in case of Object's change excepts Array", () => {
  const modules = [
    {
      topic: "what's the way of data binding in VUE",
    },
    {
      topic: 'The approach of state management in VUE',
    },
  ];
  const data = {
    course: {
      participant: { name: 'addy', tech: 'vue' },
      modules,
    },
  };

  observe(data);
  const mockModulesWatcher = jest.fn((data) => data);
  const mockParticipantWatcher = jest.fn((data) => data);
  data.course.modules.watch(mockModulesWatcher);
  data.course.participant.watch(mockParticipantWatcher);
  data.course.participant = { name: 'allience', tech: 'react' };
  data.course.participant = { name: 'common', tech: 'react' };

  expect(mockModulesWatcher.mock.calls).toHaveLength(0);
  expect(mockParticipantWatcher.mock.calls).toHaveLength(2);
  expect(mockParticipantWatcher.mock.results[0].value).toStrictEqual({
    name: 'allience',
    tech: 'react',
  });
  expect(mockParticipantWatcher.mock.results[1].value).toStrictEqual({
    name: 'common',
    tech: 'react',
  });
});

describe('Array in watch', () => {
  test("test if watch works in case of Array's change", () => {
    const data = {
      persons: [{ name: 'addy', tech: 'vue' }],
      groups: [1, 2, 3],
    };

    observe(data);
    data.persons.watch((data) => {
      expect(data).toStrictEqual([
        { name: 'addy', tech: 'vue' },
        { name: 'addy1', tech: 'react' },
      ]);
    });
    data.groups.watch((data) => {
      expect(data).toStrictEqual([1, 2, 3, 4]);
    });

    const persons = data.persons;
    const groups = data.groups;
    persons.push({ name: 'addy1', tech: 'react' });
    groups.push(4);
    expect(groups).toStrictEqual([1, 2, 3, 4]);
    expect(persons).toStrictEqual([
      { name: 'addy', tech: 'vue' },
      { name: 'addy1', tech: 'react' },
    ]);
  });

  test('test pop in array', () => {
    const data = {
      groups: [1, 2, 3],
    };

    observe(data);
    const mockWatcher = jest.fn((data) => data);
    data.groups.watch(mockWatcher);
    data.groups.pop();
    expect(mockWatcher.mock.calls).toHaveLength(1);
    expect(mockWatcher.mock.results[0].value).toStrictEqual([1, 2]);
  });

  test('test shift in array', () => {
    const data = {
      groups: [1, 2, 3],
    };

    observe(data);
    const mockWatcher = jest.fn((data) => data);
    data.groups.watch(mockWatcher);
    data.groups.shift();
    expect(mockWatcher.mock.calls).toHaveLength(1);
    expect(mockWatcher.mock.results[0].value).toStrictEqual([2, 3]);
  });

  test('test unshift in array', () => {
    const data = {
      groups: [1, 2, 3],
    };

    observe(data);
    const mockWatcher = jest.fn((data) => data);
    data.groups.watch(mockWatcher);
    data.groups.unshift(0);
    expect(mockWatcher.mock.calls).toHaveLength(1);
    expect(mockWatcher.mock.results[0].value).toStrictEqual([0, 1, 2, 3]);
  });

  test('test splice in array', () => {
    const data = {
      groups: [1, 2, 3],
    };

    observe(data);
    const mockWatcher = jest.fn((data) => data);
    data.groups.watch(mockWatcher);
    data.groups.splice(1, 1, 4);
    expect(mockWatcher.mock.calls).toHaveLength(1);
    expect(mockWatcher.mock.results[0].value).toStrictEqual([1, 4, 3]);
  });

  test('test sort in array', () => {
    const data = {
      groups: [3, 2, 1],
    };

    observe(data);
    const mockWatcher = jest.fn((data) => data);
    data.groups.watch(mockWatcher);
    data.groups.sort();
    expect(mockWatcher.mock.calls).toHaveLength(1);
    expect(mockWatcher.mock.results[0].value).toStrictEqual([1, 2, 3]);
  });

  test('test reverse in array', () => {
    const data = {
      groups: [1, 2, 3],
    };

    observe(data);
    const mockWatcher = jest.fn((data) => data);
    data.groups.watch(mockWatcher);
    data.groups.reverse();
    expect(mockWatcher.mock.calls).toHaveLength(1);
    expect(mockWatcher.mock.results[0].value).toStrictEqual([3, 2, 1]);
  });

  test('test if the new item prepended by unshift has been observed', () => {
    const data = {
      groups: [{ order: 1 }, { order: 2 }, { order: 3 }],
    };

    observe(data);
    const mockWatcher = jest.fn((data) => data);
    data.groups.watch(mockWatcher);
    data.groups.unshift({ order: 0 });
    expect(mockWatcher.mock.calls).toHaveLength(1);
    expect(
      Object.getOwnPropertyDescriptor(data.groups[0], 'order').set
    ).not.toBe(undefined);
    expect(
      Object.getOwnPropertyDescriptor(data.groups[0], 'order').set
    ).toBeInstanceOf(Function);
    expect(
      Object.getOwnPropertyDescriptor(data.groups[0], 'order').get
    ).toBeInstanceOf(Function);
    expect(mockWatcher.mock.results[0].value).toStrictEqual([
      { order: 0 },
      { order: 1 },
      { order: 2 },
      { order: 3 },
    ]);
  });
});
