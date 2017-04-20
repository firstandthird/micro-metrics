'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach((done) => {
  setup.withRapptor({}, [{
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
  }], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});
tap.test('can use the /api/tag-values?tag={tagKey} to get a list of distinct keys', (t) => {
  setup.server.inject({
    url: '/api/tag-values?tag=currency',
    method: 'GET'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.length, 3);
    t.end();
  });
});
tap.test('can use the /api/tag-values?type={typeName}&tag={tagKey} to get a list of distinct keys by type', (t) => {
  setup.server.inject({
    url: '/api/tag-values?tag=currency&type=WebPage',
    method: 'GET'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.length, 1);
    t.end();
  });
});
