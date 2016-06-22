'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('../lib/setup.test.js');
const tagsRoute = require('../routes/api/tags.js').tags;
const _ = require('lodash');
/*
lab.test('can use the tags method to get a list of tags used in the db', (done) => {
  setup({}, (server) => {
    server.route(tagsRoute);
    // add a couple of fake metrics:
    server.plugins['hapi-mongodb'].collection('tracks').insertMany([{
      type: 'BankAccount',
      tags: [{currency: 'dollars'}],
      value: 142000000,
      data: 'liquid Assets only',
      userId: 'Montgomery Burns'
    },
    {
      type: 'BankAccount',
      tags: [{currency: 'dollars'}, {units: 'cents'}],
      value: 0.15,
      data: 'liquid assets only',
      userId: 'Barney'
    },
    {
      type: 'Radish',
      tags: [{animalVegetableMineral: 'vegetable'}],
      value: 1,
      data: 'radishes are a good source of electrolytes and minerals ',
      userId: 'user1234'
    },
  ], () => {
      server.inject({
        url: '/api/tags',
        method: 'GET'
      }, (response) => {
        code.expect(response.statusCode).to.equal(200);
        code.expect(typeof response.result).to.equal('object');
        code.expect(_.keys(response.result).length).to.equal(3);
        code.expect(_.keys(response.result)).to.include('currency');
        code.expect(response.result.currency).to.include('dollars');
        server.stop(() => {
          done();
        });
      });
    });
  });
});
*/
lab.test('can use the tags method with the optional type parameter', (done) => {
  setup({}, (server) => {
    server.route(tagsRoute);
    // add a couple of fake metrics:
    server.plugins['hapi-mongodb'].collection('tracks').insertMany([
    {
      type: 'BankAccount',
      tags: [{ currency: 'yen'}],
      value: 142000000,
      data: 'liquid Assets only',
      userId: 'Montgomery Burns'
    },
    {
      type: 'BankAccount',
      tags: [{ currency: 'dollars'}, { units: 'cents'}],
      value: 0.15,
      data: 'liquid assets only',
      userId: 'Barney'
    },
    {
      type: 'Radish',
      tags: [ {animalVegetableMineral: 'vegetable'}],
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
