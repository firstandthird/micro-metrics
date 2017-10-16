'use strict';
const async = require('async');
const tap = require('tap');
const setup = require('./setup.test.js');

tap.beforeEach((done) => {
  setup.withRapptor({}, [], done);
});
tap.afterEach((done) => {
  setup.stop(done);
});

tap.test('name required', (t) => {
  setup.server.req.post('/api/conversion', {
    payload: {
    }
  }, (err, result) => {
    t.notEqual(err, null);
    t.equal(err.output.statusCode, 400);
    t.end();
  });
});

tap.test('event required', (t) => {
  setup.server.req.post('/api/conversion', {
    payload: {
      name: 'test'
    }
  }, (err, result) => {
    t.notEqual(err, null);
    t.equal(err.output.statusCode, 400);
    t.end();
  });
});

tap.test('option required', (t) => {
  setup.server.req.post('/api/conversion', {
    payload: {
      name: 'test',
      event: 'impression'
    }
  }, (err, result) => {
    t.notEqual(err, null);
    t.equal(err.output.statusCode, 400);
    t.end();
  });
});

tap.test('tracks in db', (t) => {
  setup.server.req.post('/api/conversion', {
    payload: {
      name: 'test',
      event: 'impression',
      option: 'a',
      session: '123'
    }
  }, (err, result) => {
    t.equal(err, null);
    setup.server.db.tracks.find().toArray((dberr, items) => {
      t.equal(dberr, null);
      t.equal(items.length, 1);
      const item = items[0];
      t.equal(item.type, 'conversion.test');
      t.deepEqual(item.tags, {
        event: 'impression',
        option: 'a'
      });
      t.equal(item.data.session, '123');
      t.notEqual(typeof item.data.ip, 'undefined');
      t.notEqual(typeof item.data.userAgent, 'undefined');
      t.notEqual(typeof item.data.referrer, 'undefined');
      t.equal(item.value, 1);
      t.end();
    });
  });
});

tap.test('report', (t) => {
  //report test here
});

tap.test('aggregate', (t) => {
  const server = setup.server;
  async.autoInject({
    add1(done) {
      setup.server.req.post('/api/conversion', {
        payload: {
          name: 'test',
          event: 'impression',
          option: 'a',
          session: '123'
        }
      }, done);
    },
    add2(done) {
      setup.server.req.post('/api/conversion', {
        payload: {
          name: 'test',
          event: 'impression',
          option: 'b',
          session: '123'
        }
      }, done);
    },
    add3(done) {
      setup.server.req.post('/api/conversion', {
        payload: {
          name: 'test',
          event: 'success',
          option: 'a',
          session: '123'
        }
      }, done);
    },
    aggregate(add1, add2, add3, done) {
      server.req.get('/api/report/conversion/aggregate', {
        query: {
          name: 'test'
        }
      }, done);
    },
    results(aggregate, done) {
      t.deepEqual(aggregate, [
        { option: 'a', impression: 1, success: 1 },
        { option: 'b', impression: 1, success: 0 },
      ]);
      done();
    }
  }, (err, results) => {
    t.equal(err, null);
    t.end();
  });
});
