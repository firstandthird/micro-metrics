'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});

tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('can use the generate method to generate a random db for testing', (t) => {
  setup.server.methods.generate(new Date().getTime() - (1000 * 60 * 60 * 24 * 30), 10, (err, result) => {
    t.equal(err, null, 'does not error');
    t.equal(result.ops.length, 10, 'generates the right number of result.ops in the db');
    // confirm they were put in the db:
    setup.server.db.tracks.find({}).toArray((err2, result2) => {
      t.equal(err2, null);
      t.equal(result2.length, 10, 'all of the ops actually are stored in the db');
      t.end();
    });
  });
});

tap.test('can use the generate route to generate a random db for testing', (t) => {
  setup.server.inject({
    method: 'POST',
    url: `/api/generate?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
  }, (response) => {
    t.equal(response.statusCode, 200, 'route returns HTTP OK');
    t.equal(response.result.ops.length, 10, 'route returns right number of db objects');
    // confirm they were put in the db:
    setup.server.db.tracks.find({}).toArray((err2, result) => {
      t.equal(err2, null);
      t.equal(result.length, 10, 'route stored all of the objects in the db');
      t.end();
    });
  });
});

tap.test('disallow generate route when allowTesting is falsey', (t) => {
  setup.server.settings.app.allowGeneratedData = undefined;
  setup.server.inject({
    method: 'POST',
    url: `/api/generate?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
  }, (response) => {
    t.equal(response.statusCode, 401, 'returns HTTP 401');
    t.end();
  });
});
