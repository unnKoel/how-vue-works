/* eslint-disable no-undef */
import observe from "../src/observe";

test('test wather\'s effect for only single layer of data', () => {
  const data = { name: 'addy' };
  observe(data);

  expect(data.name).toStrictEqual({
    value: 'addy',
    watchers: [],
  });

  data.name.watchers.push((data) => {
    expect(data).toBe('YanJunZhou');
  });

  data.name = 'YanJunZhou';
  expect(data.name.value).toBe('YanJunZhou');
});

test('test wather\'s effect for multiple layers of data', () => {
  const data = { person: { name: 'addy', tech: 'vue' } };
  observe(data);

  expect(data.person.name).toStrictEqual({
    value: 'addy',
    watchers: [],
  });

  expect(data.person.tech).toStrictEqual({
    value: 'vue',
    watchers: [],
  });

  data.person.name.watchers.push((data) => {
    expect(data).toBe('YanJunZhou');
  });

  data.person.name = 'YanJunZhou';
  expect(data.person.name.value).toBe('YanJunZhou');
});
