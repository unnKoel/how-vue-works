/* eslint-disable no-undef */
import observe from "../src/observe";

test('test wather\'s effect for only single layer of data', () => {
  const data = { name: 'addy' };
  observe(data);

  expect(data.name).toStrictEqual('addy');

  data.name.watchers.push((data) => {
    expect(data).toBe('YanJunZhou');
  });

  data.name = 'YanJunZhou';
  expect(data.name).toBe('YanJunZhou');
});

test('test wather\'s effect for multiple layers of data', () => {
  const data = { person: { name: 'addy', tech: 'vue' } };
  observe(data);

  expect(data.person.name).toBe('addy');

  expect(data.person.tech).toBe('vue');

  data.person.name.watchers.push((data) => {
    expect(data).toBe('YanJunZhou');
  });

  data.person.tech.watchers.push((data) => {
    expect(data).toBe('react');
  });

  data.person.name = 'YanJunZhou';
  expect(data.person.name).toBe('YanJunZhou');
  data.person.tech = 'react';
  expect(data.person.tech).toBe('react');
});

test('test wather\'s effect for array type of data', () => {
  const data = {
    persons: [{ name: 'addy', tech: 'vue' }],
    groups: [1, 2, 3]
  };
  observe(data);

  data.persons.watchers.push((data) => {
    expect(data).toStrictEqual([{ name: 'addy', tech: 'vue' }, { name: 'addy1', tech: 'react' }]);
  });

  data.groups.watchers.push((data) => {
    expect(data).toStrictEqual([1, 2, 3, 4]);
  });

  const persons = data.persons;
  const groups = data.groups;
  persons.push({ name: 'addy1', tech: 'react' });
  groups.push(4);
  expect(groups).toStrictEqual([1, 2, 3, 4]);
  expect(persons).toStrictEqual([{ name: 'addy', tech: 'vue' }, { name: 'addy1', tech: 'react' }]);
});
