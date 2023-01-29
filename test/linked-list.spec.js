/* eslint-disable no-undef */
import LinkedList from '../src/linked-list';

test('whether it is empty', () => {
  const ll = LinkedList();
  expect(ll.isEmpty()).toBe(true);
});

test('add an element', () => {
  const ll = LinkedList();
  ll.add(10);
  expect(ll.sizeOf()).toBe(1);
  expect([...ll]).toEqual([10]);
});

test('add multiple elements', () => {
  const ll = LinkedList();
  ll.add(10);
  ll.add(20);
  ll.add(30);
  ll.add(40);
  ll.add(50);
  expect(ll.sizeOf()).toBe(5);
  expect([...ll]).toEqual([10, 20, 30, 40, 50]);
});

test('remove an element', () => {
  const ll = LinkedList();
  ll.add(10);
  ll.add(20);
  ll.add(30);
  ll.add(40);
  ll.add(50);
  ll.removeElement(30);
  ll.removeElement(40);
  expect([...ll]).toEqual([10, 20, 50]);
});

test('using indexOf to get the index of specified element', () => {
  const ll = LinkedList();
  ll.add(10);
  ll.add(20);
  ll.add(30);
  ll.add(40);
  ll.add(50);
  const index = ll.indexOf(30);
  expect(index).toBe(2);
});

test('insert an element into linkedList with a specified index', () => {
  const ll = LinkedList();
  ll.add(10);
  ll.add(20);
  ll.add(30);
  ll.add(40);
  ll.add(50);
  ll.insertAt(60, 2);
  expect([...ll]).toEqual([10, 20, 60, 30, 40, 50]);
});

test('remove an element by a given index', () => {
  const ll = LinkedList();
  ll.add(10);
  ll.add(20);
  ll.add(30);
  ll.add(40);
  ll.add(50);
  ll.removeFrom(3);
  expect([...ll]).toEqual([10, 20, 30, 50]);
  expect(ll.isEmpty()).toBe(false);
});
