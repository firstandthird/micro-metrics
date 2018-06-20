'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach(() => setup.withRapptor({}, []));

tap.afterEach(() => setup.stop());

tap.test('can use the get method to get a metric from the db', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    value: 142000000,
    data: 'liquid Assets only',
    userId: 'Montgomery Burns'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: 'Barney'
  },
  {
    type: 'WebPage',
    tags: { accesses: 123 },
    value: 23,
    data: 'validated accesses only',
    userId: 'Barney'
  },
  {
    type: 'Radish',
    tags: { animalVegetableMineral: 'vegetable' },
    value: 1,
    data: 'radishes are a good source of electrolytes and minerals ',
    userId: 'user1234'
  }]);
  const response = await setup.server.inject({
    url: '/api/types',
    method: 'GET'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.results.length, 3);
  t.notEqual(response.result.results.indexOf('BankAccount'), -1);
  t.notEqual(response.result.results.indexOf('Radish'), -1);
  t.end();
});
