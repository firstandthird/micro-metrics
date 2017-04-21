'use strict';

exports.tag = {
  method: 'GET',
  path: '/api/tag-values',
  handler: {
    autoInject: {
      filter(request, server, done) {
        const filter = {};
        filter[`tags.${request.query.tag}`] = { $exists: 1 };
        if (request.query.type) {
          filter.type = request.query.type;
        }
        done(null, filter);
      },
      tag(request, server, filter, done) {
        server.db.tracks.distinct(`tags.${request.query.tag}`, filter, done);
      },
      reply(tag, done) {
        return done(null, tag);
      }
    }
  }
};
