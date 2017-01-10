'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js');

const twentyMinutes = 1000 * 60 * 20;
const twoDays = 1000 * 60 * 60 * 24 * 2;
const threeHours = 1000 * 60 * 60 * 3;
const current = new Date().getTime();

lab.experiment('type', { timeout: 5000 }, () => {
  lab.beforeEach({ timeout: 5000 }, (done) => {
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
  lab.afterEach({ timeout: 5000 }, (done) => {
    setup.stop(done);
  });
  lab.test('can use the report method to get a list of metrics from the db', { timeout: 5000 }, (done) => {
    setup.server.inject({
      method: 'GET',
      url: '/api/report'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(8);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by hour', { timeout: 5000 }, (done) => {
    code.expect(true).to.equal(true);
    setup.server.inject({
      method: 'GET',
      url: '/api/report?last=3h'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(2);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by day', { timeout: 5000 }, (done) => {
    code.expect(true).to.equal(true);
    setup.server.inject({
      method: 'GET',
      url: '/api/report?last=2d'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(3);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by day and hour', { timeout: 5000 }, (done) => {
    code.expect(true).to.equal(true);
    setup.server.inject({
      method: 'GET',
      url: '/api/report?last=2d1h'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(4);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by hour and day', { timeout: 5000 }, (done) => {
    code.expect(true).to.equal(true);
    setup.server.inject({
      method: 'GET',
      url: '/api/report?last=4h1d'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(3);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by hour and day and minute', { timeout: 5000 }, (done) => {
    code.expect(true).to.equal(true);
    setup.server.inject({
      method: 'GET',
      url: '/api/report?last=25m'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(2);
      done();
    });
  });

  lab.test('can look up a report by type', { timeout: 5000 }, (done) => {
    setup.server.inject({
      method: 'GET',
      url: '/api/report?type=BankAccount'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(5);
      done();
    });
  });
  lab.test('can look up a report by tags', { timeout: 5000 }, (done) => {
    setup.server.inject({
      method: 'GET',
      url: '/api/report?tags=animalVegetableMineral'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(1);
      done();
    });
  });
  lab.test('can look up a report by type and tags', { timeout: 5000 }, (done) => {
    setup.server.inject({
      method: 'GET',
      url: '/api/report?type=StockAccount&tags=currency'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(1);
      done();
    });
  });
});
