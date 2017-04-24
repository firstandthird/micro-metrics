'use strict';

exports.tags = {
  method: 'GET',
  path: '/api/tags',
  handler: {
    autoInject: {
      filter(request, server, done) {
        const filter = {};
        if (request.query && request.query.type) {
          filter.type = request.query.type;
        }
        return done(null, filter);
      },
      track(request, server, filter, done) {
        server.db.tracks.distinct('tagKeys', filter, done);
      },
      reply(track, done) {
        // results will be an object in which the keys are the tag names
        // and the values are each a list of the values for those names;
        // eg: { 'currency': ['dollars', 'yen'], 'vegetable': 'carrot']}
        return done(null, track);
      }
    }
  }
};
