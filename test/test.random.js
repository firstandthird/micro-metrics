'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js').withRapptor;
const _ = require('lodash');

lab.experiment('random data', { timeout: 5000 }, () => {
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
  lab.afterEach({ timeout: 5000 }, (done) => {
    server.plugins['hapi-mongodb'].db.collection('tracks').drop();
    server.stop(() => {
      done();
    });
  });
  lab.test('can use the randomize method to generate a random db for testing', (done) => {
    server.methods.randomize(new Date().getTime() - (1000 * 60 * 60 * 24 * 30), 10, (err, result) => {
      code.expect(err).to.equal(null);
      code.expect(result.ops.length).to.equal(10);
      // confirm they were put in the db:
      server.plugins['hapi-mongodb'].db.collection('tracks').find({}).toArray((err2, result) => {
        code.expect(err2).to.equal(null);
        code.expect(result.length).to.equal(10);
        done();
      });
    });
  });
  lab.test('can use the randomize route to generate a random db for testing', (done) => {
    server.inject({
      method: 'POST',
      url: `/api/randomize?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.ops.length).to.equal(10);
      // confirm they were put in the db:
      server.plugins['hapi-mongodb'].db.collection('tracks').find({}).toArray((err2, result) => {
        code.expect(err2).to.equal(null);
        code.expect(result.length).to.equal(10);
        done();
      });
    });
  });
  lab.test('disallow randomize route when allowTesting is falsey', (done) => {
    server.settings.app.allowTesting = undefined;
    server.inject({
      method: 'POST',
      url: `/api/randomize?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
    }, (response) => {
      code.expect(response.statusCode).to.equal(401);
      done();
    });
  });
});
