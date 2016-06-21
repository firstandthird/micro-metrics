'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('../lib/setup.test.js');
const typeRoute = require('../routes/api/types.js').types;
lab.test('can use the get method to get a metric from the db', (done) => {
  setup({}, (server) => {
    server.route(typeRoute);
    // add a few fake metrics:
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
      type: 'WebPage',
      tags: ['accesses'],
      value: 23,
      data: 'validated accesses only',
      userId: 'Barney'
    },
    {
      type: 'Radish',
      tags: ['vegetable'],
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
