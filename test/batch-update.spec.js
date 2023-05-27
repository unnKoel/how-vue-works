import batchQueue from '../src/batch-update';

test('update perform in a micro task', async () => {
  const firstUpdate = jest.fn();
  const secondUpdate = jest.fn();

  firstUpdate.id = 1;
  secondUpdate.id = 2;

  batchQueue.queueWatcher(firstUpdate);
  batchQueue.queueWatcher(secondUpdate);

  await new Promise(process.nextTick);
  expect(firstUpdate).toHaveBeenCalled();
  expect(secondUpdate).toHaveBeenCalled();
});

test('exclude the update with same id', async () => {
  const firstUpdate = jest.fn();
  const secondUpdate = jest.fn();

  firstUpdate.id = 1;
  secondUpdate.id = 1;

  batchQueue.queueWatcher(firstUpdate);
  batchQueue.queueWatcher(secondUpdate);

  await new Promise(process.nextTick);
  expect(firstUpdate).toHaveBeenCalled();
  expect(secondUpdate).not.toHaveBeenCalled();
});

test('recover state to original when finish batching update', async () => {
  const update = jest.fn();
  update.id = 1;

  batchQueue.queueWatcher(update);
  await new Promise(process.nextTick);
  expect(update).toHaveBeenCalled();

  const anotherUpdate = jest.fn();
  anotherUpdate.id = 1;
  batchQueue.queueWatcher(anotherUpdate);
  expect(update).toHaveBeenCalled();
});
