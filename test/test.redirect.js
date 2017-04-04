'use strict';
const code = require('code');
const lab = exports.lab = require('lab').script();
const setup = require('./setup.test.js');

lab.experiment('tags', { timeout: 5000 }, () => {
  lab.beforeEach({ timeout: 5000 }, (done) => {
    setup.withRapptor({}, [], done);
  });
  lab.afterEach({ timeout: 5000 }, (done) => {
    setup.stop(done);
  });

  lab.test('can use /r route to do a tracked redirect', (done) => {
    setup.server.route({
      path: '/detour',
      method: 'GET',
      handler: (req, res) => {
        res.reply({ success: true });
      }
    });
    setup.server.inject({
      url: '/r/?to=/detour&type=thatType',
      method: 'GET',
    }, (response) => {
      code.expect(response.statusCode).to.equal(302);
      setup.server.db.tracks.findOne({ type: 'thatType' }, (err, track) => {
        code.expect(err).to.equal(null);
        code.expect(track.type).to.equal('thatType');
        code.expect(track.data.ip).to.equal('127.0.0.1');
        code.expect(track.data.userAgent).to.equal('shot');
        done();
      });
    });
  });
});
