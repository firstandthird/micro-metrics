'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');
const os = require('os');
const async = require('async');

const twentyMinutes = 1000 * 60 * 20;
const twoDays = 1000 * 60 * 60 * 24 * 2;
const sixtyDays = twoDays * 30;
const threeHours = 1000 * 60 * 60 * 3;
const current = new Date().getTime();

tap.beforeEach(() => setup.withRapptor({}, []));
tap.afterEach(() => setup.stop());

tap.test('can use the report method to get a list of metrics from the db - defaults to hourly', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'StockAccount',
    tags: { currency: 'dollars' },
    value: 142000000,
    data: 'purchasing account',
    userId: 'Montgomery Burns',
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report'
  });
  t.equal(response.statusCode, 200, 'returns HTTP 200');
  t.equal(response.result.count, 1, 'returns the right number of metrics');
  t.end();
});

tap.test('can use the report method to get a list of metrics from the db by hour', async(t) => {
  await setup.server.db.tracks.insertMany([{
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
    createdOn: new Date(current - (twentyMinutes * 2))
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '2d3h',
    createdOn: new Date(current - twoDays - threeHours)
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?last=3h'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 2);
  t.end();
});

tap.test('can use the report method to get a list of metrics from the db by day', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 142000000,
    data: 'liquid Assets only',
    userId: '2d',
    createdOn: new Date(current - twoDays)
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '2d3h',
    createdOn: new Date(current - twoDays - threeHours)
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?last=2d'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 2);
  // verify it didn't return this in csv format:
  t.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  t.end();
});

tap.test('can use the report method to get a list of metrics from the db by day and hour', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 142000000,
    data: 'liquid Assets only',
    userId: '2d',
    createdOn: new Date(current - twoDays)
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '2d3h',
    createdOn: new Date(current - twoDays - threeHours)
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?last=2d1h'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 1);
  t.end();
});

tap.test('can use the report method to get a list of metrics from the db by hour and day', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 142000000,
    data: 'liquid Assets only',
    userId: '2d',
    createdOn: new Date(current - twoDays)
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '2d3h',
    createdOn: new Date(current - twoDays - threeHours)
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '2d3h',
    createdOn: new Date()
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?last=4h1d'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 1);
  t.end();
});

tap.test('can use the report method to get a list of metrics from the db by hour and day and minute', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?last=25m'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 2);
  t.end();
});

tap.test('can look up a report by type', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?type=BankAccount'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 1);
  t.end();
});

tap.test('can look up a report by tags', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?tags=currency'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 1);
  t.end();
});

tap.test('can look up a report by type and tags', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report?type=BankAccount&tags=currency'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 1);
  t.end();
});

tap.test('can look up the count of the items tracked', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '20m',
    createdOn: new Date(current - twentyMinutes)
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report/count'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 3);
  t.end();
});

tap.test('can pass query params to count', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: 'liquid assets only',
    userId: '20m',
    createdOn: new Date(current - twentyMinutes)
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report/count?type=BankAccount'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 2);
  t.end();
});

tap.test('can use the report method to get a list of metrics from the db in csv format', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 142000000,
    data: 'liquid Assets only',
    userId: '2d',
    createdOn: new Date(current - twoDays)
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report.csv'
  });
  t.equal(response.statusCode, 200, 'returns HTTP 200');
  t.equal(typeof response.result, 'string');
  t.equal(response.headers['content-type'], 'application/csv');
  // timestamps will be different, just check top row:
  const contents = response.result.split(os.EOL)[0];
  t.equal(contents, '"type","tags.currency","tagKeys.currency","fields","value","data","userId","createdOn","tags.units"');
  t.equal();
  t.end();
});

tap.test('can use the report method to get an aggregate list of metrics from the db', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report/aggregate'
  });
  t.equal(response.statusCode, 200, 'returns HTTP 200');
  t.equal(typeof response.result, 'object');
  t.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  t.end();
});

tap.test('can use the report method to get an aggregate list of metrics grouped by values for a given tag', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 1234,
    data: '1234',
    createdOn: new Date(current - threeHours),
    userId: '2d'
  },
  {
    type: 'StockAccount',
    tags: { currency: 'dollars' },
    value: 142,
    data: '23566357',
    userId: 'Montgomery Burns',
    createdOn: new Date(current - threeHours),
  },
  {
    type: 'StockAccount',
    tags: { transactionNumber: '1234', currency: 'yen' },
    value: 160,
    data: '78667657',
    createdOn: new Date(current - threeHours),
    userId: 'Montgomery Burns',
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: '2345234',
    createdOn: new Date(current - threeHours),
    userId: '20m'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: '768567',
    createdOn: new Date(current - threeHours),
    userId: '3h'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'euros', units: 'cents' },
    value: 0.15,
    data: '8666345345',
    createdOn: new Date(current - threeHours),
    userId: 'current'
  },
  {
    type: 'Radish',
    tags: { animalVegetableMineral: 'vegetable' },
    value: 1,
    data: 'radishes are a good source of electrolytes and minerals ',
    createdOn: new Date(current - threeHours),
    userId: 'user1234',
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: '6786785676',
    createdOn: new Date(current - threeHours),
    userId: '2d3h'
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report/groupby?groupby=currency'
  });
  t.equal(response.statusCode, 200, 'returns HTTP 200');
  t.equal(typeof response.result, 'object');
  t.equal(response.headers['content-type'], 'application/json; charset=utf-8');
  t.equal(Object.keys(response.result).length, 3);
  t.equal(response.result.dollars[0].max, 142);
  t.equal(response.result.yen[0].max, 1234);
  t.end();
});

