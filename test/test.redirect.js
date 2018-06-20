'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach(() => setup.withRapptor({}, []));
tap.afterEach(() => setup.stop());

tap.test('can use /r route to do a tracked redirect', async(t) => {
  setup.server.route({
    path: '/detour',
    method: 'GET',
    handler(request, h) {
      return { success: true };
    }
  });

  const response = await setup.server.inject({
    url: '/r/?to=/detour&type=thatType',
    method: 'GET',
  });

  t.equal(response.statusCode, 302);
  const track = await setup.server.db.tracks.findOne({ type: 'thatType' });
  t.equal(track.type, 'thatType');
  t.equal(track.data.ip, '127.0.0.1');
  t.equal(track.data.userAgent, 'shot');
  t.end();
});
