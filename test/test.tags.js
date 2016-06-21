'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('../lib/setup.test.js');
const tagsRoute = require('../routes/api/tags.js').tags;

lab.test('can use the tags method to get a list of tags used in the db', (done) => {
  setup({}, (server) => {
    server.route(tagsRoute);
    // add a couple of fake metrics:
    server.plugins['hapi-mongodb'].collection('tracks').insertMany([{
      type: 'BankAccount',
      tags: ['dollars'],
      value: 142000000,
      data: 'liquid Assets only',
      userId: 'Montgomery Burns'
    },
    {
      type: 'BankAccount',
      tags: ['dollars', 'cents'],
      value: 0.15,
      data: 'liquid assets only',
      userId: 'Barney'
    },
    {
      type: 'Radish',
      tags: ['vegetable'],
      value: 1,
      data: 'radishes are a good source of electrolytes and minerals ',
      userId: 'user1234'
    },
  ], () => {
      server.inject({
        url: '/api/tags/',
        method: 'GET'
      }, (response) => {
        code.expect(response.statusCode).to.equal(200);
        code.expect(response.result.results.length).to.equal(3);
        code.expect(response.result.results).to.include('cents');
        code.expect(response.result.results).to.include('vegetable');
        server.stop(() => {
          done();
        });
      });
    });
  });
});

lab.test('can use the tags method with the optional type parameter', (done) => {
  setup({}, (server) => {
    server.route(tagsRoute);
    // add a couple of fake metrics:
    server.plugins['hapi-mongodb'].collection('tracks').insertMany([{
      type: 'BankAccount',
      tags: ['dollars'],
      value: 142000000,
      data: 'liquid Assets only',
      userId: 'Montgomery Burns'
    },
    {
      type: 'BankAccount',
      tags: ['dollars', 'cents'],
      value: 0.15,
      data: 'liquid assets only',
      userId: 'Barney'
    },
    {
      type: 'Radish',
      tags: ['vegetable'],
      value: 1,
      data: 'radishes are a good source of electrolytes and minerals ',
      userId: 'user1234'
    },
  ], () => {
      server.inject({
        url: '/api/tags/BankAccount',
        method: 'GET'
      }, (response) => {
        code.expect(response.statusCode).to.equal(200);
        code.expect(response.result.results.length).to.equal(2);
        code.expect(response.result.results).to.include('cents');
        code.expect(response.result.results).to.not.include('vegetable');
        server.stop(() => {
          done();
        });
      });
    });
  });
});
