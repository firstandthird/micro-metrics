'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js').withRapptor;
const _ = require('lodash');

lab.experiment('tags', { timeout: 5000 }, (alldone) => {
  let server;
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup({}, (result) => {
      server = result;
      server.plugins['hapi-mongodb'].db.collection('tracks').drop();
      done();
    });
  });
  lab.test('can use the tags method to get a list of tags used in the db', (done) => {
    code.expect(server).to.not.equal(null);
    // add a couple of fake metrics:
    server.plugins['hapi-mongodb'].db.collection('tracks').insertMany([{
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
    },
  ], () => {
    console.log('inject');
      server.inject({
        url: '/api/tags',
        method: 'GET'
      }, (response) => {
        code.expect(response.statusCode).to.equal(200);
        code.expect(typeof response.result).to.equal('object');
        code.expect(_.keys(response.result).length).to.equal(3);
        code.expect(_.keys(response.result)).to.include('currency');
        code.expect(_.keys(response.result)).to.include('units');
        code.expect(response.result.currency).to.include('dollars');
        server.stop(() => {
          done();
        });
      });
    });
  });
  lab.test('can use the tags method with the optional type parameter', { timeout: 5000 }, (done) => {
    code.expect(server).to.not.equal(null);

    // add a couple of fake metrics:
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
      type: 'Radish',
      tags: { animalVegetableMineral: 'vegetable' },
      value: 1,
      data: 'radishes are a good source of electrolytes and minerals ',
      userId: 'user1234'
    }
  ], () => {
      server.inject({
        url: '/api/tags?type=BankAccount',
        method: 'GET'
      }, (response) => {
        code.expect(response.statusCode).to.equal(200);
        code.expect(typeof response.result).to.equal('object');
        code.expect(_.keys(response.result).length).to.equal(2);
        code.expect(_.keys(response.result)).to.include('currency');
        code.expect(_.keys(response.result)).to.not.include('animalVegetableMineral');
        code.expect(_.keys(response.result)).to.include('units');
        code.expect(response.result.currency).to.include('dollars');
        code.expect(response.result.currency).to.include('yen');
        code.expect(response.result.units).to.include('cents');
        server.stop(() => {
          done();
        });
      });
    });
  });
});
