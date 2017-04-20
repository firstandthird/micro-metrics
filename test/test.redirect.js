'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('can use /r route to do a tracked redirect', (t) => {
  setup.server.route({
    path: '/detour',
    method: 'GET',
    handler: (req, res) => {
      res.reply({ success: true });
    }
  });
  setup.server.inject({
    url: '/r/?to=/detour&type=thatType',
    method: 'GET',
  }, (response) => {
    t.equal(response.statusCode).to.equal(302);
    setup.server.db.tracks.findOne({ type: 'thatType' }, (err, track) => {
      t.equal(err, null);
      t.equal(track.type, 'thatType');
      t.equal(track.data.ip, '127.0.0.1');
      t.equal(track.data.userAgent, 'shot');
      t.end();
    });
  });
});
