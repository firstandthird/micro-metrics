'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

const twentyMinutes = 1000 * 60 * 20;
const twoDays = 1000 * 60 * 60 * 24 * 2;
const threeHours = 1000 * 60 * 60 * 3;
const current = new Date().getTime();

tap.beforeEach((done) => {
  setup.withRapptor({}, [{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    value: 142000000,
    data: 'liquid Assets only',
    userId: '2d',
    createdOn: new Date(current - twoDays)
  },
  {
    type: 'StockAccount',
    tags: { currency: 'dollars' },
    value: 142000000,
    data: 'purchasing account',
    userId: 'Montgomery Burns',
  },
  {
    type: 'StockAccount',
    tags: { transactionNumber: '1234' },
    value: 142000000,
    data: 'purchasing account',
    userId: 'Montgomery Burns',
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '20m',
    createdOn: new Date(current - twentyMinutes)
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '3h',
    createdOn: new Date(current - threeHours)
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: 'current',
    createdOn: new Date(current)
  },
  {
    type: 'Radish',
    tags: { animalVegetableMineral: 'vegetable' },
    value: 1,
    data: 'radishes are a good source of electrolytes and minerals ',
    userId: 'user1234',
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '2d3h',
    createdOn: new Date(current - twoDays - threeHours)
  }],
  done);
});
tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('can use the report method to get a list of metrics from the db by hour', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?last=3h'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 2);
    t.end();
  });
});
tap.test('can use the report method to get a list of metrics from the db by day', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?last=2d'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 4);
    t.end();
  });
});
tap.test('can use the report method to get a list of metrics from the db by day and hour', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?last=2d1h'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 3);
    t.end();
  });
});
tap.test('can use the report method to get a list of metrics from the db by hour and day', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?last=4h1d'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 2);
    t.end();
  });
});
tap.test('can use the report method to get a list of metrics from the db by hour and day and minute', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?last=25m'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 1);
    t.end();
  });
});

tap.test('can look up a report by type', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?type=BankAccount'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 4);
    t.end();
  });
});
tap.test('can look up a report by tags', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?tags=animalVegetableMineral'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 0);
    t.end();
  });
});
tap.test('can look up a report by type and tags', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report?type=StockAccount&tags=currency'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 0);
    t.end();
  });
});
tap.test('can look up the count of the items tracked', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report/count'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 8);
    t.end();
  });
});
tap.test('can pass query params to count', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report/count?type=BankAccount'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.count, 5);
    t.end();
  });
});

tap.test('can use the report method to get a list of metrics from the db in csv format', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report.csv'
  }, (response) => {
    t.equal(response.statusCode, 200, 'returns HTTP 200');
    t.equal(typeof response.result, 'string');
    console.log(response.result);
    t.equal(response.headers['content-type'], 'application/csv');
    t.end();
  });
});

tap.test('can use the report method to get an aggregate list of metrics from the db in csv format', (t) => {
  setup.server.inject({
    method: 'GET',
    url: '/api/report/aggregate.csv'
  }, (response) => {
    t.equal(response.statusCode, 200, 'returns HTTP 200');
    t.equal(typeof response.result, 'string');
    t.equal(response.headers['content-type'], 'application/csv');
    t.end();
  });
});
