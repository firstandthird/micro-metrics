'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js');

lab.experiment('random data', { timeout: 5000 }, () => {
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup.withRapptor({}, [], done);
  });
  lab.afterEach({ timeout: 5000 }, (done) => {
    setup.stop(done);
  });
  lab.test('can use the generate method to generate a random db for testing', (done) => {
    setup.server.methods.generate(new Date().getTime() - (1000 * 60 * 60 * 24 * 30), 10, (err, result) => {
      code.expect(err).to.equal(null);
      code.expect(result.ops.length).to.equal(10);
      // confirm they were put in the db:
      setup.server.db.tracks.find({}).toArray((err2, result2) => {
        code.expect(err2).to.equal(null);
        code.expect(result2.length).to.equal(10);
        done();
      });
    });
  });
  lab.test('can use the generate route to generate a random db for testing', (done) => {
    setup.server.inject({
      method: 'POST',
      url: `/api/generate?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.ops.length).to.equal(10);
      // confirm they were put in the db:
      setup.server.db.tracks.find({}).toArray((err2, result) => {
        code.expect(err2).to.equal(null);
        code.expect(result.length).to.equal(10);
        done();
      });
    });
  });
  lab.test('disallow generate route when allowTesting is falsey', (done) => {
    setup.server.settings.app.allowGeneratedData = undefined;
    setup.server.inject({
      method: 'POST',
      url: `/api/generate?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
    }, (response) => {
      code.expect(response.statusCode).to.equal(401);
      done();
    });
  });
});
