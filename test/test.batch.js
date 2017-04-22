'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');
const async = require('async');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('batch insert', (t) => {
  const created = new Date();
  async.autoInject({
    post(done) {
      setup.server.req.post('/api/track/batch', {
        payload: {
          events: [
            { type: 'test1', value: 1, tags: { tag1: '123' }, createdOn: created },
            { type: 'test1', value: 2, tags: { tag1: '123' }, createdOn: created },
            { type: 'test2', createdOn: created }
          ]
        }
      }, done);
    },
    get(post, done) {
      setup.server.db.tracks.find({}).toArray(done);
    },
    verify(get, done) {
      t.equal(get.length, 3);
      t.equal(get[0].type, 'test1');
      t.equal(get[1].type, 'test1');
      t.equal(get[2].type, 'test2');
      t.equal(get[0].createdOn.getTime(), created.getTime());
      done();
    }
  }, (err, res) => {
    t.equal(err, null);
    t.end();
  });
});
