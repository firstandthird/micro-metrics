'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');
const async = require('async');
tap.beforeEach((done) => {
  setup.withRapptor({ skipDrop: true }, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('will expire a tracked object if ttl is specified', { timeout: 10000000 }, (t) => {
  async.autoInject({
    nonExpiring(done) {
      setup.server.inject({
        url: '/api/track',
        method: 'POST',
        payload: {
          type: 'nonExpiringType',
        }
      }, (res) => done(null, res.result));
    },
    expiring(done) {
      setup.server.inject({
        url: '/api/track',
        method: 'POST',
        payload: {
          type: 'anExpiringType',
          data: {
            ttl: -1000
          }
        }
      }, (res) => done(null, res.result));
    },
    expiringLater(done) {
      setup.server.inject({
        url: '/api/track',
        method: 'POST',
        payload: {
          type: 'expiringLater',
          data: {
            ttl: 1000 * 260 * 240
          }
        }
      }, (res) => done(null, res.result));
    },
    doExpire(expiring, expiringLater, done) {
      setTimeout(done, 1000 * 75); // mongo cleanup runs every 60 seconds
    },
    verify(doExpire, done) {
      setup.server.db.tracks.find({}).toArray((err, response2) => {
        t.equal(err, null);
        // should be two left:
        t.equal(response2.length, 2, 'deletes the ttl-field containing track');
        t.equal(response2[0].type, 'nonExpiringType', 'does not delete non-ttl fields');
        t.equal(response2[1].type, 'expiringLater', 'does not delete if ttl is not met');
        done();
      });
    }
  }, () => {
    t.end();
  });
});
