'use strict';
const async = require('async');
const tap = require('tap');
const setup = require('./setup.test.js');
const os = require('os');

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
    report1(add1, add2, add3, done) {
      server.req.get('/api/report/conversion', {
        query: {
          name: 'test'
        }
      }, done);
    },
    results1(report1, done) {
      const lastReport = report1[report1.length - 1];
      delete lastReport.date;
      delete lastReport.dateString;
      t.deepEqual(lastReport, {
        'a - impression': 1,
        'b - impression': 1,
        'a - success': 1,
        'b - success': 0 });
      done();
    }
  }, (err, results) => {
    t.equal(err, null);
    t.end();
  });
});

tap.test('report csv', (t) => {
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
    csv(add1, add2, add3, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/conversion.csv?name=test',
      }, (response) => {
        done(null, response);
      });
    },
    results1(csv, done) {
      t.equal(csv.statusCode, 200, 'returns HTTP 200');
      t.equal(typeof csv.result, 'string');
      t.equal(csv.result.split(os.EOL)[0], '"dateString","a - impression","b - impression","a - success","b - success"');
      t.equal(csv.headers['content-type'], 'application/csv');
      done();
    }
  }, (err, results) => {
    t.equal(err, null);
    t.end();
  });
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

tap.test('aggregate csv', (t) => {
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
    csv(add1, add2, add3, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/conversion/aggregate.csv?name=test',
      }, (response) => {
        done(null, response);
      });
    },
    results1(csv, done) {
      t.equal(csv.statusCode, 200, 'returns HTTP 200');
      t.equal(typeof csv.result, 'string');
      t.equal(csv.result.split(os.EOL)[0], '"option","success","impression"');
      t.equal(csv.headers['content-type'], 'application/csv');
      done();
    }
  }, (err, results) => {
    t.equal(err, null);
    t.end();
  });
});

tap.test('can use /c.gif route to get a conversion tracking pixel', (t) => {
  setup.server.inject({
    url: '/c.gif?name=test&event=impression&option=a&session=123',
    method: 'GET'
  }, (response) => {
    t.equal(response.statusCode, 200);
    t.equal(response.headers['content-type'], 'image/gif');
    setup.server.db.tracks.findOne({ type: 'conversion.test' }, (err, track) => {
      t.equal(err, null);
      t.equal(track.tags.event, 'impression');
      t.equal(track.tags.option, 'a');
      t.equal(track.type, 'conversion.test');
      t.equal(track.data.ip, '127.0.0.1');
      t.equal(track.data.userAgent, 'shot');
      t.end();
    });
  });
});
