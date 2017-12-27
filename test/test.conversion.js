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
      session: '123',
      data: {
        test: 'abc'
      }
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
      t.equal(item.data.test, 'abc');
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
    add4(done) {
      setup.server.req.post('/api/conversion', {
        payload: {
          name: 'test',
          event: 'success',
          option: 'b',
          session: '123'
        }
      }, done);
    },
    report1(add1, add2, add3, add4, done) {
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
        'b - success': 1
      });
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
    add4(done) {
      setup.server.req.post('/api/conversion', {
        payload: {
          name: 'test',
          event: 'total collapse',
          option: 'c',
          session: '321'
        }
      }, done);
    },
    aggregate(add1, add2, add3, add4, done) {
      server.req.get('/api/report/conversion/aggregate', {
        query: {
          name: 'test'
        }
      }, done);
    },
    results(aggregate, done) {
      t.equal(aggregate.length, 3);
      const totals = { impression: 0, success: 0, 'total collapse': 0 };
      aggregate.forEach((item) => {
        totals.impression += item.impression;
        totals.success += item.success;
        totals['total collapse'] += item['total collapse'];
      });
      t.equal(totals.impression, 2);
      t.equal(totals.success, 1);
      t.equal(totals['total collapse'], 1);
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
    add4(done) {
      setup.server.req.post('/api/conversion', {
        payload: {
          name: 'test',
          event: 'cinco de mayo party',
          option: 'c',
          session: '1235'
        }
      }, done);
    },
    csv(add1, add2, add3, add4, done) {
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
      const list = csv.result.split(os.EOL)[0].split(',');
      t.notEqual(list.indexOf('"option"'), -1);
      t.notEqual(list.indexOf('"impression"'), -1);
      t.notEqual(list.indexOf('"success"'), -1);
      t.notEqual(list.indexOf('"cinco de mayo party"'), -1);
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
    url: '/c.gif?name=test&event=impression&option=a&session=123&data=test:abc',
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
      t.equal(track.data.test, 'abc');
      t.end();
    });
  });
});

tap.test('can use /api/conversions to get all conversion types', (t) => {
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
          name: 'test2',
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
    add4(done) {
      setup.server.req.post('/api/track', {
        payload: {
          type: 'aType'
        }
      }, done);
    },
    add5(done) {
      setup.server.req.post('/api/track', {
        payload: {
          type: 'not-a-conversion'
        }
      }, done);
    },
    get(add1, add2, add3, add4, add5, done) {
      server.req.get('/api/conversions', {}, done);
    },
    results1(get, done) {
      // gets a unique list of conversion tracks:
      t.equal(get.length, 2);
      t.notEqual(get.indexOf('conversion.test'), -1);
      t.notEqual(get.indexOf('conversion.test2'), -1);
      done();
    }
  }, (err, results) => {
    t.equal(err, null);
    t.end();
  });
});
