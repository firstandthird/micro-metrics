'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('can call the track route', (t) => {
  t.notEqual(setup.server, null);
  setup.server.inject({
    url: '/api/track',
    method: 'POST',
    payload: {
      type: 'aType'
    }
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.value, 1);
    t.equal(response.result.type, 'aType');
    t.equal(typeof response.result.createdOn.getTime(), 'number');
    t.end();
  });
});

tap.test('can pass in a custom timestamp for createdOn', (t) => {
  t.notEqual(setup.server, null);
  const val = new Date().getTime() - 1000;
  setup.server.inject({
    url: '/api/track',
    method: 'POST',
    payload: {
      type: 'aType',
      createdOn: new Date(val)
    }
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.result.value, 1);
    t.equal(response.result.type, 'aType');
    t.equal(response.result.createdOn.getTime(), val);
    t.end();
  });
});
tap.test('can use /t.gif route to get a tracking pixel', (t) => {
  setup.server.inject({
    url: '/t.gif?type=thisType',
    method: 'GET',
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.headers['content-type'], 'image/gif');
    setup.server.db.tracks.findOne({ type: 'thisType' }, (err, track) => {
      t.equal(err, null);
      t.equal(track.type, 'thisType');
      t.equal(track.data.ip, '127.0.0.1');
      t.equal(track.data.userAgent, 'shot');
      t.end();
    });
  });
});
