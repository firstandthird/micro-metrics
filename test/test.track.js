'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('can use the track method to store a value in the db', (t) => {
  t.notEqual(setup.server, null, 'server not null');
  setup.server.methods.track({
    type: 'aType'
  }, (err, data) => {
    t.equal(err, null, 'does not error');
    t.equal(data.value, 1, 'sets value');
    t.equal(data.type, 'aType', 'sets type');
    t.notEqual(data.createdOn, null, 'sets createdOn date');
    t.end();
  });
});

tap.test('can pass in a custom timestamp for createdOn', (t) => {
  code.expect(setup.server).to.not.equal(null);
  const val = new Date().getTime() - 1000;
  setup.server.methods.track({
    type: 'aType',
    createdOn: new Date(val)
  }, (err, data) => {
    t.equal(err, null);
    t.equal(data.value, 1);
    t.equal(data.type, 'aType');
    t.equal(data.createdOn.getTime(), val);
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
