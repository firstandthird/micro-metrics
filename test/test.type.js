'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js').withRapptor;

lab.experiment('tags', { timeout: 5000 }, (alldone) => {
  let server;
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup({}, (result) => {
      server = result;
      server.plugins['hapi-mongodb'].db.collection('tracks').drop();
      done();
    });
  });

  lab.test('can use the get method to get a metric from the db', { timeout: 5000 }, (done) => {
    code.expect(server).to.not.equal(null);
    // add a few fake metrics:
    server.plugins['hapi-mongodb'].db.collection('tracks').insertMany([{
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
    }
  ], () => {
      server.inject({
        url: '/api/types',
        method: 'GET'
      }, (response) => {
        code.expect(response.statusCode).to.equal(200);
        code.expect(response.result.results.length).to.equal(3);
        code.expect(response.result.results).to.include('BankAccount');
        code.expect(response.result.results).to.include('Radish');
        server.stop(() => {
          done();
        });
      });
    });
  });
});
