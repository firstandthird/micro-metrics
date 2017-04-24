'use strict';

exports.types = {
  method: 'GET',
  path: '/api/types',
  handler: {
    autoInject: {
      types(server, done) {
        server.db.tracks.distinct('type', done);
      },
      reply(types, done) {
        return done(null, { count: types.length, results: types });
      }
    }
  }
};
