'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});
tap.test('it can add a session and user id to the tracking payload', (t) => {
  setup.server.inject({
    method: 'POST',
    url: '/api/track',
    payload: {
      type: 'page-view',
      tags: 'tag1,tag2',
      value: 1,
      userId: '777',
      sessionId: '9090'
    }
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.sessionId, '9090');
    t.end();
  });
});
