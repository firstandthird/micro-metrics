'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach(() => setup.withRapptor({}, []));
tap.afterEach(() => setup.stop());

tap.test('can use the /api/tag-values?tag={tagKey} to get a list of distinct keys', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    value: 'one',
    data: 'liquid Assets only',
    userId: 'Montgomery Burns'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 'two',
    data: 'liquid assets only',
    userId: 'Barney'
  },
  {
    type: 'BankAccount',
    tags: { },
    value: 'blah',
    data: 'stuff',
    userId: 'Barney'
  },
  {
    type: 'WebPage',
    tags: { currency: 'hi', accesses: 123 },
    value: 'two',
    data: 'validated accesses only',
    userId: 'Barney'
  }]);
  const response = await setup.server.inject({
    url: '/api/tag-values?tag=currency',
    method: 'GET'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.length, 3);
  return t.end();
});

tap.test('can use the /api/tag-values?type={typeName}&tag={tagKey} to get a list of distinct keys by type', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    value: 'one',
    data: 'liquid Assets only',
    userId: 'Montgomery Burns'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 'two',
    data: 'liquid assets only',
    userId: 'Barney'
  },
  {
    type: 'BankAccount',
    tags: { },
    value: 'blah',
    data: 'stuff',
    userId: 'Barney'
  },
  {
    type: 'WebPage',
    tags: { currency: 'hi', accesses: 123 },
    value: 'two',
    data: 'validated accesses only',
    userId: 'Barney'
  }]);
  const response = await setup.server.inject({
    url: '/api/tag-values?tag=currency&type=WebPage',
    method: 'GET'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.length, 1);
  return t.end();
});
