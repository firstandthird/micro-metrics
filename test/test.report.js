'use strict';
const tap = require('tap');
const setup = require('./setup.test.js');
const os = require('os');
const async = require('async');

const twentyMinutes = 1000 * 60 * 20;
const twoDays = 1000 * 60 * 60 * 24 * 2;
const threeHours = 1000 * 60 * 60 * 3;
const current = new Date().getTime();

tap.afterEach((done) => {
  setup.stop(done);
});
/*
tap.test('can use the report method to get a list of metrics from the db - defaults to hourly', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'Radish',
        tags: { animalVegetableMineral: 'vegetable' },
        value: 1,
        data: 'radishes are a good source of electrolytes and minerals ',
        userId: 'user1234',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report'
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns HTTP 200');
        t.equal(response.result.count, 1, 'returns the right number of metrics');
        done();
      });
    }
  }, t.end);
});

tap.test('can use the report method to get a list of metrics from the db by hour', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '20m',
        createdOn: new Date(current - twentyMinutes)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '3h',
        createdOn: new Date(current - threeHours)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?last=3h'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 2);
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get a list of metrics from the db by day', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?last=2d'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 2);
        // verify it didn't return this in csv format:
        t.equal(response.headers['content-type'], 'application/json; charset=utf-8');
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get a list of metrics from the db by day and hour', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?last=2d1h'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 1);
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get a list of metrics from the db by hour and day', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date()
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?last=4h1d'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 1);
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get a list of metrics from the db by hour and day and minute', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '20m',
        createdOn: new Date(current - twentyMinutes)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '3h',
        createdOn: new Date(current - threeHours)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: 'current',
        createdOn: new Date(current)
      },
      {
        type: 'Radish',
        tags: { animalVegetableMineral: 'vegetable' },
        value: 1,
        data: 'radishes are a good source of electrolytes and minerals ',
        userId: 'user1234',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?last=25m'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 2);
        t.end();
      });
    }
  });
});

tap.test('can look up a report by type', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?type=BankAccount'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 1);
        t.end();
      });
    }
  });
});

tap.test('can look up a report by tags', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?tags=currency'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 1);
        t.end();
      });
    }
  });
});

tap.test('can look up a report by type and tags', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report?type=BankAccount&tags=currency'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 1);
        t.end();
      });
    }
  });
});

tap.test('can look up the count of the items tracked', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '20m',
        createdOn: new Date(current - twentyMinutes)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/count'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 3);
        t.end();
      });
    }
  });
});

tap.test('can pass query params to count', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '20m',
        createdOn: new Date(current - twentyMinutes)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/count?type=BankAccount'
      }, (response) => {
        t.equal(response.statusCode, 200);
        t.equal(response.result.count, 2);
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get a list of metrics from the db in csv format', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: 'current',
        createdOn: new Date(current)
      },
      {
        type: 'Radish',
        tags: { animalVegetableMineral: 'vegetable' },
        value: 1,
        data: 'radishes are a good source of electrolytes and minerals ',
        userId: 'user1234',
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report.csv'
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns HTTP 200');
        t.equal(typeof response.result, 'string');
        t.equal(response.headers['content-type'], 'application/csv');
        // timestamps will be different, just check top row:
        const contents = response.result.split(os.EOL)[0];
        t.equal(contents, '"type","tags.currency","tagKeys.currency","fields","value","data","userId","createdOn","tags.units"');
        t.equal();
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get an aggregate list of metrics from the db', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '20m',
        createdOn: new Date(current - twentyMinutes)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '3h',
        createdOn: new Date(current - threeHours)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: 'current',
        createdOn: new Date(current)
      },
      {
        type: 'Radish',
        tags: { animalVegetableMineral: 'vegetable' },
        value: 1,
        data: 'radishes are a good source of electrolytes and minerals ',
        userId: 'user1234',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/aggregate'
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns HTTP 200');
        t.equal(typeof response.result, 'object');
        t.equal(response.headers['content-type'], 'application/json; charset=utf-8');
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get an aggregate list of metrics grouped by values for a given tag', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 1234,
        data: '1234',
        createdOn: new Date(current - threeHours),
        userId: '2d'
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142,
        data: '23566357',
        userId: 'Montgomery Burns',
        createdOn: new Date(current - threeHours),
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234', currency: 'yen' },
        value: 160,
        data: '78667657',
        createdOn: new Date(current - threeHours),
        userId: 'Montgomery Burns',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: '2345234',
        createdOn: new Date(current - threeHours),
        userId: '20m'
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: '768567',
        createdOn: new Date(current - threeHours),
        userId: '3h'
      },
      {
        type: 'BankAccount',
        tags: { currency: 'euros', units: 'cents' },
        value: 0.15,
        data: '8666345345',
        createdOn: new Date(current - threeHours),
        userId: 'current'
      },
      {
        type: 'Radish',
        tags: { animalVegetableMineral: 'vegetable' },
        value: 1,
        data: 'radishes are a good source of electrolytes and minerals ',
        createdOn: new Date(current - threeHours),
        userId: 'user1234',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: '6786785676',
        createdOn: new Date(current - threeHours),
        userId: '2d3h'
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/aggregate?groupby=currency'
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns HTTP 200');
        t.equal(typeof response.result, 'object');
        t.equal(response.headers['content-type'], 'application/json; charset=utf-8');
        t.equal(Object.keys(response.result).length, 3);
        t.equal(response.result.dollars[0].max, 142);
        t.equal(response.result.yen[0].max, 1234);
        t.end();
      });
    }
  });
});

tap.test('can use the report method to get an aggregate list of metrics from the db in csv format', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '20m',
        createdOn: new Date(current - twentyMinutes)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '3h',
        createdOn: new Date(current - threeHours)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: 'current',
        createdOn: new Date(current)
      },
      {
        type: 'Radish',
        tags: { animalVegetableMineral: 'vegetable' },
        value: 1,
        data: 'radishes are a good source of electrolytes and minerals ',
        userId: 'user1234',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/aggregate.csv'
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns HTTP 200');
        t.equal(typeof response.result, 'string');
        t.equal(response.result.split(os.EOL)[0], '"Date","Avg","Max","Min"');
        t.equal(response.headers['content-type'], 'application/csv');
        t.end();
      });
    }
  });
});
*/
tap.test('can use the report method to get an aggregate list of metrics from the db in csv format', (t) => {
  async.autoInject({
    init(done) {
      setup.withRapptor({}, [{
        type: 'BankAccount',
        tags: { currency: 'yen' },
        tagKeys: { currency: 'yen' },
        fields: ['wc', 'strawberry'],
        value: 142000000,
        data: 'liquid Assets only',
        userId: '2d',
        createdOn: new Date(current - twoDays)
      },
      {
        type: 'StockAccount',
        tags: { currency: 'dollars' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'StockAccount',
        tags: { transactionNumber: '1234' },
        value: 142000000,
        data: 'purchasing account',
        userId: 'Montgomery Burns',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '20m',
        createdOn: new Date(current - twentyMinutes)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '3h',
        createdOn: new Date(current - threeHours)
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: 'current',
        createdOn: new Date(current)
      },
      {
        type: 'Radish',
        tags: { animalVegetableMineral: 'vegetable' },
        value: 1,
        data: 'radishes are a good source of electrolytes and minerals ',
        userId: 'user1234',
      },
      {
        type: 'BankAccount',
        tags: { currency: 'dollars', units: 'cents' },
        value: 0.15,
        data: 'liquid assets only',
        userId: '2d3h',
        createdOn: new Date(current - twoDays - threeHours)
      }],
      done);
    },
    test(init, done) {
      setup.server.inject({
        method: 'GET',
        url: '/api/report/aggregate.html'
      }, (response) => {
        t.equal(response.statusCode, 200, 'returns HTTP 200');
        t.equal(typeof response.result, 'string');
        t.notEqual(response.result.split('<tr>')[1].indexOf('<th>Date</th> <th>Avg</th> <th>Max</th> <th>Min</th> </tr>'), -1);
        t.equal(response.headers['content-type'], 'application/html');
        t.end();
      });
    }
  });
});