tap.test('can use the report method to get an aggregate list of metrics grouped by values for a given tag in csv format', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 5678,
    data: '5678',
    createdOn: new Date(current - (threeHours * 16)),
    userId: '2d'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 1234,
    data: '1234',
    createdOn: new Date(current - threeHours),
    userId: '2d'
  },
  {
    type: 'StockAccount',
    tags: { currency: 'dollars' },
    value: 142,
    data: '23566357',
    userId: 'Montgomery Burns',
    createdOn: new Date(current - threeHours),
  },
  {
    type: 'StockAccount',
    tags: { transactionNumber: '1234', currency: 'yen' },
    value: 160,
    data: '78667657',
    createdOn: new Date(current - threeHours),
    userId: 'Montgomery Burns',
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: '2345234',
    createdOn: new Date(current - threeHours),
    userId: '20m'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: '768567',
    createdOn: new Date(current - threeHours),
    userId: '3h'
  },
  {
    type: 'BankAccount',
    tags: { currency: 'euros', units: 'cents' },
    value: 0.15,
    data: '8666345345',
    createdOn: new Date(current - threeHours),
    userId: 'current'
  },
  {
    type: 'Radish',
    tags: { animalVegetableMineral: 'vegetable' },
    value: 1,
    data: 'radishes are a good source of electrolytes and minerals ',
    createdOn: new Date(current - threeHours),
    userId: 'user1234',
  },
  {
    type: 'BankAccount',
    tags: { currency: 'dollars', units: 'cents' },
    value: 0.15,
    data: '6786785676',
    createdOn: new Date(current - threeHours),
    userId: '2d3h'
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report/groupby.csv?groupby=currency'
  });
  t.equal(response.statusCode, 200, 'returns HTTP 200');
  t.equal(response.headers['content-type'], 'application/csv');
  t.equal(typeof response.result, 'string');
  t.equal(response.result.split(os.EOL)[0], '"Date","Dollars","Euros","Yen"');

  const firstRowTokens = response.result.split(os.EOL)[1].split(',');
  t.equal(typeof firstRowTokens[0], 'string');
  t.equal(parseFloat(firstRowTokens[1]).toFixed(2), '142.45');
  t.equal(firstRowTokens[2], '0.15');
  t.equal(firstRowTokens[3], '1394');

  const secondRowTokens = response.result.split(os.EOL)[2].split(',');
  t.equal(typeof secondRowTokens[0], 'string');
  t.equal(secondRowTokens[1], '0');
  t.equal(secondRowTokens[2], '0');
  t.equal(secondRowTokens[3], '5678');
  t.end();
});

tap.test('can use the report method to get an aggregate list of metrics from the db in csv format', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report/aggregate.csv'
  });
  t.equal(response.statusCode, 200, 'returns HTTP 200');
  t.equal(typeof response.result, 'string');
  t.equal(response.result.split(os.EOL)[0], '"Date","Sum","Avg","Max","Min"');
  t.equal(response.headers['content-type'], 'application/csv');
  t.end();
});

tap.test('can use the embed route to get an aggregate list of metrics from the db in html format', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/embed'
  });
  t.equal(response.statusCode, 200, 'returns HTTP 200');
  t.equal(typeof response.result, 'string');
  t.equal(response.headers['content-type'], 'text/html; charset=utf-8');
  t.end();
});

tap.test('can pass last=0 to unique to override 30 day default', async(t) => {
  await setup.server.db.tracks.insertMany([{
    type: 'BankAccount',
    tags: { currency: 'yen' },
    tagKeys: { currency: 'yen' },
    fields: ['wc', 'strawberry'],
    value: 142000000,
    data: 'liquid Assets only',
    userId: '2d',
    createdOn: new Date(current - sixtyDays)
  },
  {
    type: 'StockAccount',
    tags: { currency: 'dollars' },
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
  }]);
  const response = await setup.server.inject({
    method: 'GET',
    url: '/api/report/unique?unique=tags.currency'
  });
  t.equal(response.statusCode, 200);
  t.equal(response.result.count, 1);
  const response2 = await setup.server.inject({
    method: 'GET',
    url: '/api/report/unique?unique=tags.currency&last=0'
  });
  t.equal(response2.statusCode, 200);
  t.equal(response2.result.count, 2);
  t.end();
});
