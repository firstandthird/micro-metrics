'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js');

lab.experiment('sessions', { timeout: 5000 }, () => {
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup.withRapptor({}, [], done);
  });
  lab.afterEach({ timeout: 5000 }, (done) => {
    setup.stop(done);
  });
  lab.test('it can add a session and user id to the tracking payload');
});
