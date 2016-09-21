'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js').withRapptor;
const _ = require('lodash');

lab.experiment('tags', { timeout: 5000 }, () => {
  let server;
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup({}, (err, result) => {
      if (err) {
        return done(err);
      }
      server = result;
      server.plugins['hapi-mongodb'].db.collection('tracks').drop();
      done();
    });
  });
  lab.test('can use the tags method to get a list of tags used in the db', (done) => {
    code.expect(server).to.not.equal(null);
    const payloads = [
      {
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
      }
    ];
    // add a couple of fake metrics:
    server.inject({
      method: 'POST',
      url: '/api/track',
      payload: payloads[0]
    }, (err) => {
      server.inject({
        method: 'POST',
        url: '/api/track',
        payload: payloads[1]
      }, () => {
        server.inject({
          method: 'POST',
          url: '/api/track',
          payload: payloads[2]
        }, () => {
          server.inject({
            url: '/api/tags',
            method: 'GET'
          }, (response) => {
            code.expect(response.statusCode).to.equal(200);
            code.expect(typeof response.result).to.equal('object');
            code.expect(response.result.length).to.equal(3);
            code.expect(response.result).to.include('currency');
            code.expect(response.result).to.include('units');
            server.stop(() => {
              done();
            });
          });
        });
      });
    });
  });
  lab.test('can use the tags method with the optional type parameter', { timeout: 5000 }, (done) => {
    code.expect(server).to.not.equal(null);
    const payloads = [
      {
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
    ];
    // add a couple of fake metrics:
    server.inject({
      method: 'POST',
      url: '/api/track',
      payload: payloads[0]
    }, (err) => {
      server.inject({
        method: 'POST',
        url: '/api/track',
        payload: payloads[1]
      }, () => {
        server.inject({
          method: 'POST',
          url: '/api/track',
          payload: payloads[2]
        }, () => {
          server.inject({
            url: '/api/tags?type=BankAccount',
            method: 'GET'
          }, (response) => {
            code.expect(response.statusCode).to.equal(200);
            code.expect(typeof response.result).to.equal('object');
            code.expect(response.result.length).to.equal(2);
            code.expect(response.result).to.include('currency');
            code.expect(response.result).to.not.include('animalVegetableMineral');
            code.expect(response.result).to.include('units');
            server.stop(() => {
              done();
            });
          });
        });
      });
    });
  });
});

lab.experiment('tag', { timeout: 5000 }, () => {
  let server;
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup({}, (err, result) => {
      if (err) {
        return done(err);
      }
      server = result;
      server.plugins['hapi-mongodb'].db.collection('tracks').drop();
      // add a few fake metrics:
      server.plugins['hapi-mongodb'].db.collection('tracks').insertMany([{
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
  lab.test('can use the /api/tag-values?tag={tagKey} to get a list of distinct keys', { timeout: 5000 }, (done) => {
    server.inject({
      url: '/api/tag-values?tag=currency',
      method: 'GET'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.length).to.equal(3);
      done();
    });
  });
  lab.test('can use the /api/tag-values?type={typeName}&tag={tagKey} to get a list of distinct keys by type', { timeout: 5000 }, (done) => {
    server.inject({
      url: '/api/tag-values?tag=currency&type=WebPage',
      method: 'GET'
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      console.log(response.result)
      code.expect(response.result.length).to.equal(1);
      done();
    });
  });
});
