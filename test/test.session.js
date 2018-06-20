'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach(() => setup.withRapptor({}, []));
tap.afterEach(() => setup.stop());

tap.test('it can add a session and user id to the tracking payload', async(t) => {
  const response = await setup.server.inject({
    method: 'POST',
    url: '/api/track',
    payload: {
      type: 'page-view',
      tags: 'tag1,tag2',
      value: 1,
      userId: '777',
      sessionId: '9090'
    }
  });

  t.equal(response.statusCode, 200);
  t.equal(response.result.sessionId, '9090');
  t.end();
});
