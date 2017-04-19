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

  lab.test('can use the track method to store a value in the db', (done) => {
    code.expect(setup.server).to.not.equal(null);
    setup.server.methods.track({
      type: 'aType'
    }, (err, data) => {
      code.expect(err).to.equal(null);
      code.expect(data.value).to.equal(1);
      code.expect(data.type).to.equal('aType');
      code.expect(data.createdOn).to.not.equal(null);
      done();
    });
  });

  lab.test('can pass a timestamp to the track method to store a value in the db', (done) => {
    code.expect(setup.server).to.not.equal(null);
    setup.server.methods.track({
      type: 'aType',
      createdOn: 0
    }, (err, data) => {
      code.expect(err).to.equal(null);
      code.expect(data.value).to.equal(1);
      code.expect(data.type).to.equal('aType');
      code.expect(data.createdOn).to.equal(0);
      done();
    });
  });


  lab.test('can use /t.gif route to get a tracking pixel', (done) => {
    setup.server.inject({
      url: '/t.gif?type=thisType',
      method: 'GET',
    }, (response) => {
      code.expect(response.statusCode).to.equal(200);
      code.expect(response.headers['content-type']).to.equal('image/gif');
      setup.server.db.tracks.findOne({ type: 'thisType' }, (err, track) => {
        code.expect(err).to.equal(null);
        code.expect(track.type).to.equal('thisType');
        code.expect(track.data.ip).to.equal('127.0.0.1');
        code.expect(track.data.userAgent).to.equal('shot');
        done();
      });
    });
  });
});
