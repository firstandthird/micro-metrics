'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js').withRapptor;

const twoDays = 1000 * 60 * 60 * 24 * 2;
const threeHours = 1000 * 60 * 60 * 3;
const current = new Date().getTime();

lab.experiment('type', { timeout: 5000 }, () => {
  let server;
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup({}, (err, result) => {
      if (err) {
        return done(err);
      }
      server = result;
      server.plugins['hapi-mongodb'].db.collection('tracks').drop();
      server.plugins['hapi-mongodb'].db.collection('tracks').insertMany([{
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
      }], () => {
        done();
      });
    });
  });
  lab.afterEach({ timeout: 5000 }, (done) => {
    server.stop(() => {
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db', { timeout: 5000 }, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(7);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by hour', { timeout: 5000 }, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report/3h'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(1);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by day', { timeout: 5000 }, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report/2d'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(2);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by day and hour', { timeout: 5000 }, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report/2d1h'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(3);
      done();
    });
  });
  lab.test('can use the report method to get a list of metrics from the db by hour and day', { timeout: 5000 }, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report/4h1d'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(2);
      done();
    });
  });
  lab.test('can look up a report by type', {timeout: 5000}, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report?type=BankAccount'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(4);
      done();
    });
  });
  lab.test('can look up a report by tags', {timeout: 5000}, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report?tags=animalVegetableMineral'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(1);
      done();
    });
  });
  lab.test('can look up a report by type and tags', {timeout: 5000}, (done) => {
    server.inject({
      method: 'GET',
      url: '/api/report?type=StockAccount&tags=currency'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.count).to.equal(1);
      done();
    });
  });
});
