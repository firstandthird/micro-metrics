'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');
const async = require('async');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});
tap.test('can use the tags method to get a list of tags used in the db', (t) => {
  t.notEqual(setup.server, null);
  const payloads = [
    {
      type: 'BankAccount',
      tags: { currency: 'dollars' },
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
      type: 'Radish',
      tags: { animalVegetableMineral: 'vegetable' },
      value: 1,
      data: 'radishes are a good source of electrolytes and minerals ',
      userId: 'user1234'
    }
  ];
  async.each(payloads, (payload, eachDone) => {
    setup.server.inject({
      method: 'POST',
      url: '/api/track',
      payload
    }, (err) => {
      t.notEqual(err);
      eachDone();
    });
  }, (err) => {
    t.equal(err, null);
    setup.server.inject({
      url: '/api/tags',
      method: 'GET'
    }, (response) => {
      t.equal(response.statusCode, 200, 'returns HTTP OK');
      t.equal(typeof response.result, 'object', 'returns an object in response');
      t.equal(response.result.length, 3);
      t.notEqual(response.result.indexOf('currency'), -1);
      t.notEqual(response.result.indexOf('units'), -1);
      t.end();
    });
  });
});

tap.test('can use the tags method with the optional type parameter', (t) => {
  t.notEqual(setup.server, null);
  const payloads = [
    {
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
      type: 'Radish',
      tags: { animalVegetableMineral: 'vegetable' },
      value: 1,
      data: 'radishes are a good source of electrolytes and minerals ',
      userId: 'user1234'
    }
  ];
  async.each(payloads, (payload, eachDone) => {
    setup.server.inject({
      method: 'POST',
      url: '/api/track',
      payload
    }, (err) => {
      t.notEqual(err);
      eachDone();
    });
  }, (err) => {
    t.equal(err, null);
    setup.server.inject({
      url: '/api/tags?type=BankAccount',
      method: 'GET'
    }, (response) => {
      t.equal(response.statusCode, 200);
      t.equal(typeof response.result, 'object');
      t.equal(response.result.length, 2);
      t.notEqual(response.result.indexOf('currency'), -1, 'added new tags');
      t.notEqual(response.result.indexOf('units'), -1, 'added new tags');
      t.equal(response.result.indexOf('animalVegetableMineral'), -1, 'removed old tag');
      t.end();
    });
  });
});
