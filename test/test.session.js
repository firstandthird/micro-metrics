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
  lab.test('it can add a session and user id to the tracking payload', (done) => {
    setup.server.inject({
      method: 'POST',
      url: '/api/track',
      payload: {
       type: 'page-view',
       tags: 'tag1,tag2',
       value: 1,
       userId: '777',
       sessionId: '9090'
      }
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.result.sessionId).to.equal('9090');
      done();
    });
  });
});
