'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach(() => setup.withRapptor({}, []));
tap.afterEach(async() => { await setup.stop(); });

tap.test('can use the generate method to generate a random db for testing', async(t) => {
  const result = await setup.server.methods.generate(new Date().getTime() - (1000 * 60 * 60 * 24 * 30), 10);
  t.equal(result.ops.length, 10, 'generates the right number of result.ops in the db');
  const result2 = await setup.server.db.tracks.find({}).toArray();
  t.equal(result2.length, 10, 'all of the ops actually are stored in the db');
  t.end();
});

tap.test('can use the generate route to generate a random db for testing', async(t) => {
  const response = await setup.server.inject({
    method: 'POST',
    url: `/api/generate?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
  });

  t.equal(response.statusCode, 200, 'route returns HTTP OK');
  t.equal(response.result.ops.length, 10, 'route returns right number of db objects');
  // confirm they were put in the db:
  const result = await setup.server.db.tracks.find({}).toArray();
  t.equal(result.length, 10, 'route stored all of the objects in the db');
  t.end();
});

tap.test('disallow generate route when allowTesting is falsey', async(t) => {
  setup.server.settings.app.allowGeneratedData = undefined;

  const response = await setup.server.inject({
    method: 'POST',
    url: `/api/generate?numEntries=10&startDate=${new Date().getTime() - (60 * 60 * 1000 * 24 * 30)}`
  });

  t.equal(response.statusCode, 401, 'returns HTTP 401');
  t.end();
});
